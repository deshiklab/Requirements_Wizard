import {
  GeneratedCriteriaResult,
  GherkinScenario,
  RequirementExpansionResult,
} from './types';
import { ProjectArchetype, PriorityLevel } from '@/types/wizard';

interface GenerateCriteriaParams {
  title: string;
  userStory?: string;
  category?: string;
  personaRole?: string;
  archetype?: ProjectArchetype;
}

export function generateAcceptanceCriteria(
  params: GenerateCriteriaParams
): GeneratedCriteriaResult {
  const {
    title,
    userStory,
    category = 'General Feature',
    personaRole = 'Authorized User',
    archetype = 'web_app',
  } = params;

  const normalizedTitle = title.trim();
  const lowerTitle = normalizedTitle.toLowerCase();

  // 1. Synthesize normalized user story if missing or poorly formed
  let formattedUserStory = userStory?.trim() || '';
  const hasStoryFormat = /as a\s+.+?,\s*i want\s+.+?,\s*so that\s+.+/i.test(formattedUserStory);

  if (!hasStoryFormat) {
    formattedUserStory = `As an ${personaRole}, I want to ${normalizedTitle.toLowerCase()} so that I can achieve the expected business outcome with guaranteed reliability.`;
  }

  // 2. Derive domain-specific scenarios
  const gherkinScenarios: GherkinScenario[] = [];
  const acceptanceCriteria: string[] = [];
  const edgeCases: string[] = [];
  const negativeScenarios: string[] = [];

  // Determine scenario context based on keywords
  const isAuth = /auth|login|sign ?in|oauth|sso|session|jwt|password/i.test(lowerTitle);
  const isDataOrExport = /export|report|csv|pdf|download|sync|batch/i.test(lowerTitle);
  const isPayment = /payment|stripe|billing|invoice|checkout|subscription/i.test(lowerTitle);
  const isAi = /ai|model|llm|generate|prompt|agent|summar/i.test(lowerTitle) || archetype === 'ai_agentic';
  const isMobile = archetype === 'mobile_app';
  const isApi = archetype === 'api_backend';

  if (isAuth) {
    // Auth scenarios
    gherkinScenarios.push({
      title: 'Successful Authentication & Session Generation',
      type: 'happy_path',
      given: 'A valid registered user with verified credentials',
      when: 'The user submits the authentication form',
      then: 'The system issues a signed JWT access token and HTTP-only refresh token',
      and: ['User profile is loaded in memory', 'Audit log records successful login with IP and user-agent'],
    });
    gherkinScenarios.push({
      title: 'Invalid Credentials Rejection',
      type: 'error_handling',
      given: 'An unauthenticated client providing malformed or invalid credentials',
      when: 'The authentication request is submitted',
      then: 'The system responds with HTTP 401 Unauthorized and a standardized error code',
      and: ['No internal stack traces or user-existence clues are leaked in response'],
    });
    gherkinScenarios.push({
      title: 'Brute-force Throttling',
      type: 'security',
      given: '5 consecutive failed attempts from the same IP or account in 60 seconds',
      when: 'A 6th attempt is made',
      then: 'The system rejects the request with HTTP 429 Too Many Requests and enforces a 15-minute cooldown',
    });

    acceptanceCriteria.push(
      'Authentication tokens must be transmitted strictly over TLS 1.3 with HttpOnly, Secure, and SameSite=Strict cookie flags',
      'Failed logins must not disclose whether the email address exists in the system',
      'Rate limiting must trigger after 5 invalid attempts per minute per IP address',
      'Session revocation must invalidate all outstanding child refresh tokens immediately in Redis cache'
    );
    edgeCases.push(
      'Concurrent logins from different geographic locations triggers suspicious activity alert',
      'Expired refresh tokens return structured 401 requiring re-authentication rather than 500 error',
      'Clock skew between client and authentication server must be tolerated within 30 seconds'
    );
  } else if (isPayment) {
    // Payment scenarios
    gherkinScenarios.push({
      title: 'Successful Transaction Authorization',
      type: 'happy_path',
      given: 'A customer with a valid billing method and active shopping cart',
      when: 'The customer confirms payment',
      then: 'The gateway authorizes the transaction and records an immutable ledger entry',
      and: ['A digital receipt is dispatched via email within 5 seconds'],
    });
    gherkinScenarios.push({
      title: 'Card Decline & Insufficient Funds',
      type: 'error_handling',
      given: 'A payment gateway returning a card decline or insufficient funds code',
      when: 'Payment processing is attempted',
      then: 'The system preserves the cart state and presents actionable resolution guidance',
    });
    gherkinScenarios.push({
      title: 'Idempotency on Duplicate Submission',
      type: 'boundary_condition',
      given: 'Two identical payment requests submitted concurrently with matching idempotency keys',
      when: 'Both requests hit the payment endpoint',
      then: 'The system processes only the first request and returns the identical cached response for the second',
    });

    acceptanceCriteria.push(
      'All payment requests must require an Idempotency-Key header to prevent duplicate charges',
      'PCI-DSS compliance: No raw card numbers, CVVs, or sensitive authentication data stored in the database',
      'Webhook signatures from the payment processor must be verified cryptographically before mutating transaction state',
      'Ledger balance changes must be executed inside a single ACID database transaction'
    );
    edgeCases.push(
      'Webhook event received before frontend redirect completes must be handled gracefully',
      'Partial network failure between backend and payment gateway must initiate automated reconciliation',
      'Currency conversion rounding must maintain exact two-decimal precision without float drift'
    );
  } else if (isAi) {
    // AI Agentic scenarios
    gherkinScenarios.push({
      title: 'Structured Prompt Execution & Validated JSON Output',
      type: 'happy_path',
      given: 'A sanitized user input within allowable token limit',
      when: 'The AI model processes the request',
      then: 'The output is strictly validated against the target Zod schema before returning to client',
    });
    gherkinScenarios.push({
      title: 'Schema Validation Failure & Automated Retry',
      type: 'error_handling',
      given: 'An LLM response containing malformed JSON or schema mismatches',
      when: 'The validation parser fails',
      then: 'The system initiates a single corrective retry prompt with validation feedback before failing',
    });
    gherkinScenarios.push({
      title: 'Prompt Injection Defense',
      type: 'security',
      given: 'User prompt containing malicious override instructions (e.g., "Ignore previous instructions")',
      when: 'The prompt is evaluated by the input guardrail classifier',
      then: 'The input is sanitized or rejected with a security violation warning before reaching the LLM',
    });

    acceptanceCriteria.push(
      'All LLM completions must be parsed against a strict Zod schema before database persistence',
      'Total prompt + completion tokens must be bounded with a hard cutoff to prevent runaway billing',
      'Prompt injection defense heuristics must scrub delimiter manipulation and system prompt overrides',
      'When LLM rate limit is encountered (HTTP 429), system must back off exponentially or switch to secondary fallback model'
    );
    edgeCases.push(
      'Streaming responses must handle dropped SSE connections and resume without repeating output',
      'Hallucinated entity IDs must be validated against PostgreSQL foreign keys prior to display',
      'Context window truncation must prioritize preserving system prompt and recent conversational history'
    );
  } else if (isDataOrExport) {
    // Data export scenarios
    gherkinScenarios.push({
      title: 'Asynchronous Export of Large Dataset',
      type: 'happy_path',
      given: 'A dataset containing 50,000 records matching user filter criteria',
      when: 'The user triggers an asynchronous CSV export',
      then: 'A background worker queues the job and streams the generated file to object storage',
      and: ['A signed download URL expiring in 60 minutes is generated for the user'],
    });
    gherkinScenarios.push({
      title: 'Export Cancellation & Resource Cleanup',
      type: 'error_handling',
      given: 'An export job running in the background worker queue',
      when: 'The user cancels the export or the task times out after 10 minutes',
      then: 'The worker terminates the database cursor and frees temporary storage immediately',
    });

    acceptanceCriteria.push(
      'Datasets exceeding 1,000 rows must be processed via asynchronous worker queues to avoid blocking HTTP threads',
      'Generated export files must be encrypted with AES-256 and stored in private object storage',
      'Download links must use presigned expiring URLs with a maximum lifespan of 60 minutes',
      'Export generation must not impact latency of real-time online transaction processing (OLTP)'
    );
    edgeCases.push(
      'Special characters and formula injection (e.g. =, +, -, @) in CSV outputs must be properly escaped',
      'Zero matching records must generate a valid empty template file rather than throwing an unhandled exception',
      'Temporary disk space exhaustion on worker nodes must trigger retry on an alternate node'
    );
  } else {
    // General workflow / CRUD / API scenarios
    gherkinScenarios.push({
      title: `Successful Execution of ${normalizedTitle}`,
      type: 'happy_path',
      given: `An authorized ${personaRole} with valid session and permissions`,
      when: `The user initiates the action for "${normalizedTitle}"`,
      then: 'The system validates inputs against the schema and commits the transaction to the database',
      and: ['Visual confirmation is returned to the user within 300ms', 'An audit event is logged'],
    });
    gherkinScenarios.push({
      title: 'Payload Validation Failure',
      type: 'error_handling',
      given: 'A submission missing required fields or violating schema constraints',
      when: 'The system validates the request payload',
      then: 'The operation is aborted with zero state mutation and field-level validation errors are returned',
    });
    gherkinScenarios.push({
      title: 'Concurrent Conflict Resolution',
      type: 'boundary_condition',
      given: 'Two actors simultaneously attempting to update the same record',
      when: 'Optimistic locking detects version mismatch',
      then: 'The second write is rejected with HTTP 409 Conflict prompting the user to refresh and merge changes',
    });

    acceptanceCriteria.push(
      `All client inputs for "${normalizedTitle}" must be validated against a strict Zod contract on both client and server actions`,
      'State mutations must be atomic within an ACID transaction; partial writes are strictly prohibited',
      'The user interface must indicate real-time loading states and disable duplicate submissions during execution',
      'System must return deterministic HTTP status codes (200/201 on success, 400 on validation failure, 401/403 on authorization failure)'
    );
    edgeCases.push(
      'Loss of network connection mid-request must recover without corrupting local or remote draft state',
      'Rapid double-clicking on submit buttons must be debounced client-side and deduplicated server-side',
      'Inputs containing unescaped HTML/XSS or SQL delimiters must be sanitized before processing'
    );
  }

  // Mobile-specific additions
  if (isMobile) {
    gherkinScenarios.push({
      title: 'Offline State Queueing & Background Synchronization',
      type: 'boundary_condition',
      given: 'The device has lost network connectivity',
      when: `The user triggers "${normalizedTitle}"`,
      then: 'The action is persisted to encrypted SQLite local storage and queued for background synchronization upon reconnection',
    });
    acceptanceCriteria.push(
      'State changes performed offline must be queued in local persistent storage and auto-synced upon network reconnection'
    );
    edgeCases.push('Resolving merge conflicts when local offline edits clash with remote server edits');
  }

  // API-specific additions
  if (isApi) {
    acceptanceCriteria.push(
      'API endpoint must adhere to OpenAPI 3.1 specification with semantic versioning in request headers or URI paths',
      'All responses must include standard rate-limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)'
    );
  }

  negativeScenarios.push(
    'Submission with unauthorized role must yield immediate 403 Forbidden',
    'Malformed request body must return descriptive RFC 7807 problem details JSON'
  );

  return {
    requirementTitle: normalizedTitle,
    userStory: formattedUserStory,
    gherkinScenarios,
    acceptanceCriteria,
    edgeCases,
    negativeScenarios,
  };
}

/**
 * Expands a rough idea or prompt into a complete, structured FunctionalRequirement
 */
export function expandRequirementPrompt(
  prompt: string,
  archetype: ProjectArchetype = 'web_app',
  existingCount = 0
): RequirementExpansionResult {
  const cleanPrompt = prompt.trim();
  const title = cleanPrompt.replace(/^(add|create|implement|build|support)\s+/i, '');
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  let category = 'Core Feature';
  if (/auth|login|sso|user|account/i.test(cleanPrompt)) category = 'Authentication & Security';
  else if (/export|report|data|analytics|dashboard/i.test(cleanPrompt)) category = 'Reporting & Analytics';
  else if (/pay|billing|stripe|invoice/i.test(cleanPrompt)) category = 'Billing & Payments';
  else if (/ai|agent|model|prompt/i.test(cleanPrompt)) category = 'AI Capabilities';
  else if (/notification|email|sms|alert/i.test(cleanPrompt)) category = 'Notifications';

  const criteria = generateAcceptanceCriteria({
    title: capitalizedTitle,
    category,
    archetype,
  });

  return {
    title: capitalizedTitle,
    category,
    priority: existingCount < 2 ? 'P0' : 'P1',
    userStory: criteria.userStory,
    acceptanceCriteria: criteria.acceptanceCriteria,
    edgeCases: criteria.edgeCases,
    gherkinScenarios: criteria.gherkinScenarios,
  };
}
