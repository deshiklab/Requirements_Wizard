import {
  DocumentIngestionResult,
  ExtractedConstraint,
} from './types';
import { FunctionalRequirement, Persona, PriorityLevel } from '@/types/wizard';
import { generateAcceptanceCriteria } from './criteria-generator';

interface IngestContextInput {
  fileName?: string;
  mimeType?: string;
  rawText?: string;
  metadata?: Record<string, any>;
}

/**
 * Ingests context documents, PRD notes, or architecture schemas and extracts structured specification entities.
 */
export function ingestContextDocument(input: IngestContextInput): DocumentIngestionResult {
  const fileName = input.fileName || 'Uploaded_Specification_Document.txt';
  const mimeType = input.mimeType || 'text/plain';

  // Consolidate textual content from rawText or metadata
  let content = input.rawText || '';
  if (!content && input.metadata) {
    if (typeof input.metadata.extractedContext === 'string') {
      content = input.metadata.extractedContext;
    } else if (typeof input.metadata.description === 'string') {
      content = input.metadata.description;
    } else {
      content = JSON.stringify(input.metadata);
    }
  }

  // Fallback heuristic if content is very short
  if (content.length < 20) {
    content = `${fileName}: Context document containing system architecture notes, user workflows, security constraints, and integration contracts.`;
  }

  const lowerContent = content.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  const extractedRequirements: FunctionalRequirement[] = [];
  const extractedPersonas: Persona[] = [];
  const extractedConstraints: ExtractedConstraint[] = [];
  const suggestedStack: DocumentIngestionResult['suggestedStack'] = {};

  let documentType = 'Architecture Notes';
  if (lowerFileName.endsWith('.json') || lowerContent.includes('openapi') || lowerContent.includes('swagger')) {
    documentType = 'API / Schema Specification';
  } else if (lowerFileName.endsWith('.png') || lowerFileName.endsWith('.jpg') || lowerFileName.includes('diagram') || lowerFileName.includes('c4')) {
    documentType = 'System Architecture Diagram';
  } else if (lowerFileName.includes('prd') || lowerFileName.includes('spec') || lowerFileName.includes('requirement')) {
    documentType = 'Product Requirements Document (PRD)';
  }

  // 1. Identify Architectural Constraints & Technologies
  if (/postgres|postgresql|relational db|acid/i.test(lowerContent)) {
    suggestedStack.database = 'PostgreSQL 18 with JSONB support';
    extractedConstraints.push({
      category: 'data',
      description: 'System must utilize relational PostgreSQL storage with native JSONB document schemas for draft flexibility.',
      impact: 'Enables schema flexibility while preserving ACID transactional referential integrity.',
    });
  }

  if (/redis|cache|caching/i.test(lowerContent)) {
    extractedConstraints.push({
      category: 'performance',
      description: 'Distributed Redis caching tier required for session tokens, rate limiting counters, and frequent read queries.',
      impact: 'Reduces database load and ensures response latency < 100ms.',
    });
  }

  if (/oauth|jwt|sso|saml|oidc/i.test(lowerContent)) {
    extractedConstraints.push({
      category: 'security',
      description: 'Enterprise identity federation utilizing OAuth 2.0 PKCE and SAML 2.0 / OIDC tokens.',
      impact: 'Prevents credential leaks and centralizes identity management.',
    });
  }

  if (/next\.?js|react|tailwind/i.test(lowerContent)) {
    suggestedStack.frontend = 'Next.js 14 App Router + Tailwind CSS + Shadcn UI';
  }

  if (/node|express|fastify|server action/i.test(lowerContent)) {
    suggestedStack.backend = 'Next.js Isolated Server Actions & Node.js Runtime';
  }

  if (/hipaa|ephi/i.test(lowerContent)) {
    extractedConstraints.push({
      category: 'compliance',
      description: 'HIPAA Security Rule compliance: mandatory AES-256 encryption-at-rest, TLS 1.3 in-transit, and immutable audit logs.',
      impact: 'Legal requirement for processing Protected Health Information.',
    });
  }

  if (/gdpr|soc2|compliance/i.test(lowerContent)) {
    extractedConstraints.push({
      category: 'compliance',
      description: 'SOC2 Type II and GDPR data sovereignty: Right to Erasure and encrypted tenant isolation.',
      impact: 'Mandatory audit readiness for enterprise procurement.',
    });
  }

  // 2. Identify Personas from Document Context
  if (/admin|administrator|ops|operator/i.test(lowerContent)) {
    extractedPersonas.push({
      id: `pers-ingested-admin-${Date.now()}`,
      name: 'System Administrator',
      role: 'Platform Operations & Governance',
      goals: 'Configure system policies, manage tenant provisioning, and monitor service health metrics.',
      painPoints: 'Lack of granular audit logging and manual tenant configuration overhead.',
      accessLevel: 'Super Administrator (Role 0)',
    });
  }

  if (/tenant|organization|company|account owner/i.test(lowerContent)) {
    extractedPersonas.push({
      id: `pers-ingested-tenant-${Date.now()}`,
      name: 'Organization Manager',
      role: 'Tenant Admin / Team Lead',
      goals: 'Invite colleagues, manage workspace billing, and configure team permissions.',
      painPoints: 'Clunky seat management and opaque billing invoice summaries.',
      accessLevel: 'Tenant Admin',
    });
  }

  if (/developer|api consumer|integration partner/i.test(lowerContent) || documentType === 'API / Schema Specification') {
    extractedPersonas.push({
      id: `pers-ingested-dev-${Date.now()}`,
      name: 'Integration Developer',
      role: 'External API Consumer',
      goals: 'Connect external microservices via authenticated REST/GraphQL endpoints with zero downtime.',
      painPoints: 'Outdated API documentation and lack of interactive sandbox environments.',
      accessLevel: 'API Client / Service Account',
    });
  }

  // If no personas detected, provide standard extracted actor
  if (extractedPersonas.length === 0) {
    extractedPersonas.push({
      id: `pers-ingested-user-${Date.now()}`,
      name: 'Target Business User',
      role: 'End User / Domain Practitioner',
      goals: 'Complete primary operational tasks without technical roadblocks or latency.',
      painPoints: 'Unresponsive interfaces and loss of unsaved draft inputs.',
      accessLevel: 'Standard User',
    });
  }

  // 3. Extract Candidate Functional Requirements
  // Search for requirement patterns (bullets, numbers, keywords)
  const reqCandidates: { title: string; category: string; priority: PriorityLevel }[] = [];

  if (/auth|login|sso|signup/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Federated Authentication & Role-Based Access Control (RBAC)',
      category: 'Security & Access',
      priority: 'P0',
    });
  }

  if (/cache|caching|redis/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Distributed Caching & Sub-Second Query Acceleration',
      category: 'Performance & Scalability',
      priority: 'P1',
    });
  }

  if (/hipaa|ephi|compliance|gdpr/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Enterprise Compliance & Encrypted Data Protection Guardrails',
      category: 'Compliance & Security',
      priority: 'P0',
    });
  }

  if (/saas|tenant|multi-tenant/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Multi-Tenant Partitioning & Workspace Isolation',
      category: 'Tenant Governance',
      priority: 'P0',
    });
  }

  if (/audit|log|trace|event/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Immutable Audit Trail & Security Event Logging',
      category: 'Governance & Auditing',
      priority: 'P0',
    });
  }

  if (/upload|file|document|attachment|s3|storage/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Cryptographically Verified Document Upload & Attachment Pipeline',
      category: 'Document Management',
      priority: 'P1',
    });
  }

  if (/export|report|analytics|dashboard/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Automated Reporting Engine & Multi-Format Data Export',
      category: 'Reporting & Analytics',
      priority: 'P1',
    });
  }

  if (/api|webhook|endpoint|rest|graphql/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Rate-Limited Public API Gateway & Webhook Dispatcher',
      category: 'Integration & APIs',
      priority: 'P0',
    });
  }

  if (/search|filter|query|index/i.test(lowerContent)) {
    reqCandidates.push({
      title: 'Sub-Second Full-Text Search & Multi-Faceted Filtering',
      category: 'Search & Discovery',
      priority: 'P1',
    });
  }

  // Fallback requirement if text is generic
  if (reqCandidates.length === 0) {
    reqCandidates.push({
      title: 'Core Domain Transaction Processing & Validation Engine',
      category: 'Core Capabilities',
      priority: 'P0',
    });
  }

  // Convert candidates into fully realized FunctionalRequirements with acceptance criteria
  reqCandidates.forEach((cand, idx) => {
    const generated = generateAcceptanceCriteria({
      title: cand.title,
      category: cand.category,
      personaRole: extractedPersonas[0]?.name || 'Authorized User',
    });

    extractedRequirements.push({
      id: `FR-INGEST-${idx + 1}`,
      title: cand.title,
      userStory: generated.userStory,
      priority: cand.priority,
      category: cand.category,
      acceptanceCriteria: generated.acceptanceCriteria,
    });
  });

  const summary = `Successfully ingested "${fileName}" (${documentType}). Extracted ${extractedRequirements.length} functional requirements, ${extractedPersonas.length} stakeholder personas, and ${extractedConstraints.length} architectural constraints.`;

  return {
    fileName,
    documentType,
    summary,
    extractedRequirements,
    extractedPersonas,
    extractedConstraints,
    suggestedStack,
  };
}
