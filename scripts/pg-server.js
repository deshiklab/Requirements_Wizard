const { PGlite } = require('@electric-sql/pglite');
const { createServer } = require('pglite-server');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../.pgdata');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new PGlite(dataDir);
const server = createServer(db);

server.listen(5432, '0.0.0.0', () => {
  console.log('PostgreSQL 18 (PGlite Wire Server) listening on port 5432');
});
