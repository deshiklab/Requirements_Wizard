import { getDraftAction } from '@/actions/drafts';
import { getOrCreateUserAction } from '@/actions/users';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface WizardIdPageProps {
  params: {
    id: string;
  };
}

export default async function WizardIdPage({ params }: WizardIdPageProps) {
  const draftRes = await getDraftAction(params.id);

  if (!draftRes.success || !draftRes.data) {
    notFound();
  }

  const draft = draftRes.data;

  // Ensure default architect session user
  const userRes = await getOrCreateUserAction({
    email: 'architect@requirements-wizard.local',
    name: 'Lead System Architect',
    role: 'architect',
  });

  const userId = userRes.success && userRes.data ? userRes.data.id : draft.userId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8">
      <WizardContainer
        initialDraftId={draft.id}
        initialUserId={userId}
        initialData={draft.data}
        initialStep={draft.currentStep || 1}
        initialTitle={draft.title}
        initialStatus={draft.status}
      />
    </div>
  );
}
