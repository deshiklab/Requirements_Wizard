/**
 * SDAD Architecture Diagram Verification Suite
 * Automated Mermaid.js C4 & Sequence Diagram Engine
 */

import {
  generateC4ContainerDiagram,
  generateWorkflowSequenceDiagram,
  generateErDiagram,
  generateGovernanceStateDiagram,
  generateAllArchitectureDiagrams,
} from '../src/lib/diagrams/mermaid';
import { SpecificationExportEngine } from '../src/lib/export/engine';
import { INITIAL_WIZARD_FORM_DATA, WizardFormData } from '../src/types/wizard';

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

async function runDiagramVerification() {
  console.log('\n================================================================');
  console.log('SDAD Architecture Diagram Verification: Automated Mermaid.js Engine');
  console.log('Diagrams: C4 Container, Sequence Workflow, ER Model, Governance State');
  console.log('================================================================\n');

  const testData: WizardFormData = {
    ...INITIAL_WIZARD_FORM_DATA,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      projectName: 'Nexus Autonomous Clearinghouse',
      projectType: 'enterprise_saas',
      inScope: ['Instant Settlement', 'Anomaly Classification', 'Audit Chaining'],
    },
    step2_personas: {
      personas: [
        {
          id: 'p-1',
          name: 'Settlement Officer Sarah',
          role: 'Treasury Operations Lead',
          goals: 'Reconcile interbank liquidity intraday with cryptographic proof.',
          painPoints: 'Batch latency and missing transaction lineage.',
          accessLevel: 'Treasury Admin',
        },
      ],
    },
    step3_functional: {
      requirements: [
        {
          id: 'FR-01',
          title: 'Automated Real-Time Clearing',
          userStory: 'As a treasury officer, I want payment batches matched against reserves in real time',
          priority: 'P0',
          category: 'Core Settlement',
          acceptanceCriteria: [
            'All transactions evaluated against Fedwire balance within 200ms',
            'Cryptographic SHA-256 seal logged to audit ledger',
          ],
        },
      ],
    },
    step5_tech_and_context: {
      preferredStack: {
        frontend: 'Next.js 14 App Router + Tailwind',
        backend: 'Node.js Isolated Server Actions',
        database: 'PostgreSQL 18 with JSONB',
        cloud: 'AWS Multi-AZ VPC',
      },
      integrations: [
        {
          id: 'int-1',
          serviceName: 'Fedwire Funds Gateway',
          type: 'Interbank Network',
          purpose: 'High-value liquidity transfer',
        },
        {
          id: 'int-2',
          serviceName: 'SWIFT Alliance Gateway',
          type: 'International Messaging',
          purpose: 'Cross-border payment confirmation',
        },
      ],
      attachments: [],
    },
  };

  // -------------------------------------------------------------
  // PART 1: C4 Container / System Architecture Diagram
  // -------------------------------------------------------------
  console.log('PART 1: Testing C4 Container / System Architecture Diagram...');

  const c4 = generateC4ContainerDiagram(testData);

  assert(c4.id === 'diagram-c4-container', 'C4 diagram assigns correct ID');
  assert(c4.type === 'c4_container', 'C4 diagram assigns type c4_container');
  assert(c4.syntax.includes('graph TD'), 'C4 diagram uses graph TD top-down syntax');
  assert(c4.syntax.includes('Nexus Autonomous Clearinghouse'), 'C4 diagram embeds project name boundary');
  assert(c4.syntax.includes('Settlement Officer Sarah'), 'C4 diagram surfaces primary persona');
  assert(c4.syntax.includes('Next.js 14 App Router'), 'C4 diagram surfaces frontend tier');
  assert(c4.syntax.includes('Node.js Isolated Server Actions'), 'C4 diagram surfaces backend compute tier');
  assert(c4.syntax.includes('PostgreSQL 18 with JSONB'), 'C4 diagram surfaces relational & JSONB database');
  assert(c4.syntax.includes('Fedwire Funds Gateway'), 'C4 diagram integrates first third-party external service');
  assert(c4.syntax.includes('SWIFT Alliance Gateway'), 'C4 diagram integrates second third-party external service');
  assert(c4.syntax.includes('Cryptographic Audit Ledger'), 'C4 diagram models SHA-256 audit ledger');

  // Test mobile archetype adaptation
  const mobileData: WizardFormData = {
    ...testData,
    step1_identity: {
      ...testData.step1_identity,
      projectType: 'mobile_app',
    },
  };
  const mobileC4 = generateC4ContainerDiagram(mobileData);
  assert(mobileC4.syntax.includes('Mobile Client (iOS / Android)'), 'C4 diagram dynamically adapts client node for mobile_app');

  // -------------------------------------------------------------
  // PART 2: Sequence Diagram for Primary Workflow
  // -------------------------------------------------------------
  console.log('\nPART 2: Testing Sequence Diagram for Primary Workflow...');

  const seq = generateWorkflowSequenceDiagram(testData);

  assert(seq.type === 'sequence_workflow', 'Sequence diagram assigns type sequence_workflow');
  assert(seq.syntax.includes('sequenceDiagram'), 'Sequence diagram begins with sequenceDiagram directive');
  assert(seq.syntax.includes('autonumber'), 'Sequence diagram enables automated step numbering');
  assert(seq.syntax.includes('Settlement Officer Sarah'), 'Sequence diagram assigns primary actor');
  assert(seq.syntax.includes('Next.js 14 UI'), 'Sequence diagram includes UI participant');
  assert(seq.syntax.includes('Isolated Server Action'), 'Sequence diagram includes Server Action gateway');
  assert(seq.syntax.includes('Zod Validation & RBAC'), 'Sequence diagram models security & validation guard');
  assert(seq.syntax.includes('PostgreSQL 18 (JSONB)'), 'Sequence diagram models database persistence');
  assert(seq.syntax.includes('alt Validation Failure or Unauthorized'), 'Sequence diagram models error rejection branch');
  assert(seq.syntax.includes('else Validation Passed & Authorized'), 'Sequence diagram models success path branch');
  assert(seq.syntax.includes('FR-01'), 'Sequence diagram references requirement FR-01');

  // -------------------------------------------------------------
  // PART 3: Data Model Entity-Relationship Diagram
  // -------------------------------------------------------------
  console.log('\nPART 3: Testing Data Model Entity-Relationship Diagram...');

  const er = generateErDiagram(testData);

  assert(er.type === 'er_model', 'ER diagram assigns type er_model');
  assert(er.syntax.includes('erDiagram'), 'ER diagram begins with erDiagram directive');
  assert(er.syntax.includes('USER ||--o{ FORM_DRAFT : authors'), 'ER diagram defines User-to-Draft relation');
  assert(er.syntax.includes('FORM_DRAFT ||--o{ AUDIT_LOG : tracks'), 'ER diagram defines Draft-to-Audit relation');
  assert(er.syntax.includes('USER {'), 'ER diagram models USER entity with typed attributes');
  assert(er.syntax.includes('FORM_DRAFT {'), 'ER diagram models FORM_DRAFT entity with JSONB data');
  assert(er.syntax.includes('FILE_REFERENCE {'), 'ER diagram models FILE_REFERENCE entity');
  assert(er.syntax.includes('AUDIT_LOG {'), 'ER diagram models AUDIT_LOG entity with checksum');

  // -------------------------------------------------------------
  // PART 4: Governance State Machine Diagram
  // -------------------------------------------------------------
  console.log('\nPART 4: Testing Governance State Machine Diagram...');

  const state = generateGovernanceStateDiagram();

  assert(state.type === 'governance_state', 'State diagram assigns type governance_state');
  assert(state.syntax.includes('stateDiagram-v2'), 'State diagram begins with stateDiagram-v2 directive');
  assert(state.syntax.includes('Draft --> InReview'), 'State diagram documents Draft to InReview transition');
  assert(state.syntax.includes('InReview --> Approved'), 'State diagram documents InReview to Approved transition');
  assert(state.syntax.includes('Approved --> Locked'), 'State diagram documents Approved to Locked transition');
  assert(state.syntax.includes('state Locked {'), 'State diagram defines Locked composite state');
  assert(state.syntax.includes('Specification Frozen & Read-Only'), 'State diagram documents immutability in Locked state');
  assert(state.syntax.includes('Locked --> Draft : Authorized Reopening'), 'State diagram documents audited reopening');

  // -------------------------------------------------------------
  // PART 5: Diagram Collection Engine & Full Document Export
  // -------------------------------------------------------------
  console.log('\nPART 5: Testing Diagram Collection Engine & Full Document Export...');

  const allDiagrams = generateAllArchitectureDiagrams(testData);
  assert(Boolean(allDiagrams.c4Container), 'Collection contains C4 Container diagram');
  assert(Boolean(allDiagrams.sequenceWorkflow), 'Collection contains Sequence Workflow diagram');
  assert(Boolean(allDiagrams.erModel), 'Collection contains ER Model diagram');
  assert(Boolean(allDiagrams.governanceState), 'Collection contains Governance State diagram');

  // Verify diagrams embedded natively in IEEE 830 Markdown output
  const mdOutput = SpecificationExportEngine.toMarkdown(testData, {
    docTitle: testData.step1_identity.projectName,
    version: '1.5.0',
    generatedBy: 'Principal Architect Sarah Chen',
  });

  assert(mdOutput.includes('```mermaid'), 'Markdown export contains embedded Mermaid code blocks');
  assert(mdOutput.includes('### 2.5 System Container Architecture (C4 Model)'), 'Markdown contains Section 2.5 C4 Architecture header');
  assert(mdOutput.includes('### 3.0 Primary Workflow Execution Sequence'), 'Markdown contains Section 3.0 Workflow Sequence header');
  assert(mdOutput.includes('### 4.3 Database & Domain Entity-Relationship Model'), 'Markdown contains Section 4.3 ER Model header');
  assert(mdOutput.includes('### 6.3 Specification Lifecycle State Machine'), 'Markdown contains Section 6.3 State Machine header');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`Diagram Engine Verification Summary: ${passedChecks}/${totalChecks} PASSED`);
  if (failedChecks > 0) {
    console.error(`FAILED CHECKS: ${failedChecks}`);
    process.exit(1);
  }
  console.log('================================================================\n');
  console.log('>>> AUTOMATED MERMAID ARCHITECTURE DIAGRAMS VERIFIED: ALL TESTS PASSED! <<<\n');
}

runDiagramVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Diagram verification fatal error:', err);
    process.exit(1);
  });
