import Link from "next/link";
import { db } from "@/lib/db";
import { Client } from "pg";
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
  BrainCircuit,
  SearchCode,
  BookOpenCheck,
  FileText,
  Printer,
  Download,
  Code2,
  History,
  Lock,
  Shield,
  Key,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbStatus = "operational";
  let userCount = 0;
  let draftCount = 0;
  let fileCount = 0;
  let auditCount = 0;
  let recentDrafts: any[] = [];

  try {
    const users = await db.orm.public.User.all();
    const drafts = await db.orm.public.FormDraft.all();
    const files = await db.orm.public.FileReference.all();

    userCount = users.length;
    draftCount = drafts.length;
    fileCount = files.length;
    recentDrafts = drafts.slice(-4).reverse();

    // Query audit log count
    const pgClient = new Client({
      connectionString:
        process.env.DATABASE_URL || 'postgresql://postgres:password@127.0.0.1:5432/requirements_wizard',
    });
    await pgClient.connect();
    const auditRes = await pgClient.query('SELECT COUNT(*) as count FROM "auditLog"');
    auditCount = parseInt(auditRes.rows[0]?.count || '0', 10);
    await pgClient.end();
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
      status: "COMPLETED",
      badgeVariant: "success" as const,
      isCurrent: false,
    },
    {
      id: "phase-3",
      name: "Phase 3: AI-Assisted Requirements Elicitation",
      description: "Ambiguity scoring, Gherkin scenario generator, context document ingestion, and proactive elicitation copilot.",
      status: "COMPLETED",
      badgeVariant: "success" as const,
      isCurrent: false,
    },
    {
      id: "phase-4",
      name: "Phase 4: Document Generation & PRD Export",
      description: "IEEE 830 compliant SRS compilation, multi-format export (Markdown, JSON, Printable HTML/PDF), and readiness verification.",
      status: "COMPLETED",
      badgeVariant: "success" as const,
      isCurrent: false,
    },
    {
      id: "phase-5",
      name: "Phase 5: Governance, Auditing & Hardening",
      description: "Least-privilege RBAC, chronological audit trail, semantic diff history, SHA-256 cryptographic seals, and immutability guards.",
      status: "COMPLETED & VERIFIED",
      badgeVariant: "success" as const,
      isCurrent: true,
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
              <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                Phase 5 Live &bull; Governance &amp; RBAC Sealed
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="w-9 h-9 text-indigo-500" />
              Requirements Wizard
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1 max-w-2xl">
              An AI-driven software requirements specification and document export platform engineered under the Spec-Driven Agentic Development (SDAD) methodology.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/wizard">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 h-auto flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                <PlusCircle className="w-4 h-4" />
                Launch Requirements Wizard
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Database & Infrastructure Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                Context Documents
              </CardTitle>
              <FileCode2 className="w-4 h-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{fileCount}</div>
              <p className="text-xs text-slate-400 mt-1">Uploaded &amp; AI-Ingested</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Audit Trail Events
              </CardTitle>
              <History className="w-4 h-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{auditCount}</div>
              <p className="text-xs text-slate-400 mt-1">Immutable change logs</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                RBAC Stakeholders
              </CardTitle>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userCount}</div>
              <p className="text-xs text-slate-400 mt-1">Role-governed accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Directed Acyclic Graph Execution Pipeline */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  SDAD Directed Acyclic Graph (DAG) Progress
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Strict step-by-step gate architecture. Phase 5 completes full governance, least-privilege RBAC, and chronological audit trails.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                All 5 Phases Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {dagPhases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    phase.isCurrent
                      ? "bg-indigo-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                      : phase.status === "COMPLETED"
                      ? "bg-slate-950/50 border-emerald-500/20"
                      : "bg-slate-950/40 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                    <Badge variant={phase.badgeVariant} className="text-[9px] uppercase font-mono">
                      {phase.status}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-xs text-white mb-1">{phase.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{phase.description}</p>
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
                    Persisted Specifications &amp; Export Quick-Actions
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Resume an active specification draft or view the official IEEE 830 PRD export.
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
                        <span className="font-mono text-indigo-400">Step {draft.currentStep}/6</span>
                        <span>&bull;</span>
                        {draft.status === 'locked' && (
                          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[9px] uppercase flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </Badge>
                        )}
                        {draft.status === 'approved' && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px] uppercase">
                            Approved
                          </Badge>
                        )}
                        {draft.status === 'in_review' && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px] uppercase">
                            In Review
                          </Badge>
                        )}
                        {(draft.status === 'draft' || draft.status === 'in_progress') && (
                          <Badge variant="secondary" className="text-[9px] uppercase">
                            In Draft
                          </Badge>
                        )}
                        <span>&bull;</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {draft.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link href={`/wizard/${draft.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-400 hover:text-white">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/wizard/${draft.id}/export`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/50">
                          <FileText className="w-3 h-3 mr-1" /> View SRS
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Highlights: Export, Governance & Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Phase 4: Multi-Format Export
              </CardTitle>
              <CardDescription className="text-slate-400">
                Transforms flexible JSONB form drafts into formal IEEE 830 specifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  IEEE 830 Markdown
                </span>
                Standard-compliant Markdown with RFC 2119 keywords, scope boundaries, persona tables, and Gherkin scenarios.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                  <Code2 className="w-3.5 h-3.5" />
                  Structured JSON Schema
                </span>
                Comprehensive machine-readable contract with SHA-256 seal for autonomous coding agents.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Printer className="w-3.5 h-3.5" />
                  Printable HTML &amp; PDF
                </span>
                Clean typography with CSS `@media print` rules, automated page breaks, and sign-off stamps.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Phase 5: Auditing &amp; Diff History
              </CardTitle>
              <CardDescription className="text-slate-400">
                Chronological record of every requirement modification and milestone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1">
                  <History className="w-3.5 h-3.5" />
                  Field-Level Semantic Diffs
                </span>
                Detects additions, modifications, and deletions in user stories, acceptance criteria, and SLAs.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Draft Sealing
                </span>
                SHA-256 checksums freeze drafts and prevent unauthorized editing until explicitly reopened.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Historical Rollback
                </span>
                Allows Lead Architects to restore prior revision snapshots directly from the audit trail.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Role-Based Access Control (RBAC)
              </CardTitle>
              <CardDescription className="text-slate-400">
                Least-privilege governance across four enterprise stakeholder roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-red-400">Admin:</span> Full user management, global oversight, and emergency unlock powers.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-purple-400">Lead Architect:</span> Formal review approval, sign-off signature, and locking permissions.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-blue-400">Contributor:</span> Requirements authoring, AI elicitation, and draft updates.
              </div>
              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-slate-400">Viewer:</span> Read-only specification inspection, audit browsing, and export.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SDAD Engine v1.0.0 &bull; deshiklab/Requirements_Wizard</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Phase 5 Governance, Auditing, RBAC &amp; Hardening Complete
          </span>
        </div>
      </div>
    </main>
  );
}
