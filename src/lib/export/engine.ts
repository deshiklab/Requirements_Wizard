export * from './types';
export * from './markdown';
export * from './json';
export * from './html';

import { WizardFormData } from '@/types/wizard';
import { ExportFormat, DocumentExportOptions, GeneratedDocumentResult } from './types';
import { generateIeee830Markdown } from './markdown';
import { generateStructuredJson } from './json';
import { generatePrintableHtml } from './html';

export class SpecificationExportEngine {
  /**
   * Generates a specification document in the requested format (Markdown, JSON, or HTML).
   */
  static exportDocument(
    data: WizardFormData,
    format: ExportFormat,
    options: DocumentExportOptions = {}
  ): GeneratedDocumentResult {
    const rawTitle = options.docTitle || data.step1_identity.projectName || 'Software_Requirements_Specification';
    const slug = rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const version = options.version || '1.0.0';

    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'markdown':
        content = generateIeee830Markdown(data, options);
        fileName = `${slug}_IEEE830_SRS.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = generateStructuredJson(data, options);
        fileName = `${slug}_Specification.json`;
        mimeType = 'application/json';
        break;
      case 'html':
        content = generatePrintableHtml(data, options);
        fileName = `${slug}_IEEE830_SRS.html`;
        mimeType = 'text/html';
        break;
      default:
        throw new Error(`Unsupported export format: "${format}"`);
    }

    return {
      format,
      fileName,
      mimeType,
      content,
      metadata: {
        title: rawTitle,
        version,
        generatedAt: new Date().toISOString(),
        readinessScore: data.step6_review.specReadinessScore ?? 85,
        requirementsCount: data.step3_functional.requirements.length,
        personasCount: data.step2_personas.personas.length,
      },
    };
  }

  /**
   * Generates IEEE 830-1998 compliant Markdown.
   */
  static toMarkdown(data: WizardFormData, options?: DocumentExportOptions): string {
    return generateIeee830Markdown(data, options);
  }

  /**
   * Generates structured machine-readable JSON.
   */
  static toJSON(data: WizardFormData, options?: DocumentExportOptions): string {
    return generateStructuredJson(data, options);
  }

  /**
   * Generates printable HTML.
   */
  static toHTML(data: WizardFormData, options?: DocumentExportOptions): string {
    return generatePrintableHtml(data, options);
  }
}
