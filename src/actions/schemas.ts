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
  role: z
    .enum([
      'user',
      'admin',
      'architect',
      'lead_architect',
      'contributor',
      'viewer',
      'stakeholder',
    ])
    .default('contributor'),
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

// Phase 4: Document Generation & Export Schemas
export const ExportDocumentSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  format: z.enum(['markdown', 'json', 'html']).default('markdown'),
  options: z
    .object({
      includeGherkin: z.boolean().optional(),
      includeAuditTrail: z.boolean().optional(),
      includeReadinessScore: z.boolean().optional(),
      docTitle: z.string().optional(),
      version: z.string().optional(),
      generatedBy: z.string().optional(),
    })
    .optional(),
});

export type ExportDocumentInput = z.infer<typeof ExportDocumentSchema>;

export const DirectExportSchema = z.object({
  formData: z.record(z.string(), z.any()),
  format: z.enum(['markdown', 'json', 'html']).default('markdown'),
  options: z
    .object({
      includeGherkin: z.boolean().optional(),
      includeAuditTrail: z.boolean().optional(),
      includeReadinessScore: z.boolean().optional(),
      docTitle: z.string().optional(),
      version: z.string().optional(),
      generatedBy: z.string().optional(),
    })
    .optional(),
});

export type DirectExportInput = z.infer<typeof DirectExportSchema>;

// Phase 5: Governance, Auditing & RBAC Schemas
export const SubmitForReviewSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']).optional().default('contributor'),
  readinessScore: z.number().min(0).max(100),
});

export type SubmitForReviewInput = z.infer<typeof SubmitForReviewSchema>;

export const SignOffDraftSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']).optional(),
  signOffArchitect: z.string().min(3, 'Sign-off architect name must be at least 3 characters'),
  roleTitle: z.string().optional(),
  organization: z.string().optional(),
  notes: z.string().optional(),
  readinessScore: z.number().min(0).max(100),
});

export type SignOffDraftInput = z.infer<typeof SignOffDraftSchema>;

export const LockSpecificationSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']).optional(),
  actorName: z.string().min(2, 'Actor name is required'),
});

export type LockSpecificationInput = z.infer<typeof LockSpecificationSchema>;

export const ReopenSpecificationSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']).optional(),
  actorName: z.string().min(2, 'Actor name is required'),
  reason: z.string().min(8, 'Reopen audit reason must be at least 8 characters'),
});

export type ReopenSpecificationInput = z.infer<typeof ReopenSpecificationSchema>;

export const RestoreRevisionSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  userRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']).optional(),
  auditLogId: z.string().min(1, 'Audit Log ID is required'),
});

export type RestoreRevisionInput = z.infer<typeof RestoreRevisionSchema>;

export const GetAuditTrailSchema = z.object({
  draftId: z.string().min(1, 'Draft ID is required'),
  limit: z.number().int().min(1).max(200).optional().default(50),
});

export type GetAuditTrailInput = z.infer<typeof GetAuditTrailSchema>;

export const UpdateUserRoleSchema = z.object({
  adminUserId: z.string().min(1, 'Admin user ID is required'),
  targetUserId: z.string().min(1, 'Target user ID is required'),
  newRole: z.enum(['admin', 'lead_architect', 'contributor', 'viewer']),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };
