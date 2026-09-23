import 'dotenv/config';
import { db } from '../src/lib/db';
import {
  saveDraftAction,
  getDraftAction,
  attachFileReferenceAction,
  listUserDraftsAction,
} from '../src/actions/drafts';
import { getOrCreateUserAction } from '../src/actions/users';

interface TestAssertion {
  name: string;
  passed: boolean;
  details?: string;
}

const assertions: TestAssertion[] = [];

function assert(condition: boolean, name: string, details?: string) {
  assertions.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
  } else {
    console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
  }
}

async function runPhase1Verification() {
  console.log('================================================================');
  console.log('SDAD Phase 1 Verification: Database, Schema & Environment');
  console.log('Platform: Requirements Wizard');
  console.log('Database Engine: PostgreSQL 18.4 (JSONB Support Enabled)');
  console.log('ORM: Prisma ORM (PSL Contract + Runtime)');
  console.log('================================================================\n');

  // Test 1: Direct ORM User Creation
  console.log('Step 1: Testing User Model Creation...');
  const testEmail = `sdad-lead-${Date.now()}@arena-sdad.dev`;
  const user = await db.orm.public.User.create({
    id: crypto.randomUUID(),
    email: testEmail,
    name: 'Ada Lovelace - Systems Architect',
    role: 'architect',
  });

  assert(Boolean(user && user.id), 'User record successfully written to database');
  assert(user.email === testEmail, 'User email persisted correctly');

  // Test 2: Writing Mock Multi-Stage Form Draft with JSONB Data
  console.log('\nStep 2: Writing Multi-Stage Form Draft with Complex JSONB Payload...');

  const mockRequirementsPayload = {
    metadata: {
      framework: 'Spec-Driven Agentic Development (SDAD)',
      specVersion: '1.0.0-draft',
      riskTier: 'Tier-1 Critical Infrastructure',
      targetCompletionDate: '2026-11-15',
    },
    stage1_project_overview: {
      projectName: 'Autonomous Requirements Elicitation Engine',
      vision: 'Transform ambiguous stakeholder requests into verifiable, schema-compliant software engineering specifications.',
      targetAudience: ['Principal Architects', 'Staff Engineers', 'Autonomous Coding Agents'],
      scopeBoundaries: {
        inScope: [
          'Interactive requirements elicitation wizard with stage gates',
          'Database-backed state persistence for incomplete drafts',
          'Deterministic DAG progression & automated phase verification',
          'AI-assisted disambiguation and acceptance criteria synthesis',
        ],
        outOfScope: [
          'Direct deployment to production Kubernetes without sign-off',
          'Unconstrained generative code modification outside DAG phases',
        ],
      },
    },
    stage2_personas_and_actors: [
      {
        id: 'ACT-01',
        role: 'Human System Architect',
        responsibilities: 'Defines system constraints, signs off on phase gates, verifies test suites',
        permissions: ['approve_phase', 'override_spec', 'export_final_prd'],
      },
      {
        id: 'ACT-02',
        role: 'Autonomous Execution Agent',
        responsibilities: 'Generates incremental code, executes DAG dependencies, isolates server actions',
        permissions: ['read_spec', 'write_draft_code', 'run_verification'],
      },
    ],
    stage3_functional_requirements: [
      {
        id: 'FR-01',
        title: 'Multi-Stage Draft Persistence',
        description: 'System must persist partial draft states across stages into PostgreSQL JSONB fields.',
        acceptanceCriteria: [
          'Draft schema supports arbitrary nested JSON data without schema migrations',
          'Server actions enforce strict Zod validation on inputs',
          'Step progress tracks step numbers and completion timestamps',
        ],
        priority: 'P0 - Blocker',
      },
      {
        id: 'FR-02',
        title: 'Contextual Document Attachment Reference',
        description: 'System must associate uploaded PRD drafts, diagrams, and logs with drafts.',
        acceptanceCriteria: [
          'File references store MIME types, file sizes, storage paths, and JSON metadata',
          'Cascade rules cleanly manage file-to-draft references on draft deletion',
        ],
        priority: 'P1 - High',
      },
    ],
    stage4_non_functional_requirements: {
      performance: {
        maxSaveLatencyMs: 150,
        queryEngineOverheadMs: 10,
        clientRenderP95Ms: 300,
      },
      security: {
        serverActionIsolation: true,
        clientDataLeakagePrevention: true,
        inputSanitization: 'Zod strict parsing',
      },
      resilience: {
        connectionPooling: true,
        gracefulDegradation: true,
      },
    },
    stage5_technical_constraints: {
      stack: {
        framework: 'Next.js 14 App Router',
        styling: 'Tailwind CSS + Shadcn UI',
        database: 'PostgreSQL 18.4',
        orm: 'Prisma ORM',
        language: 'TypeScript 5.x Strict Mode',
      },
    },
  };

  const draftId = crypto.randomUUID();
  const formDraft = await db.orm.public.FormDraft.create({
    id: draftId,
    userId: user.id,
    title: 'Autonomous Requirements Elicitation Engine - SDAD Spec',
    currentStep: 3,
    status: 'in_progress',
    data: mockRequirementsPayload,
    stepProgress: {
      completedSteps: [1, 2],
      activeStep: 3,
      totalSteps: 5,
      percentComplete: 40,
      lastSavedAt: new Date().toISOString(),
    },
  });

  assert(Boolean(formDraft && formDraft.id), 'Form draft successfully written with ID: ' + draftId);
  assert(formDraft.currentStep === 3, 'Draft currentStep persisted correctly as 3');
  assert(formDraft.title.includes('Autonomous Requirements'), 'Draft title matches expectation');

  // Test 3: Attaching File Reference
  console.log('\nStep 3: Attaching File Upload Reference to Form Draft...');
  const fileId = crypto.randomUUID();
  const fileRef = await db.orm.public.FileReference.create({
    id: fileId,
    userId: user.id,
    draftId: formDraft.id,
    fileName: 'c4-container-diagram.png',
    originalName: 'System_Architecture_C4_Container_Diagram_2026.png',
    mimeType: 'image/png',
    fileSize: 4194304, // 4MB
    filePath: '/storage/uploads/c4-container-diagram.png',
    metadata: {
      width: 3840,
      height: 2160,
      colorSpace: 'sRGB',
      extractedDiagramComponents: ['Next.js App Router', 'PostgreSQL DB', 'Prisma Engine', 'LLM Provider'],
      checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  });

  assert(Boolean(fileRef && fileRef.id), 'File reference created with ID: ' + fileId);
  assert(fileRef.draftId === formDraft.id, 'File reference linked to FormDraft');

  // Test 4: Database Retrieval & JSONB Integrity Verification
  console.log('\nStep 4: Retrieving Form Draft and Verifying JSONB Nested Fields...');
  const retrievedDraft = await db.orm.public.FormDraft.where({ id: draftId }).first();

  assert(Boolean(retrievedDraft), 'Form draft retrieved from database');
  assert(retrievedDraft?.id === draftId, 'Retrieved draft ID matches expected ID');
  const draftData = retrievedDraft?.data as Record<string, any>;
  const stepProg = retrievedDraft?.stepProgress as Record<string, any>;
  assert(draftData?.metadata?.framework === 'Spec-Driven Agentic Development (SDAD)', 'Deep JSONB field "metadata.framework" verified');
  assert(draftData?.stage1_project_overview?.projectName === 'Autonomous Requirements Elicitation Engine', 'Deep JSONB field "stage1_project_overview.projectName" verified');
  assert(draftData?.stage3_functional_requirements?.length === 2, 'Deep JSONB array length verified (2 requirements)');
  assert(draftData?.stage4_non_functional_requirements?.security?.serverActionIsolation === true, 'Deep JSONB field "security.serverActionIsolation" verified');
  assert(stepProg?.percentComplete === 40, 'JSONB stepProgress field verified');

  // Test 5: Next.js Server Actions Isolation & Execution
  console.log('\nStep 5: Testing Next.js 14 Server Actions Boundary...');

  // 5a: Save draft action (Update existing draft via Server Action)
  const updatedPayload = {
    ...mockRequirementsPayload,
    stage1_project_overview: {
      ...mockRequirementsPayload.stage1_project_overview,
      projectName: 'Autonomous Requirements Elicitation Engine (Updated via Server Action)',
    },
  };

  const actionSaveResult = await saveDraftAction({
    id: draftId,
    userId: user.id,
    title: 'Autonomous Requirements Elicitation Engine - SDAD Spec (v2)',
    currentStep: 4,
    status: 'in_progress',
    data: updatedPayload,
    stepProgress: {
      completedSteps: [1, 2, 3],
      activeStep: 4,
      totalSteps: 5,
      percentComplete: 60,
    },
  });

  assert(actionSaveResult.success === true, 'saveDraftAction executed successfully');

  // 5b: Get draft action (Retrieve draft with linked files via Server Action)
  const actionGetResult = await getDraftAction(draftId);
  assert(actionGetResult.success === true, 'getDraftAction executed successfully');
  assert(actionGetResult.data?.currentStep === 4, 'Server action reflected updated currentStep = 4');
  assert(actionGetResult.data?.files?.length === 1, 'Server action returned 1 associated file reference');
  assert(actionGetResult.data?.files?.[0]?.originalName === 'System_Architecture_C4_Container_Diagram_2026.png', 'Associated file original name matched');

  // 5c: List user drafts action
  const actionListResult = await listUserDraftsAction(user.id);
  assert(actionListResult.success === true, 'listUserDraftsAction executed successfully');
  assert(Array.isArray(actionListResult.data) && actionListResult.data.length >= 1, 'listUserDraftsAction returned array with draft');

  // 5d: Security validation check (Zod rejection for invalid inputs)
  const invalidSaveResult = await saveDraftAction({
    userId: '', // Missing required userId
    title: '',
    currentStep: 99, // Out of 1..10 range
    data: {} as any,
  });
  assert(invalidSaveResult.success === false, 'Server action properly rejected invalid inputs via Zod');

  // Final Summary
  console.log('\n================================================================');
  console.log('Phase 1 Verification Summary');
  console.log('================================================================');
  const total = assertions.length;
  const passed = assertions.filter((a) => a.passed).length;
  const failed = total - passed;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed === 0) {
    console.log('\n>>> PHASE 1 DATABASE & ENVIRONMENT VERIFICATION: ALL TESTS PASSED! <<<');
    process.exit(0);
  } else {
    console.error(`\n>>> PHASE 1 VERIFICATION FAILED: ${failed} assertions failed! <<<`);
    process.exit(1);
  }
}

runPhase1Verification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
