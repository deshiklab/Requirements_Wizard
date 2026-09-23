import { WizardFormData, FunctionalRequirement } from '@/types/wizard';

export type RuleOperator =
  | 'equals'
  | 'notEquals'
  | 'inArray'
  | 'notInArray'
  | 'contains'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'truthy'
  | 'falsy';

export type RuleSeverity = 'info' | 'warning' | 'error';

export interface ValidationWarning {
  code: string;
  fieldId?: string;
  message: string;
  severity: RuleSeverity;
  step: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'architecture' | 'security' | 'compliance' | 'performance' | 'functional';
  suggestedRequirement?: Partial<FunctionalRequirement>;
}

export interface ConditionalRule {
  id: string;
  name: string;
  condition: (data: WizardFormData) => boolean;
  onTrue: {
    showFields?: string[];
    hideFields?: string[];
    requireFields?: string[];
    warnings?: ValidationWarning[];
    recommendations?: Recommendation[];
  };
}

export interface ConditionalEvaluationResult {
  visibleFields: Set<string>;
  hiddenFields: Set<string>;
  requiredFields: Set<string>;
  warnings: ValidationWarning[];
  recommendations: Recommendation[];
  triggeredRuleIds: string[];
}

/**
 * Built-in Rule Catalog for Requirements Elicitation
 */
export const CONDITIONAL_RULES: ConditionalRule[] = [
  // 1. Mobile Archetype
  {
    id: 'rule-archetype-mobile',
    name: 'Mobile App Requirements & Hardware Features',
    condition: (data) => data.step1_identity.projectType === 'mobile_app',
    onTrue: {
      showFields: ['mobilePlatforms', 'offlineRequired', 'pushNotifications'],
      requireFields: ['mobilePlatforms'],
      recommendations: [
        {
          id: 'rec-mobile-app-store-guidelines',
          title: 'App Store Review & Permissions Protocol',
          description: 'Document permission prompt rationale (Camera, Location, Push) in the SRS to ensure Apple App Store and Google Play approval.',
          category: 'compliance',
        },
      ],
    },
  },

  // 2. Mobile Offline Sync
  {
    id: 'rule-mobile-offline-sync',
    name: 'Mobile Offline Storage & Conflict Resolution',
    condition: (data) =>
      data.step1_identity.projectType === 'mobile_app' && Boolean(data.step1_identity.offlineRequired),
    onTrue: {
      recommendations: [
        {
          id: 'rec-offline-sync-engine',
          title: 'Offline-First Data Sync & Conflict Resolution',
          description: 'Specify an optimistic local store (e.g. SQLite / WatermelonDB) and define a deterministic Last-Write-Wins or CRDT conflict resolution model.',
          category: 'architecture',
          suggestedRequirement: {
            id: 'FR-OFFLINE-SYNC',
            title: 'Offline Data Synchronization',
            priority: 'P0',
            category: 'Offline Resilience',
            userStory: 'As a mobile user, I want full app functionality when disconnected so that my work saves locally and syncs automatically when online.',
            acceptanceCriteria: [
              'Data is written to encrypted local SQLite database first',
              'Outbox queue automatically flushes with exponential backoff upon network reconnection',
              'Conflict resolution strategy logs non-reconcilable deltas',
            ],
          },
        },
      ],
    },
  },

  // 3. Enterprise SaaS Archetype
  {
    id: 'rule-archetype-enterprise-saas',
    name: 'Enterprise Multi-Tenancy & Governance',
    condition: (data) => data.step1_identity.projectType === 'enterprise_saas',
    onTrue: {
      showFields: ['multiTenancyModel', 'enterpriseSso'],
      requireFields: ['multiTenancyModel'],
      recommendations: [
        {
          id: 'rec-tenant-isolation',
          title: 'Tenant Isolation & Row-Level Security Strategy',
          description: 'Define database schema isolation boundaries to prevent cross-tenant data leakage and satisfy enterprise procurement security questionnaires.',
          category: 'security',
        },
      ],
    },
  },

  // 4. Enterprise SSO Requirement
  {
    id: 'rule-enterprise-sso',
    name: 'SAML 2.0 / OIDC Enterprise Federation',
    condition: (data) =>
      data.step1_identity.projectType === 'enterprise_saas' && Boolean(data.step1_identity.enterpriseSso),
    onTrue: {
      recommendations: [
        {
          id: 'rec-sso-saml',
          title: 'Enterprise Identity Federation (SAML 2.0 / Okta / Entra)',
          description: 'Ensure directory sync (SCIM) and Just-in-Time (JIT) provisioning are captured in authentication specifications.',
          category: 'security',
          suggestedRequirement: {
            id: 'FR-ENT-SSO',
            title: 'Enterprise Single Sign-On (SSO)',
            priority: 'P0',
            category: 'Enterprise Auth',
            userStory: 'As an enterprise IT administrator, I want staff to authenticate via our corporate Identity Provider so that session lifecycle is centrally controlled.',
            acceptanceCriteria: [
              'Support SAML 2.0 and OIDC assertions from Okta, Azure AD / Entra ID, and Google Workspace',
              'JIT user provisioning upon first successful identity verification',
              'Central session revocation via SCIM protocol',
            ],
          },
        },
      ],
    },
  },

  // 5. API / Backend Archetype
  {
    id: 'rule-archetype-api-backend',
    name: 'API Protocol Specification & Throttling',
    condition: (data) => data.step1_identity.projectType === 'api_backend',
    onTrue: {
      showFields: ['apiProtocol'],
      requireFields: ['apiProtocol'],
      recommendations: [
        {
          id: 'rec-api-rate-limit',
          title: 'Rate Limiting & Tiered API Quotas',
          description: 'Specify token bucket or leaky bucket rate limiting policies per API key and IP address to mitigate denial of service.',
          category: 'performance',
        },
      ],
    },
  },

  // 6. AI Agentic Archetype
  {
    id: 'rule-archetype-ai-agentic',
    name: 'AI Agent Guardrails, Context Budget & Human Sign-off',
    condition: (data) => data.step1_identity.projectType === 'ai_agentic',
    onTrue: {
      showFields: ['aiModelProvider', 'humanInTheLoop'],
      recommendations: [
        {
          id: 'rec-ai-guardrails',
          title: 'Deterministic AI Output Validation & Safety Guardrails',
          description: 'Enforce structured JSON schema extraction (e.g. Zod / Instructor), prompt injection defenses, and fallback models for high-availability agent workflows.',
          category: 'architecture',
          suggestedRequirement: {
            id: 'FR-AI-GUARDRAILS',
            title: 'Structured Output Validation & Fallback Handling',
            priority: 'P0',
            category: 'AI Pipeline',
            userStory: 'As a system operator, I want all AI agent responses validated against a deterministic schema so that hallucinations never corrupt database state.',
            acceptanceCriteria: [
              'Model generation parsed and strictly validated with Zod schemas',
              'Automated retry loop with prompt correction on schema parsing error (max 3 retries)',
              'Graceful fallback to secondary model provider on outage or rate limit',
            ],
          },
        },
      ],
    },
  },

  // 7. HIPAA Compliance Guardrail
  {
    id: 'rule-compliance-hipaa',
    name: 'HIPAA Security Rule Strict Constraints',
    condition: (data) =>
      data.step4_non_functional.securityCompliance.complianceStandards.includes('HIPAA'),
    onTrue: {
      warnings: [
        {
          code: 'HIPAA-ENC-AT-REST',
          fieldId: 'dataEncryptionAtRest',
          message: 'HIPAA compliance mandates AES-256 encryption-at-rest for all ePHI storage volumes and database instances.',
          severity: 'error',
          step: 4,
        },
      ],
      recommendations: [
        {
          id: 'rec-hipaa-audit',
          title: 'HIPAA Immutable Audit Trail & BAA Enforcement',
          description: 'Mandate signed Business Associate Agreements (BAAs) with all cloud providers and an immutable audit log tracking every ePHI read and mutation.',
          category: 'compliance',
        },
      ],
    },
  },

  // 8. GDPR Compliance Guardrail
  {
    id: 'rule-compliance-gdpr',
    name: 'GDPR Right to be Forgotten & Consent Records',
    condition: (data) =>
      data.step4_non_functional.securityCompliance.complianceStandards.includes('GDPR'),
    onTrue: {
      recommendations: [
        {
          id: 'rec-gdpr-erasure',
          title: 'GDPR Article 17 Data Erasure Workflow',
          description: 'Specify an automated right-to-erasure background job that cascades through primary and read replica databases within 30 days.',
          category: 'compliance',
          suggestedRequirement: {
            id: 'FR-GDPR-ERASURE',
            title: 'User Data Deletion & Export Workflow',
            priority: 'P1',
            category: 'GDPR Privacy',
            userStory: 'As a European citizen, I want to request permanent erasure and export of all personal data held by the system.',
            acceptanceCriteria: [
              'Self-service account deletion request with 7-day grace period',
              'Automated cryptographic deletion of personally identifiable information (PII)',
              'Audit log records deletion confirmation timestamp without retaining PII',
            ],
          },
        },
      ],
    },
  },

  // 9. High Throughput & Scalability Rules
  {
    id: 'rule-high-concurrency-caching',
    name: 'Distributed Caching for High Concurrency (> 2500 users or > 300 RPS)',
    condition: (data) =>
      data.step4_non_functional.scalability.peakConcurrentUsers >= 2500 ||
      data.step4_non_functional.performance.targetRps >= 300,
    onTrue: {
      recommendations: [
        {
          id: 'rec-distributed-caching',
          title: 'Multi-Tier Distributed Caching (Redis / CDN)',
          description: 'Target throughput exceeds single database node capacity. Implement edge caching via CDN and Redis cluster for frequently read session and master data.',
          category: 'performance',
        },
      ],
    },
  },

  // 10. High Availability SLA Constraints
  {
    id: 'rule-four-nines-availability',
    name: '99.99% Uptime Architecture & Fast RTO',
    condition: (data) =>
      data.step4_non_functional.availability.uptimeSla === '99.99%',
    onTrue: {
      warnings: [
        {
          code: 'HA-SLA-RTO-CHECK',
          fieldId: 'disasterRecoveryRtoMinutes',
          message: '99.99% uptime allows only ~52 minutes of total downtime per year. RTO must be configured to ≤ 15 minutes with multi-AZ failover.',
          severity: 'warning',
          step: 4,
        },
      ],
      recommendations: [
        {
          id: 'rec-multi-region-ha',
          title: 'Multi-AZ / Multi-Region Active-Active Architecture',
          description: 'Provision automated database read replica failover and cross-zone load balancing to meet four-nines SLA expectations.',
          category: 'architecture',
        },
      ],
    },
  },
];

/**
 * Evaluates all conditional rules against the current wizard form state.
 */
export function evaluateConditionalLogic(
  formData: WizardFormData,
  customRules: ConditionalRule[] = CONDITIONAL_RULES
): ConditionalEvaluationResult {
  const visibleFields = new Set<string>();
  const hiddenFields = new Set<string>();
  const requiredFields = new Set<string>();
  const warnings: ValidationWarning[] = [];
  const recommendations: Recommendation[] = [];
  const triggeredRuleIds: string[] = [];

  // Default core fields always visible
  const coreFields = [
    'projectName',
    'projectType',
    'description',
    'targetAudience',
    'inScope',
    'outOfScope',
    'personas',
    'requirements',
    'performance',
    'availability',
    'securityCompliance',
    'scalability',
    'preferredStack',
    'integrations',
    'attachments',
    'finalNotes',
  ];
  coreFields.forEach((f) => visibleFields.add(f));

  for (const rule of customRules) {
    let matches = false;
    try {
      matches = rule.condition(formData);
    } catch (err) {
      console.error(`[ConditionalLogicEngine] Error evaluating rule ${rule.id}:`, err);
    }

    if (matches) {
      triggeredRuleIds.push(rule.id);

      if (rule.onTrue.showFields) {
        rule.onTrue.showFields.forEach((field) => {
          visibleFields.add(field);
          hiddenFields.delete(field);
        });
      }

      if (rule.onTrue.hideFields) {
        rule.onTrue.hideFields.forEach((field) => {
          hiddenFields.add(field);
          visibleFields.delete(field);
        });
      }

      if (rule.onTrue.requireFields) {
        rule.onTrue.requireFields.forEach((field) => requiredFields.add(field));
      }

      if (rule.onTrue.warnings) {
        warnings.push(...rule.onTrue.warnings);
      }

      if (rule.onTrue.recommendations) {
        recommendations.push(...rule.onTrue.recommendations);
      }
    }
  }

  // Dynamic cross-field consistency checks
  if (
    formData.step4_non_functional.securityCompliance.complianceStandards.includes('HIPAA') &&
    !formData.step4_non_functional.securityCompliance.dataEncryptionAtRest
  ) {
    warnings.push({
      code: 'ERR-HIPAA-ENCRYPTION-REST-DISABLED',
      fieldId: 'dataEncryptionAtRest',
      message: 'CRITICAL: Data Encryption at Rest is disabled but HIPAA compliance is selected.',
      severity: 'error',
      step: 4,
    });
  }

  if (
    formData.step4_non_functional.availability.uptimeSla === '99.99%' &&
    formData.step4_non_functional.availability.disasterRecoveryRtoMinutes > 15
  ) {
    warnings.push({
      code: 'WARN-RTO-EXCEEDS-SLA',
      fieldId: 'disasterRecoveryRtoMinutes',
      message: `RTO of ${formData.step4_non_functional.availability.disasterRecoveryRtoMinutes}m is too high for a 99.99% SLA (maximum recommended: 15m).`,
      severity: 'warning',
      step: 4,
    });
  }

  return {
    visibleFields,
    hiddenFields,
    requiredFields,
    warnings,
    recommendations,
    triggeredRuleIds,
  };
}

/**
 * Calculates a quantitative Specification Readiness Score (0-100) based on SDAD Spec Fidelity principles.
 */
export function calculateSpecReadinessScore(
  formData: WizardFormData,
  evalResult: ConditionalEvaluationResult
): {
  score: number;
  grade: 'Ready for Review' | 'In Progress' | 'Incomplete';
  checklist: { name: string; complete: boolean; weight: number; feedback: string }[];
} {
  const checklist = [
    {
      name: 'Project Scope Defined',
      weight: 20,
      complete:
        Boolean(formData.step1_identity.projectName.trim()) &&
        Boolean(formData.step1_identity.description.trim()) &&
        formData.step1_identity.inScope.length > 0,
      feedback: 'Project name, description, and at least one in-scope item defined.',
    },
    {
      name: 'User Personas Established',
      weight: 15,
      complete:
        formData.step2_personas.personas.length >= 1 &&
        formData.step2_personas.personas.every((p) => p.name.trim() && p.role.trim() && p.goals.trim()),
      feedback: 'At least one complete persona with defined goals and pain points.',
    },
    {
      name: 'Core Functional Requirements (P0)',
      weight: 25,
      complete:
        formData.step3_functional.requirements.length >= 1 &&
        formData.step3_functional.requirements.some((r) => r.priority === 'P0') &&
        formData.step3_functional.requirements.every((r) => r.acceptanceCriteria.length > 0),
      feedback: 'At least one P0 requirement with explicit acceptance criteria.',
    },
    {
      name: 'Non-Functional Requirements & SLAs',
      weight: 20,
      complete:
        formData.step4_non_functional.performance.maxLatencyMs > 0 &&
        Boolean(formData.step4_non_functional.availability.uptimeSla) &&
        Boolean(formData.step4_non_functional.securityCompliance.authStrategy),
      feedback: 'Latency target, SLA, and authentication strategy configured.',
    },
    {
      name: 'Tech Stack & Architecture Constraints',
      weight: 10,
      complete:
        Boolean(formData.step5_tech_and_context.preferredStack.frontend) &&
        Boolean(formData.step5_tech_and_context.preferredStack.database),
      feedback: 'Core frontend and database technologies selected.',
    },
    {
      name: 'Zero Critical Validation Warnings',
      weight: 10,
      complete: !evalResult.warnings.some((w) => w.severity === 'error'),
      feedback: 'No unresolved critical architectural or compliance contradictions.',
    },
  ];

  let rawScore = 0;
  for (const item of checklist) {
    if (item.complete) {
      rawScore += item.weight;
    }
  }

  // Deduct for active warnings
  const warningPenalty = Math.min(15, evalResult.warnings.filter((w) => w.severity === 'warning').length * 5);
  const finalScore = Math.max(0, rawScore - warningPenalty);

  let grade: 'Ready for Review' | 'In Progress' | 'Incomplete' = 'Incomplete';
  if (finalScore >= 80) {
    grade = 'Ready for Review';
  } else if (finalScore >= 50) {
    grade = 'In Progress';
  }

  return {
    score: finalScore,
    grade,
    checklist,
  };
}
