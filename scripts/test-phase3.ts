/**
 * Automated Verification Test Suite for SDAD Phase 3:
 * AI-Assisted Requirements Elicitation Engine & Context Ingestion
 *
 * Checks:
 * 1. Ambiguity detection & clarity scoring (vague adjectives, weak modals, passive voice, missing metrics)
 * 2. Gherkin scenario generation (Given-When-Then, boundary conditions, edge cases)
 * 3. Context document ingestion (extracting requirements, personas, constraints from metadata/text)
 * 4. Proactive elicitation prompt generation (archetype-tailored drill-down questions)
 * 5. Next.js Server Actions execution and PostgreSQL JSONB draft state augmentation
 */

import { AiElicitationEngine } from '../src/lib/ai/engine';
import {
  analyzeAmbiguityAction,
  generateCriteriaAction,
  expandRequirementAction,
  ingestDocumentContextAction,
  generateElicitationQuestionsAction,
  applyExtractedContextToDraftAction,
} from '../src/actions/ai';
import { saveDraftAction, getDraftAction } from '../src/actions/drafts';
import { getOrCreateUserAction } from '../src/actions/users';
import { INITIAL_WIZARD_FORM_DATA, WizardFormData } from '../src/types/wizard';

async function runPhase3Verification() {
  console.log('================================================================');
  console.log('SDAD Phase 3 Verification: AI-Assisted Requirements Elicitation');
  console.log('Platform: Requirements Wizard');
  console.log('Engine: Deterministic Heuristic NLP + Next.js Server Actions + PostgreSQL');
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

  // ----------------------------------------------------------------
  // PART 1: Ambiguity Detection & Clarity Scoring
  // ----------------------------------------------------------------
  console.log('PART 1: Testing Ambiguity Detector & Clarity Scoring...');

  // Case 1A: Highly ambiguous requirement
  const vagueInput = 'The system should be fast, very user-friendly, and secure. Data is processed seamlessly etc.';
  const vagueAnalysis = AiElicitationEngine.analyzeClarity(vagueInput);

  assert(vagueAnalysis.clarityScore < 60, `Vague requirement flagged with low clarity score (${vagueAnalysis.clarityScore}/100 < 60)`);
  assert(vagueAnalysis.ambiguityLevel === 'High', `Ambiguity level accurately designated as "High" (got ${vagueAnalysis.ambiguityLevel})`);
  assert(vagueAnalysis.issues.length >= 4, `At least 4 ambiguity issues detected (found ${vagueAnalysis.issues.length})`);

  const hasFastIssue = vagueAnalysis.issues.some((i) => i.term.toLowerCase().includes('fast'));
  assert(hasFastIssue, 'Flagged "fast" as missing quantitative latency metric');

  const hasUserFriendlyIssue = vagueAnalysis.issues.some((i) => i.term.toLowerCase().includes('user-friendly'));
  assert(hasUserFriendlyIssue, 'Flagged "user-friendly" as subjective, untestable adjective');

  const hasSecureIssue = vagueAnalysis.issues.some((i) => i.term.toLowerCase().includes('secure'));
  assert(hasSecureIssue, 'Flagged "secure" as vague security descriptor requiring cryptographic standards');

  const hasWeakModalIssue = vagueAnalysis.issues.some((i) => i.category === 'weak_modal');
  assert(hasWeakModalIssue, 'Flagged weak modal "should" violating RFC 2119 mandatory specification keywords');

  const hasPassiveVoiceIssue = vagueAnalysis.issues.some((i) => i.category === 'passive_voice');
  assert(hasPassiveVoiceIssue, 'Flagged passive voice "is processed" for missing initiating agent');

  const hasUnboundedIssue = vagueAnalysis.issues.some((i) => i.category === 'unbounded_scope');
  assert(hasUnboundedIssue, 'Flagged unbounded scope term "etc."');

  assert(vagueAnalysis.clarifyingQuestions.length >= 2, `Generated at least 2 clarifying questions (got ${vagueAnalysis.clarifyingQuestions.length})`);

  // Case 1B: High-clarity quantified requirement
  const clearInput = 'As an authenticated tenant admin, I want to authenticate via OAuth 2.0 PKCE with sub-200ms latency at p95 percentile, so that unauthorized access is blocked.';
  const clearAnalysis = AiElicitationEngine.analyzeClarity(clearInput);

  assert(clearAnalysis.clarityScore >= 80, `Clear requirement scores high clarity (${clearAnalysis.clarityScore}/100 >= 80)`);
  assert(clearAnalysis.ambiguityLevel === 'Low' || clearAnalysis.ambiguityLevel === 'Medium', `Clarity designated as Low/Medium ambiguity (got ${clearAnalysis.ambiguityLevel})`);

  // ----------------------------------------------------------------
  // PART 2: Gherkin Acceptance Criteria & Scenario Generation
  // ----------------------------------------------------------------
  console.log('\nPART 2: Testing Gherkin Acceptance Criteria Generation...');

  // Case 2A: Authentication domain
  const authCriteria = AiElicitationEngine.generateCriteria({
    title: 'Google OAuth2 Single Sign-On',
    category: 'Authentication',
    archetype: 'web_app',
  });

  assert(authCriteria.gherkinScenarios.length >= 3, `Generated >= 3 Gherkin scenarios for auth (got ${authCriteria.gherkinScenarios.length})`);

  const happyScenario = authCriteria.gherkinScenarios.find((s) => s.type === 'happy_path');
  assert(!!happyScenario, 'Generated happy path Gherkin scenario');
  assert(happyScenario!.given.length > 0 && happyScenario!.when.length > 0 && happyScenario!.then.length > 0, 'Scenario conforms to Given-When-Then structure');

  const bruteForceScenario = authCriteria.gherkinScenarios.find((s) => s.type === 'security');
  assert(!!bruteForceScenario, 'Generated security/throttling Gherkin scenario');

  assert(authCriteria.acceptanceCriteria.length >= 3, `Generated >= 3 bulleted acceptance criteria (got ${authCriteria.acceptanceCriteria.length})`);
  assert(authCriteria.edgeCases.length >= 2, `Generated >= 2 edge cases (got ${authCriteria.edgeCases.length})`);

  // Case 2B: AI Agentic domain
  const aiCriteria = AiElicitationEngine.generateCriteria({
    title: 'Autonomous Code Refactoring Agent',
    archetype: 'ai_agentic',
    category: 'AI Pipeline',
  });

  const promptInjectionScenario = aiCriteria.gherkinScenarios.find((s) => s.type === 'security');
  assert(!!promptInjectionScenario, 'Generated prompt injection defense scenario for AI Agentic archetype');
  assert(aiCriteria.acceptanceCriteria.some((c) => c.toLowerCase().includes('zod') || c.toLowerCase().includes('schema')), 'Enforces schema validation acceptance criterion for AI');

  // Case 2C: Prompt expansion
  const expanded = AiElicitationEngine.expandRequirement('Stripe customer subscription billing', 'enterprise_saas', 1);
  assert(expanded.title.includes('Subscription billing') || expanded.title.includes('Stripe'), `Expanded requirement title generated: "${expanded.title}"`);
  assert(expanded.priority === 'P0', `Assigned P0 priority to billing requirement`);
  assert(expanded.userStory.startsWith('As an') || expanded.userStory.startsWith('As a'), 'Generated user story adheres to standard template');
  assert(expanded.acceptanceCriteria.length >= 3, 'Expanded requirement contains full acceptance criteria');

  // ----------------------------------------------------------------
  // PART 3: Context Document Ingestion
  // ----------------------------------------------------------------
  console.log('\nPART 3: Testing Context Document Ingestion...');

  const ingested = AiElicitationEngine.ingestDocument({
    fileName: 'System_Architecture_V2.json',
    mimeType: 'application/json',
    rawText: 'Architecture overview for Enterprise SaaS: Uses PostgreSQL 18 with JSONB schemas, Redis distributed caching, OAuth2 SSO authentication, and HIPAA ePHI security controls. Role includes System Administrator and Organization Manager.',
  });

  assert(ingested.documentType === 'API / Schema Specification', `Document type identified as "${ingested.documentType}"`);
  assert(ingested.extractedRequirements.length >= 2, `Extracted >= 2 functional requirements (got ${ingested.extractedRequirements.length})`);
  assert(ingested.extractedPersonas.length >= 2, `Extracted >= 2 stakeholder personas (got ${ingested.extractedPersonas.length})`);
  assert(ingested.extractedConstraints.length >= 3, `Extracted >= 3 architectural constraints (got ${ingested.extractedConstraints.length})`);

  const hasHipaaConstraint = ingested.extractedConstraints.some((c) => c.category === 'compliance');
  assert(hasHipaaConstraint, 'Identified HIPAA compliance constraint from document text');

  const hasPostgresStack = ingested.suggestedStack?.database?.includes('PostgreSQL');
  assert(!!hasPostgresStack, 'Extracted PostgreSQL database recommendation');

  // ----------------------------------------------------------------
  // PART 4: Proactive Elicitation Questions
  // ----------------------------------------------------------------
  console.log('\nPART 4: Testing Proactive Elicitation Questions...');

  const mockFormData: WizardFormData = {
    ...INITIAL_WIZARD_FORM_DATA,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      projectType: 'enterprise_saas',
    },
    step4_non_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step4_non_functional,
      performance: {
        maxLatencyMs: 750, // Elevated latency to trigger question
        targetRps: 100,
      },
    },
  };

  const questions = AiElicitationEngine.elicitClarifications(mockFormData, 1);
  assert(questions.length >= 2, `Generated >= 2 proactive elicitation questions (got ${questions.length})`);

  const tenantQuestion = questions.find((q) => q.id.includes('tenant-isolation'));
  assert(!!tenantQuestion, 'Surfaced enterprise SaaS tenant isolation question');
  assert(tenantQuestion!.suggestedOptions.length >= 2, 'Provided concrete architectural options for tenant isolation');
  assert(!!tenantQuestion!.recommendedRequirement, 'Provided 1-click recommended requirement for Row-Level Security');

  const latencyQuestion = questions.find((q) => q.id.includes('latency'));
  assert(!!latencyQuestion, 'Flagged elevated 750ms latency with proactive clarification');

  // ----------------------------------------------------------------
  // PART 5: Server Actions & PostgreSQL JSONB Persistence
  // ----------------------------------------------------------------
  console.log('\nPART 5: Testing Next.js Server Actions & Database Persistence...');

  // 5A: Server Action analyzeAmbiguityAction
  const serverAmbiguity = await analyzeAmbiguityAction({
    text: 'The API should be extremely fast and scalable with modern UI.',
  });
  assert(serverAmbiguity.success, 'analyzeAmbiguityAction executed successfully');
  assert(serverAmbiguity.data!.issues.length >= 2, 'analyzeAmbiguityAction returned detected issues');

  // 5B: Server Action generateCriteriaAction
  const serverCriteria = await generateCriteriaAction({
    title: 'Multi-Tenant RBAC Permissions',
    archetype: 'enterprise_saas',
  });
  assert(serverCriteria.success, 'generateCriteriaAction executed successfully');
  assert(serverCriteria.data!.gherkinScenarios.length >= 2, 'generateCriteriaAction returned Gherkin scenarios');

  // 5C: Server Action expandRequirementAction
  const serverExpand = await expandRequirementAction({
    prompt: 'Automatic daily data backups to AWS S3',
    archetype: 'enterprise_saas',
  });
  assert(serverExpand.success, 'expandRequirementAction executed successfully');
  assert(serverExpand.data!.acceptanceCriteria.length >= 3, 'expandRequirementAction generated criteria checklist');

  // 5D: Server Action ingestDocumentContextAction
  const serverIngest = await ingestDocumentContextAction({
    fileName: 'Microservices_Architecture_Spec.md',
    rawText: 'Admin operations and audit logging pipeline with Redis caching tier and PostgreSQL database.',
  });
  assert(serverIngest.success, 'ingestDocumentContextAction executed successfully');
  assert(serverIngest.data!.extractedRequirements.length >= 1, 'ingestDocumentContextAction extracted requirements');

  // 5E: Server Action generateElicitationQuestionsAction
  const serverQuestions = await generateElicitationQuestionsAction({
    formData: mockFormData,
  });
  assert(serverQuestions.success, 'generateElicitationQuestionsAction executed successfully');
  assert(serverQuestions.data!.length >= 2, 'generateElicitationQuestionsAction returned questions');

  // 5F: Draft creation, AI context merge, and database persistence
  const userRes = await getOrCreateUserAction({
    email: 'ai-lead-architect@sdad-platform.internal',
    name: 'AI Lead Architect',
    role: 'architect',
  });
  assert(userRes.success, 'Created lead architect user for Phase 3 tests');

  const draftRes = await saveDraftAction({
    userId: userRes.data!.id,
    title: 'AI Elicitation Test Spec Draft',
    currentStep: 3,
    status: 'in_progress',
    data: mockFormData,
  });
  assert(draftRes.success, 'Created test form draft in PostgreSQL');
  const draftId = draftRes.data!.id;

  // Apply extracted context to draft in PostgreSQL
  const mergeRes = await applyExtractedContextToDraftAction({
    draftId,
    requirements: serverIngest.data!.extractedRequirements,
    personas: serverIngest.data!.extractedPersonas,
    preferredStack: serverIngest.data!.suggestedStack,
  });
  assert(mergeRes.success, 'applyExtractedContextToDraftAction executed successfully');
  assert(mergeRes.data!.updatedCount >= 1, `Merged >= 1 extracted requirements into draft (count: ${mergeRes.data!.updatedCount})`);

  // Retrieve draft from DB and verify merged contents
  const verifyDraftRes = await getDraftAction(draftId);
  assert(verifyDraftRes.success, 'Retrieved augmented draft from PostgreSQL');

  const dbData = verifyDraftRes.data!.data as unknown as WizardFormData;
  const mergedTitles = dbData.step3_functional.requirements.map((r) => r.title);
  const containsIngested = serverIngest.data!.extractedRequirements.some((er) =>
    mergedTitles.includes(er.title)
  );
  assert(containsIngested, 'Verified that AI-ingested requirement was persisted into PostgreSQL JSONB step3_functional');

  const mergedPersonaNames = dbData.step2_personas.personas.map((p) => p.name);
  const containsPersona = serverIngest.data!.extractedPersonas.some((ep) =>
    mergedPersonaNames.includes(ep.name)
  );
  assert(containsPersona, 'Verified that AI-ingested persona was persisted into PostgreSQL JSONB step2_personas');

  console.log('\n================================================================');
  console.log('Phase 3 Verification Summary');
  console.log('================================================================');
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed:       ${passedChecks}`);
  console.log(`Failed:       0`);
  console.log('\n>>> PHASE 3 AI ELICITATION ENGINE VERIFIED: ALL TESTS PASSED! <<<\n');
  process.exit(0);
}

runPhase3Verification().catch((err) => {
  console.error('\nVerification failed with exception:', err);
  process.exit(1);
});
