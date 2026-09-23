import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step3FunctionalData, FunctionalRequirement, PriorityLevel } from '@/types/wizard';
import {
  FileCheck2,
  Plus,
  Trash2,
  ListChecks,
  CheckCircle,
  X,
} from 'lucide-react';

interface Step3FunctionalProps {
  data: Step3FunctionalData;
  onChange: (data: Step3FunctionalData) => void;
}

const PRIORITY_BADGES: Record<PriorityLevel, { label: string; variant: 'destructive' | 'default' | 'secondary' }> = {
  P0: { label: 'P0 - Blocker', variant: 'destructive' },
  P1: { label: 'P1 - High', variant: 'default' },
  P2: { label: 'P2 - Desirable', variant: 'secondary' },
};

export function Step3Functional({ data, onChange }: Step3FunctionalProps) {
  const [newCriteriaInputs, setNewCriteriaInputs] = useState<Record<string, string>>({});

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

  const handleAddCriteria = (reqId: string) => {
    const text = (newCriteriaInputs[reqId] || '').trim();
    if (!text) return;

    const req = data.requirements.find((r) => r.id === reqId);
    if (!req) return;

    handleUpdateRequirement(reqId, {
      acceptanceCriteria: [...req.acceptanceCriteria, text],
    });

    setNewCriteriaInputs({ ...newCriteriaInputs, [reqId]: '' });
  };

  const handleRemoveCriteria = (reqId: string, index: number) => {
    const req = data.requirements.find((r) => r.id === reqId);
    if (!req) return;

    handleUpdateRequirement(reqId, {
      acceptanceCriteria: req.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            Stage 3: Functional Requirements &amp; Acceptance Criteria
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Specify testable system behaviors. Each requirement requires user stories and explicit Given-When-Then or bulleted acceptance criteria.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => handleAddRequirement()}
          className="bg-blue-600 hover:bg-blue-700 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Requirement
        </Button>
      </div>

      {/* Requirements List */}
      <div className="space-y-5">
        {data.requirements.map((req, index) => {
          const priorityInfo = PRIORITY_BADGES[req.priority] || PRIORITY_BADGES.P1;

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
