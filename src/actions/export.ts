'use server';

import { db } from '@/lib/db';
import {
  ExportDocumentSchema,
  ExportDocumentInput,
  DirectExportSchema,
  DirectExportInput,
  ActionResponse,
} from './schemas';
import { SpecificationExportEngine, GeneratedDocumentResult } from '@/lib/export/engine';
import { WizardFormData, INITIAL_WIZARD_FORM_DATA } from '@/types/wizard';
import { recordAuditEntry } from '@/lib/governance/audit';

function normalizeFormData(raw: any): WizardFormData {
  const d = raw || {};
  return {
    ...INITIAL_WIZARD_FORM_DATA,
    ...d,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      ...(d.step1_identity || {}),
    },
    step2_personas: {
      ...INITIAL_WIZARD_FORM_DATA.step2_personas,
      ...(d.step2_personas || {}),
    },
    step3_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step3_functional,
      ...(d.step3_functional || {}),
    },
    step4_non_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step4_non_functional,
      ...(d.step4_non_functional || {}),
    },
    step5_tech_and_context: {
      ...INITIAL_WIZARD_FORM_DATA.step5_tech_and_context,
      ...(d.step5_tech_and_context || {}),
    },
    step6_review: {
      ...INITIAL_WIZARD_FORM_DATA.step6_review,
      ...(d.step6_review || {}),
    },
  };
}

/**
 * Server Action: Exports a persisted PostgreSQL draft into IEEE 830 Markdown, structured JSON, or printable HTML.
 */
export async function exportDocumentAction(
  input: ExportDocumentInput
): Promise<ActionResponse<GeneratedDocumentResult>> {
  try {
    const validated = ExportDocumentSchema.parse(input);

    const draft = await db.orm.public.FormDraft.where({ id: validated.draftId }).first();
    if (!draft) {
      return {
        success: false,
        error: `Draft with ID "${validated.draftId}" not found in database.`,
      };
    }

    const formData = normalizeFormData(draft.data);
    const result = SpecificationExportEngine.exportDocument(
      formData,
      validated.format,
      {
        docTitle: draft.title || formData.step1_identity.projectName,
        version: validated.options?.version || '1.0.0',
        generatedBy: validated.options?.generatedBy || formData.step6_review?.signOffArchitect || 'Lead Systems Architect',
        includeGherkin: validated.options?.includeGherkin ?? true,
        includeAuditTrail: validated.options?.includeAuditTrail ?? true,
        includeReadinessScore: validated.options?.includeReadinessScore ?? true,
      }
    );

    try {
      await recordAuditEntry({
        draftId: draft.id,
        userId: draft.userId,
        userRole: 'contributor',
        action: 'EXPORT_DOCUMENT',
        stage: 6,
        summary: `Exported specification to ${validated.format.toUpperCase()} format`,
        metadata: { format: validated.format },
      });
    } catch {}

    return {
      success: true,
      data: result,
      message: `Generated IEEE 830 ${validated.format.toUpperCase()} document successfully.`,
    };
  } catch (error: any) {
    console.error('[exportDocumentAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to export document'),
      details: error,
    };
  }
}

/**
 * Server Action: Exports current in-memory form data directly without requiring an existing persisted draft.
 */
export async function exportDirectDocumentAction(
  input: DirectExportInput
): Promise<ActionResponse<GeneratedDocumentResult>> {
  try {
    const validated = DirectExportSchema.parse(input);
    const formData = normalizeFormData(validated.formData);

    const result = SpecificationExportEngine.exportDocument(
      formData,
      validated.format,
      validated.options
    );

    return {
      success: true,
      data: result,
      message: `Generated ${validated.format.toUpperCase()} specification document.`,
    };
  } catch (error: any) {
    console.error('[exportDirectDocumentAction Error]:', error);
    return {
      success: false,
      error: error?.issues ? error.issues.map((i: any) => i.message).join(', ') : (error?.message || 'Failed to generate document export'),
      details: error,
    };
  }
}
