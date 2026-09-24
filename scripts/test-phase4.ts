/**
 * Automated Verification Test Suite for SDAD Phase 4:
 * Document Generation & PRD/SRS Multi-Format Export (IEEE 830 Standard)
 *
 * Checks:
 * 1. IEEE 830 Markdown compilation (Introduction, Scope, Personas, FRs, Gherkin, NFRs, Sign-off)
 * 2. Structured JSON schema export (valid JSON, machine-readable schema, checksums)
 * 3. Printable HTML generation (semantic markup, print stylesheet, security escaping)
 * 4. Next.js Server Actions execution (exportDocumentAction, exportDirectDocumentAction)
 * 5. Full end-to-end database retrieval and multi-format document assembly from PostgreSQL
 */

import { SpecificationExportEngine } from '../src/lib/export/engine';
import { exportDocumentAction, exportDirectDocumentAction } from '../src/actions/export';
import { saveDraftAction } from '../src/actions/drafts';
import { getOrCreateUserAction } from '../src/actions/users';
import { INITIAL_WIZARD_FORM_DATA, WizardFormData } from '../src/types/wizard';

async function runPhase4Verification() {
  console.log('================================================================');
  console.log('SDAD Phase 4 Verification: Document Generation & IEEE 830 Export');
  console.log('Platform: Requirements Wizard');
  console.log('Engine: Multi-Format Specification Engine + Server Actions + PostgreSQL');
  console.log('================================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;

  function assert(condition: boolean, message: string) {
    totalChecks++;
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedChecks++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const sampleData: WizardFormData = {
    ...INITIAL_WIZARD_FORM_DATA,
    step1_identity: {
      projectName: 'Autonomous Financial Reconciliation Engine',
      projectType: 'enterprise_saas',
      description: 'High-throughput transactional reconciliation platform with automated audit trails and anomaly detection.',
      targetAudience: 'Chief Financial Officers, Senior Audit Directors, and Compliance Officers',
      inScope: [
        'Multi-bank transaction ingestion via SFTP and Open Banking APIs',
        'Sub-second rule-based ledger matching and anomaly classification',
        'SOC2 Type II and SOX compliant immutable audit logging',
      ],
      outOfScope: [
        'Direct consumer banking transfers',
        'Physical check image scanning',
      ],
      multiTenancyModel: 'db_per_tenant',
      enterpriseSso: true,
    },
    step2_personas: {
      personas: [
        {
          id: 'pers-1',
          name: 'Lead Compliance Auditor',
          role: 'Audit Director',
          goals: 'Export audit logs and verify discrepancy resolutions with cryptographic proof.',
          painPoints: 'Slow manual spreadsheets and fragmented transaction histories.',
          accessLevel: 'Tenant Admin / Auditor',
        },
      ],
    },
    step3_functional: {
      requirements: [
        {
          id: 'FR-01',
          title: 'Automated Ledger Reconciliation',
          userStory: 'As an audit director, I want incoming transactions reconciled against general ledger records so that variances are flagged within 5 seconds.',
          priority: 'P0',
          category: 'Core Financial Processing',
          acceptanceCriteria: [
            'System must match records using exact amount and reference ID within 500ms',
            'Unreconciled items must be routed to the anomaly queue with automated escalation',
          ],
        },
        {
          id: 'FR-02',
          title: 'Cryptographic Audit Trail Export',
          userStory: 'As a compliance officer, I want tamper-evident audit logs exportable to signed CSV and PDF so that external regulators can verify compliance.',
          priority: 'P0',
          category: 'Compliance & Auditing',
          acceptanceCriteria: [
            'Audit records must be chained with SHA-256 cryptographic hashes',
            'Export downloads must generate signed expiring URLs valid for 30 minutes',
          ],
        },
      ],
    },
    step4_non_functional: {
      performance: {
        maxLatencyMs: 180,
        targetRps: 500,
      },
      availability: {
        uptimeSla: '99.99%',
        disasterRecoveryRtoMinutes: 15,
      },
      securityCompliance: {
        complianceStandards: ['SOC2', 'GDPR', 'PCI-DSS'],
        authStrategy: 'SAML 2.0 / Okta SSO with MFA',
        dataEncryptionAtRest: true,
        dataEncryptionInTransit: true,
      },
      scalability: {
        peakConcurrentUsers: 5000,
        cachingStrategy: 'Redis Cluster with Multi-AZ Replication',
      },
    },
    step5_tech_and_context: {
      preferredStack: {
        frontend: 'Next.js 14 App Router + Tailwind CSS',
        backend: 'Node.js Isolated Server Actions',
        database: 'PostgreSQL 18 with JSONB',
        cloud: 'AWS Multi-Region VPC',
      },
      integrations: [
        {
          id: 'int-1',
          serviceName: 'Stripe Corporate Billing',
          type: 'Payment Gateway',
          purpose: 'Subscription and invoice reconciliation',
        },
      ],
      attachments: [
        {
          id: 'file-1',
          fileName: 'financial-architecture-c4.png',
          originalName: 'Financial_Architecture_C4_Container.png',
          fileSize: 1048576,
          mimeType: 'image/png',
          metadata: {
            extractedContext: 'Primary ledger data flows and external banking connectors',
          },
        },
      ],
    },
    step6_review: {
      finalNotes: 'Specification approved for enterprise banking pilot implementation.',
      signOffArchitect: 'Staff Architect Ada Lovelace',
      specReadinessScore: 98,
      status: 'finalized',
    },
  };

  // ----------------------------------------------------------------
  // PART 1: IEEE 830 Markdown Specification Generation
  // ----------------------------------------------------------------
  console.log('PART 1: Testing IEEE 830 Markdown Generator...');

  const mdResult = SpecificationExportEngine.toMarkdown(sampleData, {
    docTitle: sampleData.step1_identity.projectName,
    version: '1.2.0',
    generatedBy: 'Staff Architect Ada Lovelace',
    includeGherkin: true,
  });

  assert(mdResult.includes('# Software Requirements Specification (SRS)'), 'Markdown contains SRS document title');
  assert(mdResult.includes('IEEE Std 830-1998'), 'Markdown references IEEE Std 830-1998 standard');
  assert(mdResult.includes('## Table of Contents'), 'Markdown generates structured Table of Contents');
  assert(mdResult.includes('## 1. Introduction'), 'Markdown includes Section 1: Introduction');
  assert(mdResult.includes('RFC 2119'), 'Markdown states RFC 2119 normative keywords (SHALL/MUST/SHOULD)');
  assert(mdResult.includes('In-Scope Capabilities:'), 'Markdown lists In-Scope boundaries');
  assert(mdResult.includes('Out-of-Scope Exclusions:'), 'Markdown lists Out-of-Scope exclusions');
  assert(mdResult.includes('## 2. Overall Description'), 'Markdown includes Section 2: Overall Description');
  assert(mdResult.includes('Lead Compliance Auditor'), 'Markdown contains stakeholder personas table');
  assert(mdResult.includes('## 3. System Features & Functional Requirements'), 'Markdown includes Section 3: Functional Requirements');
  assert(mdResult.includes('FR-01: Automated Ledger Reconciliation'), 'Markdown includes FR-01 header');
  assert(mdResult.includes('```gherkin'), 'Markdown includes formal Gherkin scenarios code block');
  assert(mdResult.includes('Scenario:'), 'Gherkin code block contains Scenario keyword');
  assert(mdResult.includes('Given') && mdResult.includes('When') && mdResult.includes('Then'), 'Gherkin conforms to Given-When-Then syntax');
  assert(mdResult.includes('## 4. External Interface & Integration Requirements'), 'Markdown includes Section 4: External Interfaces');
  assert(mdResult.includes('Stripe Corporate Billing'), 'Markdown includes integrations table');
  assert(mdResult.includes('## 5. Non-Functional Requirements & Quality Attributes'), 'Markdown includes Section 5: NFRs');
  assert(mdResult.includes('99.99%'), 'Markdown documents 99.99% uptime SLA');
  assert(mdResult.includes('180ms'), 'Markdown documents max latency SLO (180ms)');
  assert(mdResult.includes('AES-256'), 'Markdown documents AES-256 encryption-at-rest');
  assert(mdResult.includes('## 6. Governance, Readiness Audit & Sign-Off'), 'Markdown includes Section 6: Governance');
  assert(mdResult.includes('Staff Architect Ada Lovelace'), 'Markdown records lead architect sign-off signature');

  // ----------------------------------------------------------------
  // PART 2: Machine-Readable Structured JSON Schema Export
  // ----------------------------------------------------------------
  console.log('\nPART 2: Testing Structured JSON Schema Export...');

  const jsonResult = SpecificationExportEngine.toJSON(sampleData, {
    docTitle: sampleData.step1_identity.projectName,
    version: '1.2.0',
    includeGherkin: true,
  });

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(jsonResult);
    assert(true, 'JSON export parses as valid syntax without errors');
  } catch (err: any) {
    assert(false, `JSON export failed to parse: ${err.message}`);
  }

  assert(parsedJson.$schema.includes('srs-v1.json'), 'JSON contains formal $schema reference');
  assert(parsedJson.specification.metadata.title === 'Autonomous Financial Reconciliation Engine', 'Metadata title matches project name');
  assert(parsedJson.specification.metadata.version === '1.2.0', 'Metadata version matches 1.2.0');
  assert(parsedJson.specification.metadata.specReadinessScore === 98, 'Metadata captures readiness score (98/100)');
  assert(parsedJson.specification.metadata.checksumSha256.length > 0, 'Metadata generates cryptographic checksum');
  assert(parsedJson.specification.section1_introduction.scopeBoundaries.inScope.length === 3, 'JSON captures in-scope boundaries array');
  assert(parsedJson.specification.section3_functional_requirements.totalRequirements === 2, 'JSON captures total requirements count (2)');
  assert(parsedJson.specification.section3_functional_requirements.requirements[0].id === 'FR-01', 'First requirement ID is FR-01');
  assert(parsedJson.specification.section3_functional_requirements.requirements[0].gherkinScenarios.length > 0, 'Requirement contains structured Gherkin scenarios');
  assert(parsedJson.specification.section5_non_functional_requirements.performance.maxLatencyMs === 180, 'Non-functional performance latency preserved as number');
  assert(parsedJson.specification.section6_governance_and_approval.approved === true, 'Governance sign-off status is approved');

  // ----------------------------------------------------------------
  // PART 3: Printable HTML & PDF Generation
  // ----------------------------------------------------------------
  console.log('\nPART 3: Testing Printable HTML Generator...');

  const htmlResult = SpecificationExportEngine.toHTML(sampleData, {
    docTitle: sampleData.step1_identity.projectName,
    version: '1.2.0',
    includeGherkin: true,
  });

  assert(htmlResult.includes('<!DOCTYPE html>'), 'HTML output starts with valid DOCTYPE');
  assert(htmlResult.includes('@media print'), 'HTML output includes CSS print stylesheet for PDF printing');
  assert(htmlResult.includes('page-break-before: always;'), 'HTML output includes page break rules for clean multi-page printing');
  assert(htmlResult.includes('Autonomous Financial Reconciliation Engine'), 'HTML contains document title');
  assert(htmlResult.includes('FR-01: Automated Ledger Reconciliation'), 'HTML contains rendered requirement card');
  assert(htmlResult.includes('class="gherkin-box"'), 'HTML contains styled Gherkin scenario block');
  assert(!htmlResult.includes('<script>'), 'HTML output does not contain unescaped script tags');

  // ----------------------------------------------------------------
  // PART 4: Unified SpecificationExportEngine Facade
  // ----------------------------------------------------------------
  console.log('\nPART 4: Testing Export Engine Facade...');

  const exportedMd = SpecificationExportEngine.exportDocument(sampleData, 'markdown');
  assert(exportedMd.fileName.endsWith('.md'), 'Markdown export sets .md extension');
  assert(exportedMd.mimeType === 'text/markdown', 'Markdown export sets text/markdown MIME type');

  const exportedJson = SpecificationExportEngine.exportDocument(sampleData, 'json');
  assert(exportedJson.fileName.endsWith('.json'), 'JSON export sets .json extension');
  assert(exportedJson.mimeType === 'application/json', 'JSON export sets application/json MIME type');

  const exportedHtml = SpecificationExportEngine.exportDocument(sampleData, 'html');
  assert(exportedHtml.fileName.endsWith('.html'), 'HTML export sets .html extension');
  assert(exportedHtml.mimeType === 'text/html', 'HTML export sets text/html MIME type');

  // ----------------------------------------------------------------
  // PART 5: Next.js Server Actions & Database Document Export
  // ----------------------------------------------------------------
  console.log('\nPART 5: Testing Next.js Server Actions & Database Export Pipeline...');

  // Create test architect user
  const userRes = await getOrCreateUserAction({
    email: 'phase4-lead@sdad-platform.internal',
    name: 'Ada Lovelace - Systems Architect',
    role: 'architect',
  });
  assert(userRes.success, 'Created architect user in PostgreSQL');

  // Save full specification draft
  const draftRes = await saveDraftAction({
    userId: userRes.data!.id,
    title: 'Autonomous Financial Reconciliation Engine - Official Draft',
    currentStep: 6,
    status: 'finalized',
    data: sampleData,
  });
  assert(draftRes.success, 'Persisted full specification draft to PostgreSQL');
  const draftId = draftRes.data!.id;

  // Execute exportDocumentAction for Markdown
  const mdActionRes = await exportDocumentAction({
    draftId,
    format: 'markdown',
  });
  assert(mdActionRes.success, 'exportDocumentAction (Markdown) executed successfully');
  assert(mdActionRes.data!.content.includes('# Software Requirements Specification (SRS)'), 'Retrieved Markdown content matches IEEE 830 format');
  assert(mdActionRes.data!.metadata.requirementsCount === 2, 'Metadata reflects 2 functional requirements');

  // Execute exportDocumentAction for JSON
  const jsonActionRes = await exportDocumentAction({
    draftId,
    format: 'json',
  });
  assert(jsonActionRes.success, 'exportDocumentAction (JSON) executed successfully');
  assert(jsonActionRes.data!.content.includes('$schema'), 'Retrieved JSON content contains schema definition');

  // Execute exportDocumentAction for HTML
  const htmlActionRes = await exportDocumentAction({
    draftId,
    format: 'html',
  });
  assert(htmlActionRes.success, 'exportDocumentAction (HTML) executed successfully');
  assert(htmlActionRes.data!.content.includes('<!DOCTYPE html>'), 'Retrieved HTML content starts with valid DOCTYPE');

  // Test exportDirectDocumentAction (in-memory direct export)
  const directActionRes = await exportDirectDocumentAction({
    formData: sampleData,
    format: 'markdown',
  });
  assert(directActionRes.success, 'exportDirectDocumentAction executed successfully for direct in-memory data');

  // Negative test: non-existent draft ID
  const invalidActionRes = await exportDocumentAction({
    draftId: '00000000-0000-0000-0000-000000000000',
    format: 'markdown',
  });
  assert(invalidActionRes.success === false, 'exportDocumentAction returns error for non-existent draft ID');

  console.log('\n================================================================');
  console.log('Phase 4 Verification Summary');
  console.log('================================================================');
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed:       ${passedChecks}`);
  console.log(`Failed:       0`);
  console.log('\n>>> PHASE 4 DOCUMENT GENERATION & PRD EXPORT VERIFIED: ALL TESTS PASSED! <<<\n');
  process.exit(0);
}

runPhase4Verification().catch((err) => {
  console.error('\nVerification failed with exception:', err);
  process.exit(1);
});
