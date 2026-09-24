/**
 * SDAD Phase 5: Specification Governance & Formal Sign-Off State Machine
 * Manages formal review, cryptographic locking, and audited reopening workflows.
 */

import { DraftStatus, SignOffPayload, UserRole } from './types';
import { assertPermission, canEditDraft, canLockDraft, canReopenDraft, canSignOff } from './rbac';
import { computeSha256Checksum } from './diff';
import { WizardFormData } from '@/types/wizard';

export interface GovernanceTransitionResult {
  allowed: boolean;
  newStatus?: DraftStatus;
  error?: string;
  checksum?: string;
  metadata?: Record<string, any>;
}

/**
 * Validates transition from draft to in_review.
 */
export function validateSubmitForReview(
  role: UserRole | string,
  currentStatus: DraftStatus | string,
  readinessScore: number
): GovernanceTransitionResult {
  assertPermission(role, 'draft:submit_review');

  if (currentStatus === 'locked') {
    return {
      allowed: false,
      error: 'Cannot submit a locked specification for review. It must first be reopened by a Lead Architect.',
    };
  }

  if (readinessScore < 70) {
    return {
      allowed: false,
      error: `Specification readiness score (${readinessScore}/100) is below the minimum threshold (70/100) required for formal review. Please address missing requirements.`,
    };
  }

  return {
    allowed: true,
    newStatus: 'in_review',
    metadata: {
      submittedAt: new Date().toISOString(),
      readinessScore,
    },
  };
}

/**
 * Validates and executes Lead Architect sign-off.
 */
export function validateSignOff(
  role: UserRole | string,
  payload: SignOffPayload
): GovernanceTransitionResult {
  if (!canSignOff(role)) {
    return {
      allowed: false,
      error: 'Unauthorized: Formal sign-off requires Lead Architect or Enterprise Administrator credentials.',
    };
  }

  if (!payload.signOffArchitect || payload.signOffArchitect.trim().length < 3) {
    return {
      allowed: false,
      error: 'Sign-off failed: Digital architect signature name must be at least 3 characters.',
    };
  }

  if (payload.readinessScore < 75) {
    return {
      allowed: false,
      error: `Sign-off rejected: Readiness score (${payload.readinessScore}/100) must be at least 75% for formal sign-off.`,
    };
  }

  return {
    allowed: true,
    newStatus: 'approved',
    metadata: {
      signedOffAt: new Date().toISOString(),
      signedOffBy: payload.signOffArchitect,
      roleTitle: payload.roleTitle || 'Lead Architect',
      organization: payload.organization || 'Architecture Review Board',
      notes: payload.notes || 'Specification approved under SDAD governance.',
      readinessScore: payload.readinessScore,
    },
  };
}

/**
 * Strips self-referential governance envelope metadata from draft before calculating or verifying cryptographic seal.
 */
export function getVerifiableDraftPayload(formData: any): any {
  if (!formData || typeof formData !== 'object') return formData;
  const { governance, ...verifiableContent } = formData;
  return verifiableContent;
}

/**
 * Validates and cryptographically locks a specification.
 */
export function validateLockSpecification(
  role: UserRole | string,
  formData: WizardFormData,
  actorName: string
): GovernanceTransitionResult {
  if (!canLockDraft(role)) {
    return {
      allowed: false,
      error: 'Unauthorized: Cryptographic specification locking requires Lead Architect or Administrator permissions.',
    };
  }

  const verifiable = getVerifiableDraftPayload(formData);
  const checksum = computeSha256Checksum(verifiable);

  return {
    allowed: true,
    newStatus: 'locked',
    checksum,
    metadata: {
      lockedAt: new Date().toISOString(),
      lockedBy: actorName,
      sealedChecksum: checksum,
      immutable: true,
    },
  };
}

/**
 * Validates reopening a locked or approved specification.
 */
export function validateReopenSpecification(
  role: UserRole | string,
  reason: string,
  actorName: string
): GovernanceTransitionResult {
  if (!canReopenDraft(role)) {
    return {
      allowed: false,
      error: 'Unauthorized: Reopening an approved or locked specification requires Lead Architect or Administrator permissions.',
    };
  }

  if (!reason || reason.trim().length < 8) {
    return {
      allowed: false,
      error: 'An audit reason of at least 8 characters is strictly required to reopen a locked specification.',
    };
  }

  return {
    allowed: true,
    newStatus: 'draft',
    metadata: {
      reopenedAt: new Date().toISOString(),
      reopenedBy: actorName,
      reopenReason: reason.trim(),
    },
  };
}

/**
 * Verifies document integrity against stored cryptographic seal.
 */
export function verifyDocumentIntegrity(
  currentFormData: WizardFormData,
  storedChecksum: string
): { verified: boolean; calculatedChecksum: string; storedChecksum: string } {
  const verifiable = getVerifiableDraftPayload(currentFormData);
  const calculatedChecksum = computeSha256Checksum(verifiable);
  return {
    verified: calculatedChecksum === storedChecksum,
    calculatedChecksum,
    storedChecksum,
  };
}
