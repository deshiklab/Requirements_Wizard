'use server';

import { db } from '@/lib/db';
import { CreateUserSchema, CreateUserInput, ActionResponse } from './schemas';

export type { CreateUserInput };

/**
 * Creates or retrieves a user by email.
 */
export async function getOrCreateUserAction(input: CreateUserInput): Promise<ActionResponse<any>> {
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
