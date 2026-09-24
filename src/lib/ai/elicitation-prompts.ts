import { ElicitationQuestion } from './types';
import { WizardFormData, ProjectArchetype } from '@/types/wizard';
import { generateAcceptanceCriteria } from './criteria-generator';

export function generateElicitationQuestions(
  formData: WizardFormData,
  activeStep?: number
): ElicitationQuestion[] {
  const questions: ElicitationQuestion[] = [];
  const archetype: ProjectArchetype = formData.step1_identity.projectType || 'web_app';

  // 1. Archetype-Specific Deep Elicitation
  if (archetype === 'ai_agentic') {
    questions.push({
      id: 'ai-q1-hallucination',
      category: 'edge_case',
      question: 'How should the system mitigate and catch model hallucinations or invalid JSON structures?',
      context: 'AI agent outputs are non-deterministic; without validation gates, downstream SQL or API actions will fail.',
      suggestedOptions: [
        'Enforce strict Zod schema parsing with automated 1x retry on schema failure',
        'Employ secondary critique/verifier LLM step for high-stakes decisions',
        'Fallback to deterministic rule-based template if LLM validation fails twice',
      ],
      recommendedRequirement: {
        title: 'Structured Output Validation & Schema Conformance Guard',
        category: 'AI Reliability',
        priority: 'P0',
        userStory: 'As a system orchestrator, I want all LLM responses validated against Zod schemas so that database corruption is prevented.',
        acceptanceCriteria: [
          'All LLM completions must parse cleanly through target Zod schema before state mutation',
          'Malformed completions must trigger an immediate self-correction retry with parser error feedback',
          'Persistent failures must alert human operator and execute deterministic fallback procedure',
        ],
      },
    });

    questions.push({
      id: 'ai-q2-injection',
      category: 'security',
      question: 'What prompt injection defenses and boundary isolation rules are mandatory?',
      context: 'Untrusted user inputs could hijack agent instructions or exfiltrate internal system prompts.',
      suggestedOptions: [
        'Heuristic delimiter escaping with system prompt segregation',
        'Pre-execution safety guardrail classifier (e.g. Llama Guard / NeMo)',
        'Sandboxed code execution for agentic code interpreters',
      ],
    });
  }

  if (archetype === 'enterprise_saas') {
    questions.push({
      id: 'saas-q1-tenant-isolation',
      category: 'security',
      question: 'What is the required level of tenant data isolation across storage and caching?',
      context: 'Enterprise customers mandate zero risk of cross-tenant data leakage during query execution.',
      suggestedOptions: [
        'Shared database with tenant_id foreign keys and PostgreSQL Row-Level Security (RLS)',
        'Database-per-tenant isolation for Tier-1 enterprise subscribers',
        'Encrypted tenant keys with segregated Redis cache namespaces',
      ],
      recommendedRequirement: {
        title: 'Multi-Tenant Data Isolation & Row-Level Security (RLS)',
        category: 'Data Governance',
        priority: 'P0',
        userStory: 'As an enterprise tenant, I want guaranteed data isolation so that no external tenant can access my records.',
        acceptanceCriteria: [
          'All database queries must enforce tenant_id partition filters via PostgreSQL RLS policies',
          'Cache keys must be prefixed with hashed tenant identifiers to prevent cross-tenant cache contamination',
          'Automated isolation regression tests must run on every CI/CD deployment pipeline',
        ],
      },
    });

    questions.push({
      id: 'saas-q2-audit',
      category: 'compliance',
      question: 'Do enterprise auditors require immutable audit logs and SCIM user provisioning?',
      context: 'SOC2 Type II and Okta/Azure AD enterprise procurement typically demand SCIM 2.0 and tamper-evident audit trails.',
      suggestedOptions: [
        'Full SCIM 2.0 automated provisioning and de-provisioning',
        'Append-only immutable audit log table with SHA-256 hash chaining',
        'Automated monthly compliance report export for customer CISOs',
      ],
    });
  }

  if (archetype === 'mobile_app') {
    questions.push({
      id: 'mob-q1-offline',
      category: 'edge_case',
      question: 'When offline changes conflict with remote server records, what is the resolution policy?',
      context: 'Concurrent edits in offline mobile mode can create data overwrite hazards.',
      suggestedOptions: [
        'Last-Write-Wins (LWW) based on NTP-synchronized timestamps',
        'Interactive client-side diff resolution screen for conflicting fields',
        'CRDT (Conflict-free Replicated Data Types) for collaborative collections',
      ],
      recommendedRequirement: {
        title: 'Offline Data Synchronization & Conflict Resolution Engine',
        category: 'Mobile Core',
        priority: 'P0',
        userStory: 'As a mobile user, I want my offline work preserved and safely synchronized upon reconnection without data loss.',
        acceptanceCriteria: [
          'Local transactions must be written to encrypted local SQLite database when offline',
          'Background synchronization must resume automatically via OS Network Change listeners',
          'Conflicts must be resolved using deterministic version vector matching',
        ],
      },
    });
  }

  if (archetype === 'api_backend') {
    questions.push({
      id: 'api-q1-idempotency',
      category: 'scale',
      question: 'How are duplicate mutating API requests handled during network timeouts?',
      context: 'Network drops during POST/PUT operations frequently cause clients to retry, risking duplicate transactions.',
      suggestedOptions: [
        'Mandatory Idempotency-Key HTTP header cached in Redis for 24 hours',
        'Deterministic hash of request body and auth token',
        'Database unique constraint violation catch and replay',
      ],
      recommendedRequirement: {
        title: 'Idempotent API Request Processing with Redis Deduping',
        category: 'API Infrastructure',
        priority: 'P0',
        userStory: 'As an API client developer, I want duplicate requests to return identical results so that accidental double charges are impossible.',
        acceptanceCriteria: [
          'Mutating POST endpoints must require and validate an Idempotency-Key UUID header',
          'Duplicate requests received within 24 hours must return the cached execution result with zero re-execution',
          'Concurrent requests with identical idempotency keys must be locked with a 5-second distributed mutex',
        ],
      },
    });
  }

  // 2. Cross-cutting Elicitations
  const hasAuthReq = formData.step3_functional.requirements.some((r) =>
    /auth|login|session|rbac/i.test(r.title)
  );

  if (!hasAuthReq) {
    questions.push({
      id: 'cross-q-auth',
      category: 'security',
      question: 'How should session lifecycle and role privileges be managed?',
      context: 'Specification currently lacks an explicit P0 requirement for authentication and session invalidation.',
      suggestedOptions: [
        'JWT access tokens (15m) + secure HttpOnly refresh tokens (7d) with rotation',
        'Session cookies backed by Redis session store with immediate revocation',
        'Single Sign-On (SSO) via Google / Microsoft OAuth 2.0',
      ],
      recommendedRequirement: {
        title: 'Secure Session Management & Role-Based Access Control',
        category: 'Security',
        priority: 'P0',
        userStory: 'As an administrator, I want authenticated sessions protected with rotation and RBAC so that unauthorized access is blocked.',
        acceptanceCriteria: [
          'Access tokens must expire in 15 minutes and rotate refresh tokens upon reuse detection',
          'Cookies must enforce HttpOnly, Secure, and SameSite=Strict attributes',
          'Role-based permissions must be evaluated on every server action and API endpoint',
        ],
      },
    });
  }

  // SLA & Latency verification
  if (formData.step4_non_functional.performance.maxLatencyMs > 500) {
    questions.push({
      id: 'cross-q-latency',
      category: 'scale',
      question: `Target latency is set to ${formData.step4_non_functional.performance.maxLatencyMs}ms. Is this acceptable for high-retention user experience?`,
      context: 'Modern web applications generally target sub-250ms p95 latency for interactive user workflows.',
      suggestedOptions: [
        'Tighten latency SLO to 200ms p95 with edge CDN caching',
        'Implement optimistic UI updates for instantaneous user perceived latency',
        'Keep current target as background processing allows higher latency',
      ],
    });
  }

  // If activeStep is specified, prioritize relevant questions
  return questions;
}
