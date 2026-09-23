import { WizardFormData } from '@/types/wizard';

export type ExportFormat = 'markdown' | 'json' | 'html';

export interface DocumentExportOptions {
  includeGherkin?: boolean;
  includeAuditTrail?: boolean;
  includeReadinessScore?: boolean;
  docTitle?: string;
  version?: string;
  generatedBy?: string;
}

export interface GeneratedDocumentResult {
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  content: string;
  metadata: {
    title: string;
    version: string;
    generatedAt: string;
    readinessScore: number;
    requirementsCount: number;
    personasCount: number;
  };
}
