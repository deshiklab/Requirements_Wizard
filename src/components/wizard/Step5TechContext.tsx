import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step5TechAndContextData, IntegrationItem, AttachmentRef } from '@/types/wizard';
import {
  Boxes,
  Plus,
  Trash2,
  Upload,
  FileText,
  FileImage,
  Paperclip,
  CheckCircle,
} from 'lucide-react';

interface Step5TechContextProps {
  data: Step5TechAndContextData;
  onChange: (data: Step5TechAndContextData) => void;
  onAttachFile?: (file: AttachmentRef) => void;
}

export function Step5TechContext({ data, onChange, onAttachFile }: Step5TechContextProps) {
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceType, setNewServiceType] = useState('');
  const [newServicePurpose, setNewServicePurpose] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('');

  const handleAddIntegration = () => {
    if (!newServiceName.trim()) return;
    const item: IntegrationItem = {
      id: `int-${Date.now()}`,
      serviceName: newServiceName.trim(),
      type: newServiceType.trim() || 'Third-Party Service',
      purpose: newServicePurpose.trim() || 'System integration',
    };

    onChange({
      ...data,
      integrations: [...data.integrations, item],
    });

    setNewServiceName('');
    setNewServiceType('');
    setNewServicePurpose('');
  };

  const handleRemoveIntegration = (id: string) => {
    onChange({
      ...data,
      integrations: data.integrations.filter((it) => it.id !== id),
    });
  };

  const handleSimulateUpload = () => {
    const rawName = simulatedFileName.trim() || 'System_Architecture_Diagram.png';
    const isImage = rawName.endsWith('.png') || rawName.endsWith('.jpg') || rawName.endsWith('.svg');
    const newFile: AttachmentRef = {
      id: `file-${Date.now()}`,
      fileName: rawName.toLowerCase().replace(/\s+/g, '-'),
      originalName: rawName,
      fileSize: Math.floor(Math.random() * 2000000) + 500000,
      mimeType: isImage ? 'image/png' : 'application/pdf',
      metadata: {
        uploadedAt: new Date().toISOString(),
        extractedContext: 'Parsed architecture components and domain entity models.',
      },
    };

    onChange({
      ...data,
      attachments: [...data.attachments, newFile],
    });

    if (onAttachFile) {
      onAttachFile(newFile);
    }

    setSimulatedFileName('');
  };

  const handleRemoveAttachment = (id: string) => {
    onChange({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-blue-400" />
          Stage 5: Technical Stack, External Integrations &amp; Context Uploads
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Lock in implementation constraints, third-party APIs, and attach contextual reference files (C4 architecture diagrams, PRD notes).
        </p>
      </div>

      {/* Tech Stack Selection */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Prescribed Architecture &amp; Technology Stack
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Frontend Framework</Label>
              <Input
                value={data.preferredStack.frontend}
                onChange={(e) =>
                  onChange({
                    ...data,
                    preferredStack: { ...data.preferredStack, frontend: e.target.value },
                  })
                }
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Backend / Compute</Label>
              <Input
                value={data.preferredStack.backend}
                onChange={(e) =>
                  onChange({
                    ...data,
                    preferredStack: { ...data.preferredStack, backend: e.target.value },
                  })
                }
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Database &amp; Storage</Label>
              <Input
                value={data.preferredStack.database}
                onChange={(e) =>
                  onChange({
                    ...data,
                    preferredStack: { ...data.preferredStack, database: e.target.value },
                  })
                }
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Cloud Infrastructure</Label>
              <Input
                value={data.preferredStack.cloud}
                onChange={(e) =>
                  onChange({
                    ...data,
                    preferredStack: { ...data.preferredStack, cloud: e.target.value },
                  })
                }
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Third Party Integrations */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Third-Party Integrations &amp; External APIs
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
              {data.integrations.length} Active
            </Badge>
          </div>

          <div className="space-y-2">
            {data.integrations.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-3 p-3 rounded bg-slate-950/70 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-white mr-2">{it.serviceName}</span>
                  <Badge variant="secondary" className="text-[9px] mr-2">
                    {it.type}
                  </Badge>
                  <span className="text-slate-400 text-[11px]">{it.purpose}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveIntegration(it.id)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
            <Input
              placeholder="Service Name (e.g. Stripe)"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            <Input
              placeholder="Type (e.g. Payments)"
              value={newServiceType}
              onChange={(e) => setNewServiceType(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            <Input
              placeholder="Purpose (e.g. Subscriptions)"
              value={newServicePurpose}
              onChange={(e) => setNewServicePurpose(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-white sm:col-span-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddIntegration}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Integration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context File References */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Attached Specification Documents &amp; Architecture References
            </div>
            <span className="text-[10px] text-slate-500">
              Persisted to PostgreSQL `fileReference`
            </span>
          </div>

          <div className="space-y-2">
            {data.attachments.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No contextual reference documents attached yet. Attach diagrams or PRD notes below.
              </div>
            ) : (
              data.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {att.mimeType.includes('image') ? (
                      <FileImage className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-200">{att.originalName}</div>
                      <div className="text-[10px] text-slate-500">
                        {(att.fileSize / 1024).toFixed(1)} KB &bull; {att.mimeType}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Document file name (e.g. C4_Container_Architecture.png, API_Spec.json)"
              value={simulatedFileName}
              onChange={(e) => setSimulatedFileName(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs text-white"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSimulateUpload}
              className="border-purple-500/40 text-purple-300 hover:bg-purple-950/40 text-xs whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Attach Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
