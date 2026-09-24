import { getOrCreateUserAction } from '@/actions/users';
import { WizardContainer } from '@/components/wizard/WizardContainer';

export const dynamic = 'force-dynamic';

export default async function WizardPage() {
  // Obtain or create default system architect session user
  const userRes = await getOrCreateUserAction({
    email: 'architect@requirements-wizard.local',
    name: 'Lead System Architect',
    role: 'architect',
  });

  const userId = userRes.success && userRes.data ? userRes.data.id : crypto.randomUUID();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-8">
      <WizardContainer initialUserId={userId} />
    </div>
  );
}
