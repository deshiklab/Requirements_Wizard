#!/bin/sh
set -e

echo "🚀 Requirements Wizard: Starting Container Entrypoint..."

# If database connection is specified, ensure schema & tables are ready
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Verifying database schema and connectivity..."
  node -e "
    const net = require('net');
    const u = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
    const port = parseInt(u.port || '5432', 10);
    const host = u.hostname || '127.0.0.1';
    let retries = 30;
    function check() {
      const sock = new net.Socket();
      sock.setTimeout(1000);
      sock.once('connect', () => {
        sock.destroy();
        console.log('✓ Database port is open at ' + host + ':' + port);
        process.exit(0);
      });
      sock.once('error', () => {
        sock.destroy();
        retry();
      });
      sock.once('timeout', () => {
        sock.destroy();
        retry();
      });
      sock.connect(port, host);
    }
    function retry() {
      retries--;
      if (retries <= 0) {
        console.warn('⚠ Could not reach database on ' + host + ':' + port + ' after 30s. Continuing startup...');
        process.exit(0);
      }
      setTimeout(check, 1000);
    }
    check();
  " || true

  echo "🛠️ Synchronizing database schema..."
  npx tsx scripts/ensure-db.ts || echo "⚠ Database initialization completed with warning"
fi

echo "✨ Launching application process: $@"
exec "$@"
