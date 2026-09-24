import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

const STEP_LABELS = [
  { step: 1, title: 'Scope & Archetype', short: 'Scope' },
  { step: 2, title: 'Personas & Actors', short: 'Personas' },
  { step: 3, title: 'Functional Specs', short: 'Functional' },
  { step: 4, title: 'NFRs & Quality', short: 'NFRs' },
  { step: 5, title: 'Tech & Context', short: 'Tech Stack' },
  { step: 6, title: 'Review & Readiness', short: 'Review' },
];

export function StepIndicator({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  const percent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Wizard Progress: {percent}%</span>
          <span>Stage {currentStep} of {totalSteps}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Step navigation chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STEP_LABELS.map((item) => {
          const isCurrent = currentStep === item.step;
          const isDone = completedSteps.includes(item.step);

          return (
            <button
              key={item.step}
              type="button"
              onClick={() => onStepClick(item.step)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCurrent
                    ? 'bg-blue-500 text-white'
                    : isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : item.step}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold truncate leading-tight">
                  {item.short}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
