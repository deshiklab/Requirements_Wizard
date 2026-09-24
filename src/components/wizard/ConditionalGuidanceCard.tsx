import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ConditionalEvaluationResult,
  Recommendation,
} from '@/lib/conditional-logic/engine';
import { FunctionalRequirement } from '@/types/wizard';

interface ConditionalGuidanceCardProps {
  evaluation: ConditionalEvaluationResult;
  onApplyRequirement?: (req: FunctionalRequirement) => void;
  activeStep: number;
}

export function ConditionalGuidanceCard({
  evaluation,
  onApplyRequirement,
  activeStep,
}: ConditionalGuidanceCardProps) {
  const stepWarnings = evaluation.warnings.filter((w) => w.step === activeStep);
  const totalWarnings = evaluation.warnings.length;
  const totalRecs = evaluation.recommendations.length;

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-lg backdrop-blur">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            SDAD Conditional Logic Engine
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {totalWarnings > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {totalWarnings} Warning{totalWarnings > 1 ? 's' : ''}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
              {totalRecs} Advice
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 space-y-4 text-xs">
        {/* Active Step Warnings */}
        {stepWarnings.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Stage Validation Warnings
            </div>
            {stepWarnings.map((warn, i) => (
              <div
                key={i}
                className={`p-2.5 rounded border ${
                  warn.severity === 'error'
                    ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {warn.code}
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed text-slate-300">
                  {warn.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Contextual Recommendations */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
            Contextual Architectural Advice
          </div>

          {evaluation.recommendations.length === 0 ? (
            <p className="text-slate-400 italic text-[11px]">
              No active recommendations for current selections. Continue filling in the wizard to trigger contextual rules.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {evaluation.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-200 truncate">
                      {rec.title}
                    </span>
                    <Badge variant="secondary" className="text-[9px] uppercase">
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {rec.description}
                  </p>

                  {rec.suggestedRequirement && onApplyRequirement && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] w-full mt-1 border-blue-500/40 text-blue-300 hover:bg-blue-950/40"
                      onClick={() =>
                        onApplyRequirement(rec.suggestedRequirement as FunctionalRequirement)
                      }
                    >
                      <Plus className="w-3 h-3 mr-1 text-blue-400" />
                      Add Recommended Requirement to FRs
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engine status indicator */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Engine: Evaluated Deterministically</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3 h-3" /> Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
