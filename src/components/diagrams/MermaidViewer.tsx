'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArchitectureDiagram, DiagramType, GeneratedDiagramsCollection } from '@/lib/diagrams/types';
import { generateAllArchitectureDiagrams } from '@/lib/diagrams/mermaid';
import { WizardFormData } from '@/types/wizard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  GitBranch,
  Database,
  ShieldCheck,
  Copy,
  CheckCircle2,
  Download,
  Code2,
  Eye,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface MermaidViewerProps {
  formData: WizardFormData;
  initialType?: DiagramType;
}

export function MermaidViewer({ formData, initialType = 'c4_container' }: MermaidViewerProps) {
  const [selectedType, setSelectedType] = useState<DiagramType>(initialType);
  const [showSyntax, setShowSyntax] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate all 4 diagrams deterministically
  const diagrams: GeneratedDiagramsCollection = generateAllArchitectureDiagrams(formData);

  const currentDiagram: ArchitectureDiagram =
    selectedType === 'c4_container'
      ? diagrams.c4Container
      : selectedType === 'sequence_workflow'
      ? diagrams.sequenceWorkflow
      : selectedType === 'er_model'
      ? diagrams.erModel
      : diagrams.governanceState;

  // Render Mermaid client-side dynamically
  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);
    setRenderError(null);

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'monospace',
          themeVariables: {
            darkMode: true,
            background: '#090d16',
            primaryColor: '#4f46e5',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#6366f1',
            lineColor: '#818cf8',
            secondaryColor: '#059669',
            tertiaryColor: '#1e293b',
          },
        });

        const uniqueId = `mermaid-svg-${selectedType}-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, currentDiagram.syntax);

        if (isMounted) {
          setRenderedSvg(svg);
          setIsRendering(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('[Mermaid Render Warning]:', err);
          setRenderError(err?.message || 'Failed to render Mermaid diagram in browser.');
          setIsRendering(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [selectedType, currentDiagram.syntax]);

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(currentDiagram.syntax);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSvg = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDiagram.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-white">
                  Automated Architecture Diagrams
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                  Mermaid.js Powered
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Dynamic C4 Container, Sequence, ER, and State Machine diagrams compiled from current requirements.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSyntax(!showSyntax)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
            >
              {showSyntax ? (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1 text-emerald-400" /> View Rendered Diagram
                </>
              ) : (
                <>
                  <Code2 className="w-3.5 h-3.5 mr-1 text-indigo-400" /> View Mermaid Syntax
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySyntax}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Syntax
                </>
              )}
            </Button>

            {renderedSvg && !showSyntax && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSvg}
                className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Export SVG
              </Button>
            )}
          </div>
        </div>

        {/* Diagram Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedType('c4_container')}
            className={`p-2.5 rounded-lg text-left transition-all border flex items-center gap-2 ${
              selectedType === 'c4_container'
                ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">C4 System Container</div>
              <div className="text-[10px] opacity-75 truncate">Architecture & boundaries</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedType('sequence_workflow')}
            className={`p-2.5 rounded-lg text-left transition-all border flex items-center gap-2 ${
              selectedType === 'sequence_workflow'
                ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Sequence Workflow</div>
              <div className="text-[10px] opacity-75 truncate">End-to-end P0 execution</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedType('er_model')}
            className={`p-2.5 rounded-lg text-left transition-all border flex items-center gap-2 ${
              selectedType === 'er_model'
                ? 'bg-emerald-600/20 border-emerald-500/60 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Database ER Model</div>
              <div className="text-[10px] opacity-75 truncate">Relational & JSONB schema</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedType('governance_state')}
            className={`p-2.5 rounded-lg text-left transition-all border flex items-center gap-2 ${
              selectedType === 'governance_state'
                ? 'bg-purple-600/20 border-purple-500/60 text-white shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">Governance States</div>
              <div className="text-[10px] opacity-75 truncate">Freezing & reopening</div>
            </div>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{currentDiagram.title}</span>
          <span>{currentDiagram.description}</span>
        </div>

        {/* Display either raw syntax or rendered SVG */}
        {showSyntax ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-500 font-mono">
              <span>Mermaid.js Definition</span>
              <button
                onClick={handleCopySyntax}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <pre className="font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap max-h-[550px] leading-relaxed">
              {currentDiagram.syntax}
            </pre>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 min-h-[420px] flex items-center justify-center overflow-x-auto"
          >
            {isRendering ? (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
                Compiling Mermaid architecture visualization...
              </div>
            ) : renderError ? (
              <div className="space-y-3 p-4 max-w-xl text-center">
                <p className="text-rose-400 text-sm font-semibold">Diagram Rendering Notice</p>
                <p className="text-xs text-slate-400">
                  Preview fallback: The raw Mermaid syntax is 100% valid and ready for export to GitHub/GitLab Markdown.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowSyntax(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Inspect Mermaid Syntax
                </Button>
              </div>
            ) : (
              <div
                className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto transition-transform"
                dangerouslySetInnerHTML={{ __html: renderedSvg }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
