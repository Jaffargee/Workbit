import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
      CheckmarkCircleRegular,
      DismissCircleRegular,
      WarningRegular,
      ClockRegular,
      ChevronDownRegular,
      ChevronUpRegular,
      OpenRegular,
      MoneyRegular,
      PeopleRegular,
      ShieldRegular,
      FlashRegular,
      ArrowClockwiseRegular,
      SendRegular,
      EyeRegular,
      ErrorCircleRegular,
      LockClosedRegular,
      LockOpenRegular,
      ProhibitedRegular,
      CheckmarkRegular,
      DismissRegular,
} from '@fluentui/react-icons';
import {
      makeStyles,
      shorthands,
      tokens,
      Text,
      Button,
      Badge,
      ProgressBar,
      Spinner,
      Checkbox,
      Textarea,
      mergeClasses,
      Dialog,
      DialogSurface,
      DialogBody,
      DialogTitle,
      DialogContent,
      DialogActions,
} from '@fluentui/react-components';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
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
      if (secs < 60)    return `${secs}s ago`;
      if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`;
      if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
      return `${Math.floor(secs / 86400)}d ago`;
};

interface StatusCfg { label: string; badgeColor: 'warning' | 'informative' | 'danger' | 'success' | 'subtle'; dotColor: string }
const statusConfig: Record<string, StatusCfg> = {
      SUBMITTED: { label: 'Pending Review', badgeColor: 'warning',     dotColor: '#f59e0b' },
      APPROVED:  { label: 'Approved',       badgeColor: 'informative', dotColor: '#3b82f6' },
      REJECTED:  { label: 'Rejected',       badgeColor: 'danger',      dotColor: '#f87171' },
      PAID:      { label: 'Paid',           badgeColor: 'success',     dotColor: '#22c55e' },
};

const flagSeverityStyle: Record<string, { bg: string; border: string; color: string }> = {
      HIGH:   { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
      MEDIUM: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
      LOW:    { bg: tokens.colorNeutralBackground2, border: tokens.colorNeutralStroke1, color: tokens.colorNeutralForeground3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      page: {
            minHeight: '100vh',
            backgroundColor: '#F7F8FA',
            paddingBottom: '80px',
      },
      container: {
            maxWidth: '1152px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: tokens.spacingHorizontalL,
            paddingRight: tokens.spacingHorizontalL,
            paddingTop: tokens.spacingVerticalXXL,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      // ── Header ──────────────────────────────────────────────────────────────
      pageHeader: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
            '@media (min-width: 640px)': {
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
            },
      },
      breadcrumb: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            marginBottom: tokens.spacingVerticalS,
      },
      titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalS,
            flexWrap: 'wrap',
      },
      pendingPill: {
            backgroundColor: '#f59e0b',
            color: '#fff',
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightBold,
            ...shorthands.padding('2px', '10px'),
            ...shorthands.borderRadius('999px'),
            animationName: { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } },
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
      },
      headerActions: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            flexShrink: 0,
      },
      // ── Escrow panel ────────────────────────────────────────────────────────
      escrowPanel: {
            backgroundColor: '#0f172a',
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingVerticalXL),
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
      },
      escrowInner: {
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      escrowTopRow: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: tokens.spacingHorizontalM,
      },
      escrowBreakdownGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
            '@media (min-width: 640px)': { gridTemplateColumns: 'repeat(4, 1fr)' },
      },
      escrowCell: {
            backgroundColor: 'rgba(255,255,255,0.05)',
            ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },
      escrowBar: {
            display: 'flex',
            gap: '2px',
            height: '8px',
            width: '100%',
            ...shorthands.borderRadius('999px'),
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.06)',
      },
      escrowLegend: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalL,
            fontSize: tokens.fontSizeBase200,
            color: '#94a3b8',
      },
      driftWarning: {
            backgroundColor: 'rgba(239,68,68,0.1)',
            ...shorthands.border('1px', 'solid', 'rgba(239,68,68,0.2)'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalXS,
      },
      // ── Bulk bar ─────────────────────────────────────────────────────────
      bulkBar: {
            position: 'sticky',
            top: 16,
            zIndex: 30,
            backgroundColor: '#0f172a',
            color: '#fff',
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            boxShadow: tokens.shadow64,
      },
      countBadge: {
            width: '24px',
            height: '24px',
            backgroundColor: tokens.colorBrandBackground,
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightBold,
            color: '#fff',
      },
      // ── Filter tabs ──────────────────────────────────────────────────────
      filterRow: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            overflowX: 'auto',
            paddingBottom: 4,
      },
      filterTab: {
            ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
            backgroundColor: tokens.colorNeutralBackground1,
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.15s',
      },
      filterTabActive: {
            backgroundColor: '#0f172a',
            color: '#fff',
            borderColor: '#0f172a',
      },
      filterTabCount: {
            ...shorthands.padding('1px', '6px'),
            ...shorthands.borderRadius(tokens.borderRadiusSmall),
            fontSize: tokens.fontSizeBase200,
            marginLeft: 4,
      },
      filterTabCountActive: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#fff',
      },
      filterTabCountInactive: {
            backgroundColor: tokens.colorNeutralBackground2,
            color: tokens.colorNeutralForeground3,
      },
      // ── Submission row ───────────────────────────────────────────────────
      submissionRow: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            transition: 'border-color 0.2s',
            overflow: 'hidden',
      },
      submissionRowSelected: {
            borderColor: tokens.colorBrandStroke1,
            outline: `2px solid ${tokens.colorBrandBackgroundInverted}`,
            outlineOffset: '-2px',
      },
      submissionRowFlagged: {
            borderLeftWidth: '4px',
            borderLeftColor: tokens.colorStatusDangerBorder1,
            borderLeftStyle: 'solid',
      },
      rowHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
      },
      workerAvatar: {
            width: '36px',
            height: '36px',
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightBold,
            flexShrink: 0,
      },
      workerInfo: { flex: 1, minWidth: 0 },
      workerNameRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS, flexWrap: 'wrap' },
      workerMetaRow: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, marginTop: 2, fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 },
      payoutCol: { textAlign: 'right', flexShrink: 0, display: 'none', '@media (min-width: 640px)': { display: 'block' } },
      actionCol: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXS, flexShrink: 0 },
      rowError: {
            marginLeft: tokens.spacingHorizontalL,
            marginRight: tokens.spacingHorizontalL,
            marginBottom: tokens.spacingVerticalS,
            backgroundColor: tokens.colorStatusDangerBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorStatusDangerBorder1),
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorStatusDangerForeground3,
      },
      expandedContent: {
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
      },
      // ── Proof items ──────────────────────────────────────────────────────
      proofGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
            '@media (min-width: 640px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
      },
      proofCard: {
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            overflow: 'hidden',
            backgroundColor: tokens.colorNeutralBackground1,
      },
      proofCardText: {
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
      },
      // ── Sub-section cards ─────────────────────────────────────────────────
      infoCard: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      infoCardGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalM,
            marginTop: tokens.spacingVerticalXS,
      },
      // ── Flag rows ─────────────────────────────────────────────────────────
      flagRow: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalS,
            ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', 'transparent'),
            fontSize: tokens.fontSizeBase200,
      },
      // ── Empty state ───────────────────────────────────────────────────────
      emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '80px',
            paddingBottom: '80px',
            gap: tokens.spacingVerticalM,
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
      },
      emptyIcon: {
            width: '56px',
            height: '56px',
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorNeutralForeground3,
      },
      // ── Modal ─────────────────────────────────────────────────────────────
      rejectIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: '#fef2f2',
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#dc2626',
      },
      // ── Action button ────────────────────────────────────────────────────
      actionBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            ...shorthands.padding('4px', '10px'),
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', 'transparent'),
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
      },
      approveBtn: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' },
      rejectBtn:  { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' },
      releaseBtn: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' },
      // ── Loading ───────────────────────────────────────────────────────────
      loadingPage: {
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
      },
      errorState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: tokens.spacingVerticalM,
      },
      mono: { fontFamily: tokens.fontFamilyMonospace },
      sectionLabel: {
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightBold,
      },
      fullWidth: { width: '100%' },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const JobVerification: React.FC = () => {
      const { job_id } = useParams<{ job_id: string }>();
      const navigate = useNavigate();
      const { profile: user } = useAuth();
      const styles = useStyles();

      const [data, setData] = useState<PageData | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState('');
      const [filter, setFilter] = useState<SubmissionFilter>('SUBMITTED');

      const [selected, setSelected] = useState<Set<string>>(new Set());
      const [rowState, setRowState] = useState<Record<string, { loading: boolean; error: string }>>({});
      const [bulkLoading, setBulkLoading] = useState(false);
      const [bulkError, setBulkError] = useState('');
      const [rejectReason, setRejectReason] = useState('');
      const [showRejectModal, setShowRejectModal] = useState<string | 'BULK' | null>(null);

      const load = useCallback(async () => {
            if (!job_id) return;
            setLoading(true); setError('');
            const { data: result, error: rpcError } = await supabase.rpc('get_job_submissions', { p_job_id: job_id });
            if (rpcError) setError(rpcError.message);
            else setData(result as PageData);
            setLoading(false);
      }, [job_id]);

      useEffect(() => { load(); }, [load]);

      const setRow = (id: string, patch: Partial<{ loading: boolean; error: string }>) =>
            setRowState(prev => ({ ...prev, [id]: { ...prev[id], loading: false, error: '', ...patch } }));

      const handleApprove = async (appId: string) => {
            setRow(appId, { loading: true, error: '' });
            const { error: err } = await supabase.rpc('verify_and_approve', { p_application_id: appId });
            if (err) { setRow(appId, { error: err.message }); return; }
            setRow(appId, {}); await load();
      };

      const handleReject = async (appId: string, reason: string) => {
            setRow(appId, { loading: true, error: '' });
            const { error: err } = await supabase.rpc('verify_and_reject', { p_application_id: appId, p_reason: reason });
            if (err) { setRow(appId, { error: err.message }); return; }
            setRow(appId, {}); setShowRejectModal(null); setRejectReason(''); await load();
      };

      const handleRelease = async (appId: string) => {
            setRow(appId, { loading: true, error: '' });
            const { error: err } = await supabase.rpc('release_payment', { p_application_id: appId });
            if (err) { setRow(appId, { error: err.message }); return; }
            setRow(appId, {}); await load();
      };

      const handleBulkApprove = async () => {
            if (selected.size === 0) return;
            setBulkLoading(true); setBulkError('');
            const { error: err } = await supabase.rpc('bulk_verify_applications', { p_application_ids: Array.from(selected), p_action: 'APPROVE' });
            setBulkLoading(false);
            if (err) { setBulkError(err.message); return; }
            setSelected(new Set()); await load();
      };

      const handleBulkReject = async (reason: string) => {
            if (selected.size === 0 || !reason.trim()) return;
            setBulkLoading(true); setBulkError('');
            const { error: err } = await supabase.rpc('bulk_verify_applications', { p_application_ids: Array.from(selected), p_action: 'REJECT', p_reason: reason });
            setBulkLoading(false);
            if (err) { setBulkError(err.message); return; }
            setSelected(new Set()); setShowRejectModal(null); setRejectReason(''); await load();
      };

      const handleCancelJob = async () => {
            if (!window.confirm('Cancel this job and refund unused escrow to your wallet?')) return;
            const { error: err } = await supabase.rpc('cancel_job_and_refund', { p_job_id: job_id });
            if (err) { setError(err.message); return; }
            await load();
      };

      const filtered = useMemo(() => {
            if (!data?.submissions) return [];
            if (filter === 'ALL') return data.submissions;
            return data.submissions.filter(s => s.application.status === filter);
      }, [data, filter]);

      const counts = useMemo(() => {
            if (!data?.submissions) return {} as Record<string, number>;
            return data.submissions.reduce((acc, s) => {
                  acc[s.application.status] = (acc[s.application.status] ?? 0) + 1;
                  return acc;
            }, {} as Record<string, number>);
      }, [data]);

      const pendingCount = counts['SUBMITTED'] ?? 0;

      const toggleSelect = (id: string) =>
            setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

      const selectAllVisible = () =>
            setSelected(new Set(filtered.filter(s => s.application.status === 'SUBMITTED').map(s => s.application.id)));

      if (loading) return <LoadingPage />;

      if (error && !data) return (
            <div className={styles.errorState}>
                  <ErrorCircleRegular fontSize={40} style={{ color: tokens.colorStatusDangerForeground3 }} />
                  <Text weight="semibold" size={400}>{error}</Text>
                  <Button appearance="transparent" icon={<ArrowClockwiseRegular />} onClick={load}>Try again</Button>
            </div>
      );

      if (!data) return null;

      const { job, funding, funding_live } = data;
      const canCancel = ['ACTIVE', 'PAUSED'].includes(job.status);

      return (
            <div className={styles.page}>
                  <div className={styles.container}>
                        {/* ── Header ──────────────────────────────────────────────────── */}
                        <div className={styles.pageHeader}>
                              <div>
                                    <div className={styles.breadcrumb}>
                                          <Link to="/dashboard/jobs" style={{ color: 'inherit', textDecoration: 'none' }}>My Jobs</Link>
                                          <span>/</span>
                                          <Text size={100} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }} truncate>{job.title}</Text>
                                    </div>
                                    <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1, letterSpacing: '-0.01em', display: 'block' }}>{job.title}</Text>
                                    <div className={styles.titleRow} style={{ marginTop: 6 }}>
                                          <JobStatusPill status={job.status} />
                                          <Text size={100} className={styles.mono} style={{ color: tokens.colorNeutralForeground3 }}>{job.id.slice(0, 8)}…</Text>
                                          {pendingCount > 0 && (
                                                <span className={styles.pendingPill}>{pendingCount} pending review</span>
                                          )}
                                    </div>
                              </div>
                              <div className={styles.headerActions}>
                                    <Button appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={load} />
                                    {canCancel && (
                                          <Button appearance="secondary" icon={<ProhibitedRegular />} size="medium"
                                                style={{ color: tokens.colorStatusDangerForeground3, borderColor: tokens.colorStatusDangerBorder1 }}
                                                onClick={handleCancelJob}>
                                                Cancel Job
                                          </Button>
                                    )}
                              </div>
                        </div>

                        {/* ── Escrow panel ─────────────────────────────────────────────── */}
                        <EscrowPanel job={job} funding={funding} live={funding_live} />

                        {/* ── Bulk bar ─────────────────────────────────────────────────── */}
                        {selected.size > 0 && (
                              <BulkActionBar
                                    count={selected.size} loading={bulkLoading} error={bulkError}
                                    onApprove={handleBulkApprove} onReject={() => setShowRejectModal('BULK')} onClear={() => setSelected(new Set())} />
                        )}

                        {/* ── Filter tabs ──────────────────────────────────────────────── */}
                        <div className={styles.filterRow}>
                              {(['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'] as SubmissionFilter[]).map(f => {
                                    const active = filter === f;
                                    return (
                                          <button key={f} className={mergeClasses(styles.filterTab, active ? styles.filterTabActive : undefined)}
                                                onClick={() => setFilter(f)}>
                                                {f === 'ALL' ? 'All' : (statusConfig[f]?.label ?? f)}
                                                {f !== 'ALL' && counts[f] ? (
                                                      <span className={mergeClasses(styles.filterTabCount, active ? styles.filterTabCountActive : styles.filterTabCountInactive)}>
                                                            {counts[f]}
                                                      </span>
                                                ) : null}
                                          </button>
                                    );
                              })}
                              {filter === 'SUBMITTED' && filtered.length > 0 && (
                                    <Button appearance="transparent" size="small" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={selectAllVisible}>
                                          Select all {filtered.length}
                                    </Button>
                              )}
                        </div>

                        {/* ── Submission list ──────────────────────────────────────────── */}
                        {filtered.length === 0
                              ? <EmptyState filter={filter} />
                              : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                                          {filtered.map(sub => (
                                                <SubmissionRow key={sub.application.id} sub={sub} job={job}
                                                      selected={selected.has(sub.application.id)}
                                                      rowLoading={rowState[sub.application.id]?.loading ?? false}
                                                      rowError={rowState[sub.application.id]?.error ?? ''}
                                                      onSelect={() => toggleSelect(sub.application.id)}
                                                      onApprove={() => handleApprove(sub.application.id)}
                                                      onReject={() => setShowRejectModal(sub.application.id)}
                                                      onRelease={() => handleRelease(sub.application.id)} />
                                          ))}
                                    </div>
                              )
                        }
                  </div>

                  {/* ── Reject modal ────────────────────────────────────────────────── */}
                  {showRejectModal && (
                        <RejectModal isBulk={showRejectModal === 'BULK'} count={showRejectModal === 'BULK' ? selected.size : 1}
                              reason={rejectReason} setReason={setRejectReason}
                              onConfirm={reason => showRejectModal === 'BULK' ? handleBulkReject(reason) : handleReject(showRejectModal as string, reason)}
                              onCancel={() => { setShowRejectModal(null); setRejectReason(''); }} />
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCROW PANEL
// ─────────────────────────────────────────────────────────────────────────────

const EscrowPanel: React.FC<{ job: Job; funding: FundingCache; live: FundingLive }> = ({ job, funding, live }) => {
      const styles = useStyles();
      const { available_live: avail, reserved_live: reserved, released_live: released } = live;
      const total = funding.funded_amount;
      const pctAvail    = total > 0 ? (avail    / total) * 100 : 0;
      const pctReserved = total > 0 ? (reserved / total) * 100 : 0;
      const pctReleased = total > 0 ? (released / total) * 100 : 0;

      return (
            <div className={styles.escrowPanel}>
                  {/* bg decorations */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 256, height: 256, backgroundColor: 'rgba(59,130,246,0.04)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 192, height: 192, backgroundColor: 'rgba(99,102,241,0.04)', borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none' }} />

                  <div className={styles.escrowInner}>
                        <div className={styles.escrowTopRow}>
                              <div>
                                    <Text size={100} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: tokens.fontWeightBold, display: 'block', marginBottom: 4 }}>
                                          Escrow Balance — Live from Ledger
                                    </Text>
                                    <Text size={900} weight="bold" className={styles.mono} style={{ color: '#fff', fontSize: '30px' }}>
                                          {fmt(avail)}
                                          <Text size={300} style={{ color: '#64748b', fontWeight: 'normal', marginLeft: 8 }}>available</Text>
                                    </Text>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: tokens.borderRadiusLarge, padding: '6px 12px' }}>
                                    <ShieldRegular fontSize={13} style={{ color: '#4ade80' }} />
                                    <Text size={100} weight="semibold" style={{ color: '#cbd5e1' }}>Escrow Active</Text>
                              </div>
                        </div>

                        {/* Breakdown */}
                        <div className={styles.escrowBreakdownGrid}>
                              {[
                                    { label: 'Total Funded', value: fmt(funding.funded_amount), sub: `${job.total_slots} slots × ${fmt(job.payout_amount)}`, color: '#fff' },
                                    { label: 'Available',    value: fmt(avail),    sub: `${Math.round(pctAvail)}% of escrow`,         color: '#4ade80' },
                                    { label: 'Reserved',     value: fmt(reserved), sub: `Pending payment · ${Math.round(pctReserved)}%`, color: '#fbbf24' },
                                    { label: 'Released',     value: fmt(released), sub: `Paid to workers · ${Math.round(pctReleased)}%`, color: '#60a5fa' },
                              ].map(({ label, value, sub, color }) => (
                                    <div key={label} className={styles.escrowCell}>
                                          <Text size={100} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>{label}</Text>
                                          <Text size={300} weight="bold" className={styles.mono} style={{ color }}>{value}</Text>
                                          <Text size={100} style={{ color: '#64748b', lineHeight: '1.4' }}>{sub}</Text>
                                    </div>
                              ))}
                        </div>

                        {/* Bar */}
                        <div>
                              <div className={styles.escrowBar}>
                                    <div style={{ width: `${pctReleased}%`,  backgroundColor: '#3b82f6', height: '100%', borderRadius: '999px 0 0 999px', transition: 'width 0.7s' }} />
                                    <div style={{ width: `${pctReserved}%`,  backgroundColor: '#f59e0b', height: '100%', transition: 'width 0.7s' }} />
                                    <div style={{ width: `${pctAvail}%`,     backgroundColor: '#22c55e', height: '100%', borderRadius: '0 999px 999px 0', transition: 'width 0.7s' }} />
                              </div>
                              <div className={styles.escrowLegend} style={{ marginTop: 8 }}>
                                    {[{ color: '#3b82f6', label: 'Released' }, { color: '#f59e0b', label: 'Reserved' }, { color: '#22c55e', label: 'Available' }].map(({ color, label }) => (
                                          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
                                                {label}
                                          </span>
                                    ))}
                              </div>
                        </div>

                        {/* Cache drift */}
                        {Math.abs(funding.available_amount - avail) > 0.01 && (
                              <div className={styles.driftWarning}>
                                    <WarningRegular fontSize={14} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
                                    <Text size={100} style={{ color: '#fca5a5', lineHeight: '1.5' }}>
                                          Cache drift detected: cached available {fmt(funding.available_amount)} vs live {fmt(avail)}. This resolves automatically. Contact support if it persists.
                                    </Text>
                              </div>
                        )}
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION ROW
// ─────────────────────────────────────────────────────────────────────────────

interface RowProps {
      sub: Submission; job: Job; selected: boolean; rowLoading: boolean; rowError: string;
      onSelect: () => void; onApprove: () => void; onReject: () => void; onRelease: () => void;
}

const SubmissionRow: React.FC<RowProps> = ({ sub, job, selected, rowLoading, rowError, onSelect, onApprove, onReject, onRelease }) => {
      const styles = useStyles();
      const [expanded, setExpanded] = useState(false);
      const { application: app, worker_profile: worker, proof, proof_items, flags, verification, payment } = sub;

      const cfg = statusConfig[app.status] ?? { label: app.status, badgeColor: 'subtle', dotColor: '#94a3b8' };
      const highFlags = flags?.filter(f => f.severity === 'HIGH') ?? [];

      const workerName = worker ? `${worker.first_name} ${worker.last_name}` : `Worker ${app.worker_id.slice(0, 8)}…`;

      return (
            <div className={mergeClasses(
                  styles.submissionRow,
                  selected ? styles.submissionRowSelected : undefined,
                  highFlags.length > 0 ? styles.submissionRowFlagged : undefined,
            )}>
                  {/* Header row */}
                  <div className={styles.rowHeader}>
                        {app.status === 'SUBMITTED' && (
                              <input type="checkbox" checked={selected} onChange={onSelect}
                                    style={{ width: 16, height: 16, accentColor: tokens.colorBrandBackground, flexShrink: 0, cursor: 'pointer' }} />
                        )}
                        <div className={styles.workerAvatar}>{workerName.charAt(0)}</div>

                        <div className={styles.workerInfo}>
                              <div className={styles.workerNameRow}>
                                    <Text size={300} weight="semibold" truncate>{workerName}</Text>
                                    <Badge appearance="filled" color={cfg.badgeColor as any} size="small">{cfg.label}</Badge>
                                    {highFlags.length > 0 && (
                                          <Badge appearance="filled" color="danger" size="small">
                                                {highFlags.length} HIGH flag{highFlags.length > 1 ? 's' : ''}
                                          </Badge>
                                    )}
                              </div>
                              <div className={styles.workerMetaRow}>
                                    {proof?.worker_social_url && (
                                          <Text size={100} className={styles.mono} truncate style={{ maxWidth: 180 }}>{proof.worker_social_url}</Text>
                                    )}
                                    {proof?.submitted_at && <Text size={100}>{timeAgo(proof.submitted_at)}</Text>}
                                    {proof?.is_late && <Text size={100} weight="semibold" style={{ color: '#ef4444' }}>⚠ Late</Text>}
                                    {proof?.submission_gap_secs != null && (
                                          <Text size={100} style={{ color: proof.submission_gap_secs < 30 ? '#ef4444' : undefined }}>
                                                {proof.submission_gap_secs}s gap
                                          </Text>
                                    )}
                              </div>
                        </div>

                        <div className={styles.payoutCol}>
                              <Text size={300} weight="bold" className={styles.mono}>{fmt(job.payout_amount)}</Text>
                              <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>{payment?.payment_status ?? 'pending'}</Text>
                        </div>

                        <div className={styles.actionCol}>
                              {rowLoading
                                    ? <Spinner size="tiny" />
                                    : (
                                          <>
                                                {app.status === 'SUBMITTED' && (
                                                      <>
                                                            <button className={mergeClasses(styles.actionBtn, styles.approveBtn)} onClick={onApprove}>
                                                                  <CheckmarkRegular fontSize={13} /> Approve
                                                            </button>
                                                            <button className={mergeClasses(styles.actionBtn, styles.rejectBtn)} onClick={onReject}>
                                                                  <DismissRegular fontSize={13} /> Reject
                                                            </button>
                                                      </>
                                                )}
                                                {app.status === 'APPROVED' && !job.auto_approve && (
                                                      <button className={mergeClasses(styles.actionBtn, styles.releaseBtn)} onClick={onRelease}>
                                                            <SendRegular fontSize={13} /> Release
                                                      </button>
                                                )}
                                                {app.status === 'PAID' && (
                                                      <Text size={100} weight="semibold" style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <CheckmarkCircleRegular fontSize={12} /> Paid
                                                      </Text>
                                                )}
                                          </>
                                    )
                              }
                              <Button appearance="transparent" size="small" icon={expanded ? <ChevronUpRegular /> : <ChevronDownRegular />}
                                    onClick={() => setExpanded(e => !e)} />
                        </div>
                  </div>

                  {rowError && <div className={styles.rowError}>{rowError}</div>}

                  {expanded && (
                        <div className={styles.expandedContent}>
                              {/* Flags */}
                              {(flags?.length ?? 0) > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                                          <Text className={styles.sectionLabel}>Auto Flags</Text>
                                          {flags!.map((f, i) => {
                                                const s = flagSeverityStyle[f.severity] ?? flagSeverityStyle.LOW;
                                                return (
                                                      <div key={i} className={styles.flagRow} style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color }}>
                                                            <WarningRegular fontSize={12} style={{ flexShrink: 0, marginTop: 2 }} />
                                                            <span>
                                                                  <strong>{f.flag_type.replace(/_/g, ' ')}</strong>
                                                                  {f.detail && <span style={{ marginLeft: 8, opacity: 0.8 }}>{f.detail}</span>}
                                                            </span>
                                                            <Text size={100} weight="bold" style={{ marginLeft: 'auto', flexShrink: 0 }}>{f.severity}</Text>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              )}

                              {/* Proof items */}
                              {proof_items && proof_items.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                                          <Text className={styles.sectionLabel}>Evidence ({proof_items.length} item{proof_items.length > 1 ? 's' : ''})</Text>
                                          <div className={styles.proofGrid}>
                                                {proof_items.sort((a, b) => a.display_order - b.display_order).map(item => (
                                                      <ProofItemCard key={item.id} item={item} />
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Verification */}
                              {verification && (
                                    <div className={styles.infoCard}>
                                          <Text className={styles.sectionLabel}>Verification</Text>
                                          <div className={styles.infoCardGrid}>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                                                      Decision: <strong>{verification.is_verified ? 'Approved' : 'Rejected'}</strong>
                                                </Text>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                                                      At: {new Date(verification.verified_at).toLocaleString('en-NG')}
                                                </Text>
                                                {verification.rejection_reason && (
                                                      <Text size={100} style={{ color: tokens.colorStatusDangerForeground3, gridColumn: '1 / -1' }}>
                                                            Reason: {verification.rejection_reason}
                                                      </Text>
                                                )}
                                          </div>
                                    </div>
                              )}

                              {/* Payment */}
                              {payment && (
                                    <div className={styles.infoCard}>
                                          <Text className={styles.sectionLabel}>Payment</Text>
                                          <div className={styles.infoCardGrid}>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                                                      Amount: <strong className={styles.mono}>{fmt(payment.amount)}</strong>
                                                </Text>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground2 }}>
                                                      Status: <strong>{payment.payment_status}</strong>
                                                </Text>
                                                {payment.paid_at && (
                                                      <Text size={100} style={{ color: tokens.colorNeutralForeground2, gridColumn: '1 / -1' }}>
                                                            Paid at: {new Date(payment.paid_at).toLocaleString('en-NG')}
                                                      </Text>
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
      const styles = useStyles();
      const isImage = item.proof_type === 'SCREENSHOT';
      const isUrl = item.proof_type === 'LINK' || (item.proof_type === 'USERNAME' && item.value.startsWith('http'));

      return (
            <div className={styles.proofCard}>
                  {isImage ? (
                        <div style={{ position: 'relative' }}>
                              <img src={item.value} alt={item.is_before ? 'Before' : 'After'}
                                    style={{ width: '100%', height: '112px', objectFit: 'cover' }}
                                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x112?text=Image'; }} />
                              <div style={{ position: 'absolute', top: 6, left: 6, fontSize: '9px', fontWeight: tokens.fontWeightBold, padding: '2px 6px', borderRadius: 4, color: '#fff', backgroundColor: item.is_before ? '#f59e0b' : '#2563eb' }}>
                                    {item.is_before ? 'BEFORE' : 'AFTER'}
                              </div>
                              <a href={item.value} target="_blank" rel="noreferrer"
                                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0)', color: '#fff', opacity: 0, transition: 'opacity 0.2s, background-color 0.2s' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(0,0,0,0.4)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(0,0,0,0)'; }}>
                                    <OpenRegular fontSize={18} />
                              </a>
                        </div>
                  ) : (
                        <div className={styles.proofCardText}>
                              <Text size={100} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: tokens.colorNeutralForeground3 }}>{item.proof_type}</Text>
                              {isUrl
                                    ? <a href={item.value} target="_blank" rel="noreferrer"
                                          style={{ display: 'flex', alignItems: 'center', gap: 4, color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase200, fontFamily: tokens.fontFamilyMonospace, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {item.value.slice(0, 30)}… <OpenRegular fontSize={10} />
                                    </a>
                                    : <Text size={100} className={styles.mono} style={{ wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                          {item.value}
                                    </Text>
                              }
                        </div>
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// BULK ACTION BAR
// ─────────────────────────────────────────────────────────────────────────────

const BulkActionBar: React.FC<{ count: number; loading: boolean; error: string; onApprove: () => void; onReject: () => void; onClear: () => void }> = ({ count, loading, error, onApprove, onReject, onClear }) => {
      const styles = useStyles();
      return (
            <div className={styles.bulkBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div className={styles.countBadge}>{count}</div>
                        <Text size={300} weight="semibold" style={{ color: '#fff' }}>selected</Text>
                  </div>
                  {error && <Text size={300} style={{ color: '#f87171' }}>{error}</Text>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {loading
                              ? <Spinner size="tiny" />
                              : (
                                    <>
                                          <Button size="small" icon={<CheckmarkCircleRegular />} onClick={onApprove}
                                                style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none' }}>
                                                Approve All
                                          </Button>
                                          <Button size="small" icon={<DismissCircleRegular />} onClick={onReject}
                                                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }}>
                                                Reject All
                                          </Button>
                                    </>
                              )
                        }
                        <Button appearance="transparent" size="small" onClick={onClear} style={{ color: '#94a3b8', fontSize: 18 }}>×</Button>
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// REJECT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const RejectModal: React.FC<{ isBulk: boolean; count: number; reason: string; setReason: (r: string) => void; onConfirm: (r: string) => void; onCancel: () => void }> = ({ isBulk, count, reason, setReason, onConfirm, onCancel }) => {
      const styles = useStyles();
      return (
            <Dialog open onOpenChange={(_, d) => { if (!d.open) onCancel(); }}>
                  <DialogSurface style={{ maxWidth: 480 }}>
                        <DialogBody>
                              <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} onClick={onCancel} />}>
                                    {isBulk ? `Reject ${count} submission${count > 1 ? 's' : ''}` : 'Reject Submission'}
                              </DialogTitle>
                              <DialogContent>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacingHorizontalM }}>
                                                <div className={styles.rejectIcon}><DismissCircleRegular fontSize={20} /></div>
                                                <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.6' }}>
                                                      A reason is required. The worker will see this message and may raise a dispute. Rejected slots are freed — another worker can claim them.
                                                </Text>
                                          </div>
                                          <Textarea autoFocus
                                                placeholder="e.g. Screenshot does not show the account following, please re-submit."
                                                value={reason} onChange={e => setReason(e.target.value)}
                                                rows={4} resize="none" style={{ width: '100%' }} />
                                    </div>
                              </DialogContent>
                              <DialogActions>
                                    <Button appearance="secondary" onClick={onCancel} style={{ borderRadius: '999px', flex: 1 }}>Cancel</Button>
                                    <Button disabled={!reason.trim()} onClick={() => onConfirm(reason)}
                                          style={{ borderRadius: '999px', flex: 1, backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>
                                          Confirm Rejection
                                    </Button>
                              </DialogActions>
                        </DialogBody>
                  </DialogSurface>
            </Dialog>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const JobStatusPill: React.FC<{ status: string }> = ({ status }) => {
      const map: Record<string, 'success' | 'warning' | 'danger' | 'informative' | 'subtle'> = {
            ACTIVE: 'success', PAUSED: 'warning', CANCELLED: 'danger', COMPLETED: 'informative', DRAFT: 'subtle',
      };
      return <Badge appearance="filled" color={map[status] ?? 'subtle'}>{status}</Badge>;
};

const EmptyState: React.FC<{ filter: SubmissionFilter }> = ({ filter }) => {
      const styles = useStyles();
      return (
            <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}><PeopleRegular fontSize={22} /></div>
                  <Text size={300} weight="semibold">No submissions</Text>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3, textAlign: 'center', maxWidth: 280 }}>
                        {filter === 'SUBMITTED' ? 'No pending submissions to review right now.' : `No ${filter.toLowerCase()} submissions for this job.`}
                  </Text>
            </div>
      );
};

const LoadingPage: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.loadingPage}>
                  <Spinner size="medium" label="Loading submissions…" labelPosition="below" />
            </div>
      );
};

export default JobVerification;