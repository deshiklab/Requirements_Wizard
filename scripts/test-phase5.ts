/**
 * SDAD Phase 5 Verification Test Suite
 * Governance, Auditing, RBAC & End-to-End Hardening
 */

import { ensurePostgres } from './ensure-db';
import { db } from '../src/lib/db';
import {
  hasPermission,
  assertPermission,
  canEditDraft,
  canSignOff,
  canLockDraft,
  canReopenDraft,
  canRestoreRevision,
  normalizeUserRole,
} from '../src/lib/governance/rbac';
import { computeDraftDiff, computeSha256Checksum } from '../src/lib/governance/diff';
import { recordAuditEntry, getDraftAuditTrail, getRevisionSnapshot } from '../src/lib/governance/audit';
import {
  submitForReviewAction,
  signOffDraftAction,
  lockSpecificationAction,
  reopenSpecificationAction,
  restoreRevisionAction,
  getAuditTrailAction,
  updateUserRoleAction,
  verifyDraftIntegrityAction,
} from '../src/actions/governance';
import { saveDraftAction, getDraftAction, attachFileReferenceAction } from '../src/actions/drafts';
import { getOrCreateUserAction } from '../src/actions/users';
import { INITIAL_WIZARD_FORM_DATA, WizardFormData } from '../src/types/wizard';
import { Client } from 'pg';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, description: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${description}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${description}`);
  }
}

async function runPhase5Verification() {
  console.log('\n================================================================');
  console.log('SDAD Phase 5 Verification: Governance, Auditing, RBAC & Hardening');
  console.log('Platform: Requirements Wizard');
  console.log('Security & Governance: Least-Privilege RBAC + Cryptographic SHA-256');
  console.log('================================================================\n');

  // Step 0: Ensure DB is active
  await ensurePostgres();

  // -------------------------------------------------------------
  // PART 1: Role-Based Access Control (RBAC) Permissions Matrix
  // -------------------------------------------------------------
  console.log('PART 1: Testing Role-Based Access Control (RBAC) Permissions Matrix...');

  // Admin permissions
  assert(hasPermission('admin', 'draft:create'), 'Admin can create drafts');
  assert(hasPermission('admin', 'draft:edit'), 'Admin can edit drafts');
  assert(hasPermission('admin', 'draft:sign_off'), 'Admin can sign off drafts');
  assert(hasPermission('admin', 'draft:lock'), 'Admin can lock drafts');
  assert(hasPermission('admin', 'draft:reopen'), 'Admin can reopen drafts');
  assert(hasPermission('admin', 'draft:restore'), 'Admin can restore revisions');
  assert(hasPermission('admin', 'role:manage'), 'Admin can manage user roles');

  // Lead Architect permissions
  assert(hasPermission('lead_architect', 'draft:sign_off'), 'Lead Architect can sign off specifications');
  assert(hasPermission('lead_architect', 'draft:lock'), 'Lead Architect can lock specifications');
  assert(hasPermission('lead_architect', 'draft:reopen'), 'Lead Architect can reopen specifications');
  assert(hasPermission('lead_architect', 'draft:restore'), 'Lead Architect can restore revisions');
  assert(!hasPermission('lead_architect', 'role:manage'), 'Lead Architect CANNOT manage user roles');

  // Contributor permissions
  assert(hasPermission('contributor', 'draft:create'), 'Contributor can create drafts');
  assert(hasPermission('contributor', 'draft:edit'), 'Contributor can edit drafts in progress');
  assert(hasPermission('contributor', 'draft:submit_review'), 'Contributor can submit draft for review');
  assert(!hasPermission('contributor', 'draft:sign_off'), 'Contributor CANNOT sign off specifications');
  assert(!hasPermission('contributor', 'draft:lock'), 'Contributor CANNOT cryptographically lock specifications');
  assert(!hasPermission('contributor', 'draft:reopen'), 'Contributor CANNOT reopen locked specifications');
  assert(!hasPermission('contributor', 'draft:restore'), 'Contributor CANNOT restore historical revisions');

  // Viewer permissions
  assert(hasPermission('viewer', 'draft:view'), 'Viewer can view specifications');
  assert(hasPermission('viewer', 'draft:export'), 'Viewer can export specifications');
  assert(hasPermission('viewer', 'audit:view'), 'Viewer can view audit logs');
  assert(!hasPermission('viewer', 'draft:create'), 'Viewer CANNOT create drafts');
  assert(!hasPermission('viewer', 'draft:edit'), 'Viewer CANNOT edit drafts');
  assert(!hasPermission('viewer', 'draft:sign_off'), 'Viewer CANNOT sign off specifications');

  // assertPermission throwing behavior
  let caughtAssertion = false;
  try {
    assertPermission('contributor', 'draft:sign_off');
  } catch (err: any) {
    caughtAssertion = true;
  }
  assert(caughtAssertion, 'assertPermission throws when permission is not held');

  // canEditDraft checks
  assert(canEditDraft('contributor', 'draft').allowed, 'Contributor can edit draft status');
  assert(!canEditDraft('viewer', 'draft').allowed, 'Viewer cannot edit draft status');
  assert(!canEditDraft('contributor', 'locked').allowed, 'Contributor cannot edit locked draft');
  assert(!canEditDraft('lead_architect', 'locked').allowed, 'Lead Architect cannot edit locked draft without reopening');
  assert(!canEditDraft('admin', 'locked').allowed, 'Admin cannot edit locked draft without reopening (strict immutability)');

  // -------------------------------------------------------------
  // PART 2: Semantic Diff Engine & Cryptographic Integrity
  // -------------------------------------------------------------
  console.log('\nPART 2: Testing Semantic Diff Engine & Cryptographic Integrity...');

  const baseDraft: WizardFormData = {
    ...INITIAL_WIZARD_FORM_DATA,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      projectName: 'Alpha Health Gateway',
      projectType: 'enterprise_saas',
      inScope: ['Auth', 'Ingestion'],
    },
    step3_functional: {
      requirements: [
        {
          id: 'FR-01',
          title: 'Patient Record Ingestion',
          userStory: 'As a doctor, I want to ingest records',
          priority: 'P1',
          category: 'Clinical',
          acceptanceCriteria: ['Valid HL7 payload'],
        },
      ],
    },
    step4_non_functional: {
      performance: { maxLatencyMs: 250, targetRps: 100 },
      availability: { uptimeSla: '99.9%', disasterRecoveryRtoMinutes: 60 },
      securityCompliance: {
        complianceStandards: ['GDPR'],
        authStrategy: 'OAuth2',
        dataEncryptionAtRest: false,
        dataEncryptionInTransit: true,
      },
      scalability: { peakConcurrentUsers: 1000, cachingStrategy: 'Redis' },
    },
  };

  const modifiedDraft: WizardFormData = {
    ...baseDraft,
    step1_identity: {
      ...baseDraft.step1_identity,
      projectName: 'Alpha Health Gateway Enterprise',
      inScope: ['Auth', 'Ingestion', 'HIPAA Telemetry'],
    },
    step3_functional: {
      requirements: [
        {
          id: 'FR-01',
          title: 'Patient Record Ingestion',
          userStory: 'As a doctor, I want to ingest records',
          priority: 'P0', // Modified P1 -> P0
          category: 'Clinical',
          acceptanceCriteria: ['Valid HL7 payload', 'FHIR v4 schema validation'], // Criteria added
        },
        {
          id: 'FR-02',
          title: 'Emergency Medical Dispatch Webhook',
          userStory: 'As a paramedic, I want immediate dispatch alerts',
          priority: 'P0',
          category: 'Dispatch',
          acceptanceCriteria: ['Dispatch within 1s'],
        },
      ],
    },
    step4_non_functional: {
      ...baseDraft.step4_non_functional,
      performance: { maxLatencyMs: 120, targetRps: 500 },
      availability: { uptimeSla: '99.99%', disasterRecoveryRtoMinutes: 15 },
      securityCompliance: {
        complianceStandards: ['GDPR', 'HIPAA'],
        authStrategy: 'OAuth2',
        dataEncryptionAtRest: true,
        dataEncryptionInTransit: true,
      },
      scalability: { peakConcurrentUsers: 5000, cachingStrategy: 'Redis Cluster' },
    },
  };

  const diffResult = computeDraftDiff(baseDraft, modifiedDraft);

  assert(diffResult.totalChanges > 0, `Diff engine detected changes (count: ${diffResult.totalChanges})`);
  assert(
    diffResult.changes.some((c) => c.path === 'step1_identity.projectName'),
    'Diff detected Project Name change'
  );
  assert(
    diffResult.changes.some((c) => c.path === 'step1_identity.inScope'),
    'Diff detected In-Scope additions'
  );
  assert(
    diffResult.changes.some((c) => c.path.includes('FR-02')),
    'Diff detected added Requirement FR-02'
  );
  assert(
    diffResult.changes.some(
      (c) => c.path === 'step3_functional.requirements[FR-01].priority' && c.before === 'P1' && c.after === 'P0'
    ),
    'Diff detected priority change from P1 to P0'
  );
  assert(
    diffResult.changes.some((c) => c.path === 'step4_non_functional.uptimeSla'),
    'Diff detected Uptime SLA change to 99.99%'
  );
  assert(
    diffResult.changes.some((c) => c.path === 'step4_non_functional.encryptionAtRest'),
    'Diff detected Encryption at Rest toggle'
  );

  // Cryptographic hash calculation
  const checksum1 = computeSha256Checksum(baseDraft);
  const checksum2 = computeSha256Checksum(modifiedDraft);
  const checksum1Repeat = computeSha256Checksum(baseDraft);

  assert(typeof checksum1 === 'string' && checksum1.length === 64, 'Generated valid 64-char SHA-256 hash');
  assert(checksum1 === checksum1Repeat, 'Checksum calculation is strictly deterministic');
  assert(checksum1 !== checksum2, 'Modifications produce distinct cryptographic checksums');

  // -------------------------------------------------------------
  // PART 3: PostgreSQL Audit Log Persistence & Queries
  // -------------------------------------------------------------
  console.log('\nPART 3: Testing PostgreSQL Audit Log Persistence & Queries...');

  // Setup test users
  const adminUserRes = await getOrCreateUserAction({
    email: 'admin.governance@requirements-wizard.local',
    name: 'Enterprise Admin Alice',
    role: 'admin',
  });
  const architectUserRes = await getOrCreateUserAction({
    email: 'architect.bob@requirements-wizard.local',
    name: 'Lead Architect Bob',
    role: 'lead_architect',
  });
  const contributorUserRes = await getOrCreateUserAction({
    email: 'contributor.charlie@requirements-wizard.local',
    name: 'Requirements Author Charlie',
    role: 'contributor',
  });
  const viewerUserRes = await getOrCreateUserAction({
    email: 'viewer.diana@requirements-wizard.local',
    name: 'Stakeholder Diana',
    role: 'viewer',
  });

  const adminUser = adminUserRes.data;
  const architectUser = architectUserRes.data;
  const contributorUser = contributorUserRes.data;
  const viewerUser = viewerUserRes.data;

  assert(Boolean(adminUser?.id), 'Created Admin user in PostgreSQL');
  assert(Boolean(architectUser?.id), 'Created Lead Architect user in PostgreSQL');
  assert(Boolean(contributorUser?.id), 'Created Contributor user in PostgreSQL');
  assert(Boolean(viewerUser?.id), 'Created Viewer user in PostgreSQL');

  // Create a draft with contributor
  const createDraftRes = await saveDraftAction({
    userId: contributorUser.id,
    title: 'Phase 5 Telemetry Spec',
    currentStep: 1,
    status: 'draft',
    data: baseDraft,
  });

  assert(createDraftRes.success, 'Contributor created new draft in PostgreSQL');
  const testDraftId = createDraftRes.data.id;

  // Retrieve audit trail for the draft
  const initialTrail = await getDraftAuditTrail(testDraftId);
  assert(initialTrail.length >= 1, `Audit trail contains initial entry (count: ${initialTrail.length})`);
  assert(initialTrail[0].action === 'CREATE_DRAFT', 'Audit action recorded as CREATE_DRAFT');

  // Save an update to trigger automated diff audit logging
  const updateDraftRes = await saveDraftAction({
    id: testDraftId,
    userId: contributorUser.id,
    title: 'Phase 5 Telemetry Spec (Updated)',
    currentStep: 3,
    status: 'draft',
    data: modifiedDraft,
  });

  assert(updateDraftRes.success, 'Contributor saved modification to draft');

  const updatedTrail = await getDraftAuditTrail(testDraftId);
  assert(updatedTrail.length >= 2, `Audit trail recorded mutation (total events: ${updatedTrail.length})`);
  const editEntry = updatedTrail[0];
  assert(editEntry.action === 'UPDATE_STAGE', 'Logged UPDATE_STAGE action');
  assert(Boolean(editEntry.diff && editEntry.diff.totalChanges > 0), 'Audit log contains semantic diff payload');

  // -------------------------------------------------------------
  // PART 4: Governance Lifecycle (Submit -> Approve -> Lock -> Reopen)
  // -------------------------------------------------------------
  console.log('\nPART 4: Testing Governance Lifecycle (Submit -> Approve -> Lock -> Reopen)...');

  // Contributor submits for review with low readiness (expect failure)
  const rejectSubmitRes = await submitForReviewAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    userRole: 'contributor',
    readinessScore: 50,
  });
  assert(!rejectSubmitRes.success, 'Rejected review submission with low readiness score (<70%)');

  // Contributor submits for review with high readiness (expect success)
  const validSubmitRes = await submitForReviewAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    userRole: 'contributor',
    readinessScore: 92,
  });
  assert(validSubmitRes.success, 'Successfully submitted draft for formal review (92% readiness)');

  // Verify status updated in DB
  const draftAfterSubmit = await getDraftAction(testDraftId);
  assert(draftAfterSubmit.data.status === 'in_review', 'Draft status transitioned to in_review');

  // Contributor attempts to sign off (unauthorized)
  const unauthorizedSignOff = await signOffDraftAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    userRole: 'contributor',
    signOffArchitect: 'Charlie Contributor',
    readinessScore: 92,
  });
  assert(!unauthorizedSignOff.success, 'Blocked Contributor from signing off specification');

  // Lead Architect signs off (authorized)
  const architectSignOff = await signOffDraftAction({
    draftId: testDraftId,
    userId: architectUser.id,
    userRole: 'lead_architect',
    signOffArchitect: 'Bob Vance, Chief Architect',
    organization: 'Global Architecture Board',
    notes: 'Specification fully verified against IEEE 830 standards.',
    readinessScore: 95,
  });
  assert(architectSignOff.success, 'Lead Architect successfully approved and signed off specification');

  const draftAfterSignOff = await getDraftAction(testDraftId);
  assert(draftAfterSignOff.data.status === 'approved', 'Draft status transitioned to approved');
  assert(
    draftAfterSignOff.data.data.step6_review.signOffArchitect === 'Bob Vance, Chief Architect',
    'Architect digital signature persisted into JSONB step6_review'
  );

  // Contributor attempts to lock specification (unauthorized)
  const unauthorizedLock = await lockSpecificationAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    userRole: 'contributor',
    actorName: 'Charlie Contributor',
  });
  assert(!unauthorizedLock.success, 'Blocked Contributor from locking specification');

  // Lead Architect cryptographically locks the specification
  const architectLock = await lockSpecificationAction({
    draftId: testDraftId,
    userId: architectUser.id,
    userRole: 'lead_architect',
    actorName: 'Bob Vance, Chief Architect',
  });
  assert(architectLock.success, 'Lead Architect locked and cryptographically sealed specification');
  const sealedChecksum = architectLock.data?.checksum;
  assert(Boolean(sealedChecksum && sealedChecksum.length === 64), 'Generated valid 64-character SHA-256 seal');

  const draftAfterLock = await getDraftAction(testDraftId);
  assert(draftAfterLock.data.status === 'locked', 'Draft status transitioned to locked');

  // -------------------------------------------------------------
  // PART 5: Immutability Enforcement on Locked Specifications
  // -------------------------------------------------------------
  console.log('\nPART 5: Testing Immutability Enforcement on Locked Specifications...');

  // Attempting to save edits to a locked draft must fail
  const blockedEditAttempt = await saveDraftAction({
    id: testDraftId,
    userId: contributorUser.id,
    title: 'Tampered Specification Title',
    currentStep: 3,
    status: 'draft',
    data: baseDraft,
  });
  assert(!blockedEditAttempt.success, 'Strict Immutability Guard: BLOCKED modification of locked specification');

  // Attempting to attach files to a locked draft must fail
  const blockedFileAttach = await attachFileReferenceAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    fileName: 'tampered-diagram.png',
    originalName: 'Tampered Diagram.png',
    mimeType: 'image/png',
    fileSize: 1024,
    filePath: '/uploads/tampered.png',
  });
  assert(!blockedFileAttach.success, 'Strict Immutability Guard: BLOCKED attaching files to locked specification');

  // Verify document integrity check passes
  const integrityCheck = await verifyDraftIntegrityAction(testDraftId);
  assert(integrityCheck.success && integrityCheck.data?.verified === true, 'Cryptographic integrity verified against stored SHA-256 seal');

  // -------------------------------------------------------------
  // PART 6: Audited Reopening Workflow
  // -------------------------------------------------------------
  console.log('\nPART 6: Testing Audited Reopening Workflow...');

  // Contributor attempts to reopen (unauthorized)
  const unauthorizedReopen = await reopenSpecificationAction({
    draftId: testDraftId,
    userId: contributorUser.id,
    userRole: 'contributor',
    actorName: 'Charlie Contributor',
    reason: 'Want to make changes',
  });
  assert(!unauthorizedReopen.success, 'Blocked Contributor from reopening locked specification');

  // Architect attempts to reopen with too short a reason (<8 chars)
  const shortReasonReopen = await reopenSpecificationAction({
    draftId: testDraftId,
    userId: architectUser.id,
    userRole: 'lead_architect',
    actorName: 'Bob Vance',
    reason: 'test',
  });
  assert(!shortReasonReopen.success, 'Blocked reopening with inadequate justification (<8 characters)');

  // Architect reopens with valid audit justification
  const validReopen = await reopenSpecificationAction({
    draftId: testDraftId,
    userId: architectUser.id,
    userRole: 'lead_architect',
    actorName: 'Bob Vance, Chief Architect',
    reason: 'Adding multi-region failover criteria per audit committee directive',
  });
  assert(validReopen.success, 'Lead Architect successfully reopened specification with audit reason');

  const draftAfterReopen = await getDraftAction(testDraftId);
  assert(draftAfterReopen.data.status === 'draft', 'Draft status reverted to draft for authorized editing');

  // Now edits succeed again
  const allowedEditAfterReopen = await saveDraftAction({
    id: testDraftId,
    userId: contributorUser.id,
    title: 'Phase 5 Telemetry Spec (Post-Reopen Revision)',
    currentStep: 3,
    status: 'draft',
    data: modifiedDraft,
  });
  assert(allowedEditAfterReopen.success, 'Edits permitted after authorized reopening');

  // -------------------------------------------------------------
  // PART 7: Historical Snapshot Rollback & Revision Restoration
  // -------------------------------------------------------------
  console.log('\nPART 7: Testing Historical Snapshot Rollback & Revision Restoration...');

  const fullTrail = await getDraftAuditTrail(testDraftId);
  // Find the CREATE_DRAFT entry which captured the initial baseDraft snapshot
  const initialLog = fullTrail.find((l) => l.action === 'CREATE_DRAFT');
  assert(Boolean(initialLog && initialLog.snapshot), 'Located historical creation snapshot in audit trail');

  if (initialLog) {
    // Contributor attempts rollback (unauthorized)
    const unauthorizedRollback = await restoreRevisionAction({
      draftId: testDraftId,
      userId: contributorUser.id,
      userRole: 'contributor',
      auditLogId: initialLog.id,
    });
    assert(!unauthorizedRollback.success, 'Blocked Contributor from rolling back revision');

    // Lead Architect rolls back to initial revision
    const rollbackRes = await restoreRevisionAction({
      draftId: testDraftId,
      userId: architectUser.id,
      userRole: 'lead_architect',
      auditLogId: initialLog.id,
    });
    assert(rollbackRes.success, 'Lead Architect successfully executed revision rollback');

    // Verify draft reverted to baseDraft state
    const rolledBackDraft = await getDraftAction(testDraftId);
    assert(
      rolledBackDraft.data.data.step1_identity.projectName === 'Alpha Health Gateway',
      'Verified draft state restored to original project name "Alpha Health Gateway"'
    );
    assert(
      rolledBackDraft.data.data.step3_functional.requirements.length === 1,
      'Verified functional requirements rolled back to initial count of 1'
    );
  }

  // -------------------------------------------------------------
  // PART 8: User Role Management (RBAC Admin Powers)
  // -------------------------------------------------------------
  console.log('\nPART 8: Testing User Role Management (RBAC Admin Powers)...');

  // Contributor attempts to promote user to lead_architect (unauthorized)
  const unauthorizedRoleChange = await updateUserRoleAction({
    adminUserId: contributorUser.id,
    targetUserId: contributorUser.id,
    newRole: 'lead_architect',
  });
  assert(!unauthorizedRoleChange.success, 'Blocked Contributor from self-promoting user role');

  // Admin promotes contributor to lead_architect
  const adminRoleChange = await updateUserRoleAction({
    adminUserId: adminUser.id,
    targetUserId: contributorUser.id,
    newRole: 'lead_architect',
  });
  assert(adminRoleChange.success, 'Enterprise Admin promoted user to Lead Architect');

  // Verify updated role in PostgreSQL
  const promotedUser = await db.orm.public.User.where({ id: contributorUser.id }).first();
  assert(promotedUser?.role === 'lead_architect', 'Promoted role verified in PostgreSQL user table');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`Phase 5 Verification Summary: ${passedChecks}/${totalChecks} PASSED`);
  if (failedChecks > 0) {
    console.error(`FAILED CHECKS: ${failedChecks}`);
    process.exit(1);
  }
  console.log('================================================================\n');
  console.log('>>> PHASE 5 GOVERNANCE, AUDITING, RBAC & HARDENING VERIFIED: ALL TESTS PASSED! <<<\n');
}

runPhase5Verification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Phase 5 Verification fatal error:', err);
    process.exit(1);
  });
