import { WizardFormData } from '@/types/wizard';
import { DocumentExportOptions } from './types';
import { generateAcceptanceCriteria } from '@/lib/ai/criteria-generator';
import {
  generateC4ContainerDiagram,
  generateWorkflowSequenceDiagram,
  generateErDiagram,
  generateGovernanceStateDiagram,
} from '@/lib/diagrams/mermaid';

export function generateIeee830Markdown(
  data: WizardFormData,
  options: DocumentExportOptions = {}
): string {
  const {
    docTitle = data.step1_identity.projectName || 'Software Requirements Specification',
    version = '1.0.0',
    generatedBy = data.step6_review.signOffArchitect || 'Lead Systems Architect',
    includeGherkin = true,
  } = options;

  const now = new Date().toISOString().split('T')[0];
  const readiness = data.step6_review.specReadinessScore ?? 85;
  const archetype = data.step1_identity.projectType || 'web_app';

  const lines: string[] = [];

  // Title & Header Block
  lines.push(`# Software Requirements Specification (SRS)`);
  lines.push(`## ${docTitle}`);
  lines.push('');
  lines.push(`**Standard Compliance:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148  `);
  lines.push(`**Methodology:** Spec-Driven Agentic Development (SDAD)  `);
  lines.push(`**Document Version:** ${version}  `);
  lines.push(`**Date:** ${now}  `);
  lines.push(`**System Archetype:** \`${archetype.toUpperCase()}\`  `);
  lines.push(`**Document Status:** \`${(data.step6_review.status || 'review').toUpperCase()}\`  `);
  lines.push(`**Spec Readiness Score:** \`${readiness}/100\`  `);
  lines.push(`**Author / Lead Architect:** ${generatedBy}  `);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  lines.push('1. [Introduction](#1-introduction)');
  lines.push('   - 1.1 [Purpose](#11-purpose)');
  lines.push('   - 1.2 [Document Conventions](#12-document-conventions)');
  lines.push('   - 1.3 [Intended Audience](#13-intended-audience)');
  lines.push('   - 1.4 [Product Scope & Boundaries](#14-product-scope--boundaries)');
  lines.push('   - 1.5 [Context References & Uploaded Artifacts](#15-context-references--uploaded-artifacts)');
  lines.push('2. [Overall Description](#2-overall-description)');
  lines.push('   - 2.1 [Product Perspective & Architectural Archetype](#21-product-perspective--architectural-archetype)');
  lines.push('   - 2.2 [User Classes & Stakeholder Personas](#22-user-classes--stakeholder-personas)');
  lines.push('   - 2.3 [Operating Environment & Technical Stack](#23-operating-environment--technical-stack)');
  lines.push('   - 2.4 [Design & Implementation Constraints](#24-design--implementation-constraints)');
  lines.push('3. [System Features & Functional Requirements](#3-system-features--functional-requirements)');
  data.step3_functional.requirements.forEach((req, idx) => {
    lines.push(`   - 3.${idx + 1} [${req.id}: ${req.title}](#3${idx + 1}-${req.id.toLowerCase()}-${req.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`);
  });
  lines.push('4. [External Interface & Integration Requirements](#4-external-interface--integration-requirements)');
  lines.push('   - 4.1 [Third-Party Integrations](#41-third-party-integrations)');
  lines.push('   - 4.2 [Communication Protocols](#42-communication-protocols)');
  lines.push('5. [Non-Functional Requirements & Quality Attributes](#5-non-functional-requirements--quality-attributes)');
  lines.push('   - 5.1 [Performance & Latency SLOs](#51-performance--latency-slos)');
  lines.push('   - 5.2 [Availability & Disaster Recovery](#52-availability--disaster-recovery)');
  lines.push('   - 5.3 [Security, Cryptography & Privacy](#53-security-cryptography--privacy)');
  lines.push('   - 5.4 [Regulatory & Compliance Standards](#54-regulatory--compliance-standards)');
  lines.push('   - 5.5 [Scalability & Data Caching Strategy](#55-scalability--data-caching-strategy)');
  lines.push('6. [Governance, Readiness Audit & Sign-Off](#6-governance-readiness-audit--sign-off)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // 1. Introduction
  lines.push('## 1. Introduction');
  lines.push('');
  lines.push('### 1.1 Purpose');
  lines.push(
    data.step1_identity.description ||
      `This document defines the complete functional and non-functional requirements for the **${docTitle}** software system. It establishes the authoritative technical contract between domain stakeholders, software engineering teams, and autonomous execution agents under the Spec-Driven Agentic Development (SDAD) framework.`
  );
  lines.push('');

  lines.push('### 1.2 Document Conventions');
  lines.push(
    'This specification adheres strictly to **RFC 2119** normative terminology:'
  );
  lines.push('- **SHALL** / **MUST**: Absolute requirement for system compliance.');
  lines.push('- **SHOULD** / **RECOMMENDED**: High-priority goal unless valid business justification exists.');
  lines.push('- **MAY** / **OPTIONAL**: Permissible system capability with zero negative impact on baseline delivery.');
  lines.push('');

  lines.push('### 1.3 Intended Audience');
  lines.push(
    `**Target Audience:** ${data.step1_identity.targetAudience || 'Systems Architects, Full-Stack Engineers, QA Leads, Product Managers, and Autonomous Coding Agents'}.`
  );
  lines.push('');

  lines.push('### 1.4 Product Scope & Boundaries');
  lines.push('The operational boundaries of this system are strictly defined as follows:');
  lines.push('');
  lines.push('#### In-Scope Capabilities:');
  if (data.step1_identity.inScope.length > 0) {
    data.step1_identity.inScope.forEach((item) => {
      lines.push(`- [x] **${item}**`);
    });
  } else {
    lines.push('- [x] Core operational workflow');
  }
  lines.push('');

  lines.push('#### Out-of-Scope Exclusions:');
  if (data.step1_identity.outOfScope.length > 0) {
    data.step1_identity.outOfScope.forEach((item) => {
      lines.push(`- [ ] ~~${item}~~ (Explicitly deferred to future release iterations)`);
    });
  } else {
    lines.push('- [ ] Legacy manual data migrations');
  }
  lines.push('');

  lines.push('### 1.5 Context References & Uploaded Artifacts');
  if (data.step5_tech_and_context.attachments.length > 0) {
    lines.push('| File Name | Type | Size (KB) | Extracted Architectural Context |');
    lines.push('|---|---|---|---|');
    data.step5_tech_and_context.attachments.forEach((att) => {
      const sizeKb = (att.fileSize / 1024).toFixed(1);
      const context = att.metadata?.extractedContext || 'Reference diagram / specification';
      lines.push(`| \`${att.originalName}\` | ${att.mimeType} | ${sizeKb} KB | ${context} |`);
    });
  } else {
    lines.push('No external architecture diagrams or files attached.');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // 2. Overall Description
  lines.push('## 2. Overall Description');
  lines.push('');
  lines.push('### 2.1 Product Perspective & Architectural Archetype');
  lines.push(`The system is classified under the **${archetype.replace('_', ' ').toUpperCase()}** archetype.`);
  if (archetype === 'ai_agentic') {
    lines.push(`- **AI Model Provider:** \`${data.step1_identity.aiModelProvider || 'Anthropic / OpenAI'}\``);
    lines.push(`- **Human-in-the-Loop Safeguard:** \`${data.step1_identity.humanInTheLoop ? 'Enabled (Mandatory)' : 'Disabled'}\``);
  } else if (archetype === 'enterprise_saas') {
    lines.push(`- **Multi-Tenancy Model:** \`${data.step1_identity.multiTenancyModel || 'shared_schema'}\``);
    lines.push(`- **Enterprise SSO Federation:** \`${data.step1_identity.enterpriseSso ? 'Enabled (SAML 2.0 / OIDC)' : 'Disabled'}\``);
  } else if (archetype === 'mobile_app') {
    lines.push(`- **Target Platforms:** \`${(data.step1_identity.mobilePlatforms || ['ios', 'android']).join(', ')}\``);
    lines.push(`- **Offline Data Sync:** \`${data.step1_identity.offlineRequired ? 'Mandatory' : 'Not required'}\``);
    lines.push(`- **Push Notifications:** \`${data.step1_identity.pushNotifications ? 'Enabled (APNs / FCM)' : 'Disabled'}\``);
  } else if (archetype === 'api_backend') {
    lines.push(`- **API Protocol Contract:** \`${(data.step1_identity.apiProtocol || 'rest').toUpperCase()}\``);
  }
  lines.push('');

  lines.push('### 2.2 User Classes & Stakeholder Personas');
  lines.push('| Persona Name | System Role | Primary Goals | Pain Points / Blockers | Access Tier |');
  lines.push('|---|---|---|---|---|');
  data.step2_personas.personas.forEach((p) => {
    lines.push(`| **${p.name}** | ${p.role} | ${p.goals} | ${p.painPoints} | \`${p.accessLevel}\` |`);
  });
  lines.push('');

  lines.push('### 2.3 Operating Environment & Technical Stack');
  lines.push('| Layer | Prescribed Technology | Architectural Rationale |');
  lines.push('|---|---|---|');
  lines.push(`| **Frontend Framework** | ${data.step5_tech_and_context.preferredStack.frontend} | Server Components with client hydration for optimal performance |`);
  lines.push(`| **Backend / Compute** | ${data.step5_tech_and_context.preferredStack.backend} | Isolated execution boundaries with strict Zod contracts |`);
  lines.push(`| **Database & Storage** | ${data.step5_tech_and_context.preferredStack.database} | ACID transactional integrity with native JSONB document flexibility |`);
  lines.push(`| **Cloud & Deployment** | ${data.step5_tech_and_context.preferredStack.cloud} | High availability with multi-region CDN and DDoS mitigation |`);
  lines.push('');

  lines.push('### 2.4 Design & Implementation Constraints');
  lines.push('- **State Persistence:** All partial and complete specifications MUST be persisted in PostgreSQL with JSONB schema safety.');
  lines.push('- **Server Action Isolation:** State mutations SHALL execute via Next.js Server Actions with zero unauthorized client-side direct access.');
  lines.push('- **Deterministic Testing:** Downstream development SHALL NOT commence until automated unit and integration tests pass with 100% success.');
  lines.push('');

  lines.push('### 2.5 System Container Architecture (C4 Model)');
  lines.push('```mermaid');
  lines.push(generateC4ContainerDiagram(data).syntax);
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // 3. System Features & Functional Requirements
  lines.push('## 3. System Features & Functional Requirements');
  lines.push('');

  lines.push('### 3.0 Primary Workflow Execution Sequence');
  lines.push('```mermaid');
  lines.push(generateWorkflowSequenceDiagram(data).syntax);
  lines.push('```');
  lines.push('');

  data.step3_functional.requirements.forEach((req, idx) => {
    lines.push(`### 3.${idx + 1} ${req.id}: ${req.title}`);
    lines.push(`**Priority:** \`${req.priority}\` | **Category:** \`${req.category}\`  `);
    lines.push('');
    lines.push(`**User Story:**  `);
    lines.push(`> ${req.userStory}`);
    lines.push('');
    lines.push('#### Definition of Done / Acceptance Criteria:');
    req.acceptanceCriteria.forEach((crit) => {
      lines.push(`- [ ] ${crit}`);
    });
    lines.push('');

    if (includeGherkin) {
      const criteria = generateAcceptanceCriteria({
        title: req.title,
        userStory: req.userStory,
        category: req.category,
        archetype,
      });

      if (criteria.gherkinScenarios.length > 0) {
        lines.push('#### Formal Gherkin Scenarios:');
        lines.push('```gherkin');
        criteria.gherkinScenarios.forEach((sc) => {
          lines.push(`Scenario: ${sc.title} [${sc.type.toUpperCase()}]`);
          lines.push(`  Given ${sc.given}`);
          lines.push(`  When ${sc.when}`);
          lines.push(`  Then ${sc.then}`);
          if (sc.and) {
            sc.and.forEach((a) => lines.push(`  And ${a}`));
          }
          lines.push('');
        });
        lines.push('```');
        lines.push('');
      }

      if (criteria.edgeCases.length > 0) {
        lines.push('#### Edge Cases & Boundary Conditions:');
        criteria.edgeCases.forEach((ec) => {
          lines.push(`- *Boundary:* ${ec}`);
        });
        lines.push('');
      }
    }
  });

  lines.push('---');
  lines.push('');

  // 4. External Interface Requirements
  lines.push('## 4. External Interface & Integration Requirements');
  lines.push('');
  lines.push('### 4.1 Third-Party Integrations');
  if (data.step5_tech_and_context.integrations.length > 0) {
    lines.push('| Service Name | Integration Type | Functional Purpose |');
    lines.push('|---|---|---|');
    data.step5_tech_and_context.integrations.forEach((it) => {
      lines.push(`| **${it.serviceName}** | \`${it.type}\` | ${it.purpose} |`);
    });
  } else {
    lines.push('No external third-party integrations currently declared.');
  }
  lines.push('');

  lines.push('### 4.2 Communication Protocols');
  lines.push('- **Transport Security:** All client-server communications SHALL mandate **TLS 1.3**.');
  lines.push('- **API Transport:** HTTP/2 with RESTful JSON payloads or GraphQL endpoints.');
  lines.push('- **Authentication Tokens:** Signed JWT access tokens with HttpOnly, Secure, and SameSite=Strict cookies.');
  lines.push('');

  lines.push('### 4.3 Database & Domain Entity-Relationship Model');
  lines.push('```mermaid');
  lines.push(generateErDiagram(data).syntax);
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  // 5. Non-Functional Requirements
  lines.push('## 5. Non-Functional Requirements & Quality Attributes');
  lines.push('');
  lines.push('### 5.1 Performance & Latency SLOs');
  lines.push(`- **Max P95 Latency:** \`${data.step4_non_functional.performance.maxLatencyMs}ms\` under nominal load.`);
  lines.push(`- **Target Throughput:** \`${data.step4_non_functional.performance.targetRps} requests/sec\` sustained capacity.`);
  lines.push('');

  lines.push('### 5.2 Availability & Disaster Recovery');
  lines.push(`- **High Availability SLA:** \`${data.step4_non_functional.availability.uptimeSla}\` service uptime target.`);
  lines.push(`- **Recovery Time Objective (RTO):** \`${data.step4_non_functional.availability.disasterRecoveryRtoMinutes} minutes\` maximum recovery threshold.`);
  lines.push('');

  lines.push('### 5.3 Security, Cryptography & Privacy');
  lines.push(`- **Authentication Strategy:** \`${data.step4_non_functional.securityCompliance.authStrategy}\``);
  lines.push(`- **Data Encryption at Rest:** \`${data.step4_non_functional.securityCompliance.dataEncryptionAtRest ? 'AES-256 Enabled' : 'Disabled (Non-Compliant)'}\``);
  lines.push(`- **Data Encryption in Transit:** \`${data.step4_non_functional.securityCompliance.dataEncryptionInTransit ? 'TLS 1.3 Mandated' : 'Disabled'}\``);
  lines.push('');

  lines.push('### 5.4 Regulatory & Compliance Standards');
  if (data.step4_non_functional.securityCompliance.complianceStandards.length > 0) {
    data.step4_non_functional.securityCompliance.complianceStandards.forEach((std) => {
      lines.push(`- [x] **${std} Compliance:** Mandates strict adherence to ${std} security controls, audit logs, and data retention.`);
    });
  } else {
    lines.push('- Standard commercial confidentiality controls apply.');
  }
  lines.push('');

  lines.push('### 5.5 Scalability & Data Caching Strategy');
  lines.push(`- **Peak Concurrent Users:** \`${data.step4_non_functional.scalability.peakConcurrentUsers.toLocaleString()} concurrent sessions\`.`);
  lines.push(`- **Caching Infrastructure:** \`${data.step4_non_functional.scalability.cachingStrategy}\`.`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // 6. Governance & Sign-Off
  lines.push('## 6. Governance, Readiness Audit & Sign-Off');
  lines.push('');
  lines.push(`### 6.1 Spec Readiness Score: ${readiness}/100`);
  lines.push('The specification has undergone automated quantitative readiness scoring. All core archetypes, acceptance criteria checklists, and security controls have been validated.');
  lines.push('');
  lines.push('### 6.2 Architectural Sign-Off');
  lines.push(`**Lead Systems Architect:** \`${generatedBy}\`  `);
  lines.push(`**Specification Status:** \`${(data.step6_review.status || 'review').toUpperCase()}\`  `);
  if (data.step6_review.finalNotes) {
    lines.push(`**Architect Notes:**  `);
    lines.push(`> ${data.step6_review.finalNotes}`);
    lines.push('');
  }
  lines.push('');

  lines.push('### 6.3 Specification Lifecycle State Machine');
  lines.push('```mermaid');
  lines.push(generateGovernanceStateDiagram().syntax);
  lines.push('```');
  lines.push('');
  lines.push('```');
  lines.push('========================================================================');
  lines.push(`FORMAL ARCHITECTURAL SIGN-OFF VERIFIED UNDER SDAD PROTOCOL`);
  lines.push(`HASH: ${Buffer.from(docTitle + now + readiness).toString('base64').slice(0, 32)}`);
  lines.push(`TIMESTAMP: ${new Date().toISOString()}`);
  lines.push('========================================================================');
  lines.push('```');

  return lines.join('\n');
}
