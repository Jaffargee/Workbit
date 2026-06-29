import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
      ArrowLeftRegular,
      EditRegular,
      DeleteRegular,
      PauseRegular,
      PlayRegular,
      ProhibitedRegular,
      SendRegular,
      MoneyRegular,
      PeopleRegular,
      EyeRegular,
      ClockRegular,
      FlashRegular,
      ShieldCheckmarkRegular,
      ErrorCircleRegular,
      CheckmarkCircleRegular,
      ArrowClockwiseRegular,
      OpenRegular,
      CalendarRegular,
      ChevronRightRegular,
      WalletRegular,
      WarningRegular,
      SaveRegular,
      DismissRegular,
      AddRegular,
      SubtractRegular,
      RocketRegular,
      BoardHeartRegular as BarChartRegular,
} from '@fluentui/react-icons';
import {
      makeStyles,
      shorthands,
      tokens,
      Text,
      Button,
      Input,
      Textarea,
      Checkbox,
      Badge,
      ProgressBar,
      Spinner,
      Divider,
      Switch,
      mergeClasses,
      Dialog,
      DialogSurface,
      DialogBody,
      DialogTitle,
      DialogContent,
      DialogActions,
      Select,
} from '@fluentui/react-components';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';
import { useWallet } from '@/hooks/useWallet';

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

type PageModal = 'none' | 'edit' | 'fund' | 'delete' | 'cancel';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
      `₦${Number(n ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const fmtDate = (iso: string | null) =>
      iso
            ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—';

const toInputDate = (iso: string | null) => (iso ? iso.slice(0, 16) : '');

const JOB_TYPES = ['FOLLOW', 'LIKE', 'COMMENT', 'RETWEET', 'SAVE', 'SHARE'];

interface StatusCfg { label: string; badgeColor: 'success' | 'warning' | 'danger' | 'informative' | 'subtle' | 'important' }
const STATUS_CONFIG: Record<string, StatusCfg> = {
      DRAFT:           { label: 'Draft',           badgeColor: 'subtle' },
      PENDING_FUNDING: { label: 'Pending Funding',  badgeColor: 'warning' },
      ACTIVE:          { label: 'Active',           badgeColor: 'success' },
      PAUSED:          { label: 'Paused',           badgeColor: 'important' },
      COMPLETED:       { label: 'Completed',        badgeColor: 'informative' },
      EXPIRED:         { label: 'Expired',          badgeColor: 'warning' },
      CANCELLED:       { label: 'Cancelled',        badgeColor: 'danger' },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      page: {
            minHeight: '100vh',
            backgroundColor: '#F7F8FA',
            paddingBottom: '96px',
      },
      container: {
            maxWidth: '1024px',
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
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
      },
      titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            flexWrap: 'wrap',
      },
      actionBar: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            flexWrap: 'wrap',
            flexShrink: 0,
      },
      // ── Feedback banners ─────────────────────────────────────────────────
      successBanner: {
            backgroundColor: '#f0fdf4',
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
      },
      errorBanner: {
            backgroundColor: tokens.colorStatusDangerBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorStatusDangerBorder1),
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalM,
      },
      // ── Pending funding callout ──────────────────────────────────────────
      pendingCallout: {
            backgroundColor: '#fffbeb',
            ...shorthands.border('1px', 'solid', '#fde68a'),
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalL,
      },
      pendingIcon: {
            width: '40px',
            height: '40px',
            backgroundColor: '#fef3c7',
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#d97706',
      },
      // ── Grid ────────────────────────────────────────────────────────────
      grid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalL,
            '@media (min-width: 1024px)': {
                  gridTemplateColumns: '2fr 1fr',
            },
      },
      leftCol: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      rightCol: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      // ── Cards ────────────────────────────────────────────────────────────
      card: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
      },
      sectionLabel: {
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightBold,
      },
      detailGrid: {
            display: 'flex',
            flexDirection: 'column',
            // gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingVerticalM,
      },
      settingsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
            '@media (min-width: 640px)': {
                  gridTemplateColumns: 'repeat(3, 1fr)',
            },
      },
      settingsFlag: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalS,
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.border('1px', 'solid', 'transparent'),
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
      },
      settingsFlagOn: {
            backgroundColor: '#eff6ff',
            borderTopColor: '#bfdbfe',
            borderRightColor: '#bfdbfe',
            borderBottomColor: '#bfdbfe',
            borderLeftColor: '#bfdbfe',
            color: '#1d4ed8',
      },
      settingsFlagOff: {
            backgroundColor: tokens.colorNeutralBackground2,
            borderTopColor: tokens.colorNeutralStroke1,
            borderRightColor: tokens.colorNeutralStroke1,
            borderBottomColor: tokens.colorNeutralStroke1,
            borderLeftColor: tokens.colorNeutralStroke1,
            color: tokens.colorNeutralForeground3,
      },
      proofBox: {
            backgroundColor: '#fffbeb',
            ...shorthands.border('1px', 'solid', '#fde68a'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            fontSize: tokens.fontSizeBase300,
            color: '#000000',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
      },
      // ── Stats card ───────────────────────────────────────────────────────
      statsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
      },
      statCell: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },
      statValue: {
            fontFamily: tokens.fontFamilyMonospace,
            fontWeight: tokens.fontWeightBold,
            fontSize: tokens.fontSizeBase400,
      },
      payoutRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: tokens.spacingVerticalS,
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      progressRow: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      progressLabel: {
            display: 'flex',
            justifyContent: 'space-between',
      },
      // ── Escrow card ──────────────────────────────────────────────────────
      escrowCard: {
            backgroundColor: '#0f172a',
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
      },
      escrowTopRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      escrowBar: {
            height: '6px',
            width: '100%',
            ...shorthands.borderRadius('999px'),
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.08)',
            display: 'flex',
            gap: '2px',
      },
      escrowGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacingHorizontalS,
            textAlign: 'center',
      },
      // ── No escrow placeholder ────────────────────────────────────────────
      noEscrow: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('2px', 'dashed', tokens.colorNeutralStroke1),
            ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalL),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacingVerticalM,
            textAlign: 'center',
      },
      noEscrowIcon: {
            width: '48px',
            height: '48px',
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorNeutralForeground3,
      },
      // ── Wallet card ──────────────────────────────────────────────────────
      walletCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      // ── Verify CTA ───────────────────────────────────────────────────────
      verifyCta: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f172a',
            color: '#fff',
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
            textDecoration: 'none',
            ':hover': {
                  backgroundColor: '#1e293b',
            },
      },
      // ── Modal ────────────────────────────────────────────────────────────
      modalForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
      },
      fieldGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      fieldLabel: {
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground2,
      },
      // Counter row (slot / payout spinners)
      counterRow: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalS,
      },
      counterInput: {
            textAlign: 'center',
            fontWeight: tokens.fontWeightBold,
            flex: 1,
      },
      // Toggle row
      toggleRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
            cursor: 'pointer',
            transition: 'background-color 0.15s',
      },
      toggleRowOn: {
            backgroundColor: '#eff6ff',
            borderTopColor: '#bfdbfe',
            borderRightColor: '#bfdbfe',
            borderBottomColor: '#bfdbfe',
            borderLeftColor: '#bfdbfe',
      },
      toggleRowOff: {
            backgroundColor: tokens.colorNeutralBackground2,
      },
      // Cost breakdown
      costBreakdown: {
            backgroundColor: '#0f172a',
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
      },
      costRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: tokens.fontSizeBase200,
            color: '#cbd5e1',
      },
      costTotalRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: tokens.spacingVerticalS,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontWeight: tokens.fontWeightBold,
            fontSize: tokens.fontSizeBase300,
      },
      walletCheck: {
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacingHorizontalM,
      },
      walletCheckOk: {
            backgroundColor: '#f0fdf4',
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
      },
      walletCheckFail: {
            backgroundColor: tokens.colorStatusDangerBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorStatusDangerBorder1),
      },
      // Modal footer buttons
      modalFooter: {
            display: 'flex',
            gap: tokens.spacingHorizontalM,
            paddingTop: tokens.spacingVerticalS,
      },
      // Error in modal
      inlineError: {
            backgroundColor: tokens.colorStatusDangerBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorStatusDangerBorder1),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalXS,
      },
      // Skeleton
      skeleton: {
            maxWidth: '1024px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: tokens.spacingHorizontalL,
            paddingRight: tokens.spacingHorizontalL,
            paddingTop: tokens.spacingVerticalXXL,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      skeletonBar: {
            backgroundColor: '#e2e8f0',
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            animationName: {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
            },
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
      },
      skeletonCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
      },
      errorState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: tokens.spacingVerticalL,
      },
      fullWidth: { width: '100%' },
      flex1: { flex: 1 },
      mono: { fontFamily: tokens.fontFamilyMonospace },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

const JobDir: React.FC = () => {
      const { job_id } = useParams<{ job_id: string }>();
      const navigate = useNavigate();
      const { profile: user } = useAuth();
      const styles = useStyles();

      const [job, setJob] = useState<Job | null>(null);
      const [funding, setFunding] = useState<Funding | null>(null);
      const [platforms, setPlatforms] = useState<Platform[]>([]);

      const [loading, setLoading] = useState(true);
      const [pageError, setPageError] = useState('');
      const [modal, setModal] = useState<PageModal>('none');
      const [actionLoading, setActionLoading] = useState(false);
      const [actionError, setActionError] = useState('');
      const [actionSuccess, setActionSuccess] = useState('');

      const { wallet, summary } = useWallet();

      const load = useCallback(async () => {
            if (!job_id || !user?.user_id) return;
            setLoading(true);
            setPageError('');

            const [jobRes, platformsRes] = await Promise.all([
                  supabase.from('jobs').select('*, platforms (*)').eq('id', job_id).single(),
                  supabase.from('platforms').select('id, name, logo_url').eq('is_active', true),

            ]);

            if (jobRes.error || !jobRes.data) { setPageError('Job not found or you do not have access.'); setLoading(false); return; }
            const j = jobRes.data as Job;
            if (j.user_id !== user.user_id) { setPageError('Access denied. This is not your job.'); setLoading(false); return; }

            setJob(j);
            if (platformsRes.data) setPlatforms(platformsRes.data as Platform[]);

            const { data: fundingData } = await supabase.from('job_funding').select('*').eq('job_id', job_id).maybeSingle();
            if (fundingData) setFunding(fundingData as Funding);
            setLoading(false);
      }, [job_id, user?.user_id]);

      useEffect(() => { load(); }, [load]);

      const handleTogglePause = async () => {
            if (!job) return;
            setActionLoading(true); setActionError('');
            const fn = job.status === 'FUNDED' ? 'pause_job' : 'resume_job';
            const { error } = await supabase.rpc(fn, { p_job_id: job.id });
            setActionLoading(false);
            if (error) { setActionError(error.message); return; }
            setActionSuccess(job.status === 'FUNDED' ? 'Job paused.' : 'Job resumed.');
            await load();
      };

      const handleDelete = async () => {
            if (!job) return;
            setActionLoading(true); setActionError('');
            const { error } = await supabase.from('jobs').delete().eq('id', job.id);
            setActionLoading(false);
            if (error) { setActionError(error.message); return; }
            navigate('/jobs');
      };

      const handleCancel = async () => {
            if (!job) return;
            setActionLoading(true); setActionError('');
            const { data, error } = await supabase.rpc('cancel_job_and_refund', { p_job_id: job.id });
            setActionLoading(false);
            if (error) { setActionError(error.message); return; }
            setModal('none');
            setActionSuccess(`Job cancelled. ${data?.refund_amount ? fmt(data.refund_amount) + ' refunded to your wallet.' : ''}`);
            await load();
      };

      const handleFundAndLaunch = async (form: FundLaunchForm) => {
            setActionLoading(true); setActionError('');
            if (!job) return;
            const { data, error } = await supabase.rpc('activate_job', { p_job_id: job.id });
            setActionLoading(false);
            if (error) { setActionError(error.message); return; }
            if (data?.error === 'insufficient_balance') {
                  setActionError(`Insufficient balance. You need ${fmt(data.required)} but only have ${fmt(data.available)}. Shortfall: ${fmt(data.shortfall)}.`);
                  return;
            }
            if (data?.success) {
                  setModal('none');
                  setActionSuccess(`Job funded and launched! ${fmt(data.escrow_amount)} locked in escrow.`);
                  await load();
            }
      };

      const handleUpdate = async (form: EditForm) => {
            if (!job) return;
            setActionLoading(true); setActionError('');
            const { error } = await supabase.from('jobs').update({
                  title: form.title.trim(), description: form.description.trim(),
                  target_url: form.target_url.trim(), proof_instructions: form.proof_instructions.trim(),
                  auto_approve: form.auto_approve, requires_screenshot: form.requires_screenshot,
                  requires_before_proof: form.requires_before_proof, expires_at: form.expires_at || null,
            }).eq('id', job.id);
            setActionLoading(false);
            if (error) { setActionError(error.message); return; }
            setModal('none');
            setActionSuccess('Job updated successfully.');
            await load();
      };

      const progress = job ? Math.min(100, (job.filled_slots / Math.max(1, job.total_slots)) * 100) : 0;
      const canPause    = job?.status === 'ACTIVE';
      const canResume   = job?.status === 'PAUSED';
      const canEdit     = job ? ['DRAFT', 'PENDING_FUNDING', 'ACTIVE', 'PAUSED'].includes(job.status) : false;
      const canFund     = job ? ['DRAFT', 'PENDING_FUNDING'].includes(job.status) : false;
      const canCancel   = job ? ['ACTIVE', 'PAUSED'].includes(job.status) : false;
      const canDelete   = job ? ['DRAFT', 'CANCELLED'].includes(job.status) : false;
      const canVerify   = job?.status === 'ACTIVE' || job?.status === 'PAUSED';

      const escrowPct = {
            available: funding ? (funding.available_amount / funding.funded_amount) * 100 : 0,
            reserved:  funding ? (funding.reserved_amount  / funding.funded_amount) * 100 : 0,
            released:  funding ? (funding.released_amount  / funding.funded_amount) * 100 : 0,
      };

      if (loading) return <PageSkeleton />;

      if (pageError || !job) return (
            <div className={styles.errorState}>
                  <ErrorCircleRegular fontSize={40} style={{ color: tokens.colorStatusDangerForeground3 }} />
                  <Text weight="semibold" size={400}>{pageError || 'Job not found.'}</Text>
                  <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase200, textDecoration: 'none' }}>
                        <ArrowLeftRegular fontSize={14} /> Back to My Jobs
                  </Link>
            </div>
      );

      const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT;

      return (
            <div className={styles.page}>
                  <div className={styles.container}>
                        {/* ── Header ──────────────────────────────────────────────────── */}
                        <div className={styles.pageHeader}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS }}>
                                    <div className={styles.breadcrumb}>
                                          <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'none' }}>
                                                <ArrowLeftRegular fontSize={12} /> My Jobs
                                          </Link>
                                          <span>/</span>
                                          <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }} truncate>
                                                {job.title}
                                          </Text>
                                    </div>
                                    <div className={styles.titleRow}>
                                          <Text size={600} weight="bold" style={{ color: tokens.colorNeutralForeground1, letterSpacing: '-0.01em' }}>
                                                {job.title}
                                          </Text>
                                          <Badge appearance="filled" color={statusCfg.badgeColor}>{statusCfg.label}</Badge>
                                    </div>
                                    <Text size={300} className={styles.mono} style={{ color: tokens.colorNeutralForeground3 }}>ID: {job.id}</Text>
                              </div>

                              <div className={styles.actionBar}>
                                    <Button appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={load} />

                                    {canVerify && (
                                          <Button as="a" href={`/jobs/owner/${job.id}/verify`} appearance="primary" icon={<ShieldCheckmarkRegular />} size="medium">
                                                Verify Submissions
                                          </Button>
                                    )}
                                    {canEdit && (
                                          <Button appearance="secondary" icon={<EditRegular />} size="medium" onClick={() => { setActionError(''); setModal('edit'); }}>
                                                Edit
                                          </Button>
                                    )}
                                    {canFund && (
                                          <Button appearance="primary" icon={<RocketRegular />} size="medium"
                                                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                                                onClick={() => { setActionError(''); setModal('fund'); }}>
                                                Fund & Launch
                                          </Button>
                                    )}
                                    {(canPause || canResume) && (
                                          <Button appearance="secondary" icon={actionLoading ? <Spinner size="tiny" /> : canPause ? <PauseRegular /> : <PlayRegular />}
                                                size="medium" disabled={actionLoading} onClick={handleTogglePause}>
                                                {canPause ? 'Pause' : 'Resume'}
                                          </Button>
                                    )}
                                    {canCancel && (
                                          <Button appearance="secondary" icon={<ProhibitedRegular />} size="medium"
                                                style={{ color: tokens.colorStatusDangerForeground3, borderColor: tokens.colorStatusDangerBorder1 }}
                                                onClick={() => { setActionError(''); setModal('cancel'); }}>
                                                Cancel
                                          </Button>
                                    )}
                                    {canDelete && (
                                          <Button appearance="secondary" icon={<DeleteRegular />} size="medium"
                                                style={{ color: tokens.colorStatusDangerForeground3, borderColor: tokens.colorStatusDangerBorder1 }}
                                                onClick={() => { setActionError(''); setModal('delete'); }}>
                                                Delete
                                          </Button>
                                    )}
                              </div>
                        </div>

                        {/* ── Banners ─────────────────────────────────────────────────── */}
                        {actionSuccess && (
                              <div className={styles.successBanner}>
                                    <CheckmarkCircleRegular fontSize={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    <Text size={200} weight="semibold" style={{ color: '#166534', flex: 1 }}>{actionSuccess}</Text>
                                    <Button appearance="transparent" icon={<DismissRegular />} size="medium" onClick={() => setActionSuccess('')} />
                              </div>
                        )}
                        {actionError && (
                              <div className={styles.errorBanner}>
                                    <ErrorCircleRegular fontSize={18} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0 }} />
                                    <Text size={200} style={{ color: tokens.colorStatusDangerForeground3, flex: 1 }}>{actionError}</Text>
                                    <Button appearance="transparent" icon={<DismissRegular />} size="medium" onClick={() => setActionError('')} />
                              </div>
                        )}

                        {/* ── Pending funding callout ──────────────────────────────────── */}
                        {job.status === 'PENDING_FUNDING' && (
                              <div className={styles.pendingCallout}>
                                    <div className={styles.pendingIcon}><WalletRegular fontSize={18} /></div>
                                    <div style={{ flex: 1 }}>
                                          <Text size={200} weight="bold" style={{ color: '#92400e', display: 'block' }}>This job is waiting for funding</Text>
                                          <Text size={300} style={{ color: '#b45309', marginTop: 4, lineHeight: '1.6', display: 'block' }}>
                                                Fund this campaign to make it visible to workers. You need{' '}
                                                <strong>{fmt(job.payout_amount * job.total_slots)}</strong> in escrow +{' '}
                                                <strong>{fmt(job.payout_amount * job.total_slots * 0.1)}</strong> platform fee.
                                                {wallet && <> Your wallet balance: <strong>{fmt(summary?.current_balance ?? 0)}</strong>.</>}
                                          </Text>
                                    </div>
                                    <Button appearance="primary" size="medium" style={{ backgroundColor: '#d97706', borderColor: '#d97706', flexShrink: 0 }}
                                          onClick={() => { setActionError(''); setModal('fund'); }}>
                                          Fund Now
                                    </Button>
                              </div>
                        )}

                        {/* ── Grid ────────────────────────────────────────────────────── */}
                        <div className={styles.grid}>
                              {/* Left */}
                              <div className={styles.leftCol}>
                                    {/* Job details */}
                                    <SectionCard title="Job Details">
                                          <div className={styles.detailGrid}>
                                                <DetailItem label="Platform" value={job.platforms?.name ?? '—'} />
                                                <DetailItem label="Task Type" value={job.job_type} mono />
                                                <DetailItem label="Target URL" value={
                                                      <a href={job.target_url} target="_blank" rel="noreferrer"
                                                            style={{ color: tokens.colorBrandForeground1, display: 'flex', alignItems: 'center', gap: 4, fontSize: tokens.fontSizeBase300, fontFamily: tokens.fontFamilyMonospace, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {job.target_url.replace('https://', '')} <OpenRegular fontSize={18} />
                                                      </a>
                                                } />
                                                <DetailItem label="Created"  value={fmtDate(job.created_at)} />
                                                <DetailItem label="Posted"   value={fmtDate(job.posted_at)} />
                                                <DetailItem label="Expires"  value={fmtDate(job.expires_at)} />
                                          </div>
                                    </SectionCard>

                                    {/* Description */}
                                    <SectionCard title="Description">
                                          <Text size={300} style={{ color: tokens.colorNeutralForeground2, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                                {job.description || <Text style={{ color: tokens.colorNeutralForeground3, fontStyle: 'italic' }}>No description provided.</Text>}
                                          </Text>
                                    </SectionCard>

                                    {/* Proof instructions */}
                                    {job.proof_instructions && (
                                          <SectionCard title="Proof Requirements">
                                                <div className={styles.proofBox}>{job.proof_instructions}</div>
                                          </SectionCard>
                                    )}

                                    {/* Settings */}
                                    <SectionCard title="Settings">
                                          <div className={styles.settingsGrid}>
                                                {[
                                                      { label: 'Auto Approve',          on: job.auto_approve,           icon: <FlashRegular fontSize={13} /> },
                                                      { label: 'Requires Screenshot',    on: job.requires_screenshot,    icon: <EyeRegular fontSize={13} /> },
                                                      { label: 'Before & After Proof',   on: job.requires_before_proof,  icon: <ShieldCheckmarkRegular fontSize={13} /> },
                                                ].map(({ label, on, icon }) => (
                                                      <div key={label} className={mergeClasses(styles.settingsFlag, on ? styles.settingsFlagOn : styles.settingsFlagOff)}>
                                                            {icon}
                                                            <Text size={200} weight="semibold">{label}</Text>
                                                            <Text size={200} weight="bold" style={{ marginLeft: 'auto' }}>{on ? 'ON' : 'OFF'}</Text>
                                                      </div>
                                                ))}
                                          </div>
                                    </SectionCard>
                              </div>

                              {/* Right */}
                              <div className={styles.rightCol}>
                                    {/* Stats */}
                                    <div className={styles.card}>
                                          <Text className={styles.sectionLabel}>Campaign Stats</Text>
                                          <div className={styles.statsGrid}>
                                                {[
                                                      { label: 'Total Slots',   value: job.total_slots,          color: tokens.colorNeutralForeground1 },
                                                      { label: 'Filled',        value: job.filled_slots,         color: tokens.colorBrandForeground1 },
                                                      { label: 'Applications',  value: job.applications_count,   color: '#6366f1' },
                                                      { label: 'Views',         value: job.views_count,          color: tokens.colorNeutralForeground1 },
                                                ].map(({ label, value, color }) => (
                                                      <div key={label} className={styles.statCell}>
                                                            <Text size={300} style={{ color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Text>
                                                            <span className={styles.statValue} style={{ color }}>{value}</span>
                                                      </div>
                                                ))}
                                          </div>
                                          <div className={styles.progressRow}>
                                                <div className={styles.progressLabel}>
                                                      <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground3 }}>Slot utilization</Text>
                                                      <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>{Math.round(progress)}%</Text>
                                                </div>
                                                <ProgressBar value={progress / 100} thickness="medium" />
                                          </div>
                                          <div className={styles.payoutRow}>
                                                <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Payout per task</Text>
                                                <Text size={300} weight="bold" className={styles.mono}>{fmt(job.payout_amount)}</Text>
                                          </div>
                                    </div>

                                    {/* Escrow */}
                                    {funding
                                          ? <EscrowCard funding={funding} escrowPct={escrowPct} />
                                          : (
                                                <div className={styles.noEscrow}>
                                                      <div className={styles.noEscrowIcon}><WalletRegular fontSize={20} /></div>
                                                      <Text size={200} weight="semibold">No Escrow Yet</Text>
                                                      <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Fund this job to lock escrow and make it live.</Text>
                                                      {canFund && (
                                                            <Button appearance="primary" className={styles.fullWidth} style={{ borderRadius: '999px', backgroundColor: '#059669', borderColor: '#059669' }} onClick={() => setModal('fund')}>
                                                                  Fund & Launch
                                                            </Button>
                                                      )}
                                                </div>
                                          )
                                    }

                                    {/* Wallet */}
                                    {wallet && (
                                          <div className={styles.walletCard}>
                                                <div>
                                                      <Text size={300} className={styles.sectionLabel} block>Your Wallet</Text>
                                                      <Text size={500} weight="bold" className={styles.mono}
                                                            style={{ color: wallet.is_frozen ? tokens.colorStatusDangerForeground3 : tokens.colorNeutralForeground1 }}>
                                                            {fmt(summary?.current_balance ?? 0)}
                                                      </Text>
                                                      {wallet.is_frozen && <Text size={300} weight="bold" style={{ color: tokens.colorStatusDangerForeground3 }}>Frozen</Text>}
                                                </div>
                                                <Button as="a" href="/wallet" appearance="primary" size="medium">Deposit</Button>
                                          </div>
                                    )}

                                    {/* Verify CTA */}
                                    {canVerify && (
                                          <Link to={`/jobs/owner/${job.id}/verify`} className={styles.verifyCta}>
                                                <div>
                                                      <Text size={300} className={styles.sectionLabel} block style={{ color: '#475569' }}>Submissions</Text>
                                                      <Text size={400} weight="bold" block style={{ color: '#fff', marginTop: 4 }}>Review & Verify</Text>
                                                      <Text size={300} style={{ color: '#64748b' }}>Approve, reject, release payments</Text>
                                                </div>
                                                <ChevronRightRegular fontSize={20} style={{ color: '#64748b' }} />
                                          </Link>
                                    )}
                              </div>
                        </div>
                  </div>

                  {/* ── Modals ───────────────────────────────────────────────────── */}
                  {modal === 'edit' && (
                        <EditModal job={job} platforms={platforms} loading={actionLoading} error={actionError}
                              onSave={handleUpdate} onClose={() => { setModal('none'); setActionError(''); }} />
                  )}
                  {modal === 'fund' && (
                        <FundLaunchModal job={job} loading={actionLoading} error={actionError}
                              onFund={handleFundAndLaunch} onClose={() => { setModal('none'); setActionError(''); }} />
                  )}
                  {modal === 'cancel' && (
                        <ConfirmModal title="Cancel Job & Refund"
                              description={`This will cancel the job and refund ${fmt(funding?.available_amount ?? 0)} to your wallet. Reserved funds (${fmt(funding?.reserved_amount ?? 0)}) will settle as pending submissions are reviewed.`}
                              confirmLabel="Yes, Cancel Job" confirmVariant="danger"
                              loading={actionLoading} error={actionError}
                              onConfirm={handleCancel} onClose={() => { setModal('none'); setActionError(''); }} />
                  )}
                  {modal === 'delete' && (
                        <ConfirmModal title="Delete Job"
                              description="This will permanently delete the job and all associated data. This cannot be undone."
                              confirmLabel="Delete Permanently" confirmVariant="danger"
                              loading={actionLoading} error={actionError}
                              onConfirm={handleDelete} onClose={() => { setModal('none'); setActionError(''); }} />
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// ESCROW CARD
// ─────────────────────────────────────────────────────────────────────────────

const EscrowCard: React.FC<{ funding: Funding; escrowPct: { available: number; reserved: number; released: number } }> = ({ funding, escrowPct }) => {
      const styles = useStyles();
      return (
            <div className={styles.escrowCard}>
                  <div className={styles.escrowTopRow}>
                        <Text size={300} style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: tokens.fontWeightBold }}>Escrow</Text>
                        <Badge appearance="filled"
                              color={funding.status === 'ACTIVE' ? 'success' : funding.status === 'DEPLETED' ? 'informative' : 'subtle'}>
                              {funding.status}
                        </Badge>
                  </div>
                  <div>
                        <Text size={600} weight="bold" className={styles.mono} style={{ color: '#fff', fontSize: '24px' }}>{fmt(funding.available_amount)}</Text>
                        <Text size={300} style={{ color: '#64748b', marginTop: 2, display: 'block' }}>available of {fmt(funding.funded_amount)}</Text>
                  </div>
                  {/* Stacked bar */}
                  <div className={styles.escrowBar}>
                        <div style={{ width: `${escrowPct.released}%`,  backgroundColor: '#3b82f6', height: '100%', borderRadius: '999px 0 0 999px', transition: 'width 0.7s' }} />
                        <div style={{ width: `${escrowPct.reserved}%`,  backgroundColor: '#f59e0b', height: '100%', transition: 'width 0.7s' }} />
                        <div style={{ width: `${escrowPct.available}%`, backgroundColor: '#22c55e', height: '100%', borderRadius: '0 999px 999px 0', transition: 'width 0.7s' }} />
                  </div>
                  <div className={styles.escrowGrid}>
                        {[
                              { label: 'Available', value: fmt(funding.available_amount), color: '#4ade80' },
                              { label: 'Reserved',  value: fmt(funding.reserved_amount),  color: '#fbbf24' },
                              { label: 'Released',  value: fmt(funding.released_amount),  color: '#60a5fa' },
                        ].map(({ label, value, color }) => (
                              <div key={label}>
                                    <Text size={300} weight="bold" className={styles.mono} style={{ color, display: 'block' }}>{value}</Text>
                                    <Text size={300} style={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</Text>
                              </div>
                        ))}
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// FUND & LAUNCH MODAL
// ─────────────────────────────────────────────────────────────────────────────

const FundLaunchModal: React.FC<{
      job: Job; loading: boolean; error: string;
      onFund: (f: FundLaunchForm) => void; onClose: () => void;
}> = ({ job, loading, error, onFund, onClose }) => {
      const styles = useStyles();
      const [form, setForm] = useState<FundLaunchForm>({
            platform_id: job.platform_id, job_type: job.job_type, target_url: job.target_url,
            payout_amount: job.payout_amount, auto_approve: job.auto_approve,
            requires_screenshot: job.requires_screenshot, requires_before_proof: job.requires_before_proof,
            proof_instructions: job.proof_instructions ?? '', title: job.title,
            description: job.description, total_slots: job.total_slots,
            expires_at: toInputDate(job.expires_at) || toInputDate(new Date(Date.now() + 7 * 86400000).toISOString()),
      });

      const { summary } = useWallet();

      const escrow = form.payout_amount * form.total_slots;
      const fee = Math.round(escrow * 0.1 * 100) / 100;
      const total = escrow + fee;
      const shortfall = summary ? Math.max(0, total - summary?.current_balance) : 0;
      const canAfford = summary ? summary?.current_balance ?? 0 >= total : false;

      const setF = (f: keyof FundLaunchForm) => (val: any) => setForm(prev => ({ ...prev, [f]: val }));

      return (
            <Dialog open onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
                  <DialogSurface style={{ maxWidth: 520 }}>
                        <DialogBody>
                              <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />}>
                                    Fund & Launch Campaign
                              </DialogTitle>
                              <DialogContent>
                                    <div className={styles.modalForm}>
                                          {/* Wallet check */}
                                          <div className={mergeClasses(styles.walletCheck, canAfford ? styles.walletCheckOk : styles.walletCheckFail)}>
                                                <div>
                                                      <Text size={300} weight="bold" style={{ color: canAfford ? '#166534' : tokens.colorStatusDangerForeground3, display: 'block' }}>
                                                            {canAfford ? 'Wallet balance sufficient' : 'Insufficient wallet balance'}
                                                      </Text>
                                                      <Text size={300} style={{ color: canAfford ? '#16a34a' : tokens.colorStatusDangerForeground3 }}>
                                                            Balance: <strong>{fmt(summary?.current_balance ?? 0)}</strong>
                                                            {!canAfford && <> · Shortfall: <strong>{fmt(shortfall)}</strong></>}
                                                      </Text>
                                                </div>
                                                {!canAfford && <Button as="a" href="/wallet" appearance="primary" size="medium" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>Deposit</Button>}
                                          </div>

                                          {/* Slots + payout */}
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingHorizontalM }}>
                                                <div className={styles.fieldGroup}>
                                                      <Text className={styles.fieldLabel}>Worker Slots</Text>
                                                      <div className={styles.counterRow}>
                                                            <Button size="medium" appearance="secondary" icon={<SubtractRegular />} onClick={() => setF('total_slots')(Math.max(1, form.total_slots - 1))} />
                                                            <Input type="number" value={String(form.total_slots)} onChange={e => setF('total_slots')(Math.max(1, parseInt(e.target.value) || 1))} style={{ textAlign: 'center', flex: 1 }} />
                                                            <Button size="medium" appearance="secondary" icon={<AddRegular />} onClick={() => setF('total_slots')(form.total_slots + 1)} />
                                                      </div>
                                                </div>
                                                <div className={styles.fieldGroup}>
                                                      <Text className={styles.fieldLabel}>Payout per Task (₦)</Text>
                                                      <div className={styles.counterRow}>
                                                            <Button size="medium" appearance="secondary" icon={<SubtractRegular />} onClick={() => setF('payout_amount')(Math.max(50, form.payout_amount - 50))} />
                                                            <Input type="number" value={String(form.payout_amount)} onChange={e => setF('payout_amount')(Math.max(50, parseInt(e.target.value) || 50))} style={{ textAlign: 'center', flex: 1 }} />
                                                            <Button size="medium" appearance="secondary" icon={<AddRegular />} onClick={() => setF('payout_amount')(form.payout_amount + 50)} />
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Expiry */}
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Campaign Expiry</Text>
                                                <Input type="datetime-local" value={form.expires_at} min={new Date().toISOString().slice(0, 16)}
                                                      onChange={e => setF('expires_at')(e.target.value)} />
                                          </div>

                                          {/* Toggles */}
                                          {([
                                                { key: 'auto_approve' as keyof FundLaunchForm, label: 'Auto-approve submissions', sub: 'Release payment immediately on submission' },
                                                { key: 'requires_screenshot' as keyof FundLaunchForm, label: 'Require screenshot proof', sub: 'Workers must upload a screenshot' },
                                                { key: 'requires_before_proof' as keyof FundLaunchForm, label: 'Require before & after screenshots', sub: 'Workers must show state before the task' },
                                          ]).map(({ key, label, sub }) => (
                                                <div key={key} className={mergeClasses(styles.toggleRow, form[key] ? styles.toggleRowOn : styles.toggleRowOff)}
                                                      onClick={() => setF(key)(!form[key])}>
                                                      <div>
                                                            <Text size={300} weight="bold" style={{ color: tokens.colorNeutralForeground1 }}>{label}</Text>
                                                            <Text size={300} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>{sub}</Text>
                                                      </div>
                                                      <div style={{ width: 36, height: 20, borderRadius: 999, backgroundColor: form[key] ? tokens.colorBrandBackground : tokens.colorNeutralStroke1, display: 'flex', alignItems: 'center', padding: '0 2px', transition: 'background 0.2s', flexShrink: 0 }}>
                                                            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', boxShadow: tokens.shadow2, transform: form[key] ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                                                      </div>
                                                </div>
                                          ))}

                                          {/* Cost breakdown */}
                                          <div className={styles.costBreakdown}>
                                                <Text size={300} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: tokens.fontWeightBold }}>Cost Breakdown</Text>
                                                <div className={styles.costRow}>
                                                      <span>{form.total_slots} slots × {fmt(form.payout_amount)}</span>
                                                      <span className={styles.mono} style={{ fontWeight: tokens.fontWeightBold }}>{fmt(escrow)}</span>
                                                </div>
                                                <div className={styles.costRow}>
                                                      <span>Platform fee (10%)</span>
                                                      <span className={styles.mono} style={{ fontWeight: tokens.fontWeightBold }}>{fmt(fee)}</span>
                                                </div>
                                                <div className={styles.costTotalRow}>
                                                      <span>Total Charged</span>
                                                      <span className={styles.mono} style={{ color: canAfford ? '#4ade80' : '#f87171' }}>{fmt(total)}</span>
                                                </div>
                                          </div>

                                          {error && (
                                                <div className={styles.inlineError}>
                                                      <ErrorCircleRegular fontSize={14} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0 }} />
                                                      <Text size={300} style={{ color: tokens.colorStatusDangerForeground3 }}>{error}</Text>
                                                </div>
                                          )}
                                    </div>
                              </DialogContent>
                              <DialogActions>
                                    <Button appearance="secondary" onClick={onClose} style={{ borderRadius: '999px', flex: 1, flexShrink: 0,  }}>Cancel</Button>
                                    <Button appearance="primary" disabled={loading || !canAfford} onClick={() => onFund(form)}
                                          icon={loading ? <Spinner size="tiny" /> : <RocketRegular />}
                                          style={{ borderRadius: '999px', padding: '0px 28px', flex: 1, flexShrink: 0, backgroundColor: '#059669', borderColor: '#059669', textWrap: 'nowrap' }}>
                                          {loading ? 'Processing…' : 'Fund & Launch'}
                                    </Button>
                              </DialogActions>
                        </DialogBody>
                  </DialogSurface>
            </Dialog>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

const EditModal: React.FC<{
      job: Job; platforms: Platform[]; loading: boolean; error: string;
      onSave: (f: EditForm) => void; onClose: () => void;
}> = ({ job, platforms, loading, error, onSave, onClose }) => {
      const styles = useStyles();
      const [form, setForm] = useState<EditForm>({
            title: job.title, description: job.description, target_url: job.target_url,
            proof_instructions: job.proof_instructions ?? '', auto_approve: job.auto_approve,
            requires_screenshot: job.requires_screenshot, requires_before_proof: job.requires_before_proof,
            expires_at: toInputDate(job.expires_at),
      });

      const setF = (f: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(prev => ({ ...prev, [f]: e.target.value }));

      return (
            <Dialog open onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
                  <DialogSurface style={{ maxWidth: 480 }}>
                        <DialogBody>
                              <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />}>Edit Job</DialogTitle>
                              <DialogContent>
                                    <div className={styles.modalForm}>
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Title</Text>
                                                <Input value={form.title} onChange={setF('title')} />
                                          </div>
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Target URL</Text>
                                                <Input type="url" value={form.target_url} onChange={setF('target_url')} style={{ fontFamily: tokens.fontFamilyMonospace }} />
                                          </div>
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Description</Text>
                                                <Textarea value={form.description} onChange={setF('description')} rows={3} resize="none" />
                                          </div>
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Proof Instructions</Text>
                                                <Textarea value={form.proof_instructions} onChange={setF('proof_instructions')} rows={2} resize="none" />
                                          </div>
                                          <div className={styles.fieldGroup}>
                                                <Text className={styles.fieldLabel}>Expiry Date</Text>
                                                <Input type="datetime-local" value={form.expires_at} onChange={setF('expires_at')} />
                                          </div>

                                          {/* Toggles */}
                                          {([
                                                { key: 'auto_approve' as keyof EditForm, label: 'Auto-approve' },
                                                { key: 'requires_screenshot' as keyof EditForm, label: 'Require Screenshot' },
                                                { key: 'requires_before_proof' as keyof EditForm, label: 'Before & After Proof' },
                                          ]).map(({ key, label }) => (
                                                <div key={key} className={mergeClasses(styles.toggleRow, form[key] ? styles.toggleRowOn : styles.toggleRowOff)}
                                                      onClick={() => setForm(p => ({ ...p, [key]: !p[key as keyof EditForm] }))}>
                                                      <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>{label}</Text>
                                                      <div style={{ width: 36, height: 20, borderRadius: 999, backgroundColor: form[key] ? tokens.colorBrandBackground : tokens.colorNeutralStroke1, display: 'flex', alignItems: 'center', padding: '0 2px', transition: 'background 0.2s', flexShrink: 0 }}>
                                                            <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff', boxShadow: tokens.shadow2, transform: form[key] ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                                                      </div>
                                                </div>
                                          ))}

                                          {error && (
                                                <div className={styles.inlineError}>
                                                      <ErrorCircleRegular fontSize={14} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0 }} />
                                                      <Text size={300} style={{ color: tokens.colorStatusDangerForeground3 }}>{error}</Text>
                                                </div>
                                          )}
                                    </div>
                              </DialogContent>
                              <DialogActions>
                                    <Button appearance="secondary" onClick={onClose} style={{ borderRadius: '999px', flex: 1 }}>Cancel</Button>
                                    <Button appearance="primary" disabled={loading} onClick={() => onSave(form)}
                                          icon={loading ? <Spinner size="tiny" /> : <SaveRegular />}
                                          style={{ borderRadius: '999px', flex: 1 }}>
                                          {loading ? 'Saving…' : 'Save Changes'}
                                    </Button>
                              </DialogActions>
                        </DialogBody>
                  </DialogSurface>
            </Dialog>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal: React.FC<{
      title: string; description: string; confirmLabel: string;
      confirmVariant: 'danger' | 'warning'; loading: boolean; error: string;
      onConfirm: () => void; onClose: () => void;
}> = ({ title, description, confirmLabel, confirmVariant, loading, error, onConfirm, onClose }) => {
      const styles = useStyles();
      const confirmColor = confirmVariant === 'danger' ? '#dc2626' : '#d97706';
      return (
            <Dialog open onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
                  <DialogSurface style={{ maxWidth: 440 }}>
                        <DialogBody>
                              <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} onClick={onClose} />}>{title}</DialogTitle>
                              <DialogContent>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                                          <Text size={200} style={{ color: tokens.colorNeutralForeground2, lineHeight: '1.6' }}>{description}</Text>
                                          {error && (
                                                <div className={styles.inlineError}>
                                                      <ErrorCircleRegular fontSize={14} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0 }} />
                                                      <Text size={300} style={{ color: tokens.colorStatusDangerForeground3 }}>{error}</Text>
                                                </div>
                                          )}
                                    </div>
                              </DialogContent>
                              <DialogActions>
                                    <Button appearance="secondary" onClick={onClose} style={{ borderRadius: '999px', flex: 1 }}>Go Back</Button>
                                    <Button disabled={loading} onClick={onConfirm}
                                          icon={loading ? <Spinner size="tiny" /> : undefined}
                                          style={{ borderRadius: '999px', flex: 1, backgroundColor: confirmColor, borderColor: confirmColor, color: '#fff' }}>
                                          {loading ? '…' : confirmLabel}
                                    </Button>
                              </DialogActions>
                        </DialogBody>
                  </DialogSurface>
            </Dialog>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
      const styles = useStyles();
      return (
            <div className={styles.card}>
                  <Text className={styles.sectionLabel}>{title}</Text>
                  {children}
            </div>
      );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => {
      const styles = useStyles();
      return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Text size={300} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.colorNeutralForeground3, fontWeight: tokens.fontWeightBold }}>
                        {label}
                  </Text>
                  {typeof value === 'string'
                        ? <Text size={300} weight="semibold" className={mono ? styles.mono : undefined}>{value}</Text>
                        : value
                  }
            </div>
      );
};

const PageSkeleton: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.skeleton}>
                  <div className={styles.skeletonBar} style={{ height: 32, width: 256 }} />
                  <div className={styles.grid}>
                        <div className={styles.leftCol}>
                              {[120, 80, 60].map(h => (
                                    <div key={h} className={styles.skeletonCard}>
                                          <div className={styles.skeletonBar} style={{ height: 12, width: 96 }} />
                                          <div className={styles.skeletonBar} style={{ height: h * 0.6, marginTop: 12 }} />
                                    </div>
                              ))}
                        </div>
                        <div className={styles.rightCol}>
                              <div className={styles.skeletonBar} style={{ height: 192, borderRadius: tokens.borderRadiusXLarge }} />
                              <div className={styles.skeletonBar} style={{ height: 160, borderRadius: tokens.borderRadiusXLarge, backgroundColor: '#1e293b' }} />
                        </div>
                  </div>
            </div>
      );
};

export default JobDir;
