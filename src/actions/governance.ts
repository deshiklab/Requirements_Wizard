'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  SubmitForReviewSchema,
  SubmitForReviewInput,
  SignOffDraftSchema,
  SignOffDraftInput,
  LockSpecificationSchema,
  LockSpecificationInput,
  ReopenSpecificationSchema,
  ReopenSpecificationInput,
  RestoreRevisionSchema,
  RestoreRevisionInput,
  GetAuditTrailSchema,
  GetAuditTrailInput,
  UpdateUserRoleSchema,
  UpdateUserRoleInput,
  ActionResponse,
} from './schemas';
import {
  canEditDraft,
  canLockDraft,
  canReopenDraft,
  canRestoreRevision,
  canSignOff,
  hasPermission,
  normalizeUserRole,
} from '@/lib/governance/rbac';
import { computeDraftDiff, computeSha256Checksum } from '@/lib/governance/diff';
import { getDraftAuditTrail, getRevisionSnapshot, recordAuditEntry } from '@/lib/governance/audit';
import {
  validateLockSpecification,
  validateReopenSpecification,
  validateSignOff,
  validateSubmitForReview,
  verifyDocumentIntegrity,
} from '@/lib/governance/sign-off';
import { AuditLogEntry, UserRole } from '@/lib/governance/types';

/**
 * Submits a draft for formal architecture review.
 */
export async function submitForReviewAction(
  input: SubmitForReviewInput
): Promise<ActionResponse<any>> {
  try {
    const validated = SubmitForReviewSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    const effectiveRole = (validated.userRole || user?.role || 'contributor') as UserRole;

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${validated.draftId}" not found.` };
    }

    const check = validateSubmitForReview(effectiveRole, draft.status, validated.readinessScore);
    if (!check.allowed || !check.newStatus) {
      return { success: false, error: check.error || 'Cannot submit for review.' };
    }

    const updated = await db.orm.public.FormDraft.where({ id: draft.id }).update({
      status: check.newStatus,
    });

    await recordAuditEntry({
      draftId: draft.id,
      userId: validated.userId,
      userRole: effectiveRole,
      action: 'SUBMIT_FOR_REVIEW',
      stage: draft.currentStep,
      summary: `Specification submitted for formal review (Readiness: ${validated.readinessScore}%)`,
      snapshot: draft.data,
      metadata: check.metadata,
    });

    try {
      revalidatePath(`/wizard/${draft.id}`);
      revalidatePath(`/wizard/${draft.id}/export`);
      revalidatePath('/');
    } catch {}

    return {
      success: true,
      data: updated,
      message: 'Specification successfully submitted for architectural review.',
    };
  } catch (err: any) {
    console.error('[submitForReviewAction Error]:', err);
    return { success: false, error: err.message || 'Failed to submit draft for review' };
  }
}

/**
 * Formally signs off an approved specification (Lead Architect / Admin only).
 */
export async function signOffDraftAction(
  input: SignOffDraftInput
): Promise<ActionResponse<any>> {
  try {
    const validated = SignOffDraftSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    const effectiveRole = (validated.userRole || user?.role || 'contributor') as UserRole;

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${validated.draftId}" not found.` };
    }

    const check = validateSignOff(effectiveRole, {
      signOffArchitect: validated.signOffArchitect,
      roleTitle: validated.roleTitle,
      organization: validated.organization,
      notes: validated.notes,
      readinessScore: validated.readinessScore,
    });

    if (!check.allowed || !check.newStatus) {
      return { success: false, error: check.error || 'Sign-off verification failed.' };
    }

    // Augment draft data with official governance signature block
    const existingData = (draft.data || {}) as any;
    const augmentedData = {
      ...existingData,
      step6_review: {
        ...(existingData.step6_review || {}),
        signOffArchitect: validated.signOffArchitect,
        status: 'approved',
        readinessScore: validated.readinessScore,
        notes: validated.notes || existingData.step6_review?.notes,
      },
      governance: {
        ...(existingData.governance || {}),
        ...check.metadata,
        status: 'approved',
      },
    };

    const updated = await db.orm.public.FormDraft.where({ id: draft.id }).update({
      status: check.newStatus,
      data: augmentedData,
    });

    await recordAuditEntry({
      draftId: draft.id,
      userId: validated.userId,
      userRole: effectiveRole,
      action: 'SIGN_OFF_DRAFT',
      stage: 6,
      summary: `Specification formally approved & signed off by ${validated.signOffArchitect}`,
      snapshot: augmentedData,
      metadata: check.metadata,
    });

    try {
      revalidatePath(`/wizard/${draft.id}`);
      revalidatePath(`/wizard/${draft.id}/export`);
      revalidatePath('/');
    } catch {}

    return {
      success: true,
      data: updated,
      message: `Specification formally approved by ${validated.signOffArchitect}`,
    };
  } catch (err: any) {
    console.error('[signOffDraftAction Error]:', err);
    return { success: false, error: err.message || 'Failed to sign off specification' };
  }
}

/**
 * Cryptographically seals and locks a specification (Immutable, tamper-evident).
 */
export async function lockSpecificationAction(
  input: LockSpecificationInput
): Promise<ActionResponse<any>> {
  try {
    const validated = LockSpecificationSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    const effectiveRole = (validated.userRole || user?.role || 'contributor') as UserRole;

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${validated.draftId}" not found.` };
    }

    const check = validateLockSpecification(effectiveRole, draft.data as any, validated.actorName);
    if (!check.allowed || !check.newStatus) {
      return { success: false, error: check.error || 'Failed to lock specification.' };
    }

    const existingData = (draft.data || {}) as any;
    const lockedData = {
      ...existingData,
      governance: {
        ...(existingData.governance || {}),
        ...check.metadata,
        status: 'locked',
        sealedChecksum: check.checksum,
      },
    };

    const updated = await db.orm.public.FormDraft.where({ id: draft.id }).update({
      status: 'locked',
      data: lockedData,
    });

    await recordAuditEntry({
      draftId: draft.id,
      userId: validated.userId,
      userRole: effectiveRole,
      action: 'LOCK_SPECIFICATION',
      stage: 6,
      summary: `Specification cryptographically locked by ${validated.actorName} (SHA-256: ${check.checksum?.slice(0, 12)}...)`,
      snapshot: lockedData,
      checksum: check.checksum,
      metadata: check.metadata,
    });

    try {
      revalidatePath(`/wizard/${draft.id}`);
      revalidatePath(`/wizard/${draft.id}/export`);
      revalidatePath('/');
    } catch {}

    return {
      success: true,
      data: { ...updated, checksum: check.checksum },
      message: `Specification locked and cryptographically sealed.`,
    };
  } catch (err: any) {
    console.error('[lockSpecificationAction Error]:', err);
    return { success: false, error: err.message || 'Failed to lock specification' };
  }
}

/**
 * Reopens a locked or approved specification with an audit-logged justification.
 */
export async function reopenSpecificationAction(
  input: ReopenSpecificationInput
): Promise<ActionResponse<any>> {
  try {
    const validated = ReopenSpecificationSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    const effectiveRole = (validated.userRole || user?.role || 'contributor') as UserRole;

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${validated.draftId}" not found.` };
    }

    const check = validateReopenSpecification(effectiveRole, validated.reason, validated.actorName);
    if (!check.allowed || !check.newStatus) {
      return { success: false, error: check.error || 'Failed to reopen specification.' };
    }

    const existingData = (draft.data || {}) as any;
    const reopenedData = {
      ...existingData,
      governance: {
        ...(existingData.governance || {}),
        ...check.metadata,
        status: 'draft',
      },
    };

    const updated = await db.orm.public.FormDraft.where({ id: draft.id }).update({
      status: 'draft',
      data: reopenedData,
    });

    await recordAuditEntry({
      draftId: draft.id,
      userId: validated.userId,
      userRole: effectiveRole,
      action: 'REOPEN_SPECIFICATION',
      stage: draft.currentStep,
      summary: `Specification reopened by ${validated.actorName}. Reason: "${validated.reason}"`,
      snapshot: reopenedData,
      metadata: { reason: validated.reason, reopenedBy: validated.actorName },
    });

    try {
      revalidatePath(`/wizard/${draft.id}`);
      revalidatePath(`/wizard/${draft.id}/export`);
      revalidatePath('/');
    } catch {}

    return {
      success: true,
      data: updated,
      message: 'Specification reopened for editing.',
    };
  } catch (err: any) {
    console.error('[reopenSpecificationAction Error]:', err);
    return { success: false, error: err.message || 'Failed to reopen specification' };
  }
}

/**
 * Restores a historical draft snapshot from the audit trail.
 */
export async function restoreRevisionAction(
  input: RestoreRevisionInput
): Promise<ActionResponse<any>> {
  try {
    const validated = RestoreRevisionSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    const effectiveRole = (validated.userRole || user?.role || 'contributor') as UserRole;

    if (!canRestoreRevision(effectiveRole)) {
      return {
        success: false,
        error: 'Unauthorized: Reverting to a previous revision requires Lead Architect or Administrator permissions.',
      };
    }

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${validated.draftId}" not found.` };
    }

    const editCheck = canEditDraft(effectiveRole, draft.status);
    if (!editCheck.allowed) {
      return { success: false, error: editCheck.reason || 'Cannot restore on locked draft.' };
    }

    const snapshot = await getRevisionSnapshot(validated.auditLogId);
    if (!snapshot) {
      return {
        success: false,
        error: `Historical snapshot for audit entry "${validated.auditLogId}" not found.`,
      };
    }

    const diff = computeDraftDiff(draft.data as any, snapshot as any);

    const updated = await db.orm.public.FormDraft.where({ id: draft.id }).update({
      data: snapshot,
    });

    await recordAuditEntry({
      draftId: draft.id,
      userId: validated.userId,
      userRole: effectiveRole,
      action: 'RESTORE_REVISION',
      stage: draft.currentStep,
      summary: `Restored historical revision from audit entry ${validated.auditLogId.slice(0, 8)}`,
      diff,
      snapshot,
      metadata: { restoredFromAuditId: validated.auditLogId },
    });

    try {
      revalidatePath(`/wizard/${draft.id}`);
      revalidatePath(`/wizard/${draft.id}/export`);
      revalidatePath('/');
    } catch {}

    return {
      success: true,
      data: updated,
      message: `Successfully rolled back specification to revision ${validated.auditLogId.slice(0, 8)}`,
    };
  } catch (err: any) {
    console.error('[restoreRevisionAction Error]:', err);
    return { success: false, error: err.message || 'Failed to restore revision' };
  }
}

/**
 * Retrieves the full chronological audit trail for a draft.
 */
export async function getAuditTrailAction(
  input: GetAuditTrailInput
): Promise<ActionResponse<AuditLogEntry[]>> {
  try {
    const validated = GetAuditTrailSchema.parse(input);
    const trail = await getDraftAuditTrail(validated.draftId, validated.limit);
    return { success: true, data: trail };
  } catch (err: any) {
    console.error('[getAuditTrailAction Error]:', err);
    return { success: false, error: err.message || 'Failed to retrieve audit trail' };
  }
}

/**
 * Updates a user's system role (Administrator only).
 */
export async function updateUserRoleAction(
  input: UpdateUserRoleInput
): Promise<ActionResponse<any>> {
  try {
    const validated = UpdateUserRoleSchema.parse(input);

    const admin = await db.orm.public.User.where({ id: validated.adminUserId }).first();
    if (!admin || normalizeUserRole(admin.role) !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized: Only Enterprise Administrators can modify user roles.',
      };
    }

    const targetUser = await db.orm.public.User.where({ id: validated.targetUserId }).first();
    if (!targetUser) {
      return { success: false, error: `Target user "${validated.targetUserId}" not found.` };
    }

    const updated = await db.orm.public.User.where({ id: validated.targetUserId }).update({
      role: validated.newRole,
    });

    return {
      success: true,
      data: updated,
      message: `User role for ${targetUser.email} updated to "${validated.newRole}".`,
    };
  } catch (err: any) {
    console.error('[updateUserRoleAction Error]:', err);
    return { success: false, error: err.message || 'Failed to update user role' };
  }
}

/**
 * Verifies document integrity against stored cryptographic seal.
 */
export async function verifyDraftIntegrityAction(
  draftId: string
): Promise<ActionResponse<{ verified: boolean; storedChecksum?: string; calculatedChecksum: string }>> {
  try {
    const draft = await db.orm.public.FormDraft.where({ id: draftId }).first();
    if (!draft) {
      return { success: false, error: `Draft "${draftId}" not found.` };
    }

    const storedChecksum = (draft.data as any)?.governance?.sealedChecksum;

    if (!storedChecksum) {
      const calculatedChecksum = computeSha256Checksum(draft.data);
      return {
        success: true,
        data: {
          verified: false,
          calculatedChecksum,
        },
        message: 'Specification has not yet been cryptographically locked.',
      };
    }

    const check = verifyDocumentIntegrity(draft.data as any, storedChecksum);

    return {
      success: true,
      data: {
        verified: check.verified,
        storedChecksum: check.storedChecksum,
        calculatedChecksum: check.calculatedChecksum,
      },
      message: check.verified
        ? 'Document integrity verified: Cryptographic SHA-256 seal matches.'
        : 'INTEGRITY ALERT: Document has been modified since it was cryptographically sealed!',
    };
  } catch (err: any) {
    console.error('[verifyDraftIntegrityAction Error]:', err);
    return { success: false, error: err.message || 'Failed to verify document integrity' };
  }
}
