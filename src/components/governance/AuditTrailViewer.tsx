'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogEntry, UserRole } from '@/lib/governance/types';
import { getAuditTrailAction, restoreRevisionAction } from '@/actions/governance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  History,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { ROLE_DESCRIPTIONS } from '@/lib/governance/rbac';

interface AuditTrailViewerProps {
  draftId: string;
  currentUserRole?: UserRole;
  currentUserId?: string;
  onRevisionRestored?: () => void;
}

export function AuditTrailViewer({
  draftId,
  currentUserRole = 'contributor',
  currentUserId,
  onRevisionRestored,
}: AuditTrailViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditTrailAction({ draftId, limit: 50 });
      if (res.success) {
        setLogs(res.data || []);
      } else {
        setError(res.error || 'Failed to load audit trail');
      }
    } catch (err: any) {
      setError(err?.message || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    if (draftId) {
      fetchLogs();
    }
  }, [draftId, fetchLogs]);

  const handleRestore = async (auditLogId: string) => {
    if (!currentUserId) {
      alert('User ID is required to perform rollback.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to restore this historical revision? The current specification state will be overwritten with this snapshot, and an audited rollback event will be logged.'
    );
    if (!confirmed) return;

    setRestoringId(auditLogId);
    setRestoreFeedback(null);
    try {
      const res = await restoreRevisionAction({
        draftId,
        userId: currentUserId,
        userRole: currentUserRole,
        auditLogId,
      });

      if (res.success) {
        setRestoreFeedback({
          type: 'success',
          message: 'Historical specification revision restored successfully!',
        });
        await fetchLogs();
        if (onRevisionRestored) onRevisionRestored();
      } else {
        setRestoreFeedback({
          type: 'error',
          message: res.error || 'Failed to restore revision.',
        });
      }
    } catch (err: any) {
      setRestoreFeedback({
        type: 'error',
        message: err?.message || 'Error during rollback execution.',
      });
    } finally {
      setRestoringId(null);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_DRAFT':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Created</Badge>;
      case 'UPDATE_STAGE':
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Stage Edit</Badge>;
      case 'SUBMIT_FOR_REVIEW':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">In Review</Badge>;
      case 'SIGN_OFF_DRAFT':
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Architect Approved</Badge>;
      case 'LOCK_SPECIFICATION':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">Cryptographically Locked</Badge>;
      case 'REOPEN_SPECIFICATION':
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Reopened</Badge>;
      case 'RESTORE_REVISION':
        return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Rollback Restored</Badge>;
      case 'EXPORT_DOCUMENT':
        return <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Exported</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">{action}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SIGN_OFF_DRAFT':
        return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case 'LOCK_SPECIFICATION':
        return <Lock className="w-4 h-4 text-rose-400" />;
      case 'REOPEN_SPECIFICATION':
        return <Unlock className="w-4 h-4 text-orange-400" />;
      case 'RESTORE_REVISION':
        return <RotateCcw className="w-4 h-4 text-indigo-400" />;
      case 'EXPORT_DOCUMENT':
        return <Download className="w-4 h-4 text-cyan-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const canRestore = currentUserRole === 'admin' || currentUserRole === 'lead_architect';

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              Audit Trail & Revision History
              <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {logs.length} events
              </span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable chronological record of requirement mutations, approvals, and cryptographic seals.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs h-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </Button>
      </CardHeader>

      <CardContent className="pt-4">
        {restoreFeedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 border ${
              restoreFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {restoreFeedback.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{restoreFeedback.message}</span>
          </div>
        )}

        {loading && logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400 opacity-60" />
            Loading cryptographic audit trail...
          </div>
        ) : error ? (
          <div className="py-6 text-center text-rose-400 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No audit log entries recorded yet for this specification draft.
          </div>
        ) : (
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
            {logs.map((entry) => {
              const isExpanded = expandedLogId === entry.id;
              const hasDiff = entry.diff && entry.diff.changes && entry.diff.changes.length > 0;
              const hasSnapshot = Boolean(entry.snapshot);

              return (
                <div
                  key={entry.id}
                  className="relative pl-9 group"
                >
                  {/* Timeline Node Icon */}
                  <div className="absolute left-2 -translate-x-1/2 top-3 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                    {getActionIcon(entry.action)}
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-750 hover:border-slate-700 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {getActionBadge(entry.action)}
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(entry.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          · {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {entry.checksum && (
                          <div
                            className="flex items-center gap-1 text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20"
                            title={`SHA-256: ${entry.checksum}`}
                          >
                            <Lock className="w-3 h-3" />
                            <span>{entry.checksum.slice(0, 8)}...</span>
                          </div>
                        )}

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300 font-medium">
                            {entry.userName || entry.userEmail || 'System User'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({entry.userRole})</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 font-medium">{entry.summary}</p>

                    {/* Metadata attributes */}
                    {entry.metadata && (
                      <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-2">
                        {entry.metadata.reopenReason && (
                          <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                            Reason: &quot;{entry.metadata.reopenReason}&quot;
                          </span>
                        )}
                        {entry.metadata.signedOffBy && (
                          <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                            Signed: {entry.metadata.signedOffBy}
                          </span>
                        )}
                        {entry.metadata.readinessScore !== undefined && (
                          <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                            Readiness: {entry.metadata.readinessScore}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* Diff & Actions footer */}
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      {hasDiff ? (
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide {entry.diff?.changes.length} Field Changes
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              Inspect {entry.diff?.changes.length} Field Changes
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-500">No field diff recorded</span>
                      )}

                      {/* Restore Revision Button */}
                      {hasSnapshot && canRestore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={restoringId === entry.id}
                          onClick={() => handleRestore(entry.id)}
                          className="h-6 px-2 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          {restoringId === entry.id ? 'Restoring...' : 'Rollback to this state'}
                        </Button>
                      )}
                    </div>

                    {/* Expanded Field Diff Card */}
                    {isExpanded && entry.diff && (
                      <div className="mt-3 p-3 rounded bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
                        <div className="text-slate-400 font-semibold mb-1 pb-1 border-b border-slate-800 text-[11px] font-sans">
                          Field-Level Semantic Diffs:
                        </div>
                        {entry.diff.changes.map((change, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-900/90 border border-slate-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-slate-200 font-bold font-sans">{change.label}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                                  change.changeType === 'added'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : change.changeType === 'modified'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {change.changeType}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              {change.before !== null && (
                                <div className="p-1.5 rounded bg-rose-500/5 border border-rose-500/20 text-rose-300">
                                  <span className="text-[10px] text-rose-400 block font-sans">Before:</span>
                                  <span className="break-words">
                                    {typeof change.before === 'object'
                                      ? JSON.stringify(change.before)
                                      : String(change.before)}
                                  </span>
                                </div>
                              )}
                              {change.after !== null && (
                                <div className="p-1.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-emerald-300">
                                  <span className="text-[10px] text-emerald-400 block font-sans">After:</span>
                                  <span className="break-words">
                                    {typeof change.after === 'object'
                                      ? JSON.stringify(change.after)
                                      : String(change.after)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
