import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  CheckCircle2,
  FileCode2,
  Layers,
  ShieldCheck,
  Server,
  Workflow,
  Sparkles,
  Cpu,
  ArrowRight,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbStatus = "operational";
  let userCount = 0;
  let draftCount = 0;
  let fileCount = 0;
  let recentDrafts: any[] = [];

  try {
    const users = await db.orm.public.User.all();
    const drafts = await db.orm.public.FormDraft.all();
    const files = await db.orm.public.FileReference.all();

    userCount = users.length;
    draftCount = drafts.length;
    fileCount = files.length;
    recentDrafts = drafts.slice(-4).reverse();
  } catch (err: any) {
    dbStatus = "error";
    console.error("DB connection error in Home page:", err.message);
  }

  const dagPhases = [
    {
      id: "phase-1",
      name: "Phase 1: Database & Environment",
      description: "Next.js 14 App Router, Tailwind/Shadcn, PostgreSQL schema with JSONB multi-stage drafts & file references.",
      status: "COMPLETED",
      badgeVariant: "success" as const,
      isCurrent: false,
    },
    {
      id: "phase-2",
      name: "Phase 2: Multi-Stage Wizard & Logic Engine",
      description: "Dynamic multi-step form engine with real-time conditional logic, archetype rules, autosave, and readiness scoring.",
      status: "COMPLETED & VERIFIED",
      badgeVariant: "success" as const,
      isCurrent: true,
    },
    {
      id: "phase-3",
      name: "Phase 3: AI-Assisted Requirements Elicitation",
      description: "Dynamic AI prompts, automated ambiguity reduction, functional/NFR decomposition, and acceptance criteria.",
      status: "AWAITING HUMAN APPROVAL",
      badgeVariant: "secondary" as const,
      isCurrent: false,
    },
    {
      id: "phase-4",
      name: "Phase 4: Document Generation & Export",
      description: "PRD/SRS compilation, IEEE 830 compliant formatting, PDF/Markdown/JSON schema exports, and audit trails.",
      status: "BLOCKED ON PHASE 3",
      badgeVariant: "outline" as const,
      isCurrent: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Launch CTA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="outline" className="text-xs uppercase tracking-wider text-emerald-400 border-emerald-500/30">
                SDAD Execution Framework
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Next.js 14 App Router
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="w-9 h-9 text-blue-500" />
              Requirements Wizard
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-2xl">
              An AI-driven software requirements elicitation platform built under the Spec-Driven Agentic Development (SDAD) methodology.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/wizard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 h-auto flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                <PlusCircle className="w-4 h-4" />
                Launch Requirements Wizard
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Database & Infrastructure Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Database Status
              </CardTitle>
              <Database className="w-4 h-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                {dbStatus === "operational" ? "Healthy" : "Degraded"}
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs text-slate-400 mt-1">PostgreSQL 18.4 + JSONB</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Persisted Form Drafts
              </CardTitle>
              <Layers className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{draftCount}</div>
              <p className="text-xs text-slate-400 mt-1">Multi-stage JSONB states</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                File References
              </CardTitle>
              <FileCode2 className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{fileCount}</div>
              <p className="text-xs text-slate-400 mt-1">Uploaded context documents</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Architect Accounts
              </CardTitle>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userCount}</div>
              <p className="text-xs text-slate-400 mt-1">Role-based stakeholders</p>
            </CardContent>
          </Card>
        </div>

        {/* Directed Acyclic Graph Execution Pipeline */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  SDAD Directed Acyclic Graph (DAG) Progress
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Strict step-by-step gate architecture. Each phase requires automated test proof and human sign-off before downstream dependency execution.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                Phase 2 Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dagPhases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`p-4 rounded-lg border transition-all ${
                    phase.isCurrent
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                      : phase.status === "COMPLETED"
                      ? "bg-slate-950/50 border-emerald-500/20"
                      : "bg-slate-950/40 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                    <Badge variant={phase.badgeVariant} className="text-[10px] uppercase font-mono">
                      {phase.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm text-white mb-1">{phase.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{phase.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Drafts & Quick Resume Section */}
        {recentDrafts.length > 0 && (
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Persisted Form Drafts in PostgreSQL
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Resume an active specification or inspect its live JSONB state.
                  </CardDescription>
                </div>
                <Link href="/wizard">
                  <Button size="sm" variant="outline" className="text-xs border-slate-700">
                    + New Specification
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{draft.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-blue-400">Step {draft.currentStep}/6</span>
                        <span>&bull;</span>
                        <Badge variant="secondary" className="text-[9px] uppercase">
                          {draft.status}
                        </Badge>
                        <span>&bull;</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {draft.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <Link href={`/wizard/${draft.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-blue-400 hover:text-white">
                        Resume <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schema Architecture & Engine Capabilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase 2 Frontend Architecture */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                Phase 2: Multi-Stage Wizard Engine Architecture
              </CardTitle>
              <CardDescription className="text-slate-400">
                Features 6 interactive stages with real-time state persistence to PostgreSQL.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-blue-400">Stage 1: Scope &amp; Archetype</span> &bull; Web, Mobile, API, SaaS, AI-Agentic archetype selectors with conditional parameters.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-400">Stage 2: Personas &amp; Actors</span> &bull; Dynamic persona cards with goals, pain points, and RBAC tiers.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-400">Stage 3: Functional Requirements</span> &bull; P0/P1/P2 priorities, user story formula, testable acceptance criteria lists.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-purple-400">Stage 4: NFRs &amp; Quality Attributes</span> &bull; Latency targets, uptime SLAs, HIPAA/GDPR/SOC2 compliance checks.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-indigo-400">Stage 5: Tech Stack &amp; Context Files</span> &bull; Framework selector, third-party integrations, diagram upload references.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-rose-400">Stage 6: Review &amp; Readiness</span> &bull; Quantitative Spec Readiness Score (0-100) and live JSONB inspector.
              </div>
            </CardContent>
          </Card>

          {/* Conditional Logic Engine Specifications */}
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Conditional Logic Rules Engine (`src/lib/conditional-logic`)
              </CardTitle>
              <CardDescription className="text-slate-400">
                Deterministic cross-field evaluation without external API latency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-300">Rule 1 (Mobile Archetype):</span> Surfaces offline sync, APNs/FCM push notifications, and App Store review constraints.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-300">Rule 2 (Enterprise SaaS):</span> Enforces multi-tenancy models (Shared vs DB-per-tenant) and SAML 2.0 / Okta SSO.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-rose-400">Rule 3 (HIPAA Guardrail):</span> Detects HIPAA selection and mandates AES-256 encryption-at-rest with audit trail.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-blue-400">Rule 4 (Scale &amp; Concurrency):</span> Detects &gt;2500 users / &gt;300 RPS and recommends distributed Redis cache.
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-400">Rule 5 (High Availability SLA):</span> Cross-checks 99.99% uptime against RTO targets (&le; 15 min requirement).
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-indigo-400">Rule 6 (AI Agent Guardrails):</span> Injects structured output validation and human-in-the-loop policies.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SDAD Engine v1.0.0 &bull; deshiklab/Requirements_Wizard</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 2 Complete &bull; Awaiting Human Sign-off for Phase 3
          </span>
        </div>
      </div>
    </main>
  );
}
