import { z } from 'zod';

export const SaveDraftSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long').default('Untitled Requirements Spec'),
  currentStep: z.number().int().min(1).max(10).default(1),
  status: z.enum(['draft', 'in_progress', 'review', 'finalized']).default('draft'),
  data: z.record(z.string(), z.any()), // Multi-stage JSONB data
  stepProgress: z.record(z.string(), z.any()).optional().nullable(),
});

export type SaveDraftInput = z.infer<typeof SaveDraftSchema>;

export const GetDraftSchema = z.object({
  id: z.string().min(1, 'Draft ID is required'),
});

export const AttachFileReferenceSchema = z.object({
  id: z.string().uuid().optional(),
  draftId: z.string().uuid().optional().nullable(),
  userId: z.string().min(1, 'User ID is required'),
  fileName: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  filePath: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export type AttachFileInput = z.infer<typeof AttachFileReferenceSchema>;

export const CreateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin', 'architect', 'stakeholder']).default('user'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Phase 3: AI Elicitation Schemas
export const AmbiguityAnalysisSchema = z.object({
  text: z.string().min(1, 'Input text cannot be empty'),
});

export type AmbiguityAnalysisInput = z.infer<typeof AmbiguityAnalysisSchema>;

export const GenerateCriteriaSchema = z.object({
  title: z.string().min(1, 'Requirement title is required'),
  userStory: z.string().optional(),
  category: z.string().optional(),
  personaRole: z.string().optional(),
  archetype: z.enum(['web_app', 'mobile_app', 'api_backend', 'enterprise_saas', 'ai_agentic']).optional(),
});

export type GenerateCriteriaInput = z.infer<typeof GenerateCriteriaSchema>;

export const ExpandRequirementSchema = z.object({
  prompt: z.string().min(1, 'Requirement prompt or idea is required'),
  archetype: z.enum(['web_app', 'mobile_app', 'api_backend', 'enterprise_saas', 'ai_agentic']).optional(),
  existingCount: z.number().int().nonnegative().optional(),
});

export type ExpandRequirementInput = z.infer<typeof ExpandRequirementSchema>;

export const IngestDocumentContextSchema = z.object({
  draftId: z.string().uuid().optional().nullable(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  rawText: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export type IngestDocumentContextInput = z.infer<typeof IngestDocumentContextSchema>;

export const ElicitationQuestionsSchema = z.object({
  formData: z.record(z.string(), z.any()),
  activeStep: z.number().int().min(1).max(6).optional(),
});

export type ElicitationQuestionsInput = z.infer<typeof ElicitationQuestionsSchema>;

export const ApplyExtractedToDraftSchema = z.object({
  draftId: z.string().uuid('Valid Draft UUID is required'),
  requirements: z.array(z.record(z.string(), z.any())).optional(),
  personas: z.array(z.record(z.string(), z.any())).optional(),
  preferredStack: z.record(z.string(), z.any()).optional(),
});

export type ApplyExtractedToDraftInput = z.infer<typeof ApplyExtractedToDraftSchema>;

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };
