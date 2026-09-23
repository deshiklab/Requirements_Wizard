'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Type-safe Zod validation schemas for Server Actions
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

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: unknown };

/**
 * Server action to save or update a multi-stage form draft.
 * Persists the flexible JSONB state securely to PostgreSQL.
 */
export async function saveDraftAction(input: SaveDraftInput): Promise<ActionResponse<any>> {
  try {
    const validated = SaveDraftSchema.parse(input);

    // Verify user exists or fail safely
    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    if (!user) {
      return {
        success: false,
        error: `User with ID "${validated.userId}" not found. Cannot save draft.`,
      };
    }

    if (validated.id) {
      // Check if draft exists
      const existingDraft = await db.orm.public.FormDraft.where({ id: validated.id }).first();
      if (existingDraft) {
        // Authorization check: ensure user owns the draft
        if (existingDraft.userId !== validated.userId) {
          return {
            success: false,
            error: 'Unauthorized: User does not own this requirements draft.',
          };
        }

        const updated = await db.orm.public.FormDraft.where({ id: validated.id }).update({
          title: validated.title,
          currentStep: validated.currentStep,
          status: validated.status,
          data: validated.data,
          stepProgress: validated.stepProgress ?? null,
        });

        try {
          revalidatePath(`/wizard/${validated.id}`);
          revalidatePath('/');
        } catch {
          // Allowed during test scripts / non-HTTP invocation
        }

        return {
          success: true,
          data: updated,
          message: 'Draft updated successfully',
        };
      }
    }

    // Create new draft
    const newDraftId = validated.id || crypto.randomUUID();
    const created = await db.orm.public.FormDraft.create({
      id: newDraftId,
      userId: validated.userId,
      title: validated.title,
      currentStep: validated.currentStep,
      status: validated.status,
      data: validated.data,
      stepProgress: validated.stepProgress ?? null,
    });

    try {
      revalidatePath('/');
    } catch {
      // Allowed during test scripts / non-HTTP invocation
    }

    return {
      success: true,
      data: created,
      message: 'Draft created successfully',
    };
  } catch (err: any) {
    console.error('[saveDraftAction Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to save form draft',
      details: err instanceof z.ZodError ? err.issues : undefined,
    };
  }
}

/**
 * Server action to retrieve a form draft with its associated file references.
 */
export async function getDraftAction(draftId: string): Promise<ActionResponse<any>> {
  try {
    const validated = GetDraftSchema.parse({ id: draftId });

    const draft = await db.orm.public.FormDraft.where({ id: validated.id }).first();
    if (!draft) {
      return {
        success: false,
        error: `Draft with ID "${validated.id}" was not found.`,
      };
    }

    const files = await db.orm.public.FileReference.where({ draftId: draft.id }).all();

    return {
      success: true,
      data: {
        ...draft,
        files,
      },
    };
  } catch (err: any) {
    console.error('[getDraftAction Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to retrieve draft',
    };
  }
}

/**
 * Server action to list all drafts belonging to a user.
 */
export async function listUserDraftsAction(userId: string): Promise<ActionResponse<any[]>> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const drafts = await db.orm.public.FormDraft.where({ userId }).all();
    return {
      success: true,
      data: drafts,
    };
  } catch (err: any) {
    console.error('[listUserDraftsAction Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to list drafts',
    };
  }
}

/**
 * Server action to register an uploaded file reference associated with a draft.
 */
export async function attachFileReferenceAction(input: AttachFileInput): Promise<ActionResponse<any>> {
  try {
    const validated = AttachFileReferenceSchema.parse(input);

    const user = await db.orm.public.User.where({ id: validated.userId }).first();
    if (!user) {
      return {
        success: false,
        error: `User with ID "${validated.userId}" not found.`,
      };
    }

    if (validated.draftId) {
      const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
      if (!draft) {
        return {
          success: false,
          error: `Draft with ID "${validated.draftId}" not found.`,
        };
      }
    }

    const fileId = validated.id || crypto.randomUUID();
    const file = await db.orm.public.FileReference.create({
      id: fileId,
      userId: validated.userId,
      draftId: validated.draftId ?? null,
      fileName: validated.fileName,
      originalName: validated.originalName,
      mimeType: validated.mimeType,
      fileSize: validated.fileSize,
      filePath: validated.filePath,
      metadata: validated.metadata ?? null,
    });

    return {
      success: true,
      data: file,
      message: 'File reference attached successfully',
    };
  } catch (err: any) {
    console.error('[attachFileReferenceAction Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to attach file reference',
      details: err instanceof z.ZodError ? err.issues : undefined,
    };
  }
}
