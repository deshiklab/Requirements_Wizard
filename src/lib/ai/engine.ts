/**
 * AI Requirements Elicitation Engine Facade (SDAD Phase 3)
 * Unifies Ambiguity Detection, Gherkin Criteria Generation, Context Ingestion, and Elicitation Prompts.
 */

export * from './types';
export * from './ambiguity-detector';
export * from './criteria-generator';
export * from './context-ingestion';
export * from './elicitation-prompts';

import { analyzeAmbiguity } from './ambiguity-detector';
import { generateAcceptanceCriteria, expandRequirementPrompt } from './criteria-generator';
import { ingestContextDocument } from './context-ingestion';
import { generateElicitationQuestions } from './elicitation-prompts';
import {
  AmbiguityAnalysisResult,
  GeneratedCriteriaResult,
  RequirementExpansionResult,
  DocumentIngestionResult,
  ElicitationQuestion,
} from './types';
import { WizardFormData, ProjectArchetype } from '@/types/wizard';

export class AiElicitationEngine {
  /**
   * Evaluates requirements for subjective adjectives, missing metrics, and passive voice.
   */
  static analyzeClarity(text: string): AmbiguityAnalysisResult {
    return analyzeAmbiguity(text);
  }

  /**
   * Generates structured Gherkin scenarios (Given-When-Then) and testable acceptance criteria.
   */
  static generateCriteria(params: {
    title: string;
    userStory?: string;
    category?: string;
    personaRole?: string;
    archetype?: ProjectArchetype;
  }): GeneratedCriteriaResult {
    return generateAcceptanceCriteria(params);
  }

  /**
   * Expands a brief requirement title/concept into a complete requirement specification.
   */
  static expandRequirement(
    prompt: string,
    archetype: ProjectArchetype = 'web_app',
    count = 0
  ): RequirementExpansionResult {
    return expandRequirementPrompt(prompt, archetype, count);
  }

  /**
   * Ingests context files, architecture notes, or PRD text and extracts domain entities.
   */
  static ingestDocument(params: {
    fileName?: string;
    mimeType?: string;
    rawText?: string;
    metadata?: Record<string, any>;
  }): DocumentIngestionResult {
    return ingestContextDocument(params);
  }

  /**
   * Synthesizes proactive clarifying questions tailored to the active archetype and gaps in draft.
   */
  static elicitClarifications(formData: WizardFormData, activeStep?: number): ElicitationQuestion[] {
    return generateElicitationQuestions(formData, activeStep);
  }
}
