import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../prisma/contract.d';
import contractJson from '../prisma/contract.json';

const globalForDb = globalThis as unknown as {
  prismaDb: ReturnType<typeof postgres<Contract>> | undefined;
};

export const db =
  globalForDb.prismaDb ??
  postgres<Contract>({
    contractJson,
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/requirements_wizard',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.prismaDb = db;
}

export default db;
