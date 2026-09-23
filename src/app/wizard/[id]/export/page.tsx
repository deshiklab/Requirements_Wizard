import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { SpecificationExportEngine } from '@/lib/export/engine';
import { WizardFormData, INITIAL_WIZARD_FORM_DATA } from '@/types/wizard';
import { DocumentExportViewer } from '@/components/export/DocumentExportViewer';

export const dynamic = 'force-dynamic';

interface ExportPageProps {
  params: {
    id: string;
  };
}

export default async function ExportPage({ params }: ExportPageProps) {
  const draftId = params.id;

  const draft = await db.orm.public.FormDraft.where({ id: draftId }).first();

  if (!draft) {
    notFound();
  }

  const rawData = (draft.data as any) || {};
  const formData: WizardFormData = {
    ...INITIAL_WIZARD_FORM_DATA,
    ...rawData,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      ...(rawData.step1_identity || {}),
    },
    step2_personas: {
      ...INITIAL_WIZARD_FORM_DATA.step2_personas,
      ...(rawData.step2_personas || {}),
    },
    step3_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step3_functional,
      ...(rawData.step3_functional || {}),
    },
    step4_non_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step4_non_functional,
      ...(rawData.step4_non_functional || {}),
    },
    step5_tech_and_context: {
      ...INITIAL_WIZARD_FORM_DATA.step5_tech_and_context,
      ...(rawData.step5_tech_and_context || {}),
    },
    step6_review: {
      ...INITIAL_WIZARD_FORM_DATA.step6_review,
      ...(rawData.step6_review || {}),
    },
  };

  const draftTitle = draft.title || formData.step1_identity.projectName || 'Software Requirements Specification';

  const exportOptions = {
    docTitle: draftTitle,
    version: '1.0.0',
    generatedBy: formData.step6_review?.signOffArchitect || 'Lead Systems Architect',
    includeGherkin: true,
    includeAuditTrail: true,
    includeReadinessScore: true,
  };

  const markdownDoc = SpecificationExportEngine.exportDocument(formData, 'markdown', exportOptions);
  const jsonDoc = SpecificationExportEngine.exportDocument(formData, 'json', exportOptions);
  const htmlDoc = SpecificationExportEngine.exportDocument(formData, 'html', exportOptions);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <DocumentExportViewer
        draftId={draftId}
        draftTitle={draftTitle}
        formData={formData}
        markdownDoc={markdownDoc}
        jsonDoc={jsonDoc}
        htmlDoc={htmlDoc}
      />
    </div>
  );
}
