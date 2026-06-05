import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
      CheckCircle2,
      XCircle,
      AlertTriangle,
      Clock,
      Loader2,
      ChevronDown,
      ChevronUp,
      ExternalLink,
      DollarSign,
      Users,
      Shield,
      Zap,
      BarChart3,
      RefreshCw,
      Send,
      Eye,
      AlertCircle,
      Lock,
      Unlock,
      Ban,
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (aligned to get_job_submissions RPC output)
// ─────────────────────────────────────────────────────────────────────────────

interface Job {
      id: string;
      title: string;
      job_type: string;
      status: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      total_slots: number;
      filled_slots: number;
      expires_at: string;
}

interface FundingCache {
      funded_amount: number;
      reserved_amount: number;
      released_amount: number;
      refunded_amount: number;
      available_amount: number;
      status: string;
}

interface FundingLive {
      available_live: number;
      reserved_live: number;
      released_live: number;
}

interface WorkerProfile {
      first_name: string;
      last_name: string;
      user_id: string;
}

interface ProofItem {
      id: string;
      proof_type: string;
      value: string;
      is_before: boolean;
      display_order: number;
}

interface ProofFlag {
      flag_type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      detail: string;
}

interface ProofRecord {
      id: string;
      worker_social_url: string;
      instructions_seen: boolean;
      submission_gap_secs: number | null;
      is_late: boolean;
      submitted_at: string;
}

interface ApplicationRecord {
      id: string;
      worker_id: string;
      status: string;
      applied_at: string;
      updated_at: string;
}

interface VerificationRecord {
      is_verified: boolean;
      rejection_reason: string | null;
      verified_at: string;
}

interface PaymentRecord {
      id: string;
      amount: number;
      payment_status: string;
      paid_at: string | null;
}

interface Submission {
      application: ApplicationRecord;
      worker_profile: WorkerProfile | null;
      proof: ProofRecord | null;
      proof_items: ProofItem[] | null;
      flags: ProofFlag[] | null;
      verification: VerificationRecord | null;
      payment: PaymentRecord | null;
}

interface PageData {
      job: Job;
      funding: FundingCache;
      funding_live: FundingLive;
      submissions: Submission[];
}

type SubmissionFilter = 'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
      `₦${Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const timeAgo = (iso: string) => {
      const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
      if (secs < 60) return `${secs}s ago`;
      if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
      if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
      return `${Math.floor(secs / 86400)}d ago`;
};

const severityColor: Record<string, string> = {
      HIGH: 'bg-red-50 text-red-700 border-red-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      LOW: 'bg-slate-50 text-slate-600 border-slate-200',
};

const statusConfig: Record<
      string,
      { label: string; color: string; dot: string }
> = {
      SUBMITTED: {
            label: 'Pending Review',
            color: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-400',
      },
      APPROVED: {
            label: 'Approved',
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            dot: 'bg-blue-500',
      },
      REJECTED: {
            label: 'Rejected',
            color: 'bg-red-50 text-red-700 border-red-200',
            dot: 'bg-red-400',
      },
      PAID: {
            label: 'Paid',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            dot: 'bg-emerald-500',
      },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const JobVerification: React.FC = () => {
      const { job_id } = useParams<{ job_id: string }>();
      const navigate = useNavigate();
      const { profile: user } = useAuth();

      const [data, setData] = useState<PageData | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [filter, setFilter] = useState<SubmissionFilter>('SUBMITTED');

      // Bulk selection
      const [selected, setSelected] = useState<Set<string>>(new Set());

      // Per-row action state: { [app_id]: { loading, error } }
      const [rowState, setRowState] = useState<
            Record<string, { loading: boolean; error: string }>
      >({});

      // Bulk action state
      const [bulkLoading, setBulkLoading] = useState(false);
      const [bulkError, setBulkError] = useState('');
      const [rejectReason, setRejectReason] = useState('');
      const [showRejectModal, setShowRejectModal] = useState<
            string | 'BULK' | null
      >(null);

      // ── Load ──────────────────────────────────────────────────────────────────

      const load = useCallback(async () => {
            if (!job_id) return;
            setLoading(true);
            setError('');

            const { data: result, error: rpcError } = await supabase.rpc(
                  'get_job_submissions',
                  { p_job_id: job_id }
            );

            console.log(result);

            if (rpcError) {
                  setError(rpcError.message);
            } else {
                  setData(result as PageData);
            }
            setLoading(false);
      }, [job_id]);

      useEffect(() => {
            load();
      }, [load]);

      // ── Row helpers ───────────────────────────────────────────────────────────

      const setRow = (
            id: string,
            patch: Partial<{ loading: boolean; error: string }>
      ) =>
            setRowState((prev) => ({
                  ...prev,
                  [id]: { ...prev[id], loading: false, error: '', ...patch },
            }));

      // ── Approve single ────────────────────────────────────────────────────────

      const handleApprove = async (appId: string) => {
            setRow(appId, { loading: true, error: '' });
            const { data: res, error: err } = await supabase.rpc(
                  'verify_and_approve',
                  { p_application_id: appId }
            );
            if (err) {
                  setRow(appId, { error: err.message });
                  return;
            }
            setRow(appId, {});
            await load();
      };

      // ── Reject single ─────────────────────────────────────────────────────────

      const handleReject = async (appId: string, reason: string) => {
            setRow(appId, { loading: true, error: '' });
            const { error: err } = await supabase.rpc('verify_and_reject', {
                  p_application_id: appId,
                  p_reason: reason,
            });
            if (err) {
                  setRow(appId, { error: err.message });
                  return;
            }
            setRow(appId, {});
            setShowRejectModal(null);
            setRejectReason('');
            await load();
      };

      // ── Release payment ───────────────────────────────────────────────────────

      const handleRelease = async (appId: string) => {
            setRow(appId, { loading: true, error: '' });
            const { error: err } = await supabase.rpc('release_payment', {
                  p_application_id: appId,
            });
            if (err) {
                  setRow(appId, { error: err.message });
                  return;
            }
            setRow(appId, {});
            await load();
      };

      // ── Bulk approve ──────────────────────────────────────────────────────────

      const handleBulkApprove = async () => {
            if (selected.size === 0) return;
            setBulkLoading(true);
            setBulkError('');
            const { data: res, error: err } = await supabase.rpc(
                  'bulk_verify_applications',
                  {
                        p_application_ids: Array.from(selected),
                        p_action: 'APPROVE',
                  }
            );
            setBulkLoading(false);
            if (err) {
                  setBulkError(err.message);
                  return;
            }
            setSelected(new Set());
            await load();
      };

      // ── Bulk reject ───────────────────────────────────────────────────────────

      const handleBulkReject = async (reason: string) => {
            if (selected.size === 0 || !reason.trim()) return;
            setBulkLoading(true);
            setBulkError('');
            const { error: err } = await supabase.rpc(
                  'bulk_verify_applications',
                  {
                        p_application_ids: Array.from(selected),
                        p_action: 'REJECT',
                        p_reason: reason,
                  }
            );
            setBulkLoading(false);
            if (err) {
                  setBulkError(err.message);
                  return;
            }
            setSelected(new Set());
            setShowRejectModal(null);
            setRejectReason('');
            await load();
      };

      // ── Cancel job ────────────────────────────────────────────────────────────

      const handleCancelJob = async () => {
            if (
                  !window.confirm(
                        'Cancel this job and refund unused escrow to your wallet?'
                  )
            )
                  return;
            const { error: err } = await supabase.rpc('cancel_job_and_refund', {
                  p_job_id: job_id,
            });
            if (err) {
                  setError(err.message);
                  return;
            }
            await load();
      };

      // ── Filtered submissions ──────────────────────────────────────────────────

      const filtered = useMemo(() => {
            if (!data?.submissions) return [];
            if (filter === 'ALL') return data.submissions;
            return data.submissions.filter(
                  (s) => s.application.status === filter
            );
      }, [data, filter]);

      const counts = useMemo(() => {
            if (!data?.submissions) return {} as Record<string, number>;
            return data.submissions.reduce(
                  (acc, s) => {
                        acc[s.application.status] =
                              (acc[s.application.status] ?? 0) + 1;
                        return acc;
                  },
                  {} as Record<string, number>
            );
      }, [data]);

      const pendingCount = counts['SUBMITTED'] ?? 0;

      // ── Select helpers ────────────────────────────────────────────────────────

      const toggleSelect = (id: string) =>
            setSelected((prev) => {
                  const next = new Set(prev);
                  next.has(id) ? next.delete(id) : next.add(id);
                  return next;
            });

      const selectAllVisible = () =>
            setSelected(
                  new Set(
                        filtered
                              .filter(
                                    (s) => s.application.status === 'SUBMITTED'
                              )
                              .map((s) => s.application.id)
                  )
            );

      // ─────────────────────────────────────────────────────────────────────────

      if (loading) return <LoadingPage />;

      if (error && !data)
            return (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
                        <AlertCircle size={40} className="text-red-400" />
                        <p className="text-slate-700 font-semibold">{error}</p>
                        <button
                              onClick={load}
                              className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                        >
                              <RefreshCw size={14} /> Try again
                        </button>
                  </div>
            );

      if (!data) return null;

      const { job, funding, funding_live } = data;
      const canCancel = ['ACTIVE', 'PAUSED'].includes(job.status);

      return (
            <div className="min-h-screen bg-[#F7F8FA] pb-20">
                  <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
                        {/* ── Page header ───────────────────────────────────────────────── */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                          <Link
                                                to="/dashboard/jobs"
                                                className="hover:text-slate-700 transition-colors"
                                          >
                                                My Jobs
                                          </Link>
                                          <span>/</span>
                                          <span className="text-slate-700 font-medium truncate max-w-[200px]">
                                                {job.title}
                                          </span>
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                          {job.title}
                                    </h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                          <JobStatusPill status={job.status} />
                                          <span className="text-xs text-slate-400 font-mono">
                                                {job.id.slice(0, 8)}…
                                          </span>
                                          {pendingCount > 0 && (
                                                <span className="text-xs font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                                                      {pendingCount} pending
                                                      review
                                                </span>
                                          )}
                                    </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                    <button
                                          onClick={load}
                                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                                    >
                                          <RefreshCw size={15} />
                                    </button>
                                    {canCancel && (
                                          <button
                                                onClick={handleCancelJob}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-all"
                                          >
                                                <Ban size={13} /> Cancel Job
                                          </button>
                                    )}
                              </div>
                        </div>

                        {/* ── Escrow panel ──────────────────────────────────────────────── */}
                        <EscrowPanel
                              job={job}
                              funding={funding}
                              live={funding_live}
                        />

                        {/* ── Bulk action bar ───────────────────────────────────────────── */}
                        {selected.size > 0 && (
                              <BulkActionBar
                                    count={selected.size}
                                    loading={bulkLoading}
                                    error={bulkError}
                                    onApprove={handleBulkApprove}
                                    onReject={() => setShowRejectModal('BULK')}
                                    onClear={() => setSelected(new Set())}
                              />
                        )}

                        {/* ── Filter tabs ───────────────────────────────────────────────── */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                              {(
                                    [
                                          'ALL',
                                          'SUBMITTED',
                                          'APPROVED',
                                          'REJECTED',
                                          'PAID',
                                    ] as SubmissionFilter[]
                              ).map((f) => (
                                    <button
                                          key={f}
                                          onClick={() => setFilter(f)}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border
                ${
                      filter === f
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
                                    >
                                          {f === 'ALL'
                                                ? 'All'
                                                : (statusConfig[f]?.label ?? f)}
                                          {f !== 'ALL' && counts[f] ? (
                                                <span
                                                      className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                                                            filter === f
                                                                  ? 'bg-white/20'
                                                                  : 'bg-slate-100 text-slate-600'
                                                      }`}
                                                >
                                                      {counts[f]}
                                                </span>
                                          ) : null}
                                    </button>
                              ))}

                              {/* Select all button — only when viewing SUBMITTED */}
                              {filter === 'SUBMITTED' &&
                                    filtered.length > 0 && (
                                          <button
                                                onClick={selectAllVisible}
                                                className="ml-auto px-3 py-1.5 text-xs font-semibold text-blue-600 hover:underline shrink-0"
                                          >
                                                Select all {filtered.length}
                                          </button>
                                    )}
                        </div>

                        {/* ── Submission list ───────────────────────────────────────────── */}
                        {filtered.length === 0 ? (
                              <EmptyState filter={filter} />
                        ) : (
                              <div className="space-y-3">
                                    {filtered.map((sub) => (
                                          <SubmissionRow
                                                key={sub.application.id}
                                                sub={sub}
                                                job={job}
                                                selected={selected.has(
                                                      sub.application.id
                                                )}
                                                rowLoading={
                                                      rowState[
                                                            sub.application.id
                                                      ]?.loading ?? false
                                                }
                                                rowError={
                                                      rowState[
                                                            sub.application.id
                                                      ]?.error ?? ''
                                                }
                                                onSelect={() =>
                                                      toggleSelect(
                                                            sub.application.id
                                                      )
                                                }
                                                onApprove={() =>
                                                      handleApprove(
                                                            sub.application.id
                                                      )
                                                }
                                                onReject={() =>
                                                      setShowRejectModal(
                                                            sub.application.id
                                                      )
                                                }
                                                onRelease={() =>
                                                      handleRelease(
                                                            sub.application.id
                                                      )
                                                }
                                          />
                                    ))}
                              </div>
                        )}
                  </div>

                  {/* ── Reject modal ──────────────────────────────────────────────────── */}
                  {showRejectModal && (
                        <RejectModal
                              isBulk={showRejectModal === 'BULK'}
                              count={
                                    showRejectModal === 'BULK'
                                          ? selected.size
                                          : 1
                              }
                              reason={rejectReason}
                              setReason={setRejectReason}
                              onConfirm={(reason) => {
                                    if (showRejectModal === 'BULK') {
                                          handleBulkReject(reason);
                                    } else {
                                          handleReject(
                                                showRejectModal as string,
                                                reason
                                          );
                                    }
                              }}
                              onCancel={() => {
                                    setShowRejectModal(null);
                                    setRejectReason('');
                              }}
                        />
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCROW PANEL
// ─────────────────────────────────────────────────────────────────────────────

const EscrowPanel: React.FC<{
      job: Job;
      funding: FundingCache;
      live: FundingLive;
}> = ({ job, funding, live }) => {
      const total = funding.funded_amount;
      const avail = live.available_live;
      const reserved = live.reserved_live;
      const released = live.released_live;

      const pctAvail = total > 0 ? (avail / total) * 100 : 0;
      const pctReserved = total > 0 ? (reserved / total) * 100 : 0;
      const pctReleased = total > 0 ? (released / total) * 100 : 0;

      return (
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
                  </div>

                  <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                              <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
                                          Escrow Balance — Live from Ledger
                                    </p>
                                    <p className="text-3xl font-black font-mono tracking-tight">
                                          {fmt(avail)}
                                          <span className="text-slate-500 text-base font-normal ml-2">
                                                available
                                          </span>
                                    </p>
                              </div>
                              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                                    <Shield
                                          size={13}
                                          className="text-emerald-400"
                                    />
                                    <span className="text-xs text-slate-300 font-semibold">
                                          Escrow Active
                                    </span>
                              </div>
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                    {
                                          label: 'Total Funded',
                                          value: fmt(funding.funded_amount),
                                          sub: `${job.total_slots} slots × ${fmt(job.payout_amount)}`,
                                          accent: 'text-white',
                                    },
                                    {
                                          label: 'Available',
                                          value: fmt(avail),
                                          sub: `${Math.round(pctAvail)}% of escrow`,
                                          accent: 'text-emerald-400',
                                    },
                                    {
                                          label: 'Reserved',
                                          value: fmt(reserved),
                                          sub: `Pending payment · ${Math.round(pctReserved)}%`,
                                          accent: 'text-amber-400',
                                    },
                                    {
                                          label: 'Released',
                                          value: fmt(released),
                                          sub: `Paid to workers · ${Math.round(pctReleased)}%`,
                                          accent: 'text-blue-400',
                                    },
                              ].map(({ label, value, sub, accent }) => (
                                    <div
                                          key={label}
                                          className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1"
                                    >
                                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                                                {label}
                                          </p>
                                          <p
                                                className={`text-base font-black font-mono ${accent}`}
                                          >
                                                {value}
                                          </p>
                                          <p className="text-[10px] text-slate-500 leading-tight">
                                                {sub}
                                          </p>
                                    </div>
                              ))}
                        </div>

                        {/* Stacked bar */}
                        <div className="space-y-2">
                              <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-white/5">
                                    <div
                                          className="bg-blue-500  h-full rounded-l-full transition-all duration-700"
                                          style={{ width: `${pctReleased}%` }}
                                    />
                                    <div
                                          className="bg-amber-400 h-full transition-all duration-700"
                                          style={{ width: `${pctReserved}%` }}
                                    />
                                    <div
                                          className="bg-emerald-500 h-full rounded-r-full transition-all duration-700"
                                          style={{ width: `${pctAvail}%` }}
                                    />
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                    <LegendDot
                                          color="bg-blue-500"
                                          label="Released"
                                    />
                                    <LegendDot
                                          color="bg-amber-400"
                                          label="Reserved"
                                    />
                                    <LegendDot
                                          color="bg-emerald-500"
                                          label="Available"
                                    />
                              </div>
                        </div>

                        {/* Cache drift warning */}
                        {Math.abs(funding.available_amount - avail) > 0.01 && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-start gap-2">
                                    <AlertTriangle
                                          size={14}
                                          className="text-red-400 shrink-0 mt-0.5"
                                    />
                                    <p className="text-xs text-red-300">
                                          Cache drift detected: cached available{' '}
                                          {fmt(funding.available_amount)} vs
                                          live {fmt(avail)}. This resolves
                                          automatically. Contact support if it
                                          persists.
                                    </p>
                              </div>
                        )}
                  </div>
            </div>
      );
};

const LegendDot: React.FC<{ color: string; label: string }> = ({
      color,
      label,
}) => (
      <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
      </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION ROW
// ─────────────────────────────────────────────────────────────────────────────

interface RowProps {
      sub: Submission;
      job: Job;
      selected: boolean;
      rowLoading: boolean;
      rowError: string;
      onSelect: () => void;
      onApprove: () => void;
      onReject: () => void;
      onRelease: () => void;
}

const SubmissionRow: React.FC<RowProps> = ({
      sub,
      job,
      selected,
      rowLoading,
      rowError,
      onSelect,
      onApprove,
      onReject,
      onRelease,
}) => {
      const [expanded, setExpanded] = useState(false);
      const {
            application: app,
            worker_profile: worker,
            proof,
            proof_items,
            flags,
            verification,
            payment,
      } = sub;

      const cfg = statusConfig[app.status] ?? {
            label: app.status,
            color: 'bg-slate-50 text-slate-600 border-slate-200',
            dot: 'bg-slate-400',
      };
      const highFlags = flags?.filter((f) => f.severity === 'HIGH') ?? [];
      const hasFlags = (flags?.length ?? 0) > 0;

      const workerName = worker
            ? `${worker.first_name} ${worker.last_name}`
            : `Worker ${app.worker_id.slice(0, 8)}…`;

      return (
            <div
                  className={`bg-white rounded-2xl border transition-all duration-200
      ${selected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200/80'}
      ${highFlags.length > 0 ? 'border-l-4 border-l-red-400' : ''}
    `}
            >
                  {/* ── Row header ────────────────────────────────────────────────────── */}
                  <div className="flex items-center gap-3 p-4">
                        {/* Checkbox — only for SUBMITTED */}
                        {app.status === 'SUBMITTED' && (
                              <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={onSelect}
                                    className="w-4 h-4 accent-blue-600 shrink-0 cursor-pointer"
                              />
                        )}

                        {/* Worker avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                              {workerName.charAt(0)}
                        </div>

                        {/* Worker info */}
                        <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-slate-900 truncate">
                                          {workerName}
                                    </span>
                                    <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}
                                    >
                                          <span
                                                className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`}
                                          />
                                          {cfg.label}
                                    </span>
                                    {highFlags.length > 0 && (
                                          <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <AlertTriangle size={9} />{' '}
                                                {highFlags.length} HIGH flag
                                                {highFlags.length > 1
                                                      ? 's'
                                                      : ''}
                                          </span>
                                    )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                                    {proof?.worker_social_url && (
                                          <span className="font-mono truncate max-w-[180px]">
                                                {proof.worker_social_url}
                                          </span>
                                    )}
                                    {proof?.submitted_at && (
                                          <span>
                                                {timeAgo(proof.submitted_at)}
                                          </span>
                                    )}
                                    {proof?.is_late && (
                                          <span className="text-red-400 font-semibold">
                                                ⚠ Late
                                          </span>
                                    )}
                                    {proof?.submission_gap_secs !== null &&
                                          proof?.submission_gap_secs !==
                                                undefined && (
                                                <span
                                                      className={
                                                            proof.submission_gap_secs <
                                                            30
                                                                  ? 'text-red-400'
                                                                  : ''
                                                      }
                                                >
                                                      {
                                                            proof.submission_gap_secs
                                                      }
                                                      s gap
                                                </span>
                                          )}
                              </div>
                        </div>

                        {/* Payout amount */}
                        <div className="text-right shrink-0 hidden sm:block">
                              <p className="text-sm font-black text-slate-900 font-mono">
                                    {fmt(job.payout_amount)}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                    {payment?.payment_status ?? 'pending'}
                              </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                              {rowLoading ? (
                                    <Loader2
                                          size={18}
                                          className="animate-spin text-blue-500"
                                    />
                              ) : (
                                    <>
                                          {app.status === 'SUBMITTED' && (
                                                <>
                                                      <ActionButton
                                                            icon={
                                                                  <CheckCircle2
                                                                        size={
                                                                              14
                                                                        }
                                                                  />
                                                            }
                                                            label="Approve"
                                                            variant="approve"
                                                            onClick={onApprove}
                                                      />
                                                      <ActionButton
                                                            icon={
                                                                  <XCircle
                                                                        size={
                                                                              14
                                                                        }
                                                                  />
                                                            }
                                                            label="Reject"
                                                            variant="reject"
                                                            onClick={onReject}
                                                      />
                                                </>
                                          )}
                                          {app.status === 'APPROVED' &&
                                                !job.auto_approve && (
                                                      <ActionButton
                                                            icon={
                                                                  <Send
                                                                        size={
                                                                              14
                                                                        }
                                                                  />
                                                            }
                                                            label="Release"
                                                            variant="release"
                                                            onClick={onRelease}
                                                      />
                                                )}
                                          {app.status === 'PAID' && (
                                                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                                      <CheckCircle2 size={12} />{' '}
                                                      Paid
                                                </span>
                                          )}
                                    </>
                              )}

                              <button
                                    onClick={() => setExpanded((e) => !e)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                              >
                                    {expanded ? (
                                          <ChevronUp size={16} />
                                    ) : (
                                          <ChevronDown size={16} />
                                    )}
                              </button>
                        </div>
                  </div>

                  {/* ── Row error ─────────────────────────────────────────────────────── */}
                  {rowError && (
                        <div className="px-4 pb-2 text-xs text-red-600 bg-red-50 mx-4 mb-2 rounded-xl py-2">
                              {rowError}
                        </div>
                  )}

                  {/* ── Expanded content ──────────────────────────────────────────────── */}
                  {expanded && (
                        <div className="border-t border-slate-100 p-4 space-y-4">
                              {/* Flags */}
                              {hasFlags && (
                                    <div className="space-y-2">
                                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                Auto Flags
                                          </p>
                                          <div className="space-y-1.5">
                                                {flags!.map((f, i) => (
                                                      <div
                                                            key={i}
                                                            className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border text-xs ${severityColor[f.severity]}`}
                                                      >
                                                            <AlertTriangle
                                                                  size={12}
                                                                  className="shrink-0 mt-0.5"
                                                            />
                                                            <div>
                                                                  <span className="font-bold">
                                                                        {f.flag_type.replace(
                                                                              /_/g,
                                                                              ' '
                                                                        )}
                                                                  </span>
                                                                  {f.detail && (
                                                                        <span className="ml-2 opacity-80">
                                                                              {
                                                                                    f.detail
                                                                              }
                                                                        </span>
                                                                  )}
                                                            </div>
                                                            <span className="ml-auto font-bold text-[10px] shrink-0">
                                                                  {f.severity}
                                                            </span>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Proof items */}
                              {proof_items && proof_items.length > 0 && (
                                    <div className="space-y-2">
                                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                Evidence ({proof_items.length}{' '}
                                                item
                                                {proof_items.length > 1
                                                      ? 's'
                                                      : ''}
                                                )
                                          </p>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {proof_items
                                                      .sort(
                                                            (a, b) =>
                                                                  a.display_order -
                                                                  b.display_order
                                                      )
                                                      .map((item) => (
                                                            <ProofItemCard
                                                                  key={item.id}
                                                                  item={item}
                                                            />
                                                      ))}
                                          </div>
                                    </div>
                              )}

                              {/* Verification details */}
                              {verification && (
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                Verification
                                          </p>
                                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                                                <span>
                                                      Decision:{' '}
                                                      <strong>
                                                            {verification.is_verified
                                                                  ? 'Approved'
                                                                  : 'Rejected'}
                                                      </strong>
                                                </span>
                                                <span>
                                                      At:{' '}
                                                      {new Date(
                                                            verification.verified_at
                                                      ).toLocaleString('en-NG')}
                                                </span>
                                                {verification.rejection_reason && (
                                                      <span className="col-span-2 text-red-600">
                                                            Reason:{' '}
                                                            {
                                                                  verification.rejection_reason
                                                            }
                                                      </span>
                                                )}
                                          </div>
                                    </div>
                              )}

                              {/* Payment details */}
                              {payment && (
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                                Payment
                                          </p>
                                          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                                                <span>
                                                      Amount:{' '}
                                                      <strong className="font-mono">
                                                            {fmt(
                                                                  payment.amount
                                                            )}
                                                      </strong>
                                                </span>
                                                <span>
                                                      Status:{' '}
                                                      <strong>
                                                            {
                                                                  payment.payment_status
                                                            }
                                                      </strong>
                                                </span>
                                                {payment.paid_at && (
                                                      <span className="col-span-2">
                                                            Paid at:{' '}
                                                            {new Date(
                                                                  payment.paid_at
                                                            ).toLocaleString(
                                                                  'en-NG'
                                                            )}
                                                      </span>
                                                )}
                                          </div>
                                    </div>
                              )}
                        </div>
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROOF ITEM CARD
// ─────────────────────────────────────────────────────────────────────────────

const ProofItemCard: React.FC<{ item: ProofItem }> = ({ item }) => {
      const isImage = item.proof_type === 'SCREENSHOT';
      const isUrl =
            item.proof_type === 'LINK' ||
            (item.proof_type === 'USERNAME' && item.value.startsWith('http'));

      return (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                  {isImage ? (
                        <div className="relative group">
                              <img
                                    src={item.value}
                                    alt={item.is_before ? 'Before' : 'After'}
                                    className="w-full h-28 object-cover"
                                    onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                                'https://placehold.co/200x112?text=Image';
                                    }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a
                                          href={item.value}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-white"
                                    >
                                          <ExternalLink size={18} />
                                    </a>
                              </div>
                              <div
                                    className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md
            ${item.is_before ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}
                              >
                                    {item.is_before ? 'BEFORE' : 'AFTER'}
                              </div>
                        </div>
                  ) : (
                        <div className="p-3 h-20 flex flex-col justify-between">
                              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                                    {item.proof_type}
                              </span>
                              {isUrl ? (
                                    <a
                                          href={item.value}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-blue-600 font-mono truncate hover:underline flex items-center gap-1"
                                    >
                                          {item.value.slice(0, 30)}…{' '}
                                          <ExternalLink size={10} />
                                    </a>
                              ) : (
                                    <p className="text-xs text-slate-700 font-mono break-all line-clamp-3">
                                          {item.value}
                                    </p>
                              )}
                        </div>
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK ACTION BAR
// ─────────────────────────────────────────────────────────────────────────────

const BulkActionBar: React.FC<{
      count: number;
      loading: boolean;
      error: string;
      onApprove: () => void;
      onReject: () => void;
      onClear: () => void;
}> = ({ count, loading, error, onApprove, onReject, onClear }) => (
      <div className="sticky top-4 z-30 bg-slate-900 text-white rounded-2xl p-4 flex items-center gap-3 shadow-2xl shadow-slate-900/30 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-black">
                        {count}
                  </span>
                  <span className="text-sm font-semibold">selected</span>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex items-center gap-2">
                  {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                  ) : (
                        <>
                              <button
                                    onClick={onApprove}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                    <CheckCircle2 size={13} /> Approve All
                              </button>
                              <button
                                    onClick={onReject}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-bold transition-colors"
                              >
                                    <XCircle size={13} /> Reject All
                              </button>
                        </>
                  )}
                  <button
                        onClick={onClear}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                  >
                        ×
                  </button>
            </div>
      </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// REJECT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const RejectModal: React.FC<{
      isBulk: boolean;
      count: number;
      reason: string;
      setReason: (r: string) => void;
      onConfirm: (r: string) => void;
      onCancel: () => void;
}> = ({ isBulk, count, reason, setReason, onConfirm, onCancel }) => (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                              <XCircle size={20} className="text-red-500" />
                        </div>
                        <div>
                              <h3 className="font-bold text-slate-900">
                                    {isBulk
                                          ? `Reject ${count} submission${count > 1 ? 's' : ''}`
                                          : 'Reject Submission'}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                    A reason is required. The worker will see
                                    this message and may raise a dispute.
                                    Rejected slots are freed — another worker
                                    can claim them.
                              </p>
                        </div>
                  </div>

                  <textarea
                        autoFocus
                        placeholder="e.g. Screenshot does not show the account following, please re-submit."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-400 min-h-[100px] resize-none"
                  />

                  <div className="flex gap-3">
                        <button
                              onClick={onCancel}
                              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                        >
                              Cancel
                        </button>
                        <button
                              onClick={() => onConfirm(reason)}
                              disabled={!reason.trim()}
                              className="flex-1 py-3 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                              Confirm Rejection
                        </button>
                  </div>
            </div>
      </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const ActionButton: React.FC<{
      icon: React.ReactNode;
      label: string;
      variant: 'approve' | 'reject' | 'release';
      onClick: () => void;
}> = ({ icon, label, variant, onClick }) => {
      const styles = {
            approve: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
            reject: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
            release: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      };
      return (
            <button
                  onClick={onClick}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${styles[variant]}`}
            >
                  {icon} {label}
            </button>
      );
};

const JobStatusPill: React.FC<{ status: string }> = ({ status }) => {
      const map: Record<string, string> = {
            ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
            CANCELLED: 'bg-red-50 text-red-600 border-red-200',
            COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
            DRAFT: 'bg-slate-50 text-slate-600 border-slate-200',
      };
      return (
            <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[status] ?? map.DRAFT}`}
            >
                  {status}
            </span>
      );
};

const EmptyState: React.FC<{ filter: SubmissionFilter }> = ({ filter }) => (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Users size={22} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700">No submissions</p>
            <p className="text-xs text-slate-400 text-center max-w-xs">
                  {filter === 'SUBMITTED'
                        ? 'No pending submissions to review right now.'
                        : `No ${filter.toLowerCase()} submissions for this job.`}
            </p>
      </div>
);

const LoadingPage: React.FC = () => (
      <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                  <p className="text-xs text-slate-400">Loading submissions…</p>
            </div>
      </div>
);

export default JobVerification;
