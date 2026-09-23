import { execSync } from 'child_process';
import net from 'net';
import { Client } from 'pg';

const PG_PORT = 5432;
const PG_DATA = '/var/lib/postgresql/data';
const DB_NAME = 'requirements_wizard';

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
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

export async function ensurePostgres(): Promise<void> {
  const open = await isPortOpen(PG_PORT);
  if (!open) {
    console.log('PostgreSQL is not running on port 5432. Starting pg_ctl...');
    try {
      execSync(`pg_ctl -D ${PG_DATA} -l /tmp/postgresql.log start`, { stdio: 'inherit' });
    } catch {
      // If data dir not initialized
      execSync(`initdb -D ${PG_DATA} -U postgres --auth=trust`, { stdio: 'inherit' });
      execSync(`pg_ctl -D ${PG_DATA} -l /tmp/postgresql.log start`, { stdio: 'inherit' });
    }
  }

  // Ensure DB exists
  const client = new Client({ host: '127.0.0.1', port: PG_PORT, user: 'postgres' });
  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
  if (res.rows.length === 0) {
    console.log(`Database "${DB_NAME}" does not exist. Creating...`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);
  }
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
