'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  WizardFormData,
  INITIAL_WIZARD_FORM_DATA,
  Step1IdentityData,
  Step2PersonasData,
  Step3FunctionalData,
  Step4NonFunctionalData,
  Step5TechAndContextData,
  Step6ReviewData,
  FunctionalRequirement,
  AttachmentRef,
} from '@/types/wizard';
import { evaluateConditionalLogic } from '@/lib/conditional-logic/engine';
import { saveDraftAction, attachFileReferenceAction } from '@/actions/drafts';
import { StepIndicator } from './StepIndicator';
import { ConditionalGuidanceCard } from './ConditionalGuidanceCard';
import { AiElicitationPanel } from './AiElicitationPanel';
import { Step1Identity } from './Step1Identity';
import { Step2Personas } from './Step2Personas';
import { Step3Functional } from './Step3Functional';
import { Step4NonFunctional } from './Step4NonFunctional';
import { Step5TechContext } from './Step5TechContext';
import { Step6Review } from './Step6Review';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DocumentIngestionResult } from '@/lib/ai/types';
import { GovernanceBar } from '@/components/governance/GovernanceBar';
import { AuditTrailViewer } from '@/components/governance/AuditTrailViewer';
import { DraftStatus, UserRole } from '@/lib/governance/types';
import { canEditDraft } from '@/lib/governance/rbac';
import {
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Workflow,
  Sparkles,
  History,
  X,
} from 'lucide-react';

interface WizardContainerProps {
  initialDraftId?: string;
  initialUserId: string;
  initialData?: Partial<WizardFormData>;
  initialStep?: number;
  initialTitle?: string;
  initialStatus?: string;
}

export function WizardContainer({
  initialDraftId,
  initialUserId,
  initialData,
  initialStep = 1,
  initialTitle = 'Untitled Requirements Spec',
  initialStatus = 'draft',
}: WizardContainerProps) {
  const router = useRouter();
  const [draftId, setDraftId] = useState<string | undefined>(initialDraftId);
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draftTitle, setDraftTitle] = useState<string>(initialTitle);
  const [status, setStatus] = useState<DraftStatus>((initialStatus as DraftStatus) || 'draft');
  const [userRole, setUserRole] = useState<UserRole>('lead_architect');
  const [showAuditDrawer, setShowAuditDrawer] = useState<boolean>(false);
  const [formData, setFormData] = useState<WizardFormData>({
    ...INITIAL_WIZARD_FORM_DATA,
    ...initialData,
    step1_identity: {
      ...INITIAL_WIZARD_FORM_DATA.step1_identity,
      ...(initialData?.step1_identity || {}),
    },
    step2_personas: {
      ...INITIAL_WIZARD_FORM_DATA.step2_personas,
      ...(initialData?.step2_personas || {}),
    },
    step3_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step3_functional,
      ...(initialData?.step3_functional || {}),
    },
    step4_non_functional: {
      ...INITIAL_WIZARD_FORM_DATA.step4_non_functional,
      ...(initialData?.step4_non_functional || {}),
    },
    step5_tech_and_context: {
      ...INITIAL_WIZARD_FORM_DATA.step5_tech_and_context,
      ...(initialData?.step5_tech_and_context || {}),
    },
    step6_review: {
      ...INITIAL_WIZARD_FORM_DATA.step6_review,
      ...(initialData?.step6_review || {}),
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Evaluate conditional logic dynamically on form state changes
  const evaluation = evaluateConditionalLogic(formData);

  // Sync draft title if project name changes on step 1
  useEffect(() => {
    if (formData.step1_identity.projectName.trim() && draftTitle === 'Untitled Requirements Spec') {
      setDraftTitle(`${formData.step1_identity.projectName.trim()} Spec Draft`);
    }
  }, [formData.step1_identity.projectName, draftTitle]);

  const saveCurrentDraft = async (targetStep = currentStep, customStatus?: string) => {
    // Phase 5 Governance & RBAC Check
    const editCheck = canEditDraft(userRole, status);
    if (!editCheck.allowed) {
      setSaveStatusMessage(`Blocked: ${editCheck.reason}`);
      setTimeout(() => setSaveStatusMessage(''), 4500);
      return null;
    }

    setIsSaving(true);
    setSaveStatusMessage('Saving draft to PostgreSQL...');

    const stepProgress = {
      completedSteps,
      activeStep: targetStep,
      totalSteps: 6,
      percentComplete: Math.round(((targetStep - 1) / 5) * 100),
      lastSavedAt: new Date().toISOString(),
    };

    const res = await saveDraftAction({
      id: draftId,
      userId: initialUserId,
      title: draftTitle,
      currentStep: targetStep,
      status: (customStatus || (targetStep === 6 ? 'in_review' : status)) as any,
      data: formData,
      stepProgress,
    });

    setIsSaving(false);

    if (res.success) {
      if (!draftId && res.data?.id) {
        setDraftId(res.data.id);
        window.history.replaceState(null, '', `/wizard/${res.data.id}`);
      }
      setLastSaved(new Date().toLocaleTimeString());
      setSaveStatusMessage('Draft persisted securely to PostgreSQL');
      setTimeout(() => setSaveStatusMessage(''), 3000);
      return res.data;
    } else {
      setSaveStatusMessage(`Save error: ${res.error}`);
      return null;
    }
  };

  const handleNextStep = async () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (currentStep < 6) {
      const next = currentStep + 1;
      setCurrentStep(next);
      await saveCurrentDraft(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 6 finalize
      await saveCurrentDraft(6, 'review');
      setSaveStatusMessage('Specification submitted for Phase 4 PRD Export!');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepJump = async (step: number) => {
    setCurrentStep(step);
    await saveCurrentDraft(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyRecommendedRequirement = (req: FunctionalRequirement) => {
    // Check if requirement already exists
    const exists = formData.step3_functional.requirements.some((r) => r.title === req.title);
    if (!exists) {
      const updated = {
        ...formData,
        step3_functional: {
          requirements: [...formData.step3_functional.requirements, req],
        },
      };
      setFormData(updated);
      setSaveStatusMessage(`Applied recommended requirement: "${req.title}"`);
      setTimeout(() => setSaveStatusMessage(''), 3000);
    }
  };

  const handleAttachFile = async (file: AttachmentRef) => {
    if (draftId) {
      await attachFileReferenceAction({
        draftId,
        userId: initialUserId,
        fileName: file.fileName,
        originalName: file.originalName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        filePath: `/uploads/${file.fileName}`,
        metadata: file.metadata,
      });
      setSaveStatusMessage(`File reference "${file.originalName}" registered in PostgreSQL`);
      setTimeout(() => setSaveStatusMessage(''), 3000);
    }
  };

  // Phase 3: Merges ingested context items (requirements, personas, stack) into draft
  const handleMergeExtractedContext = async (result: DocumentIngestionResult) => {
    const existingReqTitles = new Set(
      formData.step3_functional.requirements.map((r) => r.title.toLowerCase())
    );
    const newReqs = result.extractedRequirements.filter(
      (r) => !existingReqTitles.has(r.title.toLowerCase())
    );

    const existingPersonaNames = new Set(
      formData.step2_personas.personas.map((p) => p.name.toLowerCase())
    );
    const newPersonas = result.extractedPersonas.filter(
      (p) => !existingPersonaNames.has(p.name.toLowerCase())
    );

    const updatedFormData: WizardFormData = {
      ...formData,
      step2_personas: {
        personas: [...formData.step2_personas.personas, ...newPersonas],
      },
      step3_functional: {
        requirements: [...formData.step3_functional.requirements, ...newReqs],
      },
      step5_tech_and_context: {
        ...formData.step5_tech_and_context,
        preferredStack: {
          ...formData.step5_tech_and_context.preferredStack,
          ...(result.suggestedStack || {}),
        },
      },
    };

    setFormData(updatedFormData);
    setSaveStatusMessage(
      `Merged ${newReqs.length} requirements and ${newPersonas.length} personas from "${result.fileName}"`
    );

    // Persist immediately to PostgreSQL
    if (draftId) {
      await saveDraftAction({
        id: draftId,
        userId: initialUserId,
        title: draftTitle,
        currentStep,
        status: (formData.step6_review.status || 'in_progress') as any,
        data: updatedFormData,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SDAD Phase 5 Governance Bar */}
      {draftId && (
        <GovernanceBar
          draftId={draftId}
          status={status}
          currentRole={userRole}
          currentUserId={initialUserId}
          readinessScore={formData.step6_review?.specReadinessScore ?? 85}
          sealedChecksum={(formData as any)?.governance?.sealedChecksum}
          onRoleChange={(r) => setUserRole(r)}
          onStatusChange={(s) => setStatus(s)}
          onOpenAuditTrail={() => setShowAuditDrawer(!showAuditDrawer)}
        />
      )}

      {/* Audit Trail Drawer / Collapsible View */}
      {showAuditDrawer && draftId && (
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-2 mb-2">
            <span className="text-sm font-semibold text-slate-300">Auditing & Revision History</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuditDrawer(false)}
              className="text-slate-400 hover:text-white h-7 text-xs"
            >
              <X className="w-4 h-4 mr-1" /> Close Audit Trail
            </Button>
          </div>
          <AuditTrailViewer
            draftId={draftId}
            currentUserRole={userRole}
            currentUserId={initialUserId}
            onRevisionRestored={() => window.location.reload()}
          />
        </div>
      )}

      {/* Top Header & Autosave Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Draft ID: {draftId ? `${draftId.slice(0, 8)}...` : 'Unsaved Draft'}
              </span>
              <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                Phase 3 AI Elicitation Active
              </Badge>
            </div>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="text-base md:text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="Draft Specification Title"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatusMessage ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveStatusMessage}
            </span>
          ) : lastSaved ? (
            <span className="text-xs text-slate-400">Saved at {lastSaved}</span>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={() => saveCurrentDraft(currentStep)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={6}
        completedSteps={completedSteps}
        onStepClick={handleStepJump}
      />

      {/* Main Grid: Step Content + Conditional Guidance & AI Elicitation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Step Form (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur">
          {currentStep === 1 && (
            <Step1Identity
              data={formData.step1_identity}
              onChange={(d: Step1IdentityData) => setFormData({ ...formData, step1_identity: d })}
              evaluation={evaluation}
            />
          )}

          {currentStep === 2 && (
            <Step2Personas
              data={formData.step2_personas}
              onChange={(d: Step2PersonasData) => setFormData({ ...formData, step2_personas: d })}
            />
          )}

          {currentStep === 3 && (
            <Step3Functional
              data={formData.step3_functional}
              onChange={(d: Step3FunctionalData) =>
                setFormData({ ...formData, step3_functional: d })
              }
              archetype={formData.step1_identity.projectType}
            />
          )}

          {currentStep === 4 && (
            <Step4NonFunctional
              data={formData.step4_non_functional}
              onChange={(d: Step4NonFunctionalData) =>
                setFormData({ ...formData, step4_non_functional: d })
              }
            />
          )}

          {currentStep === 5 && (
            <Step5TechContext
              data={formData.step5_tech_and_context}
              onChange={(d: Step5TechAndContextData) =>
                setFormData({ ...formData, step5_tech_and_context: d })
              }
              onAttachFile={handleAttachFile}
              onMergeExtractedContext={handleMergeExtractedContext}
            />
          )}

          {currentStep === 6 && (
            <Step6Review
              data={formData.step6_review}
              formData={formData}
              onChange={(d: Step6ReviewData) => setFormData({ ...formData, step6_review: d })}
              evaluation={evaluation}
              draftId={draftId}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1 || isSaving}
              onClick={handlePrevStep}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Previous Stage
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={() => saveCurrentDraft(currentStep)}
                className="text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5"
              >
                {currentStep === 6 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Complete Specification
                  </>
                ) : (
                  <>
                    Next Stage <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic AI Copilot & Conditional Guidance (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <AiElicitationPanel
            formData={formData}
            activeStep={currentStep}
            onApplyRequirement={handleApplyRecommendedRequirement}
          />

          <ConditionalGuidanceCard
            evaluation={evaluation}
            onApplyRequirement={handleApplyRecommendedRequirement}
            activeStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
