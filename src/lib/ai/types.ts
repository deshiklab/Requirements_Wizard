import { PriorityLevel, FunctionalRequirement, Persona } from '@/types/wizard';

export type AmbiguityCategory =
  | 'vague_adjective'
  | 'missing_metric'
  | 'passive_voice'
  | 'weak_modal'
  | 'unbounded_scope'
  | 'missing_actor';

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface AmbiguityIssue {
  id: string;
  term: string;
  category: AmbiguityCategory;
  severity: IssueSeverity;
  message: string;
  suggestedReplacement?: string;
  position?: { start: number; end: number };
}

export interface AmbiguityAnalysisResult {
  targetText: string;
  clarityScore: number; // 0 (completely ambiguous) to 100 (exemplary specification)
  ambiguityLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  issues: AmbiguityIssue[];
  suggestedRevision: string;
  clarifyingQuestions: string[];
}

export interface GherkinScenario {
  title: string;
  type: 'happy_path' | 'error_handling' | 'boundary_condition' | 'security';
  given: string;
  when: string;
  then: string;
  and?: string[];
}

export interface GeneratedCriteriaResult {
  requirementTitle: string;
  userStory: string;
  gherkinScenarios: GherkinScenario[];
  acceptanceCriteria: string[];
  edgeCases: string[];
  negativeScenarios: string[];
}

export interface ExtractedConstraint {
  category: 'performance' | 'security' | 'architecture' | 'compliance' | 'data';
  description: string;
  impact: string;
}

export interface DocumentIngestionResult {
  fileName: string;
  documentType: string;
  summary: string;
  extractedRequirements: FunctionalRequirement[];
  extractedPersonas: Persona[];
  extractedConstraints: ExtractedConstraint[];
  suggestedStack?: {
    frontend?: string;
    backend?: string;
    database?: string;
    cloud?: string;
  };
}

export interface ElicitationQuestion {
  id: string;
  category: 'security' | 'scale' | 'edge_case' | 'integration' | 'ux' | 'compliance';
  question: string;
  context: string;
  suggestedOptions: string[];
  recommendedRequirement?: Partial<FunctionalRequirement>;
}

export interface RequirementExpansionResult {
  title: string;
  category: string;
  priority: PriorityLevel;
  userStory: string;
  acceptanceCriteria: string[];
  edgeCases: string[];
  gherkinScenarios: GherkinScenario[];
}
