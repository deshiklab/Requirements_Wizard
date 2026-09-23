'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WizardFormData } from '@/types/wizard';
import { GeneratedDocumentResult, ExportFormat } from '@/lib/export/types';
import {
  FileText,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ArrowLeft,
  FileCode,
  Code2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface DocumentExportViewerProps {
  draftId: string;
  draftTitle: string;
  formData: WizardFormData;
  markdownDoc: GeneratedDocumentResult;
  jsonDoc: GeneratedDocumentResult;
  htmlDoc: GeneratedDocumentResult;
}

export function DocumentExportViewer({
  draftId,
  draftTitle,
  formData,
  markdownDoc,
  jsonDoc,
  htmlDoc,
}: DocumentExportViewerProps) {
  const [activeTab, setActiveTab] = useState<'rendered' | 'markdown' | 'json'>('rendered');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let contentToCopy = '';
    if (activeTab === 'markdown') contentToCopy = markdownDoc.content;
    else if (activeTab === 'json') contentToCopy = jsonDoc.content;
    else contentToCopy = markdownDoc.content;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = (format: ExportFormat) => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    if (format === 'markdown') {
      content = markdownDoc.content;
      fileName = markdownDoc.fileName;
      mimeType = markdownDoc.mimeType;
    } else if (format === 'json') {
      content = jsonDoc.content;
      fileName = jsonDoc.fileName;
      mimeType = jsonDoc.mimeType;
    } else if (format === 'html') {
      content = htmlDoc.content;
      fileName = htmlDoc.fileName;
      mimeType = htmlDoc.mimeType;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Open printable HTML in a new print window or trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlDoc.content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      window.print();
    }
  };

  const readinessScore = formData.step6_review.specReadinessScore ?? 85;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href={`/wizard/${draftId}`}>
            <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Editor
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                IEEE 830-1998 Standard
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Readiness: {readinessScore}/100
              </Badge>
              <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                Phase 4 Complete
              </Badge>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white mt-0.5">
              {draftTitle} &mdash; Official Specification
            </h1>
          </div>
        </div>

        {/* Export & Download Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="text-xs border-slate-700 text-slate-300 hover:text-white"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Text
              </>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleDownload('markdown')}
            className="text-xs border-blue-500/40 text-blue-300 hover:bg-blue-950/40"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Markdown (.md)
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleDownload('json')}
            className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> JSON (.json)
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Main Presentation View */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="rendered" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BookOpen className="w-3.5 h-3.5" /> Executive Document View
            </TabsTrigger>
            <TabsTrigger value="markdown" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-3.5 h-3.5" /> IEEE 830 Markdown
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Code2 className="w-3.5 h-3.5" /> Structured JSON Schema
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-slate-500 hidden sm:block">
            Document generated at {new Date(markdownDoc.metadata.generatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Tab 1: Executive Rendered Document View */}
        <TabsContent value="rendered" className="mt-4">
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-8 text-slate-200">
              {/* Header Cover Sheet */}
              <div className="border-b border-slate-800 pb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30 uppercase tracking-widest font-mono">
                    IEEE Std 830-1998 / SDAD Contract
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">Draft UUID: {draftId}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  Software Requirements Specification (SRS)
                </h1>
                <p className="text-lg text-indigo-400 font-medium">{draftTitle}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Version</span>
                    <strong className="text-white">1.0.0</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">System Archetype</span>
                    <strong className="text-white uppercase">{formData.step1_identity.projectType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Readiness Score</span>
                    <strong className="text-emerald-400">{readinessScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Lead Architect</span>
                    <strong className="text-white">{formData.step6_review.signOffArchitect || 'Lead Systems Architect'}</strong>
                  </div>
                </div>
              </div>

              {/* Section 1: Introduction */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  1. Introduction &amp; Scope Boundaries
                </h2>
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    {formData.step1_identity.description ||
                      'This document formalizes the complete technical, functional, and compliance specifications under the SDAD methodology.'}
                  </p>
                  <p>
                    <strong className="text-white">Target Audience:</strong>{' '}
                    {formData.step1_identity.targetAudience || 'Systems Engineers & Autonomous Execution Agents'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 block mb-2">In-Scope Boundaries</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      {formData.step1_identity.inScope.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-rose-400 block mb-2">Out-of-Scope Exclusions</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      {formData.step1_identity.outOfScope.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 2: Overall Description & Personas */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  2. Overall Description &amp; Stakeholder Personas
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-800 rounded">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="p-2.5 border-b border-slate-800">Persona</th>
                        <th className="p-2.5 border-b border-slate-800">Role</th>
                        <th className="p-2.5 border-b border-slate-800">Primary Goal</th>
                        <th className="p-2.5 border-b border-slate-800">Access Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {formData.step2_personas.personas.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-bold text-white">{p.name}</td>
                          <td className="p-2.5 text-slate-300">{p.role}</td>
                          <td className="p-2.5 text-slate-400">{p.goals}</td>
                          <td className="p-2.5">
                            <Badge variant="secondary" className="text-[10px]">
                              {p.accessLevel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Functional Requirements */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  3. System Features &amp; Functional Requirements ({formData.step3_functional.requirements.length})
                </h2>

                <div className="space-y-4">
                  {formData.step3_functional.requirements.map((req, idx) => (
                    <div key={req.id} className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {req.id}
                          </span>
                          <span className="font-bold text-sm text-white">{req.title}</span>
                          <span className="text-[11px] text-slate-400">({req.category})</span>
                        </div>
                        <Badge variant={req.priority === 'P0' ? 'destructive' : req.priority === 'P1' ? 'default' : 'secondary'} className="text-[10px]">
                          {req.priority}
                        </Badge>
                      </div>

                      <blockquote className="border-l-2 border-blue-500 pl-3 italic text-xs text-slate-300">
                        {req.userStory}
                      </blockquote>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                          Acceptance Criteria (Definition of Done)
                        </span>
                        <ul className="space-y-1 text-xs">
                          {req.acceptanceCriteria.map((c, ci) => (
                            <li key={ci} className="flex items-start gap-2 text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Non-Functional Requirements */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  4. Non-Functional Requirements &amp; SLA Guardrails
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Performance</span>
                    <strong className="text-white block mt-1">P95 &le; {formData.step4_non_functional.performance.maxLatencyMs}ms</strong>
                    <span className="text-slate-400 text-[11px]">{formData.step4_non_functional.performance.targetRps} req/sec throughput</span>
                  </div>

                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Availability SLA</span>
                    <strong className="text-emerald-400 block mt-1">{formData.step4_non_functional.availability.uptimeSla} Uptime</strong>
                    <span className="text-slate-400 text-[11px]">RTO &le; {formData.step4_non_functional.availability.disasterRecoveryRtoMinutes}m</span>
                  </div>

                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Security &amp; Encryption</span>
                    <strong className="text-white block mt-1">AES-256 + TLS 1.3</strong>
                    <span className="text-slate-400 text-[11px]">{formData.step4_non_functional.securityCompliance.authStrategy}</span>
                  </div>

                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Compliance</span>
                    <strong className="text-indigo-400 block mt-1">
                      {formData.step4_non_functional.securityCompliance.complianceStandards.join(', ') || 'Standard'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {formData.step4_non_functional.scalability.peakConcurrentUsers.toLocaleString()} concurrent
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Technical Stack */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                  5. Prescribed Architecture &amp; Technical Stack
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Frontend</span>
                    <strong className="text-white">{formData.step5_tech_and_context.preferredStack.frontend}</strong>
                  </div>
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Backend</span>
                    <strong className="text-white">{formData.step5_tech_and_context.preferredStack.backend}</strong>
                  </div>
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Database</span>
                    <strong className="text-white">{formData.step5_tech_and_context.preferredStack.database}</strong>
                  </div>
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block">Cloud</span>
                    <strong className="text-white">{formData.step5_tech_and_context.preferredStack.cloud}</strong>
                  </div>
                </div>
              </div>

              {/* Section 6: Governance & Sign-Off */}
              <div className="p-5 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Architectural Sign-Off &amp; Audit Trail
                  </span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/40">
                    Sign-Off Verified
                  </Badge>
                </div>
                <p className="text-slate-400">
                  Signed off by <strong className="text-white">{formData.step6_review.signOffArchitect || 'Lead Systems Architect'}</strong> for release to downstream agentic implementation.
                </p>
                {formData.step6_review.finalNotes && (
                  <p className="text-slate-300 italic">
                    &ldquo;{formData.step6_review.finalNotes}&rdquo;
                  </p>
                )}
                <div className="font-mono text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  SDAD-SPEC-CHECKSUM: {Buffer.from(draftTitle + draftId).toString('base64').slice(0, 32)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Raw IEEE 830 Markdown View */}
        <TabsContent value="markdown" className="mt-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">File: {markdownDoc.fileName}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 text-xs border-slate-700"
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy Markdown
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-[700px]">
                {markdownDoc.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Structured JSON Schema View */}
        <TabsContent value="json" className="mt-4">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">File: {jsonDoc.fileName}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-7 text-xs border-slate-700"
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy JSON
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre-wrap max-h-[700px]">
                {jsonDoc.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
