import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Step4NonFunctionalData } from '@/types/wizard';
import {
  ShieldAlert,
  Gauge,
  Clock,
  Lock,
  Network,
  Zap,
} from 'lucide-react';

interface Step4NonFunctionalProps {
  data: Step4NonFunctionalData;
  onChange: (data: Step4NonFunctionalData) => void;
}

const COMPLIANCE_OPTIONS = [
  { id: 'SOC2', label: 'SOC-2 Type II', desc: 'Enterprise SaaS Trust Criteria' },
  { id: 'GDPR', label: 'GDPR / UK-GDPR', desc: 'EU Privacy & Right to Erasure' },
  { id: 'HIPAA', label: 'HIPAA / HITECH', desc: 'Healthcare ePHI & BAA Mandates' },
  { id: 'PCI-DSS', label: 'PCI-DSS', desc: 'Credit Card & Payment Data' },
  { id: 'ISO-27001', label: 'ISO-27001', desc: 'Information Security Management' },
];

export function Step4NonFunctional({ data, onChange }: Step4NonFunctionalProps) {
  const toggleCompliance = (standard: string) => {
    const current = data.securityCompliance.complianceStandards;
    const exists = current.includes(standard);
    const updated = exists ? current.filter((s) => s !== standard) : [...current, standard];

    onChange({
      ...data,
      securityCompliance: {
        ...data.securityCompliance,
        complianceStandards: updated,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
          Stage 4: Non-Functional Requirements &amp; Quality Attributes
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Specify quantifiable engineering benchmarks. The Conditional Logic Engine verifies SLA feasibility and compliance mandates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Latency & Throughput Performance */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Gauge className="w-4 h-4" />
              Performance &amp; Latency SLOs
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-slate-300">p99 Max API Latency</Label>
                  <span className="font-mono text-emerald-400 font-bold">
                    {data.performance.maxLatencyMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="25"
                  value={data.performance.maxLatencyMs}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      performance: {
                        ...data.performance,
                        maxLatencyMs: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>50ms (Ultra-low)</span>
                  <span>500ms</span>
                  <span>2000ms (Batch)</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs text-slate-300">Target Throughput (Peak RPS)</Label>
                <Input
                  type="number"
                  value={data.performance.targetRps}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      performance: {
                        ...data.performance,
                        targetRps: Number(e.target.value),
                      },
                    })
                  }
                  className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Values &gt; 300 RPS automatically trigger distributed cache rules in engine.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Availability & Disaster Recovery */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
              <Clock className="w-4 h-4" />
              High Availability &amp; Disaster Recovery SLA
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Target Uptime SLA</Label>
                <select
                  value={data.availability.uptimeSla}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      availability: {
                        ...data.availability,
                        uptimeSla: e.target.value as any,
                      },
                    })
                  }
                  className="w-full rounded-md border border-slate-800 bg-slate-950 p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="99.0%">99.0% (3.65 days downtime/year - Dev/Internal)</option>
                  <option value="99.9%">99.9% Three Nines (8.76 hours downtime/year - Standard SaaS)</option>
                  <option value="99.95%">99.95% (4.38 hours downtime/year - High Availability)</option>
                  <option value="99.99%">99.99% Four Nines (52 minutes downtime/year - Mission Critical)</option>
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-slate-300">Disaster Recovery RTO (Recovery Time Objective)</Label>
                  <span className="font-mono text-blue-400 font-bold">
                    {data.availability.disasterRecoveryRtoMinutes} min
                  </span>
                </div>
                <Input
                  type="number"
                  value={data.availability.disasterRecoveryRtoMinutes}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      availability: {
                        ...data.availability,
                        disasterRecoveryRtoMinutes: Number(e.target.value),
                      },
                    })
                  }
                  className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Engine flags a warning if RTO &gt; 15m under a 99.99% SLA.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Security & Regulatory Compliance */}
        <Card className="bg-slate-900/70 border-slate-800 md:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Lock className="w-4 h-4" />
                Security Standards &amp; Regulatory Compliance Matrix
              </div>
              <span className="text-[10px] text-slate-500">Drives automated security rules</span>
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-slate-300">Applicable Compliance Frameworks</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {COMPLIANCE_OPTIONS.map((comp) => {
                  const isSelected = data.securityCompliance.complianceStandards.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => toggleCompliance(comp.id)}
                      className={`cursor-pointer p-2.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{comp.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{comp.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Authentication &amp; Session Strategy</Label>
                <Input
                  value={data.securityCompliance.authStrategy}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      securityCompliance: {
                        ...data.securityCompliance,
                        authStrategy: e.target.value,
                      },
                    })
                  }
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="dataEncryptionAtRest"
                  checked={Boolean(data.securityCompliance.dataEncryptionAtRest)}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      securityCompliance: {
                        ...data.securityCompliance,
                        dataEncryptionAtRest: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="dataEncryptionAtRest" className="text-xs text-slate-300 cursor-pointer">
                  AES-256 Encryption-at-Rest (Mandatory for HIPAA)
                </Label>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="dataEncryptionInTransit"
                  checked={Boolean(data.securityCompliance.dataEncryptionInTransit)}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      securityCompliance: {
                        ...data.securityCompliance,
                        dataEncryptionInTransit: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="dataEncryptionInTransit" className="text-xs text-slate-300 cursor-pointer">
                  TLS 1.3 Encryption-in-Transit (Strict HSTS)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Scalability & Concurrency */}
        <Card className="bg-slate-900/70 border-slate-800 md:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Network className="w-4 h-4" />
              Scale &amp; Capacity Planning
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Peak Concurrent Users</Label>
                <Input
                  type="number"
                  value={data.scalability.peakConcurrentUsers}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      scalability: {
                        ...data.scalability,
                        peakConcurrentUsers: Number(e.target.value),
                      },
                    })
                  }
                  className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Caching &amp; Edge Delivery Strategy</Label>
                <Input
                  value={data.scalability.cachingStrategy}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      scalability: {
                        ...data.scalability,
                        cachingStrategy: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Redis Cluster + Cloudflare CDN Edge Cache"
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
