import 'dotenv/config';
import {
  evaluateConditionalLogic,
  calculateSpecReadinessScore,
} from '../src/lib/conditional-logic/engine';
import {
  INITIAL_WIZARD_FORM_DATA,
  WizardFormData,
  FunctionalRequirement,
} from '../src/types/wizard';
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

async function runPhase2Verification() {
  console.log('================================================================');
  console.log('SDAD Phase 2 Verification: Multi-Stage Wizard & Conditional Logic');
  console.log('Platform: Requirements Wizard');
  console.log('Engine: Deterministic Conditional Rules + Next.js Server Actions');
  console.log('================================================================\n');

  // ====================================================================
  // PART 1: CONDITIONAL LOGIC ENGINE UNIT TESTS
  // ====================================================================
  console.log('PART 1: Testing Conditional Logic Rules Engine...');

  // 1a: Default Web App Archetype
  const baseData: WizardFormData = JSON.parse(JSON.stringify(INITIAL_WIZARD_FORM_DATA));
  const baseResult = evaluateConditionalLogic(baseData);

  assert(baseResult.visibleFields.has('projectName'), 'Core field "projectName" is visible by default');
  assert(!baseResult.visibleFields.has('mobilePlatforms'), 'Mobile-specific fields hidden for web_app archetype');
  assert(!baseResult.visibleFields.has('multiTenancyModel'), 'Enterprise SaaS fields hidden for web_app archetype');

  // 1b: Mobile App Archetype Trigger
  const mobileData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  mobileData.step1_identity.projectType = 'mobile_app';
  mobileData.step1_identity.offlineRequired = true;
  mobileData.step1_identity.pushNotifications = true;

  const mobileResult = evaluateConditionalLogic(mobileData);
  assert(mobileResult.triggeredRuleIds.includes('rule-archetype-mobile'), 'Rule "rule-archetype-mobile" triggered');
  assert(mobileResult.visibleFields.has('mobilePlatforms'), 'Field "mobilePlatforms" dynamically surfaced');
  assert(mobileResult.visibleFields.has('offlineRequired'), 'Field "offlineRequired" dynamically surfaced');
  assert(mobileResult.visibleFields.has('pushNotifications'), 'Field "pushNotifications" dynamically surfaced');
  assert(mobileResult.requiredFields.has('mobilePlatforms'), 'Field "mobilePlatforms" marked as required');
  assert(mobileResult.triggeredRuleIds.includes('rule-mobile-offline-sync'), 'Rule "rule-mobile-offline-sync" triggered');
  assert(
    mobileResult.recommendations.some((r) => r.id === 'rec-offline-sync-engine'),
    'Offline sync recommendation with suggested requirement generated'
  );

  // 1c: Enterprise SaaS Archetype Trigger
  const saasData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  saasData.step1_identity.projectType = 'enterprise_saas';
  saasData.step1_identity.enterpriseSso = true;

  const saasResult = evaluateConditionalLogic(saasData);
  assert(saasResult.triggeredRuleIds.includes('rule-archetype-enterprise-saas'), 'Rule "rule-archetype-enterprise-saas" triggered');
  assert(saasResult.visibleFields.has('multiTenancyModel'), 'Field "multiTenancyModel" dynamically surfaced');
  assert(saasResult.requiredFields.has('multiTenancyModel'), 'Field "multiTenancyModel" marked as required');
  assert(saasResult.triggeredRuleIds.includes('rule-enterprise-sso'), 'Rule "rule-enterprise-sso" triggered');
  assert(
    saasResult.recommendations.some((r) => r.id === 'rec-sso-saml'),
    'Enterprise SSO / SAML recommendation generated'
  );

  // 1d: AI Agentic Archetype Trigger
  const aiData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  aiData.step1_identity.projectType = 'ai_agentic';
  aiData.step1_identity.humanInTheLoop = true;

  const aiResult = evaluateConditionalLogic(aiData);
  assert(aiResult.triggeredRuleIds.includes('rule-archetype-ai-agentic'), 'Rule "rule-archetype-ai-agentic" triggered');
  assert(aiResult.visibleFields.has('aiModelProvider'), 'Field "aiModelProvider" dynamically surfaced');
  assert(aiResult.visibleFields.has('humanInTheLoop'), 'Field "humanInTheLoop" dynamically surfaced');
  assert(
    aiResult.recommendations.some((r) => r.id === 'rec-ai-guardrails'),
    'AI structured output validation guardrails recommendation generated'
  );

  // 1e: HIPAA Compliance Violation Detection
  const hipaaData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  hipaaData.step4_non_functional.securityCompliance.complianceStandards = ['HIPAA'];
  hipaaData.step4_non_functional.securityCompliance.dataEncryptionAtRest = false; // Contradiction!

  const hipaaResult = evaluateConditionalLogic(hipaaData);
  assert(
    hipaaResult.warnings.some((w) => w.code === 'ERR-HIPAA-ENCRYPTION-REST-DISABLED' && w.severity === 'error'),
    'HIPAA violation detected: critical error emitted when encryption-at-rest is disabled'
  );

  // Fix contradiction
  hipaaData.step4_non_functional.securityCompliance.dataEncryptionAtRest = true;
  const hipaaFixedResult = evaluateConditionalLogic(hipaaData);
  assert(
    !hipaaFixedResult.warnings.some((w) => w.code === 'ERR-HIPAA-ENCRYPTION-REST-DISABLED'),
    'HIPAA validation error cleared when encryption-at-rest is enabled'
  );

  // 1f: High Availability (99.99%) & RTO Mismatch Warning
  const haData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  haData.step4_non_functional.availability.uptimeSla = '99.99%';
  haData.step4_non_functional.availability.disasterRecoveryRtoMinutes = 120; // 2 hours is too high for 99.99%!

  const haResult = evaluateConditionalLogic(haData);
  assert(
    haResult.warnings.some((w) => w.code === 'WARN-RTO-EXCEEDS-SLA'),
    'High availability warning emitted when RTO exceeds 99.99% allowable threshold'
  );

  // 1g: High Concurrency Caching Rule
  const highLoadData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  highLoadData.step4_non_functional.scalability.peakConcurrentUsers = 15000;
  highLoadData.step4_non_functional.performance.targetRps = 1000;

  const highLoadResult = evaluateConditionalLogic(highLoadData);
  assert(
    highLoadResult.triggeredRuleIds.includes('rule-high-concurrency-caching'),
    'Distributed caching rule triggered for peak concurrent users > 2500'
  );

  // 1h: Specification Readiness Scoring
  const completeSpecData: WizardFormData = JSON.parse(JSON.stringify(baseData));
  completeSpecData.step1_identity.projectName = 'Automated Logistics Grid';
  completeSpecData.step1_identity.description = 'Enterprise fleet routing and telematics platform.';
  completeSpecData.step1_identity.inScope = ['Routing', 'Telematics'];

  const readinessScore = calculateSpecReadinessScore(completeSpecData, evaluateConditionalLogic(completeSpecData));
  assert(readinessScore.score >= 80, `Complete specification scores high readiness (${readinessScore.score}/100)`);
  assert(readinessScore.grade === 'Ready for Review', 'Grade designated as "Ready for Review"');

  // ====================================================================
  // PART 2: MULTI-STAGE DRAFT PERSISTENCE & SERVER ACTIONS INTEGRATION
  // ====================================================================
  console.log('\nPART 2: Testing Multi-Stage Draft Persistence via Server Actions...');

  // 2a: Create test architect user
  const userRes = await getOrCreateUserAction({
    email: `phase2-architect-${Date.now()}@deshiklab.com`,
    name: 'Senior Architect Turing',
    role: 'architect',
  });
  assert(userRes.success && Boolean(userRes.data?.id), 'Architect user session initialized');
  const userId = userRes.data!.id;

  // 2b: Step 1 Save (Initial Draft Creation)
  const draftId = crypto.randomUUID();
  const step1Payload: WizardFormData = JSON.parse(JSON.stringify(INITIAL_WIZARD_FORM_DATA));
  step1Payload.step1_identity.projectName = 'NextGen Telematics Gateway';
  step1Payload.step1_identity.projectType = 'api_backend';
  step1Payload.step1_identity.apiProtocol = 'rest';
  step1Payload.step1_identity.description = 'High-throughput telemetry ingestion platform processing 50k events/sec.';
  step1Payload.step1_identity.inScope = ['MQTT broker connector', 'Timeseries ingestion', 'REST query API'];
  step1Payload.step1_identity.outOfScope = ['Vehicle hardware sensors'];

  const step1Save = await saveDraftAction({
    id: draftId,
    userId,
    title: 'NextGen Telematics Gateway Spec',
    currentStep: 1,
    status: 'in_progress',
    data: step1Payload,
    stepProgress: {
      completedSteps: [1],
      activeStep: 1,
      totalSteps: 6,
      percentComplete: 16,
      lastSavedAt: new Date().toISOString(),
    },
  });

  assert(step1Save.success === true, 'Step 1: Initial draft created via saveDraftAction');
  assert(step1Save.data?.currentStep === 1, 'Draft currentStep is 1');

  // 2c: Step 3 Save (Functional Requirements Progress)
  const step3Payload: WizardFormData = JSON.parse(JSON.stringify(step1Payload));
  const newReq: FunctionalRequirement = {
    id: 'FR-TELEMETRY-01',
    title: 'High-Volume MQTT Ingestion',
    userStory: 'As a fleet telemetry consumer, I want all vehicle CAN bus metrics ingested without message drop.',
    priority: 'P0',
    category: 'Ingestion Pipeline',
    acceptanceCriteria: [
      'Ingest p99 latency < 50ms from broker to queue',
      'At-least-once message delivery guarantee with Kafka partition keys',
    ],
  };
  step3Payload.step3_functional.requirements.push(newReq);

  const step3Save = await saveDraftAction({
    id: draftId,
    userId,
    title: 'NextGen Telematics Gateway Spec',
    currentStep: 3,
    status: 'in_progress',
    data: step3Payload,
    stepProgress: {
      completedSteps: [1, 2, 3],
      activeStep: 3,
      totalSteps: 6,
      percentComplete: 50,
      lastSavedAt: new Date().toISOString(),
    },
  });

  assert(step3Save.success === true, 'Step 3: Advanced draft to Step 3 and persisted new requirement');
  assert(step3Save.data?.currentStep === 3, 'Draft currentStep is updated to 3');

  // 2d: Step 5 Save & Attach File Reference
  const fileRes = await attachFileReferenceAction({
    draftId,
    userId,
    fileName: 'telematics-data-flow-c4.png',
    originalName: 'Telematics_Data_Flow_Architecture_C4.png',
    mimeType: 'image/png',
    fileSize: 3145728, // 3MB
    filePath: '/uploads/telematics-data-flow-c4.png',
    metadata: {
      diagramType: 'C4 Component Diagram',
      nodes: ['MQTT Broker', 'Kafka Ingestion Topic', 'TimescaleDB Sink', 'Next.js API Gateway'],
    },
  });

  assert(fileRes.success === true, 'Step 5: Attached architectural file reference linked to draft');

  // 2e: Step 6 Finalize & Transition Status to Review
  const step6Payload: WizardFormData = JSON.parse(JSON.stringify(step3Payload));
  step6Payload.step6_review.signOffArchitect = 'Senior Architect Turing';
  step6Payload.step6_review.finalNotes = 'Specification complete and ready for Phase 3 AI Elicitation ingestion.';
  step6Payload.step6_review.specReadinessScore = 92;

  const step6Save = await saveDraftAction({
    id: draftId,
    userId,
    title: 'NextGen Telematics Gateway Spec (Verified)',
    currentStep: 6,
    status: 'review',
    data: step6Payload,
    stepProgress: {
      completedSteps: [1, 2, 3, 4, 5, 6],
      activeStep: 6,
      totalSteps: 6,
      percentComplete: 100,
      lastSavedAt: new Date().toISOString(),
    },
  });

  assert(step6Save.success === true, 'Step 6: Completed full wizard workflow and saved review status');
  assert(step6Save.data?.status === 'review', 'Draft status successfully transitioned to "review"');

  // 2f: Retrieval & Full State Consistency Assertion
  const retrievedRes = await getDraftAction(draftId);
  assert(retrievedRes.success === true, 'Draft retrieved via getDraftAction');
  assert(retrievedRes.data?.id === draftId, 'Retrieved draft ID matches expected draft ID');
  assert(retrievedRes.data?.currentStep === 6, 'Retrieved draft is at Step 6');
  assert(retrievedRes.data?.status === 'review', 'Retrieved draft status is "review"');

  const retrievedData = retrievedRes.data?.data as WizardFormData;
  assert(
    retrievedData.step1_identity.projectName === 'NextGen Telematics Gateway',
    'JSONB step1_identity.projectName matches perfectly'
  );
  assert(
    retrievedData.step3_functional.requirements.some((r) => r.id === 'FR-TELEMETRY-01'),
    'JSONB step3_functional.requirements includes added P0 requirement'
  );
  assert(
    retrievedData.step6_review.signOffArchitect === 'Senior Architect Turing',
    'JSONB step6_review.signOffArchitect matches sign-off name'
  );
  assert(
    retrievedRes.data?.files?.length === 1,
    'Associated file references populated correctly (count = 1)'
  );
  assert(
    retrievedRes.data?.files?.[0]?.originalName === 'Telematics_Data_Flow_Architecture_C4.png',
    'Associated file original name matches'
  );

  // 2g: List drafts validation
  const userDraftsRes = await listUserDraftsAction(userId);
  assert(userDraftsRes.success === true, 'listUserDraftsAction succeeded');
  assert(
    userDraftsRes.data?.some((d: any) => d.id === draftId),
    'Draft appears in user draft listings'
  );

  // ====================================================================
  // SUMMARY
  // ====================================================================
  console.log('\n================================================================');
  console.log('Phase 2 Verification Summary');
  console.log('================================================================');
  const total = assertions.length;
  const passed = assertions.filter((a) => a.passed).length;
  const failed = total - passed;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed === 0) {
    console.log('\n>>> PHASE 2 FRONTEND WIZARD & CONDITIONAL LOGIC VERIFIED: ALL TESTS PASSED! <<<');
    process.exit(0);
  } else {
    console.error(`\n>>> PHASE 2 VERIFICATION FAILED: ${failed} assertions failed! <<<`);
    process.exit(1);
  }
}

runPhase2Verification().catch((err) => {
  console.error('Fatal Phase 2 verification error:', err);
  process.exit(1);
});
