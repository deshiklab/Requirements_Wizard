import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { Client } from 'pg';

const PG_PORT = 5432;

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function waitForPort(port: number, maxRetries = 20): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    const open = await isPortOpen(port);
    if (open) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Port ${port} did not become available in time.`);
}

export async function ensurePostgres(): Promise<void> {
  const open = await isPortOpen(PG_PORT);
  if (!open) {
    console.log('PostgreSQL is not running on port 5432. Starting PGlite wire server...');
    const serverScript = path.join(__dirname, 'pg-server.js');
    const child = spawn(process.execPath, [serverScript], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    await waitForPort(PG_PORT);
    console.log('PostgreSQL server is now listening on port 5432.');
  }

  // Ensure DB & Tables exist
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/requirements_wizard',
  });
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
