import React, {
      useState,
      useEffect,
      useMemo,
      useRef,
      useCallback,
} from 'react';
import {
      ArrowLeftRegular,
      OpenRegular,
      CheckmarkCircleRegular,
      ErrorCircleRegular,
      ClockRegular,
      PeopleRegular,
      FlashRegular,
      ShieldCheckmarkRegular,
      CloudArrowUpRegular,
      EyeRegular,
      CameraRegular,
      CheckmarkRegular,
      DocumentRegular,
      SpinnerIosRegular,
      DismissRegular,
      LockClosedRegular,
      ChevronRightRegular,
      SparkleRegular,
} from '@fluentui/react-icons';
import {
      makeStyles,
      shorthands,
      tokens,
      Text,
      Button,
      Input,
      Checkbox,
      Badge,
      ProgressBar,
      Spinner,
      Card,
      CardHeader,
      Divider,
      Avatar,
      mergeClasses,
} from '@fluentui/react-components';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';
import {
      JobApplication,
      ProofItemPayload,
      ProofType,
      UserProfile,
} from '@/types/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

interface Platform {
      name: string;
      logo_url: string | null;
}

interface Job {
      id: string;
      user_id?: string;
      platform_id?: string;
      job_type: string;
      status: string;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      views_count: number;
      total_slots: number;
      filled_slots: number;
      applications_count: number;
      posted_at: string;
      completed_at?: string | null;
      expires_at: string;
      created_at?: string;
      platforms?: Platform;
}

interface PlatformStyle {
      name: string;
      gradient: string; // CSS gradient string used inline
      accentColor: string; // CSS color token
      badgeBg: string;
      badgeFg: string;
}

interface ProofFormState {
      worker_social_url: string;
      instructions_seen: boolean;
      before_file: File | null;
      before_preview: string | null;
      after_file: File | null;
      after_preview: string | null;
}

type WorkflowStep =
      | 'loading_job'
      | 'idle'
      | 'applying'
      | 'working'
      | 'submitting'
      | 'submitted'
      | 'already_applied'
      | 'slots_full'
      | 'job_error';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMSXL: PlatformStyle[] = [
      {
            name: 'TikTok',
            gradient: 'linear-gradient(135deg, #000 0%, #1a1a2e 100%)',
            accentColor: '#f43f5e',
            badgeBg: '#fff1f2',
            badgeFg: '#f43f5e',
      },
      {
            name: 'Instagram',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 60%, #f59e0b 100%)',
            accentColor: '#db2777',
            badgeBg: '#fdf2f8',
            badgeFg: '#db2777',
      },
      {
            name: 'Twitter / X',
            gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            accentColor: '#0f172a',
            badgeBg: '#f1f5f9',
            badgeFg: '#0f172a',
      },
      {
            name: 'YouTube',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            accentColor: '#dc2626',
            badgeBg: '#fef2f2',
            badgeFg: '#dc2626',
      },
      {
            name: 'Telegram',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
            accentColor: '#2563eb',
            badgeBg: '#eff6ff',
            badgeFg: '#2563eb',
      },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function uploadScreenshot(file: File, userId: string): Promise<string> {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
            .from('Screenshots')
            .upload(path, file, { upsert: false });
      if (error || !data) throw new Error(`Upload failed: ${error?.message || 'No data returned'}`);
      const { data: { publicUrl } } = supabase.storage.from('Screenshots').getPublicUrl(data.path);
      return publicUrl;
}

function formatCurrency(amount: number, currency: string): string {
      return `${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      // ── Page shell ──────────────────────────────────────────────────────────
      page: {
            minHeight: '100vh',
            backgroundColor: tokens.colorNeutralBackground2,
            paddingBottom: '96px',
            fontFamily: tokens.fontFamilyBase,
      },
      main: {
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
      twoCol: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalXL,
            '@media (min-width: 1024px)': {
                  gridTemplateColumns: '2fr 1fr',
            },
      },
      mainCol: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      sidebar: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalM,
            '@media (min-width: 1024px)': {
                  position: 'sticky',
                  top: '80px',
            },
      },

      // ── Generic card ────────────────────────────────────────────────────────
      card: {
            backgroundColor: tokens.colorNeutralBackground1,
            borderRadius: tokens.borderRadiusXLarge,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalXL),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
            position: 'relative',
            overflow: 'hidden',
      },
      cardSm: {
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
      },

      // ── Header ──────────────────────────────────────────────────────────────
      header: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
            '@media (min-width: 640px)': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
            },
      },
      headerBadges: {
            display: 'flex',
            gap: tokens.spacingHorizontalS,
            flexShrink: 0,
      },
      escrowId: {
            fontFamily: tokens.fontFamilyMonospace,
            color: tokens.colorNeutralForeground2,
            userSelect: 'all',
      },

      // ── Job hero ────────────────────────────────────────────────────────────
      statsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
            paddingTop: tokens.spacingVerticalL,
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            '@media (min-width: 768px)': {
                  gridTemplateColumns: 'repeat(4, 1fr)',
            },
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
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground1,
      },
      progressRow: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      progressLabel: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
      },

      // ── Instruction card ─────────────────────────────────────────────────
      stepRow: {
            display: 'flex',
            gap: tokens.spacingHorizontalM,
            alignItems: 'flex-start',
      },
      stepNum: {
            minWidth: '32px',
            height: '32px',
            borderRadius: tokens.borderRadiusMedium,
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: tokens.fontWeightBold,
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground1,
            flexShrink: 0,
      },
      stepBody: {
            flex: 1,
            paddingTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      warningBox: {
            backgroundColor: '#fffbeb',
            ...shorthands.border('1px', 'solid', '#fde68a'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
      },
      escrowShield: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
      },
      escrowIcon: {
            ...shorthands.padding(tokens.spacingVerticalS),
            backgroundColor: '#f0fdf4',
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
            color: '#16a34a',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
      },

      // ── Sidebar cards ────────────────────────────────────────────────────
      payoutHighlight: {
            background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
            ...shorthands.border('1px', 'solid', '#bfdbfe'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },
      payoutAmount: {
            fontFamily: tokens.fontFamilyMonospace,
            fontWeight: tokens.fontWeightBold,
            fontSize: '28px',
            color: tokens.colorNeutralForeground1,
      },
      metaGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingVerticalXS,
      },
      metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase200,
      },
      featureList: {
            backgroundColor: '#eff6ff',
            ...shorthands.border('1px', 'solid', '#bfdbfe'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
      },
      featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            fontSize: tokens.fontSizeBase200,
            color: '#1e40af',
      },
      statusBadge: {
            ...shorthands.padding('10px', tokens.spacingHorizontalM),
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
      },
      checkboxLabel: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalS,
            cursor: 'pointer',
      },

      // ── Screenshot dropzone ──────────────────────────────────────────────
      dropzone: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalM),
            ...shorthands.border('2px', 'dashed', tokens.colorNeutralStroke1),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            cursor: 'pointer',
            transition: 'border-color 0.15s, background-color 0.15s',
            minHeight: '90px',
            textAlign: 'center',
            ':hover': {
                  borderColor: tokens.colorBrandStroke1,
                  backgroundColor: tokens.colorBrandBackground2,
            },
      },
      dropzonePreview: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            backgroundColor: '#f0fdf4',
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
      },
      previewThumb: {
            width: '48px',
            height: '48px',
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            overflow: 'hidden',
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
            flexShrink: 0,
      },
      previewThumbImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
      },

      // ── Platform logo box ────────────────────────────────────────────────
      platformLogo: {
            width: '56px',
            height: '56px',
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
      },

      // ── Error box ────────────────────────────────────────────────────────
      errorBox: {
            backgroundColor: tokens.colorStatusDangerBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorStatusDangerBorder1),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacingHorizontalXS,
      },

      // ── Full-screen overlay ──────────────────────────────────────────────
      overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 2200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
      },
      overlayCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.borderRadius(tokens.borderRadiusXLarge),
            ...shorthands.padding(tokens.spacingVerticalXXL, tokens.spacingHorizontalXXL),
            maxWidth: '320px',
            width: '100%',
            boxShadow: tokens.shadow64,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacingVerticalL,
      },

      // ── Icon accent boxes ────────────────────────────────────────────────
      iconBoxAmber: {
            width: '56px',
            height: '56px',
            backgroundColor: '#fffbeb',
            ...shorthands.border('1px', 'solid', '#fde68a'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
      },
      iconBoxGreen: {
            width: '56px',
            height: '56px',
            backgroundColor: '#f0fdf4',
            ...shorthands.border('1px', 'solid', '#bbf7d0'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a',
      },
      iconBoxBlue: {
            width: '56px',
            height: '56px',
            backgroundColor: '#eff6ff',
            ...shorthands.border('1px', 'solid', '#bfdbfe'),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
      },
      iconBoxSlate: {
            width: '56px',
            height: '56px',
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorNeutralForeground3,
      },
      iconBoxBlueSmall: {
            ...shorthands.padding(tokens.spacingVerticalS),
            backgroundColor: '#eff6ff',
            ...shorthands.border('1px', 'solid', '#bfdbfe'),
            ...shorthands.borderRadius(tokens.borderRadiusMedium),
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
      },

      // ── Success list ─────────────────────────────────────────────────────
      successList: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            ...shorthands.borderRadius(tokens.borderRadiusLarge),
            ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
            textAlign: 'left',
            width: '100%',
      },
      successItem: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground2,
      },

      // ── Transition spinner card ──────────────────────────────────────────
      transitionCard: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacingVerticalL,
            minHeight: '220px',
      },

      // ── Center state ────────────────────────────────────────────────────
      centerState: {
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacingVerticalL,
      },

      // ── Page loading ────────────────────────────────────────────────────
      pageLoading: {
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
      },

      // ── Form section divider ────────────────────────────────────────────
      formHeader: {
            paddingBottom: tokens.spacingVerticalM,
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },

      fullWidth: {
            width: '100%',
      },
});

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const JobDetail: React.FC = () => {
      const { job_id } = useParams<{ job_id: string }>();
      const navigate = useNavigate();
      const { profile: user } = useAuth();
      const styles = useStyles();

      const [job, setJob] = useState<Job | null>(null);
      const [step, setStep] = useState<WorkflowStep>('loading_job');
      const [application, setApplication] = useState<JobApplication | null>(null);
      const [actionError, setActionError] = useState('');

      const [proofForm, setProofForm] = useState<ProofFormState>({
            worker_social_url: '',
            instructions_seen: false,
            before_file: null,
            before_preview: null,
            after_file: null,
            after_preview: null,
      });

      const platformInfo = useMemo<PlatformStyle>(() => {
            if (!job?.platforms) return PLATFORMSXL[0];
            return PLATFORMSXL.find((p) => job.platforms!.name.includes(p.name)) ?? PLATFORMSXL[0];
      }, [job]);

      useEffect(() => {
            if (!job_id || !user?.user_id) return;
            const load = async () => {
                  setStep('loading_job');
                  const { data: jobData, error: jobError } = await supabase
                        .from('jobs')
                        .select('*, platforms (*)')
                        .eq('id', job_id)
                        .single();
                  if (jobError || !jobData) { setStep('job_error'); return; }
                  const j = jobData as Job;
                  setJob(j);
                  if (j.filled_slots >= j.total_slots) { setStep('slots_full'); return; }
                  const { data: appData } = await supabase
                        .from('job_applications')
                        .select('*')
                        .eq('job_id', job_id)
                        .eq('worker_id', user.user_id)
                        .maybeSingle();
                  if (appData) {
                        setApplication(appData as JobApplication);
                        setStep(['APPLIED', 'WORKING'].includes(appData.status) ? 'working' : 'already_applied');
                        return;
                  }
                  setStep('idle');
            };
            load();
      }, [job_id, user?.user_id]);

      const handleApply = useCallback(async () => {
            setStep('applying');
            setActionError('');
            try {
                  const { data, error } = await supabase.rpc('apply_and_start_job', { p_job_id: job_id });
                  if (error) { setActionError(error.message); setStep('idle'); return; }
                  if (data?.success) {
                        const { data: appData } = await supabase
                              .from('job_applications').select('*').eq('id', data.application_id).single();
                        setApplication(appData as JobApplication);
                        setStep('working');
                  }
            } catch { setActionError('Something went wrong. Please try again.'); setStep('idle'); }
      }, [job_id]);

      const handleSubmitProof = useCallback(async (e: React.FormEvent) => {
            e.preventDefault();
            setActionError('');
            if (!proofForm.worker_social_url.trim()) { setActionError('Please enter your social media profile URL or username.'); return; }
            if (!proofForm.instructions_seen) { setActionError('Please confirm you have read and followed the instructions.'); return; }
            if (job?.requires_screenshot && !proofForm.after_file) { setActionError('Please upload your proof screenshot.'); return; }
            if (job?.requires_before_proof && !proofForm.before_file) { setActionError('This job requires a before screenshot. Please upload it.'); return; }
            setStep('submitting');
            try {
                  const items: ProofItemPayload[] = [];
                  if (job?.requires_before_proof && proofForm.before_file) {
                        items.push({ proof_type: 'SCREENSHOT', value: await uploadScreenshot(proofForm.before_file, user!.user_id), is_before: true, display_order: 0 });
                  }
                  if (job?.requires_screenshot && proofForm.after_file) {
                        items.push({ proof_type: 'SCREENSHOT', value: await uploadScreenshot(proofForm.after_file, user!.user_id), is_before: false, display_order: items.length });
                  }
                  items.push({ proof_type: 'USERNAME', value: proofForm.worker_social_url.trim(), is_before: false, display_order: items.length });
                  const { data, error } = await supabase.rpc('submit_job_proof', {
                        p_application_id: application!.id,
                        p_worker_social_url: proofForm.worker_social_url.trim(),
                        p_instructions_seen: proofForm.instructions_seen,
                        p_items: items,
                  });
                  if (error) { setActionError(error.message); setStep('working'); return; }
                  if (data?.success) setStep('submitted');
            } catch (err: any) { setActionError(err.message ?? 'Upload failed. Please try again.'); setStep('working'); }
      }, [proofForm, job, application, user]);

      const handleBeforeFile = useCallback((file: File) => {
            setProofForm((prev) => ({ ...prev, before_file: file, before_preview: URL.createObjectURL(file) }));
      }, []);

      const handleAfterFile = useCallback((file: File) => {
            setProofForm((prev) => ({ ...prev, after_file: file, after_preview: URL.createObjectURL(file) }));
      }, []);

      const clearBeforeFile = useCallback(() => {
            setProofForm((prev) => { if (prev.before_preview) URL.revokeObjectURL(prev.before_preview); return { ...prev, before_file: null, before_preview: null }; });
      }, []);

      const clearAfterFile = useCallback(() => {
            setProofForm((prev) => { if (prev.after_preview) URL.revokeObjectURL(prev.after_preview); return { ...prev, after_file: null, after_preview: null }; });
      }, []);

      if (step === 'loading_job') return <PageLoadingState />;

      if (step === 'job_error' || !job) {
            return (
                  <div className={styles.centerState}>
                        <div className={styles.iconBoxAmber} style={{ width: 64, height: 64 }}>
                              <ErrorCircleRegular fontSize={28} />
                        </div>
                        <Text size={500} weight="semibold">Job Not Found</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, textAlign: 'center', maxWidth: 280 }}>
                              This job may have expired or been removed from the marketplace.
                        </Text>
                        <Button
                              appearance="transparent"
                              icon={<ArrowLeftRegular />}
                              onClick={() => navigate('/marketplace')}
                        >
                              Back to Marketplace
                        </Button>
                  </div>
            );
      }

      const slotsLeft = job.total_slots - job.filled_slots;
      const progressPercent = Math.min(100, Math.floor((job.filled_slots / job.total_slots) * 100));

      return (
            <div className={styles.page}>
                  {step === 'submitting' && <UploadingState />}
                  <main className={styles.main}>
                        <PageHeader job={job} platformInfo={platformInfo} />
                        <div className={styles.twoCol}>
                              <div className={styles.mainCol}>
                                    <JobHeroCard job={job} platformInfo={platformInfo} progressPercent={progressPercent} slotsLeft={slotsLeft} />
                                    <InstructionCard job={job} platformInfo={platformInfo} />
                              </div>
                              <div className={styles.sidebar}>
                                    <SidebarPanel
                                          job={job}
                                          user={user as UserProfile}
                                          step={step}
                                          actionError={actionError}
                                          proofForm={proofForm}
                                          setProofForm={setProofForm}
                                          onApply={handleApply}
                                          onSubmitProof={handleSubmitProof}
                                          onBeforeFile={handleBeforeFile}
                                          onAfterFile={handleAfterFile}
                                          onClearBefore={clearBeforeFile}
                                          onClearAfter={clearAfterFile}
                                          onFindMore={() => navigate('/marketplace')}
                                    />
                              </div>
                        </div>
                  </main>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarPanelProps {
      job: Job;
      user: UserProfile;
      step: WorkflowStep;
      actionError: string;
      proofForm: ProofFormState;
      setProofForm: React.Dispatch<React.SetStateAction<ProofFormState>>;
      onApply: () => void;
      onSubmitProof: (e: React.FormEvent) => void;
      onBeforeFile: (f: File) => void;
      onAfterFile: (f: File) => void;
      onClearBefore: () => void;
      onClearAfter: () => void;
      onFindMore: () => void;
}

const SidebarPanel: React.FC<SidebarPanelProps> = (props) => {
      const { step, job, user } = props;

      if (!user?.is_subscribed) return <NotSubscribedCard />;

      switch (step) {
            case 'idle':
                  return <ApplyCard job={job} error={props.actionError} onApply={props.onApply} />;
            case 'applying':
                  return <TransitionCard label="Securing your slot…" sub="Checking availability and locking you in." />;
            case 'working':
                  return (
                        <ProofForm
                              job={job}
                              proofForm={props.proofForm}
                              setProofForm={props.setProofForm}
                              onSubmit={props.onSubmitProof}
                              onBeforeFile={props.onBeforeFile}
                              onAfterFile={props.onAfterFile}
                              onClearBefore={props.onClearBefore}
                              onClearAfter={props.onClearAfter}
                              error={props.actionError}
                        />
                  );
            case 'submitting':
                  return <TransitionCard label="Uploading your proof…" sub="Please keep this page open." />;
            case 'submitted':
                  return <SubmittedCard job={job} onFindMore={props.onFindMore} />;
            case 'already_applied':
                  return <AlreadyAppliedCard job={job} onFindMore={props.onFindMore} />;
            case 'slots_full':
                  return <SlotFullCard job={job} onFindMore={props.onFindMore} />;
            default:
                  return null;
      }
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR STATE CARDS
// ─────────────────────────────────────────────────────────────────────────────

const NotSubscribedCard: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm)} style={{ textAlign: 'center', alignItems: 'center' }}>
                  <div className={styles.iconBoxAmber}>
                        <LockClosedRegular fontSize={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Text size={400} weight="semibold" block>Membership Required</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                              You need an active subscription to earn from micro-tasks. Join the Earners Club and start earning today.
                        </Text>
                  </div>
                  <div className={styles.featureList} style={{ width: '100%' }}>
                        {['Access all active jobs', 'Instant payout on approval', 'Priority review queue'].map((f) => (
                              <div key={f} className={styles.featureItem}>
                                    <CheckmarkRegular fontSize={18} color="#3b82f6" />
                                    <Text size={300}>{f}</Text>
                              </div>
                        ))}
                  </div>
                  <Button appearance="primary" className={styles.fullWidth} size="large" style={{ borderRadius: '999px' }}>
                        Subscribe — ₦5,000 / month
                  </Button>
            </div>
      );
};

const ApplyCard: React.FC<{ job: Job; error: string; onApply: () => void }> = ({ job, error, onApply }) => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm)}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text size={400} weight="semibold" block>Ready to start?</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                              Click below to claim a slot. You have until{' '}
                              <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>
                                    {job.expires_at ? new Date(job.expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : 'expiry'}
                              </Text>{' '}
                              to submit your proof.
                        </Text>
                  </div>

                  <div className={styles.payoutHighlight}>
                        <Text size={300} weight="semibold" style={{ color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                              Guaranteed Payout
                        </Text>
                        <span className={styles.payoutAmount}>{formatCurrency(job.payout_amount, job.payout_currency)}</span>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                              {job.auto_approve ? 'Auto-approved · instant wallet credit' : 'Manual review · up to 24h'}
                        </Text>
                  </div>

                  {error && (
                        <div className={styles.errorBox}>
                              <ErrorCircleRegular fontSize={18} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0, marginTop: 2 }} />
                              <Text size={300} style={{ color: tokens.colorStatusDangerForeground3 }}>{error}</Text>
                        </div>
                  )}

                  <Button
                        appearance="primary"
                        size="large"
                        icon={<ChevronRightRegular />}
                        iconPosition="after"
                        onClick={onApply}
                        className={styles.fullWidth}
                        style={{ borderRadius: '999px', justifyContent: 'center' }}
                  >
                        Claim Slot & Start Task
                  </Button>

                  <div className={styles.metaGrid}>
                        {[
                              { icon: <PeopleRegular fontSize={18} />, label: `${job.total_slots - job.filled_slots} slots left` },
                              { icon: <EyeRegular fontSize={18} />, label: `${job.views_count} views` },
                              { icon: <ShieldCheckmarkRegular fontSize={18} />, label: 'Escrow protected' },
                              job.auto_approve
                                    ? { icon: <FlashRegular fontSize={18} style={{ color: '#16a34a' }} />, label: 'Auto-approved' }
                                    : { icon: <ClockRegular fontSize={18} />, label: 'Manual review' },
                        ].map(({ icon, label }) => (
                              <div key={label} className={styles.metaItem}>
                                    {icon}
                                    <Text size={300}>{label}</Text>
                              </div>
                        ))}
                  </div>
            </div>
      );
};

const TransitionCard: React.FC<{ label: string; sub: string }> = ({ label, sub }) => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm, styles.transitionCard)}>
                  <Spinner size="medium" label={label} labelPosition="below" />
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>{sub}</Text>
            </div>
      );
};

const SubmittedCard: React.FC<{ job: Job; onFindMore: () => void }> = ({ job, onFindMore }) => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm)} style={{ textAlign: 'center', alignItems: 'center' }}>
                  <div className={styles.iconBoxGreen}>
                        <CheckmarkCircleRegular fontSize={28} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Text size={400} weight="semibold" block>Proof Submitted!</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                              Your verification has been securely recorded.{' '}
                              {job.auto_approve
                                    ? 'Your wallet will be credited automatically.'
                                    : `You'll receive ${formatCurrency(job.payout_amount, job.payout_currency)} once approved.`}
                        </Text>
                  </div>
                  <div className={styles.successList}>
                        {[
                              job.auto_approve ? 'Payout processing automatically' : 'Under review · up to 24 hours',
                              'Notification sent to your account',
                              'Check your wallet for the credit',
                        ].map((line) => (
                              <div key={line} className={styles.successItem}>
                                    <CheckmarkRegular fontSize={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    <Text size={300}>{line}</Text>
                              </div>
                        ))}
                  </div>
                  <Button appearance="secondary" className={styles.fullWidth} size="large" style={{ borderRadius: '999px' }} onClick={onFindMore}>
                        Find More Jobs
                  </Button>
            </div>
      );
};

const AlreadyAppliedCard: React.FC<{ job: Job; onFindMore: () => void }> = ({ job, onFindMore }) => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm)} style={{ textAlign: 'center', alignItems: 'center' }}>
                  <div className={styles.iconBoxBlue}>
                        <CheckmarkCircleRegular fontSize={28} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Text size={400} weight="semibold" block>Already Submitted</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                              You've already submitted proof for this job.{' '}
                              {job.auto_approve ? 'Your payout is being processed.' : "It's under review — you'll be notified once approved."}
                        </Text>
                  </div>
                  <Button appearance="secondary" className={styles.fullWidth} style={{ borderRadius: '999px' }} onClick={onFindMore}>
                        Browse More Jobs
                  </Button>
            </div>
      );
};

const SlotFullCard: React.FC<{ job: Job; onFindMore: () => void }> = ({ job, onFindMore }) => {
      const styles = useStyles();
      return (
            <div className={mergeClasses(styles.card, styles.cardSm)} style={{ textAlign: 'center', alignItems: 'center' }}>
                  <div className={styles.iconBoxSlate}>
                        <PeopleRegular fontSize={24} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <Text size={400} weight="semibold" block>All Slots Filled</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                              All {job.total_slots} slots for this job have been claimed. Check out similar jobs in the marketplace.
                        </Text>
                  </div>
                  <Button appearance="primary" className={styles.fullWidth} style={{ borderRadius: '999px' }} onClick={onFindMore}>
                        Find Other Jobs
                  </Button>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROOF FORM
// ─────────────────────────────────────────────────────────────────────────────

interface ProofFormProps {
      job: Job;
      proofForm: ProofFormState;
      setProofForm: React.Dispatch<React.SetStateAction<ProofFormState>>;
      onSubmit: (e: React.FormEvent) => void;
      onBeforeFile: (f: File) => void;
      onAfterFile: (f: File) => void;
      onClearBefore: () => void;
      onClearAfter: () => void;
      error: string;
}

const ProofForm: React.FC<ProofFormProps> = ({
      job, proofForm, setProofForm, onSubmit, onBeforeFile, onAfterFile, onClearBefore, onClearAfter, error,
}) => {
      const styles = useStyles();
      const beforeRef = useRef<HTMLInputElement>(null);
      const afterRef = useRef<HTMLInputElement>(null);

      const isValid = useMemo(() => {
            if (!proofForm.worker_social_url.trim()) return false;
            if (!proofForm.instructions_seen) return false;
            if (job.requires_screenshot && !proofForm.after_file) return false;
            if (job.requires_before_proof && !proofForm.before_file) return false;
            return true;
      }, [proofForm, job]);

      return (
            <div className={mergeClasses(styles.card, styles.cardSm)}>
                  <div className={styles.formHeader}>
                        <Text size={400} weight="semibold" block>Submit Task Proof</Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                              Enter your verification handle and upload your screenshots below.
                        </Text>
                  </div>

                  <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
                        {/* Social URL */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                              <Text size={300} weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colorNeutralForeground2 }}>
                                    Your Account URL / Handle
                              </Text>
                              <Input
                                    required
                                    placeholder="e.g. https://instagram.com/username"
                                    value={proofForm.worker_social_url}
                                    onChange={(e) => setProofForm((prev) => ({ ...prev, worker_social_url: e.target.value }))}
                                    style={{ width: '100%' }}
                              />
                        </div>

                        {/* Screenshots */}
                        {job.requires_screenshot && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                                    {job.requires_before_proof && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                                                <Text size={300} weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colorNeutralForeground2 }}>
                                                      1 — Before Screenshot
                                                </Text>
                                                <ScreenshotDropzone
                                                      preview={proofForm.before_preview}
                                                      fileName={proofForm.before_file?.name ?? null}
                                                      inputRef={beforeRef}
                                                      label="Attach initial snapshot"
                                                      hint="Taken before you performed the task"
                                                      onFile={onBeforeFile}
                                                      onClear={onClearBefore}
                                                      inputId="before_file"
                                                />
                                          </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                                          <Text size={300} weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colorNeutralForeground2 }}>
                                                {job.requires_before_proof ? '2 — After Screenshot' : 'Screenshot Proof'}
                                          </Text>
                                          <ScreenshotDropzone
                                                preview={proofForm.after_preview}
                                                fileName={proofForm.after_file?.name ?? null}
                                                inputRef={afterRef}
                                                label="Upload proof image"
                                                hint="Shows you completed the task"
                                                onFile={onAfterFile}
                                                onClear={onClearAfter}
                                                inputId="after_file"
                                          />
                                    </div>
                              </div>
                        )}

                        {/* Status badge */}
                        <div className={styles.statusBadge}>
                              {job.auto_approve ? (
                                    <>
                                          <FlashRegular fontSize={14} style={{ color: '#16a34a', flexShrink: 0 }} />
                                          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Instant auto-approval configured</Text>
                                    </>
                              ) : (
                                    <>
                                          <ClockRegular fontSize={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                                          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>Manually reviewed · 24h SLA</Text>
                                    </>
                              )}
                        </div>

                        {/* Instructions checkbox */}
                        <Checkbox
                              checked={proofForm.instructions_seen}
                              onChange={(_, data) => setProofForm((prev) => ({ ...prev, instructions_seen: !!data.checked }))}
                              label={
                                    <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5' }}>
                                          I have read the instructions, performed the task on the platform, and the screenshots I'm uploading accurately reflect my submission.
                                    </Text>
                              }
                        />

                        {/* Error */}
                        {error && (
                              <div className={styles.errorBox}>
                                    <ErrorCircleRegular fontSize={14} style={{ color: tokens.colorStatusDangerForeground3, flexShrink: 0, marginTop: 2 }} />
                                    <Text size={300} style={{ color: tokens.colorStatusDangerForeground3 }}>{error}</Text>
                              </div>
                        )}

                        <Button
                              type="submit"
                              appearance="primary"
                              size="large"
                              disabled={!isValid}
                              className={styles.fullWidth}
                              style={{ borderRadius: '999px', justifyContent: 'center' }}
                        >
                              Finish & Submit Task
                        </Button>
                  </form>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREENSHOT DROPZONE
// ─────────────────────────────────────────────────────────────────────────────

interface DropzoneProps {
      preview: string | null;
      fileName: string | null;
      inputRef: React.RefObject<HTMLInputElement>;
      label: string;
      hint: string;
      onFile: (f: File) => void;
      onClear: () => void;
      inputId: string;
}

const ScreenshotDropzone: React.FC<DropzoneProps> = ({
      preview, fileName, inputRef, label, hint, onFile, onClear, inputId,
}) => {
      const styles = useStyles();

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = '';
      };

      return (
            <div>
                  <input ref={inputRef} id={inputId} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
                  {preview ? (
                        <div className={styles.dropzonePreview}>
                              <div className={styles.previewThumb}>
                                    <img src={preview} className={styles.previewThumbImg} alt="Preview" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text size={300} weight="semibold" truncate block style={{ color: tokens.colorNeutralForeground1 }}>{fileName}</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                          <CheckmarkRegular fontSize={10} style={{ color: '#16a34a' }} />
                                          <Text size={300} style={{ color: '#16a34a' }}>Ready to submit</Text>
                                    </div>
                              </div>
                              <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<DismissRegular />}
                                    onClick={onClear}
                                    style={{ minWidth: 'unset', borderRadius: tokens.borderRadiusMedium }}
                              />
                        </div>
                  ) : (
                        <label htmlFor={inputId} className={styles.dropzone}>
                              <CameraRegular fontSize={22} style={{ color: tokens.colorNeutralForeground3, marginBottom: 6 }} />
                              <Text size={200} weight="medium" style={{ color: tokens.colorNeutralForeground2 }}>{label}</Text>
                              <Text size={300} style={{ color: tokens.colorNeutralForeground3, marginTop: 2 }}>{hint}</Text>
                              <Text size={300} style={{ color: tokens.colorNeutralForeground4, marginTop: 4 }}>JPEG · PNG · up to 5MB</Text>
                        </label>
                  )}
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB HERO CARD
// ─────────────────────────────────────────────────────────────────────────────

interface JobHeroCardProps {
      job: Job;
      platformInfo: PlatformStyle;
      progressPercent: number;
      slotsLeft: number;
}

const JobHeroCard: React.FC<JobHeroCardProps> = ({ job, platformInfo, progressPercent, slotsLeft }) => {
      const styles = useStyles();
      return (
            <div className={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalL }}>
                        <div className={styles.platformLogo} style={{ background: platformInfo.gradient, padding: 10 }}>
                              <img
                                    src={job.platforms?.logo_url ?? 'https://placehold.co/100x100'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadiusMedium }}
                                    alt={job.platforms?.name ?? 'Platform'}
                              />
                        </div>
                        <div>
                              <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.08em' }} block>
                                    Escrow Protected
                              </Text>
                              <Text size={400} weight="semibold" block>Multi-Sig Escrow Shield</Text>
                        </div>
                  </div>

                  <Text size={200} style={{ color: tokens.colorNeutralForeground2, lineHeight: '1.6' }}>
                        {job.description}
                  </Text>

                  <div className={styles.statsGrid}>
                        {[
                              { label: 'Guaranteed Payout', value: formatCurrency(job.payout_amount, job.payout_currency) },
                              { label: 'Total Slots', value: `${job.total_slots} Slots` },
                              { label: 'Slots Remaining', value: `${slotsLeft} Left` },
                              { label: 'Task Views', value: String(job.views_count) },
                        ].map(({ label, value }) => (
                              <div key={label} className={styles.statCell}>
                                    <Text size={300} style={{ color: tokens.colorNeutralForeground3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Text>
                                    <span className={styles.statValue}>{value}</span>
                              </div>
                        ))}
                  </div>

                  <div className={styles.progressRow}>
                        <div className={styles.progressLabel}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <PeopleRegular fontSize={13} style={{ color: tokens.colorNeutralForeground3 }} />
                                    <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground3 }}>Slots Utilization</Text>
                              </div>
                              <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>{progressPercent}% Filled</Text>
                        </div>
                        <ProgressBar value={progressPercent / 300} thickness="medium" />
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTION CARD
// ─────────────────────────────────────────────────────────────────────────────

interface InstructionCardProps {
      job: Job;
      platformInfo: PlatformStyle;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ job, platformInfo }) => {
      const styles = useStyles();

      const steps = [
            {
                  n: '01',
                  title: 'Perform Social Operation',
                  body: 'Navigate to the platform target and complete the physical task (follow, like, comment, etc.).',
                  cta: (
                        <a
                              href={job.target_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 14px',
                                    background: platformInfo.gradient,
                                    color: '#fff',
                                    fontSize: tokens.fontSizeBase200,
                                    fontWeight: tokens.fontWeightSemibold,
                                    borderRadius: tokens.borderRadiusMedium,
                                    textDecoration: 'none',
                                    marginTop: 4,
                              }}
                        >
                              Open task on {job.platforms?.name}
                              <OpenRegular fontSize={18} />
                        </a>
                  ),
            },
            {
                  n: '02',
                  title: 'Document Proof of Completion',
                  body: 'Take the required screenshots before and after completing the task.',
                  cta: job.proof_instructions ? (
                        <div className={styles.warningBox}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ErrorCircleRegular fontSize={18 } style={{ color: '#d97706' }} />
                                    <Text size={300} weight="semibold" style={{ color: '#92400e' }}>Verification Rules:</Text>
                              </div>
                              <Text size={300} style={{ color: '#92400e', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{job.proof_instructions}</Text>
                        </div>
                  ) : null,
            },
            {
                  n: '03',
                  title: 'Submit Verification Details',
                  body: 'Enter your social handle and attach the screenshot evidence in the sidebar form to trigger your payout review.',
                  cta: null,
            },
      ];

      return (
            <div className={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                        <div className={styles.iconBoxBlueSmall}>
                              <DocumentRegular fontSize={18} />
                        </div>
                        <Text size={400} weight="semibold">Earner Audit Requirements</Text>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL }}>
                        {steps.map(({ n, title, body, cta }) => (
                              <div key={n} className={styles.stepRow}>
                                    <div className={styles.stepNum}>{n}</div>
                                    <div className={styles.stepBody}>
                                          <Text size={300} weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.colorNeutralForeground1 }}>
                                                {title}
                                          </Text>
                                          <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.6' }}>{body}</Text>
                                          {cta}
                                    </div>
                              </div>
                        ))}
                  </div>

                  <div className={styles.escrowShield}>
                        <div className={styles.escrowIcon}>
                              <ShieldCheckmarkRegular fontSize={17} />
                        </div>
                        <div>
                              <Text size={300} weight="semibold" block>Instant Escrow Release Shield</Text>
                              <Text size={300} style={{ color: tokens.colorNeutralForeground3, lineHeight: '1.5', marginTop: 4, display: 'block' }}>
                                    Your payment is fully locked in escrow. Submissions are verified by system parameters or human review within 24 hours.
                              </Text>
                        </div>
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────────────────────

const PageHeader: React.FC<{ job: Job; platformInfo: PlatformStyle }> = ({ job, platformInfo }) => {
      const styles = useStyles();
      return (
            <div className={styles.header}>
                  <div>
                        <Text size={500} weight="semibold" style={{ color: tokens.colorNeutralForeground1, letterSpacing: '-0.01em' }} block>
                              {job.title}
                        </Text>
                        <Text size={300} style={{ color: tokens.colorNeutralForeground3, marginTop: 4 }}>
                              Escrow ID:{' '}
                              <span className={styles.escrowId}>{job.id}</span>
                        </Text>
                  </div>
                  <div className={styles.headerBadges}>
                        <Badge
                              appearance="filled"
                              style={{ backgroundColor: platformInfo.badgeBg, color: platformInfo.badgeFg, border: `1px solid ${platformInfo.accentColor}22` }}
                        >
                              {job.platforms?.name} Verified
                        </Badge>
                        <Badge appearance="filled" color="informative">Active</Badge>
                  </div>
            </div>
      );
};

// ─────────────────────────────────────────────────────────────────────────────
// LOADING / OVERLAY STATES
// ─────────────────────────────────────────────────────────────────────────────

const PageLoadingState: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.pageLoading}>
                  <Spinner size="medium" label="Loading job details…" labelPosition="below" />
            </div>
      );
};

const UploadingState: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.overlay}>
                  <div className={styles.overlayCard}>
                        <Spinner size="large" />
                        <div style={{ textAlign: 'center' }}>
                              <Text size={300} weight="semibold" block>Uploading Assets</Text>
                              <Text size={300} style={{ color: tokens.colorNeutralForeground3, marginTop: 4 }}>Verifying file metadata structure…</Text>
                        </div>
                  </div>
            </div>
      );
};

export default JobDetail;