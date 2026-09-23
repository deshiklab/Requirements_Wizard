import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Step2PersonasData, Persona } from '@/types/wizard';
import { Users, Plus, Trash2, UserCheck, Sparkles } from 'lucide-react';

interface Step2PersonasProps {
  data: Step2PersonasData;
  onChange: (data: Step2PersonasData) => void;
}

export function Step2Personas({ data, onChange }: Step2PersonasProps) {
  const handleAddPersona = (template?: Partial<Persona>) => {
    const newPersona: Persona = {
      id: `pers-${Date.now()}`,
      name: template?.name || 'New Persona',
      role: template?.role || 'User Role',
      goals: template?.goals || 'Accomplish core tasks efficiently with high reliability.',
      painPoints: template?.painPoints || 'Complex navigation and missing automated alerts.',
      accessLevel: template?.accessLevel || 'Standard User',
    };

    onChange({
      personas: [...data.personas, newPersona],
    });
  };

  const handleUpdatePersona = (id: string, updates: Partial<Persona>) => {
    onChange({
      personas: data.personas.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleRemovePersona = (id: string) => {
    if (data.personas.length <= 1) return; // Keep at least one
    onChange({
      personas: data.personas.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Stage 2: Stakeholders, Personas &amp; User Journeys
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Specify the human actors, internal operators, or external entities that interact with the system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              handleAddPersona({
                name: 'System Administrator',
                role: 'DevOps / Platform Admin',
                accessLevel: 'Superadmin',
                goals: 'Monitor infrastructure health, manage RBAC privileges, audit logs.',
                painPoints: 'Opaque error codes and lack of centralized observability.',
              })
            }
            className="text-xs border-slate-700 hover:bg-slate-800"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            Add Admin Template
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleAddPersona()}
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Custom Persona
          </Button>
        </div>
      </div>

      {/* Personas List */}
      <div className="space-y-4">
        {data.personas.map((persona, index) => (
          <Card
            key={persona.id}
            className="bg-slate-900/70 border-slate-800 shadow-sm transition-all"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-sm text-white">{persona.name}</span>
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                    {persona.accessLevel}
                  </Badge>
                </div>

                {data.personas.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemovePersona(persona.id)}
                    className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Persona Title / Name</Label>
                  <Input
                    value={persona.name}
                    onChange={(e) => handleUpdatePersona(persona.id, { name: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">System Role / Job Title</Label>
                  <Input
                    value={persona.role}
                    onChange={(e) => handleUpdatePersona(persona.id, { role: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">RBAC Access Tier</Label>
                  <select
                    value={persona.accessLevel}
                    onChange={(e) => handleUpdatePersona(persona.id, { accessLevel: e.target.value })}
                    className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Standard User">Standard User</option>
                    <option value="Manager / Lead">Manager / Lead</option>
                    <option value="Superadmin">Superadmin / System Operator</option>
                    <option value="Compliance Auditor">Compliance Auditor (Read-Only)</option>
                    <option value="Anonymous Public">Anonymous Public / Guest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Primary Motivations &amp; Goals
                  </Label>
                  <textarea
                    rows={2}
                    value={persona.goals}
                    onChange={(e) => handleUpdatePersona(persona.id, { goals: e.target.value })}
                    placeholder="What specific outcome does this user need from the software?"
                    className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-400">Current Friction &amp; Pain Points</Label>
                  <textarea
                    rows={2}
                    value={persona.painPoints}
                    onChange={(e) => handleUpdatePersona(persona.id, { painPoints: e.target.value })}
                    placeholder="What frustrates them today? (Latency, complexity, manual errors)"
                    className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
