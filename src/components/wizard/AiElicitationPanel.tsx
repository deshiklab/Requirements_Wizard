'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WizardFormData, FunctionalRequirement } from '@/types/wizard';
import { ElicitationQuestion } from '@/lib/ai/types';
import { generateElicitationQuestionsAction } from '@/actions/ai';
import {
  Sparkles,
  HelpCircle,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sliders,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
} from 'lucide-react';

interface AiElicitationPanelProps {
  formData: WizardFormData;
  activeStep: number;
  onApplyRequirement: (req: FunctionalRequirement) => void;
}

export function AiElicitationPanel({
  formData,
  activeStep,
  onApplyRequirement,
}: AiElicitationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<ElicitationQuestion[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const fetchQuestions = async () => {
    setIsLoading(true);
    const res = await generateElicitationQuestionsAction({
      formData,
      activeStep,
    });
    setIsLoading(false);
    if (res.success && res.data) {
      setQuestions(res.data);
    }
  };

  const handleToggle = () => {
    if (!isOpen && questions.length === 0) {
      fetchQuestions();
    }
    setIsOpen(!isOpen);
  };

  const handleApplyRecommendedReq = (q: ElicitationQuestion) => {
    if (!q.recommendedRequirement) return;

    const nextIdx = (formData.step3_functional.requirements.length || 0) + 1;
    const req: FunctionalRequirement = {
      id: `FR-AI-${nextIdx}`,
      title: q.recommendedRequirement.title || `Requirement ${nextIdx}`,
      category: q.recommendedRequirement.category || 'Security & Reliability',
      priority: q.recommendedRequirement.priority || 'P0',
      userStory:
        q.recommendedRequirement.userStory ||
        'As an authorized user, I want this safeguard implemented so that operations remain reliable.',
      acceptanceCriteria: q.recommendedRequirement.acceptanceCriteria || [
        'Must validate inputs against schema',
        'Must maintain transactional integrity',
      ],
    };

    onApplyRequirement(req);
    setAppliedIds([...appliedIds, q.id]);
  };

  return (
    <Card className="border-indigo-500/30 bg-indigo-950/20 backdrop-blur shadow-md transition-all">
      <div
        onClick={handleToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-indigo-900/10 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">
                Phase 3: AI Elicitation Copilot
              </span>
              <Badge variant="outline" className="text-[9px] border-indigo-500/40 text-indigo-300">
                Active
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Disambiguation, proactive edge cases &amp; Gherkin criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <CardContent className="p-4 pt-0 space-y-4 border-t border-indigo-500/20">
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Proactive Elicitation Questions ({questions.length})
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isLoading}
              onClick={fetchQuestions}
              className="h-7 text-[11px] text-indigo-300 hover:text-indigo-200 hover:bg-indigo-900/30"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Re-analyze Specs
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              No outstanding ambiguities flagged for this stage.
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => {
                const isApplied = appliedIds.includes(q.id);
                const selectedOpt = selectedAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-lg bg-slate-950/80 border border-indigo-900/40 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-100 flex items-start gap-1.5">
                        <span className="text-indigo-400 mt-0.5">&bull;</span>
                        <span>{q.question}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[9px] uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-800 shrink-0"
                      >
                        {q.category}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 pl-3 border-l-2 border-indigo-500/30">
                      {q.context}
                    </p>

                    {/* Suggested Architectural Options */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Suggested Architectural Options:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.suggestedOptions.map((opt, oi) => {
                          const isSelected = selectedOpt === opt;
                          return (
                            <button
                              key={oi}
                              type="button"
                              onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: opt })}
                              className={`text-left p-2 rounded text-[11px] transition-colors border ${
                                isSelected
                                  ? 'bg-indigo-900/40 border-indigo-500/60 text-white'
                                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span>{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1-Click Adopt Recommended Requirement */}
                    {q.recommendedRequirement && (
                      <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                        <span className="text-[11px] text-slate-400">
                          Recommended Requirement: <strong className="text-white">{q.recommendedRequirement.title}</strong>
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          disabled={isApplied}
                          onClick={() => handleApplyRecommendedReq(q)}
                          className={`h-7 text-xs ${
                            isApplied
                              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" /> Added to Spec
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" /> Add to Step 3
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
