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

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };
