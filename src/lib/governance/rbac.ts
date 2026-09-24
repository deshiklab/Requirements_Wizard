/**
 * SDAD Phase 5: Role-Based Access Control (RBAC) Engine
 * Enforces least-privilege enterprise governance across requirements lifecycles.
 */

import { UserRole, Permission, DraftStatus } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'draft:create',
    'draft:edit',
    'draft:delete',
    'draft:view',
    'draft:submit_review',
    'draft:sign_off',
    'draft:lock',
    'draft:reopen',
    'draft:restore',
    'draft:export',
    'audit:view',
    'role:manage',
  ],
  lead_architect: [
    'draft:create',
    'draft:edit',
    'draft:view',
    'draft:submit_review',
    'draft:sign_off',
    'draft:lock',
    'draft:reopen',
    'draft:restore',
    'draft:export',
    'audit:view',
  ],
  contributor: [
    'draft:create',
    'draft:edit',
    'draft:view',
    'draft:submit_review',
    'draft:export',
    'audit:view',
  ],
  viewer: [
    'draft:view',
    'draft:export',
    'audit:view',
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; badgeColor: string; description: string }> = {
  admin: {
    title: 'Enterprise Administrator',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Unrestricted system access: user role governance, force unlocking, and global audit oversight.',
  },
  lead_architect: {
    title: 'Lead Architect',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Technical authority: approves specifications, signs off milestones, cryptographically locks drafts.',
  },
  contributor: {
    title: 'Requirements Contributor',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Authoring access: creates and updates functional/NFR requirements, runs AI elicitation.',
  },
  viewer: {
    title: 'Stakeholder / Viewer',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    description: 'Auditing access: reads specifications, inspects audit trail, and exports PRD artifacts.',
  },
};

/**
 * Normalizes input role string to a valid UserRole.
 */
export function normalizeUserRole(role?: string | null): UserRole {
  if (!role) return 'contributor';
  const clean = role.toLowerCase().trim();
  if (clean === 'admin') return 'admin';
  if (clean === 'lead_architect' || clean === 'architect' || clean === 'lead-architect') return 'lead_architect';
  if (clean === 'viewer' || clean === 'stakeholder') return 'viewer';
  return 'contributor';
}

/**
 * Checks whether a given role holds a specific permission.
 */
export function hasPermission(role: UserRole | string, permission: Permission): boolean {
  const normalized = normalizeUserRole(role);
  const permissions = ROLE_PERMISSIONS[normalized] || [];
  return permissions.includes(permission);
}

/**
 * Asserts that a given role holds a specific permission; throws if unauthorized.
 */
export function assertPermission(role: UserRole | string, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    const normalized = normalizeUserRole(role);
    throw new Error(
      `Access Denied: Role "${normalized}" lacks permission "${permission}". Required for this operation.`
    );
  }
}

/**
 * Evaluates whether a user can modify a draft in its current lifecycle status.
 * Strict Immutability Rule: Locked drafts CANNOT be edited until explicitly reopened.
 */
export function canEditDraft(
  role: UserRole | string,
  draftStatus: DraftStatus | string
): { allowed: boolean; reason?: string } {
  const normalizedRole = normalizeUserRole(role);
  const normalizedStatus = (draftStatus || 'draft').toLowerCase() as DraftStatus;

  // 1. Check basic permission
  if (!hasPermission(normalizedRole, 'draft:edit')) {
    return {
      allowed: false,
      reason: `Role "${normalizedRole}" is read-only and cannot modify requirement specifications.`,
    };
  }

  // 2. Immutability guard: locked drafts cannot be edited
  if (normalizedStatus === 'locked') {
    return {
      allowed: false,
      reason:
        'This specification is cryptographically LOCKED and immutable. An authorized Lead Architect or Admin must reopen it before changes can be made.',
    };
  }

  // 3. Approved drafts require reopening to prevent silent drift
  if (normalizedStatus === 'approved') {
    return {
      allowed: false,
      reason:
        'This specification has been APPROVED and signed off. Reopen the draft to create an audited revision.',
    };
  }

  return { allowed: true };
}

/**
 * Evaluates whether a user can sign off on a draft.
 */
export function canSignOff(role: UserRole | string): boolean {
  return hasPermission(role, 'draft:sign_off');
}

/**
 * Evaluates whether a user can lock a draft.
 */
export function canLockDraft(role: UserRole | string): boolean {
  return hasPermission(role, 'draft:lock');
}

/**
 * Evaluates whether a user can reopen a locked/approved draft.
 */
export function canReopenDraft(role: UserRole | string): boolean {
  return hasPermission(role, 'draft:reopen');
}

/**
 * Evaluates whether a user can rollback/restore a draft revision.
 */
export function canRestoreRevision(role: UserRole | string): boolean {
  return hasPermission(role, 'draft:restore');
}
