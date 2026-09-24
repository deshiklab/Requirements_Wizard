import { AmbiguityAnalysisResult, AmbiguityIssue, AmbiguityCategory } from './types';

interface VagueTermRule {
  pattern: RegExp;
  category: AmbiguityCategory;
  severity: 'critical' | 'warning' | 'info';
  term: string;
  message: string;
  suggestedReplacement: string;
  clarifyingQuestion: string;
}

const VAGUE_TERM_RULES: VagueTermRule[] = [
  // Performance ambiguities
  {
    pattern: /\b(fast|speedy|lightning fast|blazing fast)\b/i,
    category: 'missing_metric',
    severity: 'warning',
    term: 'fast',
    message: 'Subjective latency descriptor. Needs quantitative response time in milliseconds.',
    suggestedReplacement: 'respond within 200ms at p95 percentile',
    clarifyingQuestion: 'What is the exact maximum latency tolerance (in milliseconds) under target load?',
  },
  {
    pattern: /\b(real[- ]?time|instant|instantly)\b/i,
    category: 'missing_metric',
    severity: 'warning',
    term: 'real-time',
    message: 'Ambiguous synchronization expectation. Does this require WebSockets, SSE, or polling (< 500ms)?',
    suggestedReplacement: 'synchronized via WebSocket with sub-500ms broadcast latency',
    clarifyingQuestion: 'Does "real-time" require duplex WebSocket connection or is periodic polling (< 1s) sufficient?',
  },
  {
    pattern: /\b(scalable|high[- ]?capacity)\b/i,
    category: 'missing_metric',
    severity: 'warning',
    term: 'scalable',
    message: 'Vague scaling goal without quantitative throughput or concurrency targets.',
    suggestedReplacement: 'support up to 5,000 concurrent sessions and 500 requests/sec',
    clarifyingQuestion: 'What are the expected peak concurrent users and requests-per-second thresholds?',
  },

  // Usability & UX ambiguities
  {
    pattern: /\b(user[- ]?friendly|intuitive|easy to use|seamless|effortless)\b/i,
    category: 'vague_adjective',
    severity: 'critical',
    term: 'user-friendly',
    message: 'Subjective UX goal that cannot be verified by an automated test or deterministic QA check.',
    suggestedReplacement: 'accessible within 3 user clicks with inline schema error validation',
    clarifyingQuestion: 'What concrete workflow metrics define success (e.g. task completion in < 3 steps)?',
  },
  {
    pattern: /\b(clean|modern|simple|state[- ]of[- ]the[- ]art)\b/i,
    category: 'vague_adjective',
    severity: 'info',
    term: 'modern/simple',
    message: 'Aesthetic term lacking functional specification.',
    suggestedReplacement: 'WCAG 2.1 AA compliant interface with responsive mobile breakpoints',
    clarifyingQuestion: 'Are there specific design system constraints or accessibility standards (e.g. WCAG 2.1 AA)?',
  },

  // Security ambiguities
  {
    pattern: /\b(secure|safe|bulletproof|unhackable)\b/i,
    category: 'vague_adjective',
    severity: 'critical',
    term: 'secure',
    message: 'Ambiguous security claim. Must name specific cryptographic standards and authorization mechanisms.',
    suggestedReplacement: 'authenticated via OAuth2 PKCE with AES-256 encryption-at-rest and TLS 1.3 in-transit',
    clarifyingQuestion: 'Which security standards apply (e.g., OWASP ASVS Level 2, AES-256-GCM, MFA)?',
  },
  {
    pattern: /\b(robust|resilient|fault[- ]tolerant)\b/i,
    category: 'missing_metric',
    severity: 'warning',
    term: 'robust',
    message: 'Lacks concrete failure recovery parameters (RTO, RPO, circuit breakers).',
    suggestedReplacement: 'with automated retry policy (exponential backoff) and RTO < 15 minutes',
    clarifyingQuestion: 'What are the target Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?',
  },

  // Weak RFC 2119 modals
  {
    pattern: /\b(should|could|might|ideally|may)\b/i,
    category: 'weak_modal',
    severity: 'warning',
    term: 'should/could',
    message: 'Weak modal verb. Per RFC 2119 / IEEE 830, mandatory requirements must state "shall" or "must".',
    suggestedReplacement: 'must / shall',
    clarifyingQuestion: 'Is this feature optional (P2) or a strict contractual mandate (P0/P1)?',
  },

  // Passive voice / missing actor
  {
    pattern: /\b(is|are|will be) (processed|handled|done|updated|sent|managed)\b/i,
    category: 'passive_voice',
    severity: 'warning',
    term: 'passive voice',
    message: 'Passive voice hides the initiating agent. Specify which system service, worker, or user role performs the action.',
    suggestedReplacement: 'the background worker queue shall process',
    clarifyingQuestion: 'Which specific user role or subsystem is responsible for executing this action?',
  },

  // Unbounded scope
  {
    pattern: /\b(etc(\.|\b)|and so on|and more|all possible|any other)\b/i,
    category: 'unbounded_scope',
    severity: 'critical',
    term: 'etc / unbounded',
    message: 'Open-ended scope creates ambiguity and prevents bounded testing.',
    suggestedReplacement: 'specifically including [explicit list of items]',
    clarifyingQuestion: 'What is the exhaustive, finite list of supported scenarios or entities?',
  },
];

/**
 * Analyzes requirement text, user story, or acceptance criteria for ambiguity and vagueness.
 */
export function analyzeAmbiguity(text: string): AmbiguityAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      targetText: text,
      clarityScore: 0,
      ambiguityLevel: 'High',
      summary: 'Requirement description is empty. Cannot evaluate specification clarity.',
      issues: [
        {
          id: 'issue-empty',
          term: 'empty_specification',
          category: 'missing_metric',
          severity: 'critical',
          message: 'The specification text is completely blank.',
        },
      ],
      suggestedRevision: 'As a [user role], I want [capability] so that [business objective]. System must [quantitative behavior].',
      clarifyingQuestions: [
        'Who is the primary actor initiating this requirement?',
        'What is the expected quantitative system response or outcome?',
      ],
    };
  }

  const issues: AmbiguityIssue[] = [];
  const clarifyingQuestions: string[] = [];
  let suggestedRevision = text;

  // Run through rule catalog
  for (let i = 0; i < VAGUE_TERM_RULES.length; i++) {
    const rule = VAGUE_TERM_RULES[i];
    const match = text.match(rule.pattern);
    if (match) {
      issues.push({
        id: `issue-${rule.category}-${i}`,
        term: match[0],
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        suggestedReplacement: rule.suggestedReplacement,
        position: match.index !== undefined ? { start: match.index, end: match.index + match[0].length } : undefined,
      });

      if (!clarifyingQuestions.includes(rule.clarifyingQuestion)) {
        clarifyingQuestions.push(rule.clarifyingQuestion);
      }

      // Replace in suggested revision (case-insensitive)
      suggestedRevision = suggestedRevision.replace(
        new RegExp(match[0], 'gi'),
        `[${rule.suggestedReplacement}]`
      );
    }
  }

  // Check for User Story format compliance
  const hasUserStoryFormula = /as a\s+[\w\s]+,\s*i want\s+[\w\s]+,\s*so that\s+[\w\s]+/i.test(text);
  const lacksActors = !/\b(user|admin|operator|architect|customer|tenant|system|service|client)\b/i.test(text);

  if (lacksActors) {
    issues.push({
      id: 'issue-actor-missing',
      term: 'actor missing',
      category: 'missing_actor',
      severity: 'warning',
      message: 'No specific user persona or system actor is designated.',
      suggestedReplacement: 'As an authenticated user...',
    });
    if (!clarifyingQuestions.includes('Which persona or role triggers this requirement?')) {
      clarifyingQuestions.push('Which persona or role triggers this requirement?');
    }
  }

  // Check for numeric / quantitative criteria
  const hasNumbersOrMetrics = /\b(\d+|sub-\d+|\d+ms|\d+s|p\d+|percentage|%)\b/i.test(text);
  if (!hasNumbersOrMetrics && text.length > 50) {
    issues.push({
      id: 'issue-no-metrics',
      term: 'no metrics',
      category: 'missing_metric',
      severity: 'info',
      message: 'No numeric thresholds, timeouts, or SLA parameters found in description.',
      suggestedReplacement: 'e.g., within 250ms, for up to 1,000 items',
    });
  }

  // Calculate clarity score starting from 100
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 18;
    else if (issue.severity === 'warning') score -= 10;
    else if (issue.severity === 'info') score -= 4;
  }

  // Reward well-formed user story formula and explicit metric
  if (hasUserStoryFormula) score += 10;
  if (hasNumbersOrMetrics) score += 5;

  // Bound score strictly between 5 and 100
  const finalScore = Math.max(5, Math.min(100, score));

  let ambiguityLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (finalScore < 60) {
    ambiguityLevel = 'High';
  } else if (finalScore < 85) {
    ambiguityLevel = 'Medium';
  }

  // Construct summary
  let summary = '';
  if (ambiguityLevel === 'Low') {
    summary = 'High specification clarity. Requirements are quantified, action-oriented, and testable.';
  } else if (ambiguityLevel === 'Medium') {
    summary = `Moderate ambiguity detected (${issues.length} flagged items). Tighten subjective terms with explicit SLAs.`;
  } else {
    summary = `Significant ambiguity detected (${issues.length} critical issues). Contains untestable adjectives or missing actors.`;
  }

  return {
    targetText: text,
    clarityScore: finalScore,
    ambiguityLevel,
    summary,
    issues,
    suggestedRevision,
    clarifyingQuestions: clarifyingQuestions.slice(0, 4),
  };
}
