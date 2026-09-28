import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

const PG_PORT = 5432;
const DEFAULT_DATABASE_URL = 'postgresql://postgres:password@127.0.0.1:5432/requirements_wizard';

/** Grace period while a freshly spawned PGlite server initialises its data directory. */
const SPAWN_READY_TIMEOUT_MS = 90_000;
/** Grace period when something is already listening on the port. */
const EXISTING_READY_TIMEOUT_MS = 30_000;
const RETRY_INTERVAL_MS = 750;

type ServerState = 'ready' | 'refused' | 'unresponsive';

/**
 * Probe PostgreSQL over the real wire protocol.
 *
 * IMPORTANT: never probe with a bare TCP socket. The PGlite wire server opens its
 * listen socket (~0.3s) well before its data directory has finished initialising
 * (~4s). A raw connect-and-disconnect sends no startup packet, and the server waits
 * on that half-open connection forever — every later client then hangs and
 * `npm test` never returns. A genuine client handshake (or an ECONNREFUSED) is safe.
 */
async function probePostgres(connectionString: string): Promise<ServerState> {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 3_000,
    query_timeout: 5_000,
    statement_timeout: 5_000,
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return 'ready';
  } catch (err) {
    try {
      await client.end();
    } catch {
      // The client never finished handshaking; nothing to release.
    }
    const code = (err as NodeJS.ErrnoException | undefined)?.code;
    if (code === 'ECONNREFUSED' || code === 'EADDRNOTAVAIL' || code === 'ENOENT') {
      return 'refused';
    }
    return 'unresponsive';
  }
}

/** Poll with real queries until the server answers, or fail fast with a usable message. */
async function waitForPostgres(
  connectionString: string,
  opts: { timeoutMs: number; spawned: boolean; logFile?: string },
): Promise<void> {
  const deadline = Date.now() + opts.timeoutMs;
  let lastState: ServerState = 'refused';

  while (Date.now() < deadline) {
    lastState = await probePostgres(connectionString);
    if (lastState === 'ready') return;
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
  }

  if (opts.spawned) {
    throw new Error(
      `The PGlite wire server did not become ready within ${Math.round(opts.timeoutMs / 1000)}s.` +
        (opts.logFile ? ` See ${opts.logFile} for details.` : '') +
        ` Alternatively, start PostgreSQL yourself and point DATABASE_URL at it.`,
    );
  }

  throw new Error(
    `Something is listening on port ${PG_PORT} but is not answering PostgreSQL queries ` +
      `(last state: ${lastState}). This is usually a PGlite wire server left in a broken ` +
      `state by an interrupted run. Stop it (or point DATABASE_URL at a healthy PostgreSQL) ` +
      `and re-run.`,
  );
}

/** Start the bundled PGlite wire server detached so it outlives this process (each
 *  verification phase runs in its own Node process and must reach the same server). */
function startPgliteServer(): { logFile: string } {
  const serverScript = path.join(__dirname, 'pg-server.js');
  const dataDir = path.join(__dirname, '..', '.pgdata');
  fs.mkdirSync(dataDir, { recursive: true });

  // Keep the child's output so a failed start is diagnosable (previously discarded).
  const logFile = path.join(dataDir, 'pglite-server.log');
  const logFd = fs.openSync(logFile, 'a');

  const child = spawn(process.execPath, [serverScript], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });
  child.unref();
  fs.closeSync(logFd);

  return { logFile };
}

export async function ensurePostgres(): Promise<void> {
  const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

  const state = await probePostgres(connectionString);

  if (state === 'refused') {
    console.log(`PostgreSQL is not reachable on port ${PG_PORT}. Starting PGlite wire server...`);
    const { logFile } = startPgliteServer();
    await waitForPostgres(connectionString, {
      timeoutMs: SPAWN_READY_TIMEOUT_MS,
      spawned: true,
      logFile,
    });
    console.log(`PostgreSQL server is now ready on port ${PG_PORT} (log: ${logFile}).`);
  } else {
    // Either already serving, or holding the port without answering: both get a bounded wait.
    await waitForPostgres(connectionString, {
      timeoutMs: EXISTING_READY_TIMEOUT_MS,
      spawned: false,
    });
  }

  // Ensure DB & Tables exist
  const client = new Client({ connectionString });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "name" TEXT,
      "role" TEXT NOT NULL DEFAULT 'user',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "formDraft" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL DEFAULT 'Untitled Requirements Spec',
      "currentStep" INTEGER NOT NULL DEFAULT 1,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "data" JSONB NOT NULL,
      "stepProgress" JSONB,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "fileReference" (
      "id" TEXT PRIMARY KEY,
      "fileName" TEXT NOT NULL,
      "originalName" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "fileSize" INTEGER NOT NULL,
      "filePath" TEXT NOT NULL,
      "metadata" JSONB,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "draftId" TEXT REFERENCES "formDraft"("id") ON DELETE SET NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "auditLog" (
      "id" TEXT PRIMARY KEY,
      "draftId" TEXT NOT NULL REFERENCES "formDraft"("id") ON DELETE CASCADE,
      "userId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
      "userRole" TEXT NOT NULL DEFAULT 'contributor',
      "action" TEXT NOT NULL,
      "stage" INTEGER,
      "summary" TEXT NOT NULL,
      "diff" JSONB,
      "snapshot" JSONB,
      "checksum" TEXT,
      "metadata" JSONB,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS "idx_auditLog_draftId" ON "auditLog"("draftId");
    CREATE INDEX IF NOT EXISTS "idx_auditLog_createdAt" ON "auditLog"("createdAt" DESC);
  `);

  await client.end();
}

if (require.main === module) {
  ensurePostgres()
    .then(() => {
      console.log('PostgreSQL and database requirements_wizard are ready.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to ensure PostgreSQL:', err);
      process.exit(1);
    });
}
