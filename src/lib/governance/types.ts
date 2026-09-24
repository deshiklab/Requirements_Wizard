/**
 * SDAD Phase 5: Governance, Auditing & Role-Based Access Control (RBAC)
 * Type Definitions & System Contracts
 */

export type UserRole = 'admin' | 'lead_architect' | 'contributor' | 'viewer';

export type DraftStatus = 'draft' | 'in_review' | 'approved' | 'locked' | 'rejected';

export type Permission =
  | 'draft:create'
  | 'draft:edit'
  | 'draft:delete'
  | 'draft:view'
  | 'draft:submit_review'
  | 'draft:sign_off'
  | 'draft:lock'
  | 'draft:reopen'
  | 'draft:restore'
  | 'draft:export'
  | 'audit:view'
  | 'role:manage';

export type AuditAction =
  | 'CREATE_DRAFT'
  | 'UPDATE_STAGE'
  | 'AUTO_SAVE'
  | 'SUBMIT_FOR_REVIEW'
  | 'SIGN_OFF_DRAFT'
  | 'REJECT_DRAFT'
  | 'LOCK_SPECIFICATION'
  | 'REOPEN_SPECIFICATION'
  | 'RESTORE_REVISION'
  | 'ATTACH_FILE'
  | 'EXPORT_DOCUMENT'
  | 'CHANGE_ROLE';

export interface FieldChange {
  path: string;
  label: string;
  changeType: 'added' | 'modified' | 'removed';
  before: any;
  after: any;
}

export interface DraftDiff {
  changes: FieldChange[];
  summary: string;
  totalChanges: number;
}

export interface AuditLogEntry {
  id: string;
  draftId: string;
  userId: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole: UserRole;
  action: AuditAction;
  stage: number | null;
  summary: string;
  diff: DraftDiff | null;
  snapshot: any | null;
  checksum: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

export interface SignOffPayload {
  signOffArchitect: string;
  roleTitle?: string;
  organization?: string;
  notes?: string;
  readinessScore: number;
}

export interface GovernanceState {
  status: DraftStatus;
  readinessScore: number;
  signedOffAt?: string | null;
  signedOffBy?: string | null;
  architectSignature?: string | null;
  lockedAt?: string | null;
  lockedBy?: string | null;
  sealedChecksum?: string | null;
  reopenedAt?: string | null;
  reopenedBy?: string | null;
  reopenReason?: string | null;
  version: string;
}
