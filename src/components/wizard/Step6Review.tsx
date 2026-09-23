import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step6ReviewData, WizardFormData } from '@/types/wizard';
import {
  ConditionalEvaluationResult,
  calculateSpecReadinessScore,
} from '@/lib/conditional-logic/engine';
import { SpecificationExportEngine } from '@/lib/export/engine';
import {
  ClipboardCheck,
  Code2,
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface Step6ReviewProps {
  data: Step6ReviewData;
  formData: WizardFormData;
  onChange: (data: Step6ReviewData) => void;
  evaluation: ConditionalEvaluationResult;
  draftId?: string;
}

export function Step6Review({
  data,
  formData,
  onChange,
  evaluation,
  draftId,
}: Step6ReviewProps) {
  const [copied, setCopied] = useState(false);
  const readiness = calculateSpecReadinessScore(formData, evaluation);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickDownload = (format: 'markdown' | 'json' | 'html') => {
    const doc = SpecificationExportEngine.exportDocument(formData, format, {
      docTitle: formData.step1_identity.projectName || 'Software_Requirements_Specification',
      version: '1.0.0',
      generatedBy: data.signOffArchitect || 'Lead Systems Architect',
    });
    const blob = new Blob([doc.content], { type: doc.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const doc = SpecificationExportEngine.exportDocument(formData, 'html', {
      docTitle: formData.step1_identity.projectName || 'Software_Requirements_Specification',
      version: '1.0.0',
      generatedBy: data.signOffArchitect || 'Lead Systems Architect',
    });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(doc.content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            Stage 6: Specification Review &amp; IEEE 830 PRD Export
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Review the synthesized requirements, inspect the PostgreSQL JSONB document payload, and export the official IEEE 830 specification.
          </p>
        </div>

        {draftId && (
          <Link href={`/wizard/${draftId}/export`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 shadow-md shadow-indigo-600/20">
              <FileText className="w-4 h-4 mr-1.5" /> Full Document Presentation &rarr;
            </Button>
          </Link>
        )}
      </div>

      {/* Phase 4 Document Export Action Banner */}
      <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200">
                Phase 4: Multi-Format Specification Exporter
              </span>
              <Badge variant="outline" className="text-[9px] text-indigo-400 border-indigo-500/40">
                IEEE 830 Compliant
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickDownload('markdown')}
                className="text-xs border-blue-500/40 text-blue-300 hover:bg-blue-950/40 h-7"
              >
                <Download className="w-3 h-3 mr-1" /> Markdown (.md)
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleQuickDownload('json')}
                className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-950/40 h-7"
              >
                <Download className="w-3 h-3 mr-1" /> JSON (.json)
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7"
              >
                <Printer className="w-3 h-3 mr-1" /> Print / PDF
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Exports full requirement sets, Gherkin acceptance scenarios, personas, SLAs, and formal architect sign-off into standard documentation formats.
          </p>
        </CardContent>
      </Card>

      {/* Quantitative Readiness Score Card */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-md">
        <CardHeader className="pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SDAD Specification Readiness Score
            </CardTitle>
            <Badge
              variant={readiness.score >= 80 ? 'default' : 'secondary'}
              className="text-xs font-mono font-bold"
            >
              {readiness.grade} ({readiness.score}/100)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  readiness.score >= 80
                    ? 'bg-emerald-500'
                    : readiness.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${readiness.score}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
            {readiness.checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-2">
                  {item.complete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={item.complete ? 'text-slate-200' : 'text-slate-400'}>
                    {item.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500 font-bold">
                  +{item.weight} pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specification Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Core Identity</div>
          <div className="text-sm font-bold text-white">
            {formData.step1_identity.projectName || 'Untitled Project'}
          </div>
          <Badge variant="outline" className="text-[10px] text-blue-400">
            Archetype: {formData.step1_identity.projectType}
          </Badge>
          <div className="text-[11px] text-slate-400 pt-1 line-clamp-2">
            {formData.step1_identity.description || 'No description provided.'}
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">Requirements Count</div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-bold text-white">
                {formData.step3_functional.requirements.length}
              </div>
              <div className="text-[10px] text-slate-400">Functional (FRs)</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-bold text-amber-400">
                {formData.step3_functional.requirements.filter((r) => r.priority === 'P0').length}
              </div>
              <div className="text-[10px] text-slate-400">P0 Blockers</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-xl font-bold text-purple-400">
                {formData.step2_personas.personas.length}
              </div>
              <div className="text-[10px] text-slate-400">Personas</div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">SLAs &amp; Compliance</div>
          <div className="text-sm font-bold text-emerald-400">
            {formData.step4_non_functional.availability.uptimeSla} Uptime SLA
          </div>
          <div className="text-[11px] text-slate-400">
            p99 Latency &lt; {formData.step4_non_functional.performance.maxLatencyMs}ms
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {formData.step4_non_functional.securityCompliance.complianceStandards.map((c) => (
              <Badge key={c} variant="secondary" className="text-[9px]">
                {c}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* JSONB Database State Inspector */}
      <Card className="bg-slate-950 border-slate-800">
        <CardHeader className="py-3 px-4 border-b border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Live FormDraft.data (JSONB Document Payload)
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopyJson}
            className="h-7 text-xs border-slate-700 hover:bg-slate-800"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" /> Copy JSON
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <pre className="max-h-64 overflow-y-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800/80">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Sign-off & Final Notes */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-400" />
            Architect Sign-off &amp; Review Protocol
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Lead Systems Architect / Sign-off Author</Label>
              <Input
                placeholder="e.g. Staff Architect Ada Lovelace"
                value={data.signOffArchitect}
                onChange={(e) => onChange({ ...data, signOffArchitect: e.target.value })}
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Draft Status Designation</Label>
              <select
                value={data.status || 'review'}
                onChange={(e) => onChange({ ...data, status: e.target.value as any })}
                className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Draft (Work in Progress)</option>
                <option value="in_progress">In Progress (Active Elicitation)</option>
                <option value="review">Review (Ready for Phase 4 Export)</option>
                <option value="finalized">Finalized (Specification Frozen)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Final Architectural Notes &amp; Caveats</Label>
            <textarea
              rows={2}
              placeholder="Record any explicit assumptions, trade-offs, or open questions for downstream AI synthesis..."
              value={data.finalNotes}
              onChange={(e) => onChange({ ...data, finalNotes: e.target.value })}
              className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
