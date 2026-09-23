import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Step1IdentityData,
  ProjectArchetype,
} from '@/types/wizard';
import { ConditionalEvaluationResult } from '@/lib/conditional-logic/engine';
import {
  Globe,
  Smartphone,
  Server,
  Building2,
  Bot,
  Plus,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface Step1IdentityProps {
  data: Step1IdentityData;
  onChange: (data: Step1IdentityData) => void;
  evaluation: ConditionalEvaluationResult;
}

const ARCHETYPES: {
  id: ProjectArchetype;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'web_app',
    label: 'Modern Web Application',
    icon: Globe,
    description: 'Responsive desktop & mobile web app with rich client UX and server rendering.',
  },
  {
    id: 'mobile_app',
    label: 'Native / Hybrid Mobile',
    icon: Smartphone,
    description: 'iOS/Android app with offline synchronization and device hardware integrations.',
  },
  {
    id: 'enterprise_saas',
    label: 'Enterprise SaaS Platform',
    icon: Building2,
    description: 'Multi-tenant B2B solution requiring role-based access, SSO, and compliance audit trails.',
  },
  {
    id: 'api_backend',
    label: 'API / Microservices Backend',
    icon: Server,
    description: 'High-throughput headless API platform, event streams, and database pipelines.',
  },
  {
    id: 'ai_agentic',
    label: 'AI-Native Agentic System',
    icon: Bot,
    description: 'Autonomous LLM-driven agents with tool calling, context grounding, and human-in-the-loop gates.',
  },
];

export function Step1Identity({ data, onChange, evaluation }: Step1IdentityProps) {
  const [inScopeInput, setInScopeInput] = useState('');
  const [outOfScopeInput, setOutOfScopeInput] = useState('');

  const handleArchetypeSelect = (type: ProjectArchetype) => {
    onChange({
      ...data,
      projectType: type,
    });
  };

  const handleAddInScope = () => {
    if (!inScopeInput.trim()) return;
    onChange({
      ...data,
      inScope: [...data.inScope, inScopeInput.trim()],
    });
    setInScopeInput('');
  };

  const handleRemoveInScope = (index: number) => {
    onChange({
      ...data,
      inScope: data.inScope.filter((_, i) => i !== index),
    });
  };

  const handleAddOutOfScope = () => {
    if (!outOfScopeInput.trim()) return;
    onChange({
      ...data,
      outOfScope: [...data.outOfScope, outOfScopeInput.trim()],
    });
    setOutOfScopeInput('');
  };

  const handleRemoveOutOfScope = (index: number) => {
    onChange({
      ...data,
      outOfScope: data.outOfScope.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          Stage 1: Project Identity &amp; Scope Architecture
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Define core project identity and choose an architectural archetype. The Conditional Logic Engine adapts subsequent requirements based on this archetype.
        </p>
      </div>

      {/* Project Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectName" className="text-xs font-semibold text-slate-300">
            Project Name <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="projectName"
            placeholder="e.g. Autonomous Fleet Optimizer"
            value={data.projectName}
            onChange={(e) => onChange({ ...data, projectName: e.target.value })}
            className="bg-slate-900 border-slate-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAudience" className="text-xs font-semibold text-slate-300">
            Target Audience &amp; Core Users <span className="text-rose-400">*</span>
          </Label>
          <Input
            id="targetAudience"
            placeholder="e.g. Enterprise Logistics Directors, Warehouse Operators"
            value={data.targetAudience}
            onChange={(e) => onChange({ ...data, targetAudience: e.target.value })}
            className="bg-slate-900 border-slate-800 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-semibold text-slate-300">
          Executive Summary &amp; Vision <span className="text-rose-400">*</span>
        </Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Outline high-level business goals, problem statement, and expected transformation..."
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full rounded-md border border-slate-800 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Architectural Archetype Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-300">
            System Archetype <span className="text-rose-400">*</span>
          </Label>
          <span className="text-[11px] text-slate-500">Drives dynamic conditional rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ARCHETYPES.map((arch) => {
            const Icon = arch.icon;
            const isSelected = data.projectType === arch.id;

            return (
              <div
                key={arch.id}
                onClick={() => handleArchetypeSelect(arch.id)}
                className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className={`p-1.5 rounded-md ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-xs text-white">{arch.label}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{arch.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Conditional Fields based on Archetype */}
      {data.projectType === 'mobile_app' && (
        <Card className="bg-slate-900/90 border-blue-500/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Smartphone className="w-4 h-4" />
              Mobile Architecture Parameters (Conditional Rule Active)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <Label className="text-xs text-slate-300">Target Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {(['ios', 'android', 'cross_platform'] as const).map((plat) => {
                    const active = data.mobilePlatforms?.includes(plat);
                    return (
                      <Badge
                        key={plat}
                        variant={active ? 'default' : 'outline'}
                        className="cursor-pointer text-[11px]"
                        onClick={() => {
                          const current = data.mobilePlatforms || [];
                          const updated = active
                            ? current.filter((p) => p !== plat)
                            : [...current, plat];
                          onChange({ ...data, mobilePlatforms: updated });
                        }}
                      >
                        {plat === 'cross_platform' ? 'React Native / Flutter' : plat.toUpperCase()}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="offlineRequired"
                  checked={Boolean(data.offlineRequired)}
                  onChange={(e) => onChange({ ...data, offlineRequired: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="offlineRequired" className="text-xs text-slate-300 cursor-pointer">
                  Offline-First Local Sync Required
                </Label>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={Boolean(data.pushNotifications)}
                  onChange={(e) => onChange({ ...data, pushNotifications: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="pushNotifications" className="text-xs text-slate-300 cursor-pointer">
                  Push Notifications (APNs / FCM)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.projectType === 'enterprise_saas' && (
        <Card className="bg-slate-900/90 border-blue-500/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Building2 className="w-4 h-4" />
              Enterprise SaaS Parameters (Conditional Rule Active)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Multi-Tenancy Isolation Model</Label>
                <select
                  value={data.multiTenancyModel || 'shared_schema'}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      multiTenancyModel: e.target.value as any,
                    })
                  }
                  className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="shared_schema">Shared Schema + Row-Level Security (Standard SaaS)</option>
                  <option value="db_per_tenant">Database-per-Tenant (Strict Regulated / High Security)</option>
                  <option value="isolated_vpcs">Isolated VPCs / Dedicated Compute (Financial / GovCloud)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="enterpriseSso"
                  checked={Boolean(data.enterpriseSso)}
                  onChange={(e) => onChange({ ...data, enterpriseSso: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="enterpriseSso" className="text-xs text-slate-300 cursor-pointer">
                  Enterprise SSO (SAML 2.0 / Okta / Azure AD / Entra ID)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.projectType === 'api_backend' && (
        <Card className="bg-slate-900/90 border-blue-500/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Server className="w-4 h-4" />
              API Architecture Protocol (Conditional Rule Active)
            </div>
            <div className="space-y-1.5 max-w-md">
              <Label className="text-xs text-slate-300">Primary API Interface Protocol</Label>
              <select
                value={data.apiProtocol || 'rest'}
                onChange={(e) =>
                  onChange({
                    ...data,
                    apiProtocol: e.target.value as any,
                  })
                }
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="rest">RESTful JSON over HTTPS (OpenAPI 3.1)</option>
                <option value="graphql">GraphQL API (Schema-first with DataLoader)</option>
                <option value="grpc">gRPC / Protocol Buffers (Internal Microservice RPC)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {data.projectType === 'ai_agentic' && (
        <Card className="bg-slate-900/90 border-blue-500/30">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Bot className="w-4 h-4" />
              AI Agentic Configuration (Conditional Rule Active)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Model Provider &amp; Runtime</Label>
                <Input
                  value={data.aiModelProvider || ''}
                  onChange={(e) => onChange({ ...data, aiModelProvider: e.target.value })}
                  placeholder="e.g. Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o"
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="humanInTheLoop"
                  checked={Boolean(data.humanInTheLoop)}
                  onChange={(e) => onChange({ ...data, humanInTheLoop: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="humanInTheLoop" className="text-xs text-slate-300 cursor-pointer">
                  Human-in-the-Loop Approval Required for Destructive Actions
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scope Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* In-Scope */}
        <div className="space-y-3 p-4 rounded-lg border border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-emerald-400">
              In-Scope Deliverables &amp; Features
            </Label>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
              {data.inScope.length} Included
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. Real-time fleet tracking map"
              value={inScopeInput}
              onChange={(e) => setInScopeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInScope())}
              className="bg-slate-900 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddInScope}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.inScope.map((item, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 py-1"
              >
                <span>{item}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => handleRemoveInScope(i)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Out-of-Scope */}
        <div className="space-y-3 p-4 rounded-lg border border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-400">
              Out-of-Scope (Explicit Non-Goals)
            </Label>
            <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
              {data.outOfScope.length} Excluded
            </Badge>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. Hardware GPS tracking beacon firmware"
              value={outOfScopeInput}
              onChange={(e) => setOutOfScopeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOutOfScope())}
              className="bg-slate-900 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddOutOfScope}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.outOfScope.map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs bg-slate-900 border-slate-700 text-slate-300 flex items-center gap-1.5 py-1"
              >
                <span>{item}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-400"
                  onClick={() => handleRemoveOutOfScope(i)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
