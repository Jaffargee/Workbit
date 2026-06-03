import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
      ArrowLeft,
      Edit3,
      Trash2,
      Pause,
      Play,
      Ban,
      Send,
      DollarSign,
      Users,
      Eye,
      Clock,
      Zap,
      ShieldCheck,
      AlertCircle,
      CheckCircle2,
      Loader2,
      RefreshCw,
      ExternalLink,
      BarChart3,
      Calendar,
      ChevronRight,
      Wallet,
      AlertTriangle,
      Save,
      X,
      Plus,
      Minus,
      ToggleLeft,
      ToggleRight,
      Rocket,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Platform {
      id: string;
      name: string;
      logo_url: string | null;
}

interface Job {
      id: string;
      user_id: string;
      platform_id: string;
      job_type: string;
      status: string;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string | null;
      title: string;
      description: string;
      views_count: number;
      total_slots: number;
      filled_slots: number;
      applications_count: number;
      posted_at: string | null;
      completed_at: string | null;
      expires_at: string | null;
      created_at: string;
      platforms?: Platform;
}

interface Funding {
      funded_amount: number;
      reserved_amount: number;
      released_amount: number;
      refunded_amount: number;
      available_amount: number;
      status: string;
}

interface WalletInfo {
      balance: number;
      currency: string;
      is_frozen: boolean;
}

interface EditForm {
      title: string;
      description: string;
      target_url: string;
      proof_instructions: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      expires_at: string;
}

type PageModal = 'none' | 'edit' | 'fund' | 'unfund' | 'delete' | 'cancel';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
      `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const fmtDate = (iso: string | null) =>
      iso
            ? new Date(iso).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
              })
            : '—';

const toInputDate = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

const JOB_TYPES = ['FOLLOW', 'LIKE', 'COMMENT', 'RETWEET', 'SAVE', 'SHARE'];

const STATUS_CONFIG: Record<
      string,
      { label: string; dot: string; badge: string }
> = {
      DRAFT: {
            label: 'Draft',
            dot: 'bg-slate-400',
            badge: 'bg-slate-50 text-slate-600 border-slate-200',
      },
      PENDING_FUNDING: {
            label: 'Pending Funding',
            dot: 'bg-amber-400',
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      FUNDED: {
            label: 'FUNDED',
            dot: 'bg-emerald-500',
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      PAUSED: {
            label: 'Paused',
            dot: 'bg-indigo-400',
            badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      },
      COMPLETED: {
            label: 'Completed',
            dot: 'bg-blue-500',
            badge: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      EXPIRED: {
            label: 'Expired',
            dot: 'bg-orange-400',
            badge: 'bg-orange-50 text-orange-700 border-orange-200',
      },
      CANCELLED: {
            label: 'Cancelled',
            dot: 'bg-red-400',
            badge: 'bg-red-50 text-red-600 border-red-200',
      },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const JobDir: React.FC = () => {
      const { job_id } = useParams<{ job_id: string }>();
      const navigate = useNavigate();
      const { profile: user } = useAuth();

      const [job, setJob] = useState<Job | null>(null);
      const [funding, setFunding] = useState<Funding | null>(null);
      const [wallet, setWallet] = useState<WalletInfo | null>(null);
      const [platforms, setPlatforms] = useState<Platform[]>([]);

      const [loading, setLoading] = useState(true);
      const [pageError, setPageError] = useState('');
      const [modal, setModal] = useState<PageModal>('none');
      const [actionLoading, setActionLoading] = useState(false);
      const [actionError, setActionError] = useState('');
      const [actionSuccess, setActionSuccess] = useState('');

      // ── Load all page data ────────────────────────────────────────────────────

      const load = useCallback(async () => {
            if (!job_id || !user?.user_id) return;
            setLoading(true);
            setPageError('');

            const [jobRes, platformsRes, walletRes] = await Promise.all([
                  supabase
                        .from('jobs')
                        .select('*, platforms (*)')
                        .eq('id', job_id)
                        .single(),
                  supabase
                        .from('platforms')
                        .select('id, name, logo_url')
                        .eq('is_active', true),
                  supabase
                        .from('wallets')
                        .select('balance, currency, is_frozen')
                        .eq('user_id', user.user_id)
                        .single(),
            ]);

            if (jobRes.error || !jobRes.data) {
                  setPageError('Job not found or you do not have access.');
                  setLoading(false);
                  return;
            }

            const j = jobRes.data as Job;

            // Verify ownership
            if (j.user_id !== user.user_id) {
                  setPageError('Access denied. This is not your job.');
                  setLoading(false);
                  return;
            }

            setJob(j);
            if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);
            if (walletRes.data) setWallet(walletRes.data as WalletInfo);

            // Load funding separately — may not exist for DRAFT jobs
            const { data: fundingData } = await supabase
                  .from('job_funding')
                  .select('*')
                  .eq('job_id', job_id)
                  .maybeSingle();

            console.log(funding);
            

            if (fundingData) setFunding(fundingData as Funding);

            setLoading(false);
      }, [job_id, user?.user_id]);

      useEffect(() => {
            load();
      }, [load]);

      // ── Action: Pause / Resume ────────────────────────────────────────────────

      const handleTogglePause = async () => {
            if (!job) return;
            setActionLoading(true);
            setActionError('');
            const fn = job.status === 'FUNDED' ? 'pause_job' : 'resume_job';
            const { error } = await supabase.rpc(fn, { p_job_id: job.id });
            setActionLoading(false);
            if (error) {
                  setActionError(error.message);
                  return;
            }
            setActionSuccess(
                  job.status === 'FUNDED' ? 'Job paused.' : 'Job resumed.'
            );
            await load();
      };

      // ── Action: Delete (only DRAFT / CANCELLED jobs) ──────────────────────────

      const handleDelete = async () => {
            if (!job) return;
            setActionLoading(true);
            setActionError('');
            const { error } = await supabase
                  .from('jobs')
                  .delete()
                  .eq('id', job.id);
            setActionLoading(false);
            if (error) {
                  setActionError(error.message);
                  return;
            }
            navigate('/dashboard/jobs');
      };

      // ── Action: Cancel + refund ───────────────────────────────────────────────

      const handleCancel = async () => {
            if (!job) return;
            setActionLoading(true);
            setActionError('');
            const { data, error } = await supabase.rpc(
                  'cancel_job_and_refund',
                  { p_job_id: job.id }
            );
            setActionLoading(false);
            if (error) {
                  setActionError(error.message);
                  return;
            }
            setModal('none');
            setActionSuccess(
                  `Job cancelled. ${data?.refund_amount ? fmt(data.refund_amount) + ' refunded to your wallet.' : ''}`
            );
            await load();
      };

      // ── Action: Fund & Launch ─────────────────────────────────────────────────

      const handleFundAndLaunch = async (form: FundLaunchForm) => {
            setActionLoading(true);
            setActionError('');

            const { data, error } = await supabase.rpc(
                  'create_job_with_funding',
                  {
                        p_platform_id: form.platform_id,
                        p_job_type: form.job_type,
                        p_target_url: form.target_url,
                        p_payout_amount: form.payout_amount,
                        p_payout_currency: 'NGN',
                        p_auto_approve: form.auto_approve,
                        p_requires_screenshot: form.requires_screenshot,
                        p_requires_before_proof: form.requires_before_proof,
                        p_proof_instructions: form.proof_instructions,
                        p_title: form.title,
                        p_description: form.description,
                        p_total_slots: form.total_slots,
                        p_expires_at: form.expires_at,
                  }
            );

            setActionLoading(false);

            if (error) {
                  setActionError(error.message);
                  return;
            }

            if (data?.error === 'insufficient_balance') {
                  setActionError(
                        `Insufficient balance. You need ${fmt(data.required)} but only have ${fmt(data.available)}. ` +
                              `Shortfall: ${fmt(data.shortfall)}.`
                  );
                  return;
            }

            if (data?.success) {
                  setModal('none');
                  setActionSuccess(
                        `Job funded and launched! ${fmt(data.escrow_amount)} locked in escrow.`
                  );
                  await load();
            }
      };

      // ── Action: Update job fields ─────────────────────────────────────────────

      const handleUpdate = async (form: EditForm) => {
            if (!job) return;
            setActionLoading(true);
            setActionError('');

            const { error } = await supabase
                  .from('jobs')
                  .update({
                        title: form.title.trim(),
                        description: form.description.trim(),
                        target_url: form.target_url.trim(),
                        proof_instructions: form.proof_instructions.trim(),
                        auto_approve: form.auto_approve,
                        requires_screenshot: form.requires_screenshot,
                        requires_before_proof: form.requires_before_proof,
                        expires_at: form.expires_at || null,
                  })
                  .eq('id', job.id);

            setActionLoading(false);
            if (error) {
                  setActionError(error.message);
                  return;
            }
            setModal('none');
            setActionSuccess('Job updated successfully.');
            await load();
      };

      // ── Derived values ────────────────────────────────────────────────────────

      const progress = job
            ? Math.min(
                    100,
                    (job.filled_slots / Math.max(1, job.total_slots)) * 100
              )
            : 0;

      const canPause = job?.status === 'FUNDED';
      const canResume = job?.status === 'PAUSED';
      const canEdit = job
            ? ['DRAFT', 'PENDING_FUNDING', 'FUNDED', 'PAUSED'].includes(
                    job.status
              )
            : false;
      const canFund = job
            ? ['DRAFT', 'PENDING_FUNDING'].includes(job.status)
            : false;
      const canCancel = job ? ['FUNDED', 'PAUSED'].includes(job.status) : false;
      const canDelete = job
            ? ['DRAFT', 'CANCELLED'].includes(job.status)
            : false;
      const canVerify = job?.status === 'FUNDED' || job?.status === 'PAUSED';

      const escrowPct = {
            available: funding
                  ? (funding.available_amount / funding.funded_amount) * 100
                  : 0,
            reserved: funding
                  ? (funding.reserved_amount / funding.funded_amount) * 100
                  : 0,
            released: funding
                  ? (funding.released_amount / funding.funded_amount) * 100
                  : 0,
      };

      // ─────────────────────────────────────────────────────────────────────────

      if (loading) return <PageSkeleton />;

      if (pageError || !job)
            return (
                  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                        <AlertCircle size={40} className="text-red-400" />
                        <p className="font-semibold text-slate-700">
                              {pageError || 'Job not found.'}
                        </p>
                        <Link
                              to="/dashboard/jobs"
                              className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                        >
                              <ArrowLeft size={14} /> Back to My Jobs
                        </Link>
                  </div>
            );

      const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT;

      return (
            <div className="min-h-screen bg-[#F7F8FA] pb-24">
                  <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">
                        {/* ── Breadcrumb + header ──────────────────────────────────────── */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                          <Link
                                                to="/dashboard/jobs"
                                                className="hover:text-slate-700 transition-colors flex items-center gap-1"
                                          >
                                                <ArrowLeft size={12} /> My Jobs
                                          </Link>
                                          <span>/</span>
                                          <span className="text-slate-700 font-medium truncate max-w-[240px]">
                                                {job.title}
                                          </span>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                                {job.title}
                                          </h1>
                                          <span
                                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusCfg.badge}`}
                                          >
                                                <span
                                                      className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                                                />
                                                {statusCfg.label}
                                          </span>
                                    </div>

                                    <p className="text-xs text-slate-400 font-mono">
                                          ID: {job.id}
                                    </p>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    <button
                                          onClick={load}
                                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
                                    >
                                          <RefreshCw size={15} />
                                    </button>

                                    {canVerify && (
                                          <Link
                                                to={`/dashboard/jobs/${job.id}/verify`}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                                          >
                                                <ShieldCheck size={13} /> Verify
                                                Submissions
                                          </Link>
                                    )}

                                    {canEdit && (
                                          <button
                                                onClick={() => {
                                                      setActionError('');
                                                      setModal('edit');
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                                          >
                                                <Edit3 size={13} /> Edit
                                          </button>
                                    )}

                                    {canFund && (
                                          <button
                                                onClick={() => {
                                                      setActionError('');
                                                      setModal('fund');
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                                          >
                                                <Rocket size={13} /> Fund &
                                                Launch
                                          </button>
                                    )}

                                    {(canPause || canResume) && (
                                          <button
                                                onClick={handleTogglePause}
                                                disabled={actionLoading}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                                          >
                                                {actionLoading ? (
                                                      <Loader2
                                                            size={13}
                                                            className="animate-spin"
                                                      />
                                                ) : canPause ? (
                                                      <>
                                                            <Pause size={13} />{' '}
                                                            Pause
                                                      </>
                                                ) : (
                                                      <>
                                                            <Play size={13} />{' '}
                                                            Resume
                                                      </>
                                                )}
                                          </button>
                                    )}

                                    {canCancel && (
                                          <button
                                                onClick={() => {
                                                      setActionError('');
                                                      setModal('cancel');
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                                          >
                                                <Ban size={13} /> Cancel
                                          </button>
                                    )}

                                    {canDelete && (
                                          <button
                                                onClick={() => {
                                                      setActionError('');
                                                      setModal('delete');
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
                                          >
                                                <Trash2 size={13} /> Delete
                                          </button>
                                    )}
                              </div>
                        </div>

                        {/* ── Feedback banners ─────────────────────────────────────────── */}
                        {actionSuccess && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                                    <CheckCircle2
                                          size={18}
                                          className="text-emerald-500 shrink-0"
                                    />
                                    <p className="text-sm text-emerald-800 font-medium">
                                          {actionSuccess}
                                    </p>
                                    <button
                                          onClick={() => setActionSuccess('')}
                                          className="ml-auto text-emerald-400 hover:text-emerald-700"
                                    >
                                          <X size={14} />
                                    </button>
                              </div>
                        )}
                        {actionError && (
                              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertCircle
                                          size={18}
                                          className="text-red-500 shrink-0 mt-0.5"
                                    />
                                    <p className="text-sm text-red-700">
                                          {actionError}
                                    </p>
                                    <button
                                          onClick={() => setActionError('')}
                                          className="ml-auto text-red-400 hover:text-red-700"
                                    >
                                          <X size={14} />
                                    </button>
                              </div>
                        )}

                        {/* ── Pending funding callout ──────────────────────────────────── */}
                        {job.status === 'PENDING_FUNDING' && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                                          <Wallet
                                                size={18}
                                                className="text-amber-600"
                                          />
                                    </div>
                                    <div className="flex-1">
                                          <p className="font-bold text-amber-900 text-sm">
                                                This job is waiting for funding
                                          </p>
                                          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                                Fund this campaign to make it
                                                visible to workers. You need{' '}
                                                <strong>
                                                      {fmt(
                                                            job.payout_amount *
                                                                  job.total_slots
                                                      )}
                                                </strong>{' '}
                                                in escrow +{' '}
                                                <strong>
                                                      {fmt(
                                                            job.payout_amount *
                                                                  job.total_slots *
                                                                  0.1
                                                      )}
                                                </strong>{' '}
                                                platform fee.
                                                {wallet && (
                                                      <span>
                                                            {' '}
                                                            Your wallet balance:{' '}
                                                            <strong>
                                                                  {fmt(
                                                                        wallet.balance
                                                                  )}
                                                            </strong>
                                                            .
                                                      </span>
                                                )}
                                          </p>
                                    </div>
                                    <button
                                          onClick={() => {
                                                setActionError('');
                                                setModal('fund');
                                          }}
                                          className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all shrink-0"
                                    >
                                          Fund Now
                                    </button>
                              </div>
                        )}

                        {/* ── Main grid ────────────────────────────────────────────────── */}
                        <div className="grid lg:grid-cols-3 gap-6">
                              {/* ── Left: Job details ───────────────────────────────────────── */}
                              <div className="lg:col-span-2 space-y-5">
                                    {/* Core details */}
                                    <Section title="Job Details">
                                          <div className="grid grid-cols-2 gap-4">
                                                <DetailItem
                                                      label="Platform"
                                                      value={
                                                            job.platforms
                                                                  ?.name ?? '—'
                                                      }
                                                />
                                                <DetailItem
                                                      label="Task Type"
                                                      value={job.job_type}
                                                      mono
                                                />
                                                <DetailItem
                                                      label="Target URL"
                                                      value={
                                                            <a
                                                                  href={
                                                                        job.target_url
                                                                  }
                                                                  target="_blank"
                                                                  rel="noreferrer"
                                                                  className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-mono truncate max-w-[200px]"
                                                            >
                                                                  {job.target_url.replace(
                                                                        'https://',
                                                                        ''
                                                                  )}{' '}
                                                                  <ExternalLink
                                                                        size={
                                                                              10
                                                                        }
                                                                  />
                                                            </a>
                                                      }
                                                />
                                                <DetailItem
                                                      label="Created"
                                                      value={fmtDate(
                                                            job.created_at
                                                      )}
                                                />
                                                <DetailItem
                                                      label="Posted"
                                                      value={fmtDate(
                                                            job.posted_at
                                                      )}
                                                />
                                                <DetailItem
                                                      label="Expires"
                                                      value={fmtDate(
                                                            job.expires_at
                                                      )}
                                                />
                                          </div>
                                    </Section>

                                    {/* Description */}
                                    <Section title="Description">
                                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {job.description || (
                                                      <span className="text-slate-400 italic">
                                                            No description
                                                            provided.
                                                      </span>
                                                )}
                                          </p>
                                    </Section>

                                    {/* Proof instructions */}
                                    {job.proof_instructions && (
                                          <Section title="Proof Requirements">
                                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                                                      {job.proof_instructions}
                                                </div>
                                          </Section>
                                    )}

                                    {/* Settings flags */}
                                    <Section title="Settings">
                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {[
                                                      {
                                                            label: 'Auto Approve',
                                                            on: job.auto_approve,
                                                            icon: (
                                                                  <Zap
                                                                        size={
                                                                              13
                                                                        }
                                                                  />
                                                            ),
                                                      },
                                                      {
                                                            label: 'Requires Screenshot',
                                                            on: job.requires_screenshot,
                                                            icon: (
                                                                  <Eye
                                                                        size={
                                                                              13
                                                                        }
                                                                  />
                                                            ),
                                                      },
                                                      {
                                                            label: 'Before & After Proof',
                                                            on: job.requires_before_proof,
                                                            icon: (
                                                                  <ShieldCheck
                                                                        size={
                                                                              13
                                                                        }
                                                                  />
                                                            ),
                                                      },
                                                ].map(({ label, on, icon }) => (
                                                      <div
                                                            key={label}
                                                            className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl border text-xs font-semibold
                    ${on ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                                      >
                                                            {icon}
                                                            <span>{label}</span>
                                                            <span className="ml-auto">
                                                                  {on
                                                                        ? 'ON'
                                                                        : 'OFF'}
                                                            </span>
                                                      </div>
                                                ))}
                                          </div>
                                    </Section>
                              </div>

                              {/* ── Right: Stats + escrow ───────────────────────────────────── */}
                              <div className="space-y-5">
                                    {/* Slot stats */}
                                    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4">
                                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Campaign Stats
                                          </p>

                                          <div className="grid grid-cols-2 gap-3">
                                                {[
                                                      {
                                                            label: 'Total Slots',
                                                            value: job.total_slots,
                                                            accent: 'text-slate-900',
                                                      },
                                                      {
                                                            label: 'Filled',
                                                            value: job.filled_slots,
                                                            accent: 'text-blue-600',
                                                      },
                                                      {
                                                            label: 'Applications',
                                                            value: job.applications_count,
                                                            accent: 'text-indigo-600',
                                                      },
                                                      {
                                                            label: 'Views',
                                                            value: job.views_count,
                                                            accent: 'text-slate-900',
                                                      },
                                                ].map(
                                                      ({
                                                            label,
                                                            value,
                                                            accent,
                                                      }) => (
                                                            <div
                                                                  key={label}
                                                                  className="bg-slate-50 rounded-2xl p-3 border border-slate-100"
                                                            >
                                                                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                                                                        {label}
                                                                  </p>
                                                                  <p
                                                                        className={`text-lg font-black font-mono ${accent}`}
                                                                  >
                                                                        {value}
                                                                  </p>
                                                            </div>
                                                      )
                                                )}
                                          </div>

                                          {/* Progress bar */}
                                          <div className="space-y-1.5">
                                                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                                                      <span>
                                                            Slot utilization
                                                      </span>
                                                      <span>
                                                            {Math.round(
                                                                  progress
                                                            )}
                                                            %
                                                      </span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                      <div
                                                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700"
                                                            style={{
                                                                  width: `${progress}%`,
                                                            }}
                                                      />
                                                </div>
                                          </div>

                                          {/* Payout per slot */}
                                          <div className="pt-1 flex justify-between items-center border-t border-slate-100">
                                                <span className="text-xs text-slate-500">
                                                      Payout per task
                                                </span>
                                                <span className="text-sm font-black font-mono text-slate-900">
                                                      {fmt(job.payout_amount)}
                                                </span>
                                          </div>
                                    </div>

                                    {/* Escrow panel */}
                                    {funding ? (
                                          <EscrowCard
                                                funding={funding}
                                                escrowPct={escrowPct}
                                          />
                                    ) : (
                                          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-6 text-center space-y-3">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                                                      <Wallet
                                                            size={20}
                                                            className="text-slate-400"
                                                      />
                                                </div>
                                                <p className="text-xs font-semibold text-slate-600">
                                                      No Escrow Yet
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                      Fund this job to lock
                                                      escrow and make it live.
                                                </p>
                                                {canFund && (
                                                      <button
                                                            onClick={() =>
                                                                  setModal(
                                                                        'fund'
                                                                  )
                                                            }
                                                            className="w-full py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-all"
                                                      >
                                                            Fund & Launch
                                                      </button>
                                                )}
                                          </div>
                                    )}

                                    {/* Wallet balance */}
                                    {wallet && (
                                          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 flex items-center justify-between">
                                                <div>
                                                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                                                            Your Wallet
                                                      </p>
                                                      <p
                                                            className={`text-xl font-black font-mono ${wallet.is_frozen ? 'text-red-500' : 'text-slate-900'}`}
                                                      >
                                                            {fmt(
                                                                  wallet.balance
                                                            )}
                                                      </p>
                                                      {wallet.is_frozen && (
                                                            <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                                                                  Frozen
                                                            </p>
                                                      )}
                                                </div>
                                                <Link
                                                      to="/dashboard/wallet"
                                                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
                                                >
                                                      Deposit
                                                </Link>
                                          </div>
                                    )}

                                    {/* Quick nav to verification */}
                                    {canVerify && (
                                          <Link
                                                to={`/dashboard/jobs/${job.id}/verify`}
                                                className="flex items-center justify-between bg-slate-900 text-white rounded-3xl p-5 hover:bg-slate-800 transition-all group"
                                          >
                                                <div>
                                                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                                            Submissions
                                                      </p>
                                                      <p className="font-bold text-base">
                                                            Review & Verify
                                                      </p>
                                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                                            Approve, reject,
                                                            release payments
                                                      </p>
                                                </div>
                                                <ChevronRight
                                                      size={20}
                                                      className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                                                />
                                          </Link>
                                    )}
                              </div>
                        </div>
                  </div>

                  {/* ── Modals ───────────────────────────────────────────────────────── */}

                  {modal === 'edit' && (
                        <EditModal
                              job={job}
                              platforms={platforms}
                              loading={actionLoading}
                              error={actionError}
                              onSave={handleUpdate}
                              onClose={() => {
                                    setModal('none');
                                    setActionError('');
                              }}
                        />
                  )}

                  {modal === 'fund' && (
                        <FundLaunchModal
                              job={job}
                              wallet={wallet}
                              loading={actionLoading}
                              error={actionError}
                              onFund={handleFundAndLaunch}
                              onClose={() => {
                                    setModal('none');
                                    setActionError('');
                              }}
                        />
                  )}

                  {modal === 'cancel' && (
                        <ConfirmModal
                              title="Cancel Job & Refund"
                              description={`This will cancel the job and refund ${fmt(funding?.available_amount ?? 0)} to your wallet. Reserved funds (₦${fmt(funding?.reserved_amount ?? 0)}) will settle as pending submissions are reviewed.`}
                              confirmLabel="Yes, Cancel Job"
                              confirmVariant="danger"
                              loading={actionLoading}
                              error={actionError}
                              onConfirm={handleCancel}
                              onClose={() => {
                                    setModal('none');
                                    setActionError('');
                              }}
                        />
                  )}

                  {modal === 'delete' && (
                        <ConfirmModal
                              title="Delete Job"
                              description="This will permanently delete the job and all associated data. This cannot be undone."
                              confirmLabel="Delete Permanently"
                              confirmVariant="danger"
                              loading={actionLoading}
                              error={actionError}
                              onConfirm={handleDelete}
                              onClose={() => {
                                    setModal('none');
                                    setActionError('');
                              }}
                        />
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCROW CARD
// ─────────────────────────────────────────────────────────────────────────────

const EscrowCard: React.FC<{
      funding: Funding;
      escrowPct: { available: number; reserved: number; released: number };
}> = ({ funding, escrowPct }) => (
      <div className="bg-slate-900 rounded-3xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Escrow
                  </p>
                  <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
        ${
              funding.status === 'FUNDED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : funding.status === 'DEPLETED'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-700 text-slate-400'
        }`}
                  >
                        {funding.status}
                  </span>
            </div>

            <div>
                  <p className="text-2xl font-black font-mono">
                        {fmt(funding.available_amount)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                        available of {fmt(funding.funded_amount)}
                  </p>
            </div>

            {/* Stacked bar */}
            <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/10 flex gap-0.5">
                  <div
                        className="bg-blue-500 h-full rounded-l-full transition-all"
                        style={{ width: `${escrowPct.released}%` }}
                  />
                  <div
                        className="bg-amber-400 h-full transition-all"
                        style={{ width: `${escrowPct.reserved}%` }}
                  />
                  <div
                        className="bg-emerald-500 h-full rounded-r-full transition-all"
                        style={{ width: `${escrowPct.available}%` }}
                  />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                        {
                              label: 'Available',
                              value: fmt(funding.available_amount),
                              color: 'text-emerald-400',
                        },
                        {
                              label: 'Reserved',
                              value: fmt(funding.reserved_amount),
                              color: 'text-amber-400',
                        },
                        {
                              label: 'Released',
                              value: fmt(funding.released_amount),
                              color: 'text-blue-400',
                        },
                  ].map(({ label, value, color }) => (
                        <div key={label}>
                              <p
                                    className={`text-xs font-black font-mono ${color}`}
                              >
                                    {value}
                              </p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">
                                    {label}
                              </p>
                        </div>
                  ))}
            </div>
      </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// FUND & LAUNCH MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface FundLaunchForm {
      platform_id: string;
      job_type: string;
      target_url: string;
      payout_amount: number;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      total_slots: number;
      expires_at: string;
}

const FundLaunchModal: React.FC<{
      job: Job;
      wallet: WalletInfo | null;
      loading: boolean;
      error: string;
      onFund: (f: FundLaunchForm) => void;
      onClose: () => void;
}> = ({ job, wallet, loading, error, onFund, onClose }) => {
      const [form, setForm] = useState<FundLaunchForm>({
            platform_id: job.platform_id,
            job_type: job.job_type,
            target_url: job.target_url,
            payout_amount: job.payout_amount,
            auto_approve: job.auto_approve,
            requires_screenshot: job.requires_screenshot,
            requires_before_proof: job.requires_before_proof,
            proof_instructions: job.proof_instructions ?? '',
            title: job.title,
            description: job.description,
            total_slots: job.total_slots,
            expires_at:
                  toInputDate(job.expires_at) ||
                  toInputDate(
                        new Date(Date.now() + 7 * 86400000).toISOString()
                  ),
      });

      const escrow = form.payout_amount * form.total_slots;
      const fee = Math.round(escrow * 0.1 * 100) / 100;
      const total = escrow + fee;
      const shortfall = wallet ? Math.max(0, total - wallet.balance) : 0;
      const canAfford = wallet ? wallet.balance >= total : false;

      const set =
            (f: keyof FundLaunchForm) =>
            (
                  e: React.ChangeEvent<
                        | HTMLInputElement
                        | HTMLTextAreaElement
                        | HTMLSelectElement
                  >
            ) =>
                  setForm((prev) => ({ ...prev, [f]: e.target.value }));

      const setNum =
            (f: keyof FundLaunchForm) =>
            (e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({
                        ...prev,
                        [f]: Math.max(1, parseInt(e.target.value) || 1),
                  }));

      const setToggle = (f: keyof FundLaunchForm) => () =>
            setForm((prev) => ({
                  ...prev,
                  [f]: !prev[f as keyof FundLaunchForm],
            }));

      return (
            <Modal onClose={onClose} title="Fund & Launch Campaign" wide>
                  <div className="space-y-6">
                        {/* Wallet balance check */}
                        <div
                              className={`rounded-2xl p-4 flex items-center justify-between gap-4 border
          ${canAfford ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                        >
                              <div>
                                    <p
                                          className={`text-xs font-bold ${canAfford ? 'text-emerald-800' : 'text-red-800'}`}
                                    >
                                          {canAfford
                                                ? 'Wallet balance sufficient'
                                                : 'Insufficient wallet balance'}
                                    </p>
                                    <p
                                          className={`text-[11px] mt-0.5 ${canAfford ? 'text-emerald-600' : 'text-red-600'}`}
                                    >
                                          Balance:{' '}
                                          <strong>
                                                {fmt(wallet?.balance ?? 0)}
                                          </strong>
                                          {!canAfford && (
                                                <>
                                                      {' '}
                                                      · Shortfall:{' '}
                                                      <strong>
                                                            {fmt(shortfall)}
                                                      </strong>
                                                </>
                                          )}
                                    </p>
                              </div>
                              {!canAfford && (
                                    <Link
                                          to="/dashboard/wallet"
                                          className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shrink-0"
                                    >
                                          Deposit
                                    </Link>
                              )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                              {/* Slots */}
                              <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                          Worker Slots
                                    </label>
                                    <div className="flex items-center gap-2">
                                          <button
                                                type="button"
                                                onClick={() =>
                                                      setForm((p) => ({
                                                            ...p,
                                                            total_slots:
                                                                  Math.max(
                                                                        1,
                                                                        p.total_slots -
                                                                              1
                                                                  ),
                                                      }))
                                                }
                                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                          >
                                                <Minus size={14} />
                                          </button>
                                          <input
                                                type="number"
                                                value={form.total_slots}
                                                onChange={setNum('total_slots')}
                                                min={1}
                                                className="flex-1 text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500"
                                          />
                                          <button
                                                type="button"
                                                onClick={() =>
                                                      setForm((p) => ({
                                                            ...p,
                                                            total_slots:
                                                                  p.total_slots +
                                                                  1,
                                                      }))
                                                }
                                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                          >
                                                <Plus size={14} />
                                          </button>
                                    </div>
                              </div>

                              {/* Payout */}
                              <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">
                                          Payout per Task (₦)
                                    </label>
                                    <div className="flex items-center gap-2">
                                          <button
                                                type="button"
                                                onClick={() =>
                                                      setForm((p) => ({
                                                            ...p,
                                                            payout_amount:
                                                                  Math.max(
                                                                        50,
                                                                        p.payout_amount -
                                                                              50
                                                                  ),
                                                      }))
                                                }
                                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                          >
                                                <Minus size={14} />
                                          </button>
                                          <input
                                                type="number"
                                                value={form.payout_amount}
                                                onChange={setNum(
                                                      'payout_amount'
                                                )}
                                                min={50}
                                                className="flex-1 text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500"
                                          />
                                          <button
                                                type="button"
                                                onClick={() =>
                                                      setForm((p) => ({
                                                            ...p,
                                                            payout_amount:
                                                                  p.payout_amount +
                                                                  50,
                                                      }))
                                                }
                                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                          >
                                                <Plus size={14} />
                                          </button>
                                    </div>
                              </div>
                        </div>

                        {/* Expires at */}
                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Campaign Expiry
                              </label>
                              <input
                                    type="datetime-local"
                                    value={form.expires_at}
                                    onChange={set('expires_at')}
                                    min={new Date().toISOString().slice(0, 16)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                              />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2.5">
                              {(
                                    [
                                          {
                                                key: 'auto_approve',
                                                label: 'Auto-approve submissions',
                                                sub: 'Release payment immediately on submission',
                                          },
                                          {
                                                key: 'requires_screenshot',
                                                label: 'Require screenshot proof',
                                                sub: 'Workers must upload a screenshot',
                                          },
                                          {
                                                key: 'requires_before_proof',
                                                label: 'Require before & after screenshots',
                                                sub: 'Workers must show state before the task',
                                          },
                                    ] as {
                                          key: keyof FundLaunchForm;
                                          label: string;
                                          sub: string;
                                    }[]
                              ).map(({ key, label, sub }) => (
                                    <div
                                          key={key}
                                          onClick={setToggle(key)}
                                          className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border cursor-pointer transition-all
                ${form[key] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                          <div>
                                                <p className="text-xs font-bold text-slate-800">
                                                      {label}
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                      {sub}
                                                </p>
                                          </div>
                                          <div
                                                className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5
                ${form[key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                                          >
                                                <div
                                                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all
                  ${form[key] ? 'translate-x-4' : 'translate-x-0'}`}
                                                />
                                          </div>
                                    </div>
                              ))}
                        </div>

                        {/* Cost breakdown */}
                        <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Cost Breakdown
                              </p>
                              <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-300">
                                          <span>
                                                {form.total_slots} slots ×{' '}
                                                {fmt(form.payout_amount)}
                                          </span>
                                          <span className="font-mono font-bold">
                                                {fmt(escrow)}
                                          </span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                          <span>Platform fee (10%)</span>
                                          <span className="font-mono font-bold">
                                                {fmt(fee)}
                                          </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-700 text-base font-black">
                                          <span>Total Charged</span>
                                          <span
                                                className={`font-mono ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}
                                          >
                                                {fmt(total)}
                                          </span>
                                    </div>
                              </div>
                        </div>

                        {error && (
                              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-start gap-2">
                                    <AlertCircle
                                          size={14}
                                          className="text-red-500 shrink-0 mt-0.5"
                                    />
                                    <p className="text-xs text-red-700">
                                          {error}
                                    </p>
                              </div>
                        )}

                        <div className="flex gap-3">
                              <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                              >
                                    Cancel
                              </button>
                              <button
                                    onClick={() => onFund(form)}
                                    disabled={loading || !canAfford}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-full font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                    {loading ? (
                                          <>
                                                <Loader2
                                                      size={16}
                                                      className="animate-spin"
                                                />{' '}
                                                Processing…
                                          </>
                                    ) : (
                                          <>
                                                <Rocket size={16} /> Fund &
                                                Launch
                                          </>
                                    )}
                              </button>
                        </div>
                  </div>
            </Modal>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const EditModal: React.FC<{
      job: Job;
      platforms: Platform[];
      loading: boolean;
      error: string;
      onSave: (f: EditForm) => void;
      onClose: () => void;
}> = ({ job, platforms, loading, error, onSave, onClose }) => {
      const [form, setForm] = useState<EditForm>({
            title: job.title,
            description: job.description,
            target_url: job.target_url,
            proof_instructions: job.proof_instructions ?? '',
            auto_approve: job.auto_approve,
            requires_screenshot: job.requires_screenshot,
            requires_before_proof: job.requires_before_proof,
            expires_at: toInputDate(job.expires_at),
      });

      const set =
            (f: keyof EditForm) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setForm((prev) => ({ ...prev, [f]: e.target.value }));

      const setToggle = (f: keyof EditForm) => () =>
            setForm((prev) => ({ ...prev, [f]: !prev[f as keyof EditForm] }));

      return (
            <Modal onClose={onClose} title="Edit Job" wide>
                  <div className="space-y-4">
                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Title
                              </label>
                              <input
                                    value={form.title}
                                    onChange={set('title')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                              />
                        </div>

                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Target URL
                              </label>
                              <input
                                    type="url"
                                    value={form.target_url}
                                    onChange={set('target_url')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-500"
                              />
                        </div>

                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Description
                              </label>
                              <textarea
                                    value={form.description}
                                    onChange={set('description')}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                              />
                        </div>

                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Proof Instructions
                              </label>
                              <textarea
                                    value={form.proof_instructions}
                                    onChange={set('proof_instructions')}
                                    rows={2}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                              />
                        </div>

                        <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700">
                                    Expiry Date
                              </label>
                              <input
                                    type="datetime-local"
                                    value={form.expires_at}
                                    onChange={set('expires_at')}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                              />
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                              {(
                                    [
                                          {
                                                key: 'auto_approve',
                                                label: 'Auto-approve',
                                          },
                                          {
                                                key: 'requires_screenshot',
                                                label: 'Require Screenshot',
                                          },
                                          {
                                                key: 'requires_before_proof',
                                                label: 'Before & After Proof',
                                          },
                                    ] as {
                                          key: keyof EditForm;
                                          label: string;
                                    }[]
                              ).map(({ key, label }) => (
                                    <div
                                          key={key}
                                          onClick={setToggle(key)}
                                          className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all
                ${form[key] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                                    >
                                          <span className="text-xs font-semibold text-slate-700">
                                                {label}
                                          </span>
                                          <div
                                                className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all ${form[key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                                          >
                                                <div
                                                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form[key] ? 'translate-x-4' : ''}`}
                                                />
                                          </div>
                                    </div>
                              ))}
                        </div>

                        {error && (
                              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                                    {error}
                              </div>
                        )}

                        <div className="flex gap-3 pt-1">
                              <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                              >
                                    Cancel
                              </button>
                              <button
                                    onClick={() => onSave(form)}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                    {loading ? (
                                          <>
                                                <Loader2
                                                      size={16}
                                                      className="animate-spin"
                                                />{' '}
                                                Saving…
                                          </>
                                    ) : (
                                          <>
                                                <Save size={16} /> Save Changes
                                          </>
                                    )}
                              </button>
                        </div>
                  </div>
            </Modal>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL (cancel / delete)
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal: React.FC<{
      title: string;
      description: string;
      confirmLabel: string;
      confirmVariant: 'danger' | 'warning';
      loading: boolean;
      error: string;
      onConfirm: () => void;
      onClose: () => void;
}> = ({
      title,
      description,
      confirmLabel,
      confirmVariant,
      loading,
      error,
      onConfirm,
      onClose,
}) => (
      <Modal onClose={onClose} title={title}>
            <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                        {description}
                  </p>
                  {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                              {error}
                        </div>
                  )}
                  <div className="flex gap-3">
                        <button
                              onClick={onClose}
                              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold text-sm hover:bg-slate-200 transition-colors"
                        >
                              Go Back
                        </button>
                        <button
                              onClick={onConfirm}
                              disabled={loading}
                              className={`flex-1 py-3 text-white rounded-full font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2
            ${confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                        >
                              {loading ? (
                                    <Loader2
                                          size={16}
                                          className="animate-spin"
                                    />
                              ) : (
                                    confirmLabel
                              )}
                        </button>
                  </div>
            </div>
      </Modal>
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MODAL WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

const Modal: React.FC<{
      title: string;
      wide?: boolean;
      onClose: () => void;
      children: React.ReactNode;
}> = ({ title, wide, onClose, children }) => (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                  className={`bg-white rounded-3xl shadow-2xl w-full animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]
        ${wide ? 'max-w-lg' : 'max-w-md'}`}
            >
                  <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                        <h3 className="font-bold text-slate-900 text-base">
                              {title}
                        </h3>
                        <button
                              onClick={onClose}
                              className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                        >
                              <X size={15} />
                        </button>
                  </div>
                  <div className="p-6 overflow-y-auto">{children}</div>
            </div>
      </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
      title,
      children,
}) => (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {title}
            </p>
            {children}
      </div>
);

const DetailItem: React.FC<{
      label: string;
      value: React.ReactNode;
      mono?: boolean;
}> = ({ label, value, mono }) => (
      <div className="space-y-0.5">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {label}
            </p>
            <p
                  className={`text-sm text-slate-800 font-semibold ${mono ? 'font-mono' : ''}`}
            >
                  {value}
            </p>
      </div>
);

const PageSkeleton: React.FC = () => (
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded-xl w-64" />
            <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-5">
                        {[120, 80, 60].map((h) => (
                              <div
                                    key={h}
                                    className="bg-white rounded-3xl border border-slate-100 p-6"
                              >
                                    <div className="space-y-3">
                                          <div className="h-3 bg-slate-100 rounded w-24" />
                                          <div
                                                className={`h-${Math.round(h / 8)} bg-slate-100 rounded`}
                                          />
                                    </div>
                              </div>
                        ))}
                  </div>
                  <div className="space-y-5">
                        <div className="h-48 bg-slate-200 rounded-3xl" />
                        <div className="h-40 bg-slate-900/10 rounded-3xl" />
                  </div>
            </div>
      </div>
);

export default JobDir;
