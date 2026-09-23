'use server';

import { z } from 'zod';
import { db } from '@/lib/db';

export const CreateUserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin', 'architect', 'stakeholder']).default('user'),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Creates or retrieves a user by email.
 */
export async function getOrCreateUserAction(input: CreateUserInput) {
  try {
    const validated = CreateUserSchema.parse(input);

    const existing = await db.orm.public.User.where({ email: validated.email }).first();
    if (existing) {
      return { success: true, data: existing };
    }

    const created = await db.orm.public.User.create({
      id: validated.id || crypto.randomUUID(),
      email: validated.email,
      name: validated.name ?? null,
      role: validated.role,
    });

    return { success: true, data: created };
  } catch (err: any) {
    console.error('[getOrCreateUserAction Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to create user',
    };
  }
}
