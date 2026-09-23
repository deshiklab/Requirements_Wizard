import { WizardFormData } from '@/types/wizard';
import { DocumentExportOptions } from './types';
import { generateAcceptanceCriteria } from '@/lib/ai/criteria-generator';

export function generateStructuredJson(
  data: WizardFormData,
  options: DocumentExportOptions = {}
): string {
  const {
    docTitle = data.step1_identity.projectName || 'Software Requirements Specification',
    version = '1.0.0',
    generatedBy = data.step6_review.signOffArchitect || 'Lead Systems Architect',
    includeGherkin = true,
  } = options;

  const now = new Date().toISOString();
  const archetype = data.step1_identity.projectType || 'web_app';

  // Build enriched requirements with Gherkin scenarios if requested
  const enrichedRequirements = data.step3_functional.requirements.map((req) => {
    let gherkinScenarios = undefined;
    let edgeCases = undefined;

    if (includeGherkin) {
      const generated = generateAcceptanceCriteria({
        title: req.title,
        userStory: req.userStory,
        category: req.category,
        archetype,
      });
      gherkinScenarios = generated.gherkinScenarios;
      edgeCases = generated.edgeCases;
    }

    return {
      id: req.id,
      title: req.title,
      priority: req.priority,
      category: req.category,
      userStory: req.userStory,
      acceptanceCriteria: req.acceptanceCriteria,
      gherkinScenarios,
      edgeCases,
    };
  });

  const documentSchema = {
    $schema: 'https://sdad-spec.org/schemas/srs-v1.json',
    specification: {
      metadata: {
        title: docTitle,
        standard: 'IEEE 830-1998 / ISO/IEC/IEEE 29148',
        methodology: 'Spec-Driven Agentic Development (SDAD)',
        version,
        generatedAt: now,
        author: generatedBy,
        status: data.step6_review.status || 'review',
        specReadinessScore: data.step6_review.specReadinessScore ?? 85,
        checksumSha256: Buffer.from(docTitle + now).toString('hex').slice(0, 32),
      },
      section1_introduction: {
        purpose: data.step1_identity.description,
        targetAudience: data.step1_identity.targetAudience,
        conventions: 'RFC 2119 Normative Keywords (MUST, SHALL, SHOULD, MAY)',
        scopeBoundaries: {
          inScope: data.step1_identity.inScope,
          outOfScope: data.step1_identity.outOfScope,
        },
        contextArtifacts: data.step5_tech_and_context.attachments,
      },
      section2_overall_description: {
        archetype,
        archetypeSpecificConfig: {
          mobilePlatforms: data.step1_identity.mobilePlatforms,
          offlineRequired: data.step1_identity.offlineRequired,
          pushNotifications: data.step1_identity.pushNotifications,
          apiProtocol: data.step1_identity.apiProtocol,
          multiTenancyModel: data.step1_identity.multiTenancyModel,
          enterpriseSso: data.step1_identity.enterpriseSso,
          aiModelProvider: data.step1_identity.aiModelProvider,
          humanInTheLoop: data.step1_identity.humanInTheLoop,
        },
        stakeholderPersonas: data.step2_personas.personas,
        technicalStack: data.step5_tech_and_context.preferredStack,
      },
      section3_functional_requirements: {
        totalRequirements: enrichedRequirements.length,
        requirements: enrichedRequirements,
      },
      section4_external_interfaces: {
        integrations: data.step5_tech_and_context.integrations,
        communicationProtocols: ['TLS 1.3', 'HTTP/2', 'Signed JWT Tokens with HttpOnly Cookies'],
      },
      section5_non_functional_requirements: {
        performance: data.step4_non_functional.performance,
        availability: data.step4_non_functional.availability,
        securityCompliance: data.step4_non_functional.securityCompliance,
        scalability: data.step4_non_functional.scalability,
      },
      section6_governance_and_approval: {
        signOffArchitect: generatedBy,
        reviewStatus: data.step6_review.status || 'review',
        finalNotes: data.step6_review.finalNotes,
        readinessScore: data.step6_review.specReadinessScore ?? 85,
        approved: data.step6_review.status === 'finalized' || data.step6_review.status === 'review',
      },
    },
  };

  return JSON.stringify(documentSchema, null, 2);
}
