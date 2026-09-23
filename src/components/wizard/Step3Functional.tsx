import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step3FunctionalData, FunctionalRequirement, PriorityLevel } from '@/types/wizard';
import {
  analyzeAmbiguityAction,
  generateCriteriaAction,
  expandRequirementAction,
} from '@/actions/ai';
import {
  AmbiguityAnalysisResult,
  GeneratedCriteriaResult,
} from '@/lib/ai/types';
import {
  FileCheck2,
  Plus,
  Trash2,
  ListChecks,
  CheckCircle,
  X,
  Sparkles,
  SearchCode,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ArrowRight,
  BookOpenCheck,
} from 'lucide-react';

interface Step3FunctionalProps {
  data: Step3FunctionalData;
  onChange: (data: Step3FunctionalData) => void;
  archetype?: string;
}

const PRIORITY_BADGES: Record<PriorityLevel, { label: string; variant: 'destructive' | 'default' | 'secondary' }> = {
  P0: { label: 'P0 - Blocker', variant: 'destructive' },
  P1: { label: 'P1 - High', variant: 'default' },
  P2: { label: 'P2 - Desirable', variant: 'secondary' },
};

export function Step3Functional({ data, onChange, archetype = 'web_app' }: Step3FunctionalProps) {
  const [newCriteriaInputs, setNewCriteriaInputs] = useState<Record<string, string>>({});
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  // Per-requirement AI analysis state
  const [analyzingReqId, setAnalyzingReqId] = useState<string | null>(null);
  const [generatingReqId, setGeneratingReqId] = useState<string | null>(null);
  const [ambiguityResults, setAmbiguityResults] = useState<Record<string, AmbiguityAnalysisResult>>({});
  const [generatedCriteria, setGeneratedCriteria] = useState<Record<string, GeneratedCriteriaResult>>({});

  const handleAddRequirement = (custom?: Partial<FunctionalRequirement>) => {
    const nextIndex = data.requirements.length + 1;
    const newReq: FunctionalRequirement = {
      id: custom?.id || `FR-${nextIndex}`,
      title: custom?.title || `Requirement ${nextIndex}`,
      userStory:
        custom?.userStory ||
        'As a user, I want this capability so that I can perform the workflow without blockers.',
      priority: custom?.priority || 'P0',
      category: custom?.category || 'Core Capability',
      acceptanceCriteria: custom?.acceptanceCriteria || [
        'Inputs must validate against the domain schema before database write',
        'State changes must be committed transactionally',
      ],
    };

    onChange({
      requirements: [...data.requirements, newReq],
    });
  };

  const handleUpdateRequirement = (id: string, updates: Partial<FunctionalRequirement>) => {
    onChange({
      requirements: data.requirements.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    });
  };

  const handleRemoveRequirement = (id: string) => {
    if (data.requirements.length <= 1) return;
    onChange({
      requirements: data.requirements.filter((r) => r.id !== id),
    });
  };

  const handleAddCriteria = (reqId: string, customText?: string) => {
    const text = (customText || newCriteriaInputs[reqId] || '').trim();
    if (!text) return;

    const req = data.requirements.find((r) => r.id === reqId);
    if (!req) return;

    handleUpdateRequirement(reqId, {
      acceptanceCriteria: [...req.acceptanceCriteria, text],
    });

    if (!customText) {
      setNewCriteriaInputs({ ...newCriteriaInputs, [reqId]: '' });
    }
  };

  const handleRemoveCriteria = (reqId: string, index: number) => {
    const req = data.requirements.find((r) => r.id === reqId);
    if (!req) return;

    handleUpdateRequirement(reqId, {
      acceptanceCriteria: req.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  // Phase 3 AI: Expand quick prompt into a complete requirement
  const handleQuickExpand = async () => {
    if (!quickPrompt.trim()) return;
    setIsExpanding(true);

    const res = await expandRequirementAction({
      prompt: quickPrompt.trim(),
      archetype: archetype as any,
      existingCount: data.requirements.length,
    });

    setIsExpanding(false);

    if (res.success && res.data) {
      const nextIdx = data.requirements.length + 1;
      const newReq: FunctionalRequirement = {
        id: `FR-${nextIdx}`,
        title: res.data.title,
        userStory: res.data.userStory,
        priority: res.data.priority,
        category: res.data.category,
        acceptanceCriteria: res.data.acceptanceCriteria,
      };

      onChange({
        requirements: [...data.requirements, newReq],
      });
      setQuickPrompt('');
    }
  };

  // Phase 3 AI: Analyze ambiguity of a single requirement
  const handleAnalyzeAmbiguity = async (req: FunctionalRequirement) => {
    setAnalyzingReqId(req.id);
    const textToAnalyze = `${req.title}. ${req.userStory}. ${req.acceptanceCriteria.join('. ')}`;
    const res = await analyzeAmbiguityAction({ text: textToAnalyze });
    setAnalyzingReqId(null);

    if (res.success && res.data) {
      setAmbiguityResults({
        ...ambiguityResults,
        [req.id]: res.data,
      });
    }
  };

  // Phase 3 AI: Apply suggested revision from ambiguity check
  const handleApplyRevision = (reqId: string, revision: string) => {
    handleUpdateRequirement(reqId, {
      userStory: revision,
    });
    // Clear the analysis preview after applying
    const copy = { ...ambiguityResults };
    delete copy[reqId];
    setAmbiguityResults(copy);
  };

  // Phase 3 AI: Generate Gherkin scenarios and boundary criteria
  const handleGenerateCriteria = async (req: FunctionalRequirement) => {
    setGeneratingReqId(req.id);
    const res = await generateCriteriaAction({
      title: req.title,
      userStory: req.userStory,
      category: req.category,
      archetype: archetype as any,
    });
    setGeneratingReqId(null);

    if (res.success && res.data) {
      setGeneratedCriteria({
        ...generatedCriteria,
        [req.id]: res.data,
      });
    }
  };

  // Phase 3 AI: Append all generated criteria into requirement
  const handleAdoptAllGeneratedCriteria = (reqId: string) => {
    const gen = generatedCriteria[reqId];
    if (!gen) return;

    const req = data.requirements.find((r) => r.id === reqId);
    if (!req) return;

    const newCriteria = [
      ...req.acceptanceCriteria,
      ...gen.acceptanceCriteria.filter((c) => !req.acceptanceCriteria.includes(c)),
    ];

    handleUpdateRequirement(reqId, {
      acceptanceCriteria: newCriteria,
    });

    const copy = { ...generatedCriteria };
    delete copy[reqId];
    setGeneratedCriteria(copy);
  };

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            Stage 3: Functional Requirements &amp; Acceptance Criteria
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Specify testable system behaviors. Use AI Elicitation tools below to eliminate ambiguity and generate formal Gherkin scenarios.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => handleAddRequirement()}
          className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Requirement
        </Button>
      </div>

      {/* AI Quick Requirement Synthesizer */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 shadow-md">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-200">
              AI Requirement Elicitation Synthesizer
            </span>
            <Badge variant="outline" className="text-[9px] text-indigo-400 border-indigo-500/40">
              Phase 3 Assistant
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400">
            Type a high-level feature concept. The AI engine will expand it into a fully articulated user story, priority level, and acceptance criteria.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Input
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickExpand())}
              placeholder="e.g. Real-time webhook notifications with cryptographic HMAC signatures..."
              className="bg-slate-950/80 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              size="sm"
              disabled={isExpanding || !quickPrompt.trim()}
              onClick={handleQuickExpand}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs whitespace-nowrap shrink-0"
            >
              {isExpanding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Expanding...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Expand Requirement
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <div className="space-y-5">
        {data.requirements.map((req) => {
          const priorityInfo = PRIORITY_BADGES[req.priority] || PRIORITY_BADGES.P1;
          const ambiguity = ambiguityResults[req.id];
          const criteriaGen = generatedCriteria[req.id];
          const isAnalyzing = analyzingReqId === req.id;
          const isGenerating = generatingReqId === req.id;

          return (
            <Card
              key={req.id}
              className="bg-slate-900/70 border-slate-800 shadow-sm transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {req.id}
                    </span>
                    <span className="font-semibold text-sm text-white">{req.title}</span>
                    <Badge variant={priorityInfo.variant} className="text-[10px]">
                      {priorityInfo.label}
                    </Badge>
                  </div>

                  {data.requirements.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRequirement(req.id)}
                      className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Form Fields: Title, Priority, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-slate-400">Requirement Title</Label>
                    <Input
                      value={req.title}
                      onChange={(e) => handleUpdateRequirement(req.id, { title: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Priority</Label>
                      <select
                        value={req.priority}
                        onChange={(e) =>
                          handleUpdateRequirement(req.id, {
                            priority: e.target.value as PriorityLevel,
                          })
                        }
                        className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="P0">P0 - Blocker</option>
                        <option value="P1">P1 - High</option>
                        <option value="P2">P2 - Desirable</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Category</Label>
                      <Input
                        value={req.category}
                        onChange={(e) =>
                          handleUpdateRequirement(req.id, { category: e.target.value })
                        }
                        placeholder="e.g. Auth, Workflow"
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* User Story */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">
                    User Story (Format: As a [role], I want [feature], so that [outcome])
                  </Label>
                  <textarea
                    rows={2}
                    value={req.userStory}
                    onChange={(e) => handleUpdateRequirement(req.id, { userStory: e.target.value })}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* AI Action Toolbar for this requirement */}
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isAnalyzing}
                    onClick={() => handleAnalyzeAmbiguity(req)}
                    className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40 text-xs h-7"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <SearchCode className="w-3 h-3 mr-1 text-indigo-400" />
                    )}
                    AI Clarity &amp; Ambiguity Check
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isGenerating}
                    onClick={() => handleGenerateCriteria(req)}
                    className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs h-7"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <BookOpenCheck className="w-3 h-3 mr-1 text-emerald-400" />
                    )}
                    AI Generate Gherkin Criteria
                  </Button>
                </div>

                {/* Ambiguity Analysis Results Drawer */}
                {ambiguity && (
                  <div className="p-3.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 space-y-2.5 text-xs animate-fade-in">
                    <div className="flex items-center justify-between pb-1 border-b border-indigo-900/40">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          Clarity Evaluation
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            ambiguity.clarityScore >= 85
                              ? 'text-emerald-400 border-emerald-500/40'
                              : ambiguity.clarityScore >= 60
                              ? 'text-amber-400 border-amber-500/40'
                              : 'text-rose-400 border-rose-500/40'
                          }
                        >
                          Score: {ambiguity.clarityScore}/100 ({ambiguity.ambiguityLevel} Ambiguity)
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const copy = { ...ambiguityResults };
                          delete copy[req.id];
                          setAmbiguityResults(copy);
                        }}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <p className="text-slate-300 text-[11px]">{ambiguity.summary}</p>

                    {/* Flagged issues */}
                    {ambiguity.issues.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Flagged Subjective Terms / Gaps:
                        </div>
                        {ambiguity.issues.map((iss) => (
                          <div
                            key={iss.id}
                            className="flex items-start gap-2 p-1.5 rounded bg-slate-950/60 border border-slate-800 text-[11px]"
                          >
                            <AlertTriangle
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                iss.severity === 'critical'
                                  ? 'text-rose-400'
                                  : iss.severity === 'warning'
                                  ? 'text-amber-400'
                                  : 'text-blue-400'
                              }`}
                            />
                            <div>
                              <strong className="text-white">&ldquo;{iss.term}&rdquo;</strong>: {iss.message}{' '}
                              {iss.suggestedReplacement && (
                                <span className="text-emerald-400">
                                  &rarr; Suggested: {iss.suggestedReplacement}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Clarifying Questions */}
                    {ambiguity.clarifyingQuestions.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] uppercase font-bold text-indigo-300">
                          Clarifying Questions to Resolve Ambiguity:
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                          {ambiguity.clarifyingQuestions.map((q, qi) => (
                            <li key={qi}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Revision Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-indigo-900/40">
                      <span className="text-[11px] text-slate-400 truncate max-w-sm">
                        Suggested: {ambiguity.suggestedRevision}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApplyRevision(req.id, ambiguity.suggestedRevision)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-6 px-2.5"
                      >
                        Apply AI Refinement
                      </Button>
                    </div>
                  </div>
                )}

                {/* Gherkin Scenarios Drawer */}
                {criteriaGen && (
                  <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 space-y-2.5 text-xs animate-fade-in">
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-900/40">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                          Generated Gherkin Scenarios &amp; Criteria
                        </span>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                          {criteriaGen.gherkinScenarios.length} Scenarios
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const copy = { ...generatedCriteria };
                          delete copy[req.id];
                          setGeneratedCriteria(copy);
                        }}
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {criteriaGen.gherkinScenarios.map((sc, si) => (
                        <div
                          key={si}
                          className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] space-y-1"
                        >
                          <div className="font-semibold text-emerald-300 flex items-center justify-between">
                            <span>Scenario: {sc.title}</span>
                            <Badge variant="secondary" className="text-[9px] uppercase">
                              {sc.type}
                            </Badge>
                          </div>
                          <div className="text-slate-300 font-mono text-[10px] space-y-0.5">
                            <div><strong className="text-blue-400">Given</strong> {sc.given}</div>
                            <div><strong className="text-purple-400">When</strong> {sc.when}</div>
                            <div><strong className="text-emerald-400">Then</strong> {sc.then}</div>
                            {sc.and && sc.and.map((a, ai) => (
                              <div key={ai}><strong className="text-slate-400">And</strong> {a}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40">
                      <span className="text-[11px] text-slate-400">
                        {criteriaGen.acceptanceCriteria.length} acceptance criteria ready to merge
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAdoptAllGeneratedCriteria(req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-6 px-3"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Append to Criteria Checklist
                      </Button>
                    </div>
                  </div>
                )}

                {/* Acceptance Criteria Sub-List */}
                <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      Testable Acceptance Criteria (Definition of Done)
                    </Label>
                    <span className="text-[10px] text-slate-500">
                      {req.acceptanceCriteria.length} Criteria Defined
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {req.acceptanceCriteria.map((criterion, ci) => (
                      <div
                        key={ci}
                        className="flex items-start justify-between gap-2 p-2 rounded bg-slate-900/60 border border-slate-800/60 text-xs text-slate-200"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{criterion}</span>
                        </div>
                        <X
                          className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-rose-400 shrink-0 mt-0.5"
                          onClick={() => handleRemoveCriteria(req.id, ci)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="e.g. Given an expired token, When an API call occurs, Then HTTP 401 is returned"
                      value={newCriteriaInputs[req.id] || ''}
                      onChange={(e) =>
                        setNewCriteriaInputs({
                          ...newCriteriaInputs,
                          [req.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleAddCriteria(req.id))
                      }
                      className="bg-slate-900 border-slate-800 text-xs text-white"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddCriteria(req.id)}
                      className="text-xs whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Criterion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
