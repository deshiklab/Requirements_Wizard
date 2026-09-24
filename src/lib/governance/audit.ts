/**
 * SDAD Phase 5: Audit Trail & Historical Versioning Service
 * Persists and retrieves chronological requirement mutation logs and snapshots.
 */

import { Client } from 'pg';
import crypto from 'crypto';
import { AuditAction, AuditLogEntry, DraftDiff, UserRole } from './types';
import { computeSha256Checksum } from './diff';

function getPgClient(): Client {
  return new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/requirements_wizard',
  });
}

export interface CreateAuditEntryInput {
  draftId: string;
  userId?: string | null;
  userRole?: UserRole | string;
  action: AuditAction;
  stage?: number | null;
  summary: string;
  diff?: DraftDiff | null;
  snapshot?: any | null;
  checksum?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Records an immutable audit log entry into PostgreSQL.
 */
export async function recordAuditEntry(input: CreateAuditEntryInput): Promise<AuditLogEntry> {
  const client = getPgClient();
  await client.connect();

  try {
    const id = crypto.randomUUID();
    const role = (input.userRole || 'contributor').toLowerCase();
    const checksum = input.checksum || (input.snapshot ? computeSha256Checksum(input.snapshot) : null);

    const res = await client.query(
      `INSERT INTO "auditLog" 
       ("id", "draftId", "userId", "userRole", "action", "stage", "summary", "diff", "snapshot", "checksum", "metadata", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [
        id,
        input.draftId,
        input.userId || null,
        role,
        input.action,
        input.stage ?? null,
        input.summary,
        input.diff ? JSON.stringify(input.diff) : null,
        input.snapshot ? JSON.stringify(input.snapshot) : null,
        checksum,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      draftId: row.draftId,
      userId: row.userId,
      userRole: row.userRole as UserRole,
      action: row.action as AuditAction,
      stage: row.stage,
      summary: row.summary,
      diff: row.diff,
      snapshot: row.snapshot,
      checksum: row.checksum,
      metadata: row.metadata,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    };
  } finally {
    await client.end();
  }
}

/**
 * Retrieves the full chronological audit trail for a draft.
 */
export async function getDraftAuditTrail(draftId: string, limit = 50): Promise<AuditLogEntry[]> {
  const client = getPgClient();
  await client.connect();

  try {
    const res = await client.query(
      `SELECT a.*, u.email as "userEmail", u.name as "userName"
       FROM "auditLog" a
       LEFT JOIN "user" u ON a."userId" = u."id"
       WHERE a."draftId" = $1
       ORDER BY a."createdAt" DESC
       LIMIT $2;`,
      [draftId, limit]
    );

    return res.rows.map((row) => ({
      id: row.id,
      draftId: row.draftId,
      userId: row.userId,
      userEmail: row.userEmail,
      userName: row.userName,
      userRole: row.userRole as UserRole,
      action: row.action as AuditAction,
      stage: row.stage,
      summary: row.summary,
      diff: row.diff,
      snapshot: row.snapshot,
      checksum: row.checksum,
      metadata: row.metadata,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    }));
  } finally {
    await client.end();
  }
}

/**
 * Retrieves a specific historical snapshot by audit log ID.
 */
export async function getRevisionSnapshot(auditLogId: string): Promise<any | null> {
  const client = getPgClient();
  await client.connect();

  try {
    const res = await client.query(
      `SELECT snapshot, checksum FROM "auditLog" WHERE "id" = $1;`,
      [auditLogId]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0].snapshot;
  } finally {
    await client.end();
  }
}
