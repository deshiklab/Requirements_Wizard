'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  AmbiguityAnalysisSchema,
  AmbiguityAnalysisInput,
  GenerateCriteriaSchema,
  GenerateCriteriaInput,
  ExpandRequirementSchema,
  ExpandRequirementInput,
  IngestDocumentContextSchema,
  IngestDocumentContextInput,
  ElicitationQuestionsSchema,
  ElicitationQuestionsInput,
  ApplyExtractedToDraftSchema,
  ApplyExtractedToDraftInput,
  ActionResponse,
} from './schemas';
import {
  AiElicitationEngine,
  AmbiguityAnalysisResult,
  GeneratedCriteriaResult,
  RequirementExpansionResult,
  DocumentIngestionResult,
  ElicitationQuestion,
} from '@/lib/ai/engine';
import { WizardFormData } from '@/types/wizard';

/**
 * Server Action: Analyzes requirement text for ambiguity, vague adjectives, and missing SLAs.
 */
export async function analyzeAmbiguityAction(
  input: AmbiguityAnalysisInput
): Promise<ActionResponse<AmbiguityAnalysisResult>> {
  try {
    const validated = AmbiguityAnalysisSchema.parse(input);
    const result = AiElicitationEngine.analyzeClarity(validated.text);
    return {
      success: true,
      data: result,
      message: `Ambiguity analysis completed with Clarity Score: ${result.clarityScore}/100`,
    };
  } catch (error: any) {
    console.error('[analyzeAmbiguityAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to analyze ambiguity'),
      details: error,
    };
  }
}

/**
 * Server Action: Generates testable Gherkin scenarios (Given-When-Then) and boundary acceptance criteria.
 */
export async function generateCriteriaAction(
  input: GenerateCriteriaInput
): Promise<ActionResponse<GeneratedCriteriaResult>> {
  try {
    const validated = GenerateCriteriaSchema.parse(input);
    const result = AiElicitationEngine.generateCriteria({
      title: validated.title,
      userStory: validated.userStory,
      category: validated.category,
      personaRole: validated.personaRole,
      archetype: validated.archetype as any,
    });
    return {
      success: true,
      data: result,
      message: `Generated ${result.gherkinScenarios.length} Gherkin scenarios and ${result.acceptanceCriteria.length} acceptance criteria.`,
    };
  } catch (error: any) {
    console.error('[generateCriteriaAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to generate acceptance criteria'),
      details: error,
    };
  }
}

/**
 * Server Action: Expands a brief requirement prompt into a complete specification item.
 */
export async function expandRequirementAction(
  input: ExpandRequirementInput
): Promise<ActionResponse<RequirementExpansionResult>> {
  try {
    const validated = ExpandRequirementSchema.parse(input);
    const result = AiElicitationEngine.expandRequirement(
      validated.prompt,
      validated.archetype as any,
      validated.existingCount || 0
    );
    return {
      success: true,
      data: result,
      message: `Successfully expanded requirement "${result.title}"`,
    };
  } catch (error: any) {
    console.error('[expandRequirementAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to expand requirement'),
      details: error,
    };
  }
}

/**
 * Server Action: Ingests contextual documents (architecture diagrams, PRD text, API contracts)
 * and extracts requirements, personas, and constraints.
 */
export async function ingestDocumentContextAction(
  input: IngestDocumentContextInput
): Promise<ActionResponse<DocumentIngestionResult>> {
  try {
    const validated = IngestDocumentContextSchema.parse(input);

    let rawText = validated.rawText || '';
    let metadata = validated.metadata || {};

    // If fileId is provided, attempt to look up FileReference from DB
    if (validated.fileId) {
      const fileRef = await db.orm.public.FileReference.where({ id: validated.fileId }).first();
      if (fileRef) {
        if (!validated.fileName) validated.fileName = fileRef.originalName;
        if (!validated.mimeType) validated.mimeType = fileRef.mimeType;
        if (fileRef.metadata && typeof fileRef.metadata === 'object') {
          metadata = { ...metadata, ...(fileRef.metadata as Record<string, any>) };
        }
      }
    }

    const result = AiElicitationEngine.ingestDocument({
      fileName: validated.fileName,
      mimeType: validated.mimeType,
      rawText,
      metadata,
    });

    return {
      success: true,
      data: result,
      message: result.summary,
    };
  } catch (error: any) {
    console.error('[ingestDocumentContextAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to ingest context document'),
      details: error,
    };
  }
}

/**
 * Server Action: Generates proactive elicitation questions for missing specifications and edge cases.
 */
export async function generateElicitationQuestionsAction(
  input: ElicitationQuestionsInput
): Promise<ActionResponse<ElicitationQuestion[]>> {
  try {
    const validated = ElicitationQuestionsSchema.parse(input);
    const questions = AiElicitationEngine.elicitClarifications(
      validated.formData as WizardFormData,
      validated.activeStep
    );
    return {
      success: true,
      data: questions,
      message: `Generated ${questions.length} proactive elicitation questions.`,
    };
  } catch (error: any) {
    console.error('[generateElicitationQuestionsAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to generate elicitation questions'),
      details: error,
    };
  }
}

/**
 * Server Action: Merges AI-extracted requirements, personas, and stack constraints directly into a PostgreSQL draft.
 */
export async function applyExtractedContextToDraftAction(
  input: ApplyExtractedToDraftInput
): Promise<ActionResponse<{ updatedCount: number }>> {
  try {
    const validated = ApplyExtractedToDraftSchema.parse(input);

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();

    if (!draft) {
      return {
        success: false,
        error: `Draft with ID "${validated.draftId}" not found.`,
      };
    }

    const currentData = (draft.data as unknown as WizardFormData) || {};
    let updatedCount = 0;

    // Merge requirements
    if (validated.requirements && validated.requirements.length > 0) {
      const existingReqs = currentData.step3_functional?.requirements || [];
      const newReqs = validated.requirements.filter(
        (nr) => !existingReqs.some((er) => er.title.toLowerCase() === nr.title?.toLowerCase())
      );
      if (!currentData.step3_functional) {
        currentData.step3_functional = { requirements: [] };
      }
      currentData.step3_functional.requirements = [...existingReqs, ...(newReqs as any)];
      updatedCount += newReqs.length;
    }

    // Merge personas
    if (validated.personas && validated.personas.length > 0) {
      const existingPersonas = currentData.step2_personas?.personas || [];
      const newPersonas = validated.personas.filter(
        (np) => !existingPersonas.some((ep) => ep.name.toLowerCase() === np.name?.toLowerCase())
      );
      if (!currentData.step2_personas) {
        currentData.step2_personas = { personas: [] };
      }
      currentData.step2_personas.personas = [...existingPersonas, ...(newPersonas as any)];
      updatedCount += newPersonas.length;
    }

    // Merge stack
    if (validated.preferredStack) {
      if (!currentData.step5_tech_and_context) {
        currentData.step5_tech_and_context = {
          preferredStack: { frontend: '', backend: '', database: '', cloud: '' },
          integrations: [],
          attachments: [],
        };
      }
      currentData.step5_tech_and_context.preferredStack = {
        ...currentData.step5_tech_and_context.preferredStack,
        ...validated.preferredStack,
      };
    }

    await db.orm.public.FormDraft.where({ id: validated.draftId }).update({
      data: currentData as any,
    });

    try {
      revalidatePath(`/wizard/${validated.draftId}`);
      revalidatePath('/wizard');
    } catch {
      // Allowed during test scripts / non-HTTP environment
    }

    return {
      success: true,
      data: { updatedCount },
      message: `Successfully merged ${updatedCount} AI-elicited specifications into PostgreSQL draft.`,
    };
  } catch (error: any) {
    console.error('[applyExtractedContextToDraftAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to apply extracted context to draft'),
      details: error,
    };
  }
}
