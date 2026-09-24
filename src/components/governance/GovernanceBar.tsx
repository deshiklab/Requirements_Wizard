'use client';

import React, { useState } from 'react';
import { DraftStatus, UserRole } from '@/lib/governance/types';
import {
  submitForReviewAction,
  signOffDraftAction,
  lockSpecificationAction,
  reopenSpecificationAction,
  verifyDraftIntegrityAction,
} from '@/actions/governance';
import { canEditDraft, canLockDraft, canReopenDraft, canSignOff, ROLE_DESCRIPTIONS } from '@/lib/governance/rbac';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface GovernanceBarProps {
  draftId: string;
  status: DraftStatus;
  currentRole: UserRole;
  currentUserId: string;
  currentUserName?: string;
  readinessScore: number;
  sealedChecksum?: string | null;
  onRoleChange: (newRole: UserRole) => void;
  onStatusChange: (newStatus: DraftStatus) => void;
  onOpenAuditTrail?: () => void;
}

export function GovernanceBar({
  draftId,
  status,
  currentRole,
  currentUserId,
  currentUserName = 'Current User',
  readinessScore,
  sealedChecksum,
  onRoleChange,
  onStatusChange,
  onOpenAuditTrail,
}: GovernanceBarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / Form state for Sign-Off
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffName, setSignOffName] = useState(currentUserName);
  const [signOffOrg, setSignOffOrg] = useState('Architecture Review Board');
  const [signOffNotes, setSignOffNotes] = useState('Approved according to IEEE 830 and SDAD standards.');

  // Modal / Form state for Reopen
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Integrity Check State
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<{
    verified: boolean;
    storedChecksum?: string;
    calculatedChecksum: string;
  } | null>(null);

  const roleMeta = ROLE_DESCRIPTIONS[currentRole] || ROLE_DESCRIPTIONS.contributor;
  const isLocked = status === 'locked';
  const isApproved = status === 'approved';

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await submitForReviewAction({
        draftId,
        userId: currentUserId,
        userRole: currentRole,
        readinessScore,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Specification submitted for formal review!' });
        onStatusChange('in_review');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to submit for review.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Submission error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await signOffDraftAction({
        draftId,
        userId: currentUserId,
        userRole: currentRole,
        signOffArchitect: signOffName,
        organization: signOffOrg,
        notes: signOffNotes,
        readinessScore,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: `Approved and signed off by ${signOffName}!` });
        setShowSignOffModal(false);
        onStatusChange('approved');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Sign-off failed.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Sign-off error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLock = async () => {
    const confirm = window.confirm(
      'Are you sure you want to cryptographically lock this specification? It will become IMMUTABLE. Any edits will be blocked until explicitly reopened with an audit justification.'
    );
    if (!confirm) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await lockSpecificationAction({
        draftId,
        userId: currentUserId,
        userRole: currentRole,
        actorName: signOffName || currentUserName,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Specification cryptographically locked and sealed with SHA-256!' });
        onStatusChange('locked');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to lock specification.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Lock error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reopenReason.trim().length < 8) {
      alert('An audit reason of at least 8 characters is strictly required.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await reopenSpecificationAction({
        draftId,
        userId: currentUserId,
        userRole: currentRole,
        actorName: signOffName || currentUserName,
        reason: reopenReason,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: 'Specification reopened for editing.' });
        setShowReopenModal(false);
        setReopenReason('');
        onStatusChange('draft');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reopen specification.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Reopen error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const res = await verifyDraftIntegrityAction(draftId);
      if (res.success && res.data) {
        setIntegrityResult(res.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {/* Immutability Banner if locked */}
      {isLocked && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-lg p-3 text-sm text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Cryptographically Locked & Sealed:</strong> This specification is immutable under SDAD Governance.
              Edits are prohibited without authorized reopening.
            </span>
          </div>

          {sealedChecksum && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono bg-rose-900/50 px-2 py-1 rounded border border-rose-500/30 text-rose-300">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>SHA-256: {sealedChecksum.slice(0, 10)}...</span>
            </div>
          )}
        </div>
      )}

      {/* Main Governance Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Status & Role Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Status:</span>
            {status === 'draft' && (
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-medium">In Draft</Badge>
            )}
            {status === 'in_review' && (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">In Review</Badge>
            )}
            {status === 'approved' && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">Approved</Badge>
            )}
            {status === 'locked' && (
              <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </Badge>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Interactive Role Selector for testing/preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="contributor">Contributor (Author)</option>
              <option value="lead_architect">Lead Architect (Approver)</option>
              <option value="admin">Administrator (Superuser)</option>
              <option value="viewer">Viewer (Read-Only)</option>
            </select>
            <Badge className={`${roleMeta.badgeColor} text-[11px] hidden lg:inline-flex`}>
              {roleMeta.title}
            </Badge>
          </div>
        </div>

        {/* Right: Governance Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Integrity verify button if locked */}
          {sealedChecksum && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyIntegrity}
              disabled={verifying}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
              title="Verify cryptographic SHA-256 seal integrity"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {verifying ? 'Verifying...' : 'Verify Seal'}
            </Button>
          )}

          {/* Submit for Review (Contributor or higher when in draft) */}
          {status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmitForReview}
              disabled={isSubmitting || currentRole === 'viewer'}
              className="border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs h-8"
            >
              <FileCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Submit for Review
            </Button>
          )}

          {/* Sign Off & Approve (Architect / Admin only) */}
          {!isLocked && status !== 'approved' && canSignOff(currentRole) && (
            <Button
              size="sm"
              onClick={() => setShowSignOffModal(true)}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approve & Sign Off
            </Button>
          )}

          {/* Lock Specification (Architect / Admin when approved) */}
          {!isLocked && (status === 'approved' || canLockDraft(currentRole)) && (
            <Button
              size="sm"
              onClick={handleLock}
              disabled={isSubmitting || !canLockDraft(currentRole)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Cryptographically Lock
            </Button>
          )}

          {/* Reopen Specification (Architect / Admin when locked or approved) */}
          {(isLocked || isApproved) && canReopenDraft(currentRole) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReopenModal(true)}
              disabled={isSubmitting}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs h-8"
            >
              <Unlock className="w-3.5 h-3.5 mr-1 text-orange-400" />
              Reopen Draft
            </Button>
          )}

          {/* Open Audit Trail Drawer/Tab CTA */}
          {onOpenAuditTrail && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenAuditTrail}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs h-8"
            >
              <Shield className="w-3.5 h-3.5 mr-1" />
              Audit Trail
            </Button>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-2.5 rounded-lg text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Integrity Verification Result Callout */}
      {integrityResult && (
        <div
          className={`p-3 rounded-lg text-xs border flex items-center justify-between ${
            integrityResult.verified
              ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-200 border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {integrityResult.verified ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            )}
            <div>
              <p className="font-semibold">
                {integrityResult.verified
                  ? 'Cryptographic Document Integrity: VERIFIED'
                  : 'INTEGRITY ALERT: Document has drifted from sealed state!'}
              </p>
              <p className="text-[11px] opacity-80 font-mono mt-0.5">
                Current SHA-256: {integrityResult.calculatedChecksum}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIntegrityResult(null)}
            className="text-slate-400 hover:text-slate-200 text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal: Formal Sign-Off */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-lg text-white">Lead Architect Sign-Off</h3>
              </div>
              <button
                onClick={() => setShowSignOffModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Formally approve this specification draft under SDAD standards. Your signature and readiness score
              will be permanently recorded in the revision audit trail.
            </p>

            <form onSubmit={handleSignOff} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Architect Full Name / Signature</label>
                <input
                  type="text"
                  required
                  value={signOffName}
                  onChange={(e) => setSignOffName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Sarah Chen, Principal Architect"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Governing Body / Organization</label>
                <input
                  type="text"
                  value={signOffOrg}
                  onChange={(e) => setSignOffOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Approval Notes & Guidance</label>
                <textarea
                  rows={3}
                  value={signOffNotes}
                  onChange={(e) => setSignOffNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>Verified Readiness Score:</span>
                <span className="font-bold text-emerald-400">{readinessScore} / 100</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignOffModal(false)}
                  className="border-slate-700 bg-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Confirm & Seal Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reopen Specification */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-lg text-white">Reopen Specification for Editing</h3>
              </div>
              <button
                onClick={() => setShowReopenModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reopening unlocks the specification and reverts its status to editable draft. An audited justification
              is required and will be permanently recorded in the audit trail.
            </p>

            <form onSubmit={handleReopen} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Audit Justification Reason (Min 8 characters)
                </label>
                <textarea
                  required
                  minLength={8}
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Adding HIPAA compliance criteria and updating SLA targets per security review."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReopenModal(false)}
                  className="border-slate-700 bg-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || reopenReason.trim().length < 8}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                >
                  Reopen Specification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
