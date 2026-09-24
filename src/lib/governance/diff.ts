/**
 * SDAD Phase 5: Semantic Diff Engine & Cryptographic Integrity Seal
 * Computes deep field-level changes between requirement revisions and generates SHA-256 seals.
 */

import crypto from 'crypto';
import { DraftDiff, FieldChange } from './types';
import { WizardFormData } from '@/types/wizard';

/**
 * Computes deterministic canonical representation of any JSON-compatible object.
 */
function canonicalizeJson(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(canonicalizeJson);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of sortedKeys) {
    result[key] = canonicalizeJson(obj[key]);
  }
  return result;
}

/**
 * Computes deterministic SHA-256 hash for any specification payload.
 */
export function computeSha256Checksum(payload: any): string {
  const canonical = canonicalizeJson(payload);
  const canonicalString = JSON.stringify(canonical);
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Computes semantic field-level differences between two wizard form states.
 */
export function computeDraftDiff(before: Partial<WizardFormData> | null | undefined, after: Partial<WizardFormData>): DraftDiff {
  const changes: FieldChange[] = [];

  if (!before) {
    return {
      changes: [
        {
          path: 'root',
          label: 'Specification Draft Created',
          changeType: 'added',
          before: null,
          after: after?.step1_identity?.projectName || 'New Draft',
        },
      ],
      summary: `Initial creation of specification "${after?.step1_identity?.projectName || 'Draft'}"`,
      totalChanges: 1,
    };
  }

  // 1. Stage 1: Identity & Scope
  const b1: any = before.step1_identity || {};
  const a1: any = after.step1_identity || {};

  if (b1.projectName !== a1.projectName) {
    changes.push({
      path: 'step1_identity.projectName',
      label: 'Project Name',
      changeType: 'modified',
      before: b1.projectName || '',
      after: a1.projectName || '',
    });
  }

  const bArchetype = b1.targetArchetype || b1.projectType;
  const aArchetype = a1.targetArchetype || a1.projectType;
  if (bArchetype !== aArchetype) {
    changes.push({
      path: 'step1_identity.targetArchetype',
      label: 'Target Archetype',
      changeType: 'modified',
      before: bArchetype || '',
      after: aArchetype || '',
    });
  }

  const bPurpose = b1.projectPurpose || b1.description;
  const aPurpose = a1.projectPurpose || a1.description;
  if (bPurpose !== aPurpose) {
    changes.push({
      path: 'step1_identity.projectPurpose',
      label: 'Mission & Purpose',
      changeType: 'modified',
      before: bPurpose || '',
      after: aPurpose || '',
    });
  }

  // Compare inScope arrays
  const bInScope: string[] = b1.inScope || [];
  const aInScope: string[] = a1.inScope || [];
  const addedInScope = aInScope.filter((x) => !bInScope.includes(x));
  const removedInScope = bInScope.filter((x) => !aInScope.includes(x));
  if (addedInScope.length > 0) {
    changes.push({
      path: 'step1_identity.inScope',
      label: 'In-Scope Additions',
      changeType: 'added',
      before: null,
      after: addedInScope,
    });
  }
  if (removedInScope.length > 0) {
    changes.push({
      path: 'step1_identity.inScope',
      label: 'In-Scope Removals',
      changeType: 'removed',
      before: removedInScope,
      after: null,
    });
  }

  // 2. Stage 2: Stakeholder Personas
  const bPersonas: any[] = before.step2_personas?.personas || [];
  const aPersonas: any[] = after.step2_personas?.personas || [];
  if (bPersonas.length !== aPersonas.length) {
    changes.push({
      path: 'step2_personas.personas',
      label: 'Stakeholder Personas Count',
      changeType: aPersonas.length > bPersonas.length ? 'added' : 'removed',
      before: `${bPersonas.length} personas`,
      after: `${aPersonas.length} personas`,
    });
  }

  // 3. Stage 3: Functional Requirements
  const bReqs: any[] = before.step3_functional?.requirements || [];
  const aReqs: any[] = after.step3_functional?.requirements || [];

  // Track added requirements
  for (const aReq of aReqs) {
    const matched = bReqs.find((b) => b.id === aReq.id);
    if (!matched) {
      changes.push({
        path: `step3_functional.requirements[${aReq.id}]`,
        label: `Added Requirement ${aReq.id}: ${aReq.title || 'Untitled'}`,
        changeType: 'added',
        before: null,
        after: { id: aReq.id, title: aReq.title, priority: aReq.priority },
      });
    } else {
      // Check priority modification
      if (matched.priority !== aReq.priority) {
        changes.push({
          path: `step3_functional.requirements[${aReq.id}].priority`,
          label: `Requirement ${aReq.id} Priority Changed`,
          changeType: 'modified',
          before: matched.priority,
          after: aReq.priority,
        });
      }
      // Check title modification
      if (matched.title !== aReq.title) {
        changes.push({
          path: `step3_functional.requirements[${aReq.id}].title`,
          label: `Requirement ${aReq.id} Title Changed`,
          changeType: 'modified',
          before: matched.title,
          after: aReq.title,
        });
      }
      // Check acceptance criteria count
      const bCritCount = matched.acceptanceCriteria?.length || 0;
      const aCritCount = aReq.acceptanceCriteria?.length || 0;
      if (bCritCount !== aCritCount) {
        changes.push({
          path: `step3_functional.requirements[${aReq.id}].acceptanceCriteria`,
          label: `Requirement ${aReq.id} Acceptance Criteria (${bCritCount} -> ${aCritCount})`,
          changeType: aCritCount > bCritCount ? 'added' : 'removed',
          before: `${bCritCount} criteria`,
          after: `${aCritCount} criteria`,
        });
      }
    }
  }

  // Track removed requirements
  for (const bReq of bReqs) {
    const matched = aReqs.find((a) => a.id === bReq.id);
    if (!matched) {
      changes.push({
        path: `step3_functional.requirements[${bReq.id}]`,
        label: `Removed Requirement ${bReq.id}: ${bReq.title || 'Untitled'}`,
        changeType: 'removed',
        before: { id: bReq.id, title: bReq.title, priority: bReq.priority },
        after: null,
      });
    }
  }

  // 4. Stage 4: Non-Functional Requirements
  const b4 = (before as any).step4_non_functional || (before as any).step4_nonFunctional || {};
  const a4 = (after as any).step4_non_functional || (after as any).step4_nonFunctional || {};

  const bUptime = b4.availability?.uptimeSla ?? b4.uptimeSla;
  const aUptime = a4.availability?.uptimeSla ?? a4.uptimeSla;
  if (bUptime !== aUptime) {
    changes.push({
      path: 'step4_non_functional.uptimeSla',
      label: 'Uptime SLA Target',
      changeType: 'modified',
      before: bUptime || '',
      after: aUptime || '',
    });
  }

  const bLatency = b4.performance?.maxLatencyMs ?? b4.latencyP95Ms;
  const aLatency = a4.performance?.maxLatencyMs ?? a4.latencyP95Ms;
  if (bLatency !== aLatency) {
    changes.push({
      path: 'step4_non_functional.latencyP95Ms',
      label: 'P95 Max Latency SLO',
      changeType: 'modified',
      before: `${bLatency ?? ''}ms`,
      after: `${aLatency ?? ''}ms`,
    });
  }

  const bEnc = b4.securityCompliance?.dataEncryptionAtRest ?? b4.encryptionAtRest;
  const aEnc = a4.securityCompliance?.dataEncryptionAtRest ?? a4.encryptionAtRest;
  if (bEnc !== aEnc) {
    changes.push({
      path: 'step4_non_functional.encryptionAtRest',
      label: 'Encryption at Rest',
      changeType: 'modified',
      before: bEnc ? 'Enabled' : 'Disabled',
      after: aEnc ? 'Enabled' : 'Disabled',
    });
  }

  // Compare compliance frameworks
  const bCompliance = b4.securityCompliance?.complianceStandards ?? b4.complianceFrameworks ?? [];
  const aCompliance = a4.securityCompliance?.complianceStandards ?? a4.complianceFrameworks ?? [];
  const addedCompliance = aCompliance.filter((x: string) => !bCompliance.includes(x));
  const removedCompliance = bCompliance.filter((x: string) => !aCompliance.includes(x));
  if (addedCompliance.length > 0 || removedCompliance.length > 0) {
    changes.push({
      path: 'step4_non_functional.complianceFrameworks',
      label: 'Compliance Frameworks',
      changeType: 'modified',
      before: bCompliance.join(', ') || 'None',
      after: aCompliance.join(', ') || 'None',
    });
  }

  // 5. Stage 5: Technical Context
  const b5 = (before as any).step5_tech_and_context || (before as any).step5_techContext || {};
  const a5 = (after as any).step5_tech_and_context || (after as any).step5_techContext || {};

  if (b5.architectureStyle !== a5.architectureStyle) {
    changes.push({
      path: 'step5_techContext.architectureStyle',
      label: 'Architecture Style',
      changeType: 'modified',
      before: b5.architectureStyle || '',
      after: a5.architectureStyle || '',
    });
  }

  // Build human-readable summary
  let summary = 'Specification updated';
  if (changes.length === 0) {
    summary = 'No semantic modifications detected';
  } else if (changes.length === 1) {
    summary = changes[0].label;
  } else {
    const addedCount = changes.filter((c) => c.changeType === 'added').length;
    const modCount = changes.filter((c) => c.changeType === 'modified').length;
    const remCount = changes.filter((c) => c.changeType === 'removed').length;
    const parts: string[] = [];
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (modCount > 0) parts.push(`${modCount} modified`);
    if (remCount > 0) parts.push(`${remCount} removed`);
    summary = `Modified ${changes.length} specification attributes (${parts.join(', ')})`;
  }

  return {
    changes,
    summary,
    totalChanges: changes.length,
  };
}
