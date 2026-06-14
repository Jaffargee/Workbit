import React, { useState, useEffect } from 'react';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';
import { Platform_, JobType } from '@/types/types';
import { NetworkService } from '@/utils/network_service';
import NetworkError from '@/components/NetworkError';

import {
      makeStyles,
      shorthands,
      tokens,
      Button,
      Checkbox,
      Combobox,
      Dialog,
      DialogActions,
      DialogBody,
      DialogContent,
      DialogSurface,
      DialogTitle,
      Field,
      Input,
      MessageBar,
      MessageBarBody,
      Option,
      Select,
      Spinner,
      Text,
      Textarea,
      InputOnChangeData,
      SelectOnChangeData,
} from '@fluentui/react-components';

import {
      Calculator20Regular,
      CheckmarkCircle24Regular,
      Warning20Regular,
      Link20Regular,
      ArrowRight16Regular,
      Info16Regular,
      AppsList20Regular,
      Globe20Regular,
      NumberSymbol20Regular,
      MoneyHand20Regular,
      CalendarClock20Regular,
      ShieldCheckmark16Regular,
      Camera16Regular,
      LayerDiagonalPerson16Regular,
      Flash16Regular,
} from '@fluentui/react-icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(days: number): string {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString();
}

const MAX_RETRIES = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostJobForm {
      platform_id: string;
      job_type: JobType;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      total_slots: number;
      expires_in_days: number;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      root: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalM,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            '@media (min-width: 1024px)': {
                  gridTemplateColumns: '3fr 2fr',
            },
      },

      // ── Form card ─────────────────────────────────────────────────────────
      formCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusXLarge,
            ...shorthands.padding(
                  tokens.spacingVerticalL,
                  tokens.spacingHorizontalL
            ),
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalL,
      },
      formRow: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalM,
            '@media (min-width: 640px)': {
                  gridTemplateColumns: '1fr 1fr',
            },
      },
      formRowSingle: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalM,
      },

      // ── Checkbox rows ─────────────────────────────────────────────────────
      checkboxGroup: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
      },
      checkboxCard: {
            display: 'flex',
            alignItems: 'flex-start',
            columnGap: tokens.spacingHorizontalS,
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
            cursor: 'pointer',
            transition: 'border-color 0.12s ease, background 0.12s ease',
            ':hover': {
                  borderColor: tokens.colorBrandStroke1,
                  backgroundColor: tokens.colorBrandBackground2,
            },
      },
      checkboxCardActive: {
            borderColor: tokens.colorBrandStroke1,
            backgroundColor: tokens.colorBrandBackground2,
      },
      checkboxMeta: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2px',
            paddingTop: '2px',
      },

      // ── Cost summary sidebar ───────────────────────────────────────────────
      sidebar: {
            position: 'sticky',
            top: '8px',
            alignSelf: 'start',
      },
      costCard: {
            background: 'linear-gradient(145deg, #1b1f2b 0%, #242938 100%)',
            borderRadius: tokens.borderRadiusXLarge,
            ...shorthands.padding(
                  tokens.spacingVerticalL,
                  tokens.spacingHorizontalL
            ),
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: tokens.shadow16,
      },
      costGlyph: {
            position: 'absolute',
            top: 0,
            right: 0,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            opacity: 0.05,
            fontSize: '120px',
            pointerEvents: 'none',
      },
      costTitle: {
            display: 'flex',
            alignItems: 'center',
            columnGap: tokens.spacingHorizontalS,
            marginBottom: tokens.spacingVerticalL,
            position: 'relative',
            zIndex: 1,
      },
      costRows: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
            position: 'relative',
            zIndex: 1,
      },
      costRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      costDivider: {
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            marginTop: tokens.spacingVerticalS,
            marginBottom: tokens.spacingVerticalS,
      },
      infoSteps: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            marginTop: tokens.spacingVerticalL,
            position: 'relative',
            zIndex: 1,
      },
      infoStep: {
            display: 'flex',
            alignItems: 'center',
            columnGap: tokens.spacingHorizontalS,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.08)'),
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
      },
      infoStepNum: {
            width: '24px',
            height: '24px',
            borderRadius: tokens.borderRadiusCircular,
            background: 'rgba(0,120,212,0.25)',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightBold,
            flexShrink: 0,
      },

      // ── Success overlay (faux viewport — no position:fixed) ───────────────
      successOverlayWrap: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...shorthands.padding(tokens.spacingVerticalM),
      },
      successCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusXLarge,
            boxShadow: tokens.shadow64,
            ...shorthands.padding(
                  tokens.spacingVerticalXL,
                  tokens.spacingHorizontalXL
            ),
            maxWidth: '440px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
      },
      successHead: {
            display: 'flex',
            alignItems: 'center',
            columnGap: tokens.spacingHorizontalM,
      },
      successIconBox: {
            width: '44px',
            height: '44px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorPaletteGreenBackground2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: tokens.colorPaletteGreenForeground1,
      },
      paymentBanner: {
            backgroundColor: tokens.colorPaletteYellowBackground2,
            ...shorthands.border(
                  '1px',
                  'solid',
                  tokens.colorPaletteYellowBorderActive
            ),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
      },
      successActions: {
            display: 'flex',
            columnGap: tokens.spacingHorizontalS,
      },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const PostJob: React.FC = () => {
      const styles = useStyles();
      const { profile } = useAuth();

      const [platforms, setPlatforms] = useState<Platform_[]>([]);
      const [platformError, setPlatformError] = useState('');
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState<{
            job_id: string;
            total_cost: number;
      } | null>(null);
      const [submitError, setSubmitError] = useState('');

      const [form, setForm] = useState<PostJobForm>({
            platform_id: '',
            job_type: 'FOLLOW',
            target_url: '',
            payout_amount: 150,
            payout_currency: 'NGN',
            auto_approve: false,
            requires_screenshot: true,
            requires_before_proof: false,
            proof_instructions: '',
            title: '',
            description: '',
            total_slots: 10,
            expires_in_days: 7,
      });

      const set = <K extends keyof PostJobForm>(
            key: K,
            value: PostJobForm[K]
      ) => setForm((prev) => ({ ...prev, [key]: value }));

      const totalCost = form.total_slots * form.payout_amount;
      const platformFee = totalCost * 0.1;
      const grandTotal = totalCost + platformFee;

      // ── Load platforms ────────────────────────────────────────────────────
      useEffect(() => {
            const fetchPlatforms = async () => {
                  const delay = (ms: number) =>
                        new Promise((r) => setTimeout(r, ms));
                  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                        try {
                              if (!NetworkService.isOnline()) {
                                    setPlatformError('No internet connection.');
                                    await delay(1500);
                                    continue;
                              }
                              const { data, error } = await supabase
                                    .from('platforms')
                                    .select('*')
                                    .eq('is_active', true);
                              if (error) {
                                    if (attempt === MAX_RETRIES)
                                          setPlatformError(
                                                'Could not load platforms. Please refresh.'
                                          );
                                    await delay(1000 * attempt);
                                    continue;
                              }
                              if (data?.length) {
                                    setPlatforms(data as Platform_[]);
                                    set('platform_id', data[0].id);
                              }
                              return;
                        } catch {
                              if (attempt === MAX_RETRIES)
                                    setPlatformError(
                                          'Could not load platforms. Please refresh.'
                                    );
                        }
                  }
            };
            fetchPlatforms();
      }, []);

      // ── Submit ────────────────────────────────────────────────────────────
      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setSubmitError('');

            if (!form.platform_id)
                  return setSubmitError('Please select a platform.');
            if (!form.target_url.trim())
                  return setSubmitError('Target URL is required.');
            if (!form.title.trim())
                  return setSubmitError('Job title is required.');

            setLoading(true);
            try {
                  const { data, error } = await supabase
                        .from('jobs')
                        .insert({
                              user_id: profile?.user_id,
                              platform_id: form.platform_id,
                              job_type: form.job_type,
                              target_url: form.target_url.trim(),
                              payout_amount: form.payout_amount,
                              payout_currency: form.payout_currency,
                              auto_approve: form.auto_approve,
                              requires_screenshot: form.requires_screenshot,
                              requires_before_proof: form.requires_before_proof,
                              proof_instructions:
                                    form.proof_instructions?.trim() || null,
                              title: form.title.trim(),
                              description: form.description.trim(),
                              total_slots: form.total_slots,
                              expires_at: addDays(form.expires_in_days),
                        })
                        .select()
                        .maybeSingle();

                  if (error) {
                        setSubmitError(error.message);
                        return;
                  }
                  if (data?.success) {
                        setSuccess({
                              job_id: data.job_id,
                              total_cost:
                                    data.escrow_amount + data.platform_fee,
                        });
                  }
            } catch {
                  setSubmitError(
                        'An unexpected error occurred. Please try again.'
                  );
            } finally {
                  setLoading(false);
            }
      };

      const resetForm = () => {
            setSuccess(null);
            setForm((prev) => ({
                  ...prev,
                  title: '',
                  description: '',
                  target_url: '',
                  proof_instructions: '',
                  total_slots: 10,
                  payout_amount: 150,
            }));
      };

      if (!NetworkService.isOnline()) return <NetworkError />;
      const isMobile = window.innerWidth < 640;

      return (
            <div className={styles.root}>
                  {/* ── Form panel ── */}
                  <div className={styles.formCard}>
                        {/* Success overlay */}
                        {success && (
                              <SuccessOverlay
                                    jobId={success.job_id}
                                    totalCost={success.total_cost}
                                    onReset={resetForm}
                              />
                        )}

                        {/* Error bar */}
                        {submitError && (
                              <MessageBar intent="error">
                                    <MessageBarBody>
                                          {submitError}
                                    </MessageBarBody>
                              </MessageBar>
                        )}

                        <form
                              onSubmit={handleSubmit}
                              style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    rowGap: tokens.spacingVerticalL,
                              }}
                        >
                              {/* Row 1 — Title + Platform */}
                              <div className={styles.formRow}>
                                    <WInput
                                          label="Job Title"
                                          required
                                          placeholder="e.g., Follow my X account"
                                          value={form.title}
                                          onChange={(_, d) =>
                                                set('title', d.value)
                                          }
                                          contentBefore={
                                                <Info16Regular
                                                      style={{
                                                            color: tokens.colorNeutralForeground3,
                                                      }}
                                                />
                                          }
                                    />
                                    <Field
                                          label="Platform"
                                          required
                                          validationState={
                                                platformError ? 'error' : 'none'
                                          }
                                          validationMessage={
                                                platformError || undefined
                                          }
                                    >
                                          <Select
                                                size={isMobile ? "large" : "medium"}
                                                value={form.platform_id}
                                                onChange={(_, d) =>
                                                      set(
                                                            'platform_id',
                                                            d.value
                                                      )
                                                }
                                          >
                                                {platforms.map((p) => (
                                                      <option
                                                            key={p.id}
                                                            value={p.id}
                                                      >
                                                            {p.name}
                                                      </option>
                                                ))}
                                          </Select>
                                    </Field>
                              </div>

                              {/* Row 2 — Target URL + Task Type */}
                              <div className={styles.formRow}>
                                    <WInput
                                          label="Target URL"
                                          required
                                          type="url"
                                          placeholder="https://x.com/yourprofile"
                                          value={form.target_url}
                                          onChange={(_, d) =>
                                                set('target_url', d.value)
                                          }
                                          contentBefore={
                                                <Link20Regular
                                                      style={{
                                                            color: tokens.colorNeutralForeground3,
                                                      }}
                                                />
                                          }
                                    />
                                    <WSelect
                                          options={[
                                                {
                                                      value: 'FOLLOW',
                                                      label: 'Follow',
                                                },
                                                {
                                                      value: 'LIKE',
                                                      label: 'Like',
                                                },
                                                {
                                                      value: 'COMMENT',
                                                      label: 'Comment',
                                                },
                                                {
                                                      value: 'RETWEET',
                                                      label: 'Retweet',
                                                },
                                                {
                                                      value: 'SAVE',
                                                      label: 'Save',
                                                },
                                                {
                                                      value: 'SHARE',
                                                      label: 'Share',
                                                },
                                          ]}
                                          label="Task Type"
                                          value={form.job_type}
                                          onChange={(_, d) =>
                                                set(
                                                      'job_type',
                                                      d.value as JobType
                                                )
                                          }
                                    />
                              </div>

                              {/* Row 3 — Slots + Payout + Expiry */}
                              <div className={styles.formRowSingle}>
                                    <WInput
                                          label="Target URL"
                                          required
                                          type="number"
                                          placeholder="10"
                                          value={String(form.total_slots)}
                                          onChange={(_, d) =>
                                                set(
                                                      'total_slots',
                                                      Math.max(
                                                            1,
                                                            parseInt(d.value) ||
                                                                  1
                                                      )
                                                )
                                          }
                                          contentBefore={
                                                <NumberSymbol20Regular
                                                      style={{
                                                            color: tokens.colorNeutralForeground3,
                                                      }}
                                                />
                                          }
                                    />
                                    <WInput
                                          label="Payout per Task (₦)"
                                          required
                                          type="number"
                                          placeholder="150"
                                          value={String(form.payout_amount)}
                                          onChange={(_, d) =>
                                                set(
                                                      'payout_amount',
                                                      Math.max(
                                                            1,
                                                            parseInt(d.value) ||
                                                                  1
                                                      )
                                                )
                                          }
                                          contentBefore={
                                                <MoneyHand20Regular
                                                      style={{
                                                            color: tokens.colorNeutralForeground3,
                                                      }}
                                                />
                                          }
                                    />
                                    <WSelect
                                          options={[
                                                { value: '1', label: '1 day' },
                                                { value: '3', label: '3 days' },
                                                { value: '7', label: '7 days' },
                                                {
                                                      value: '14',
                                                      label: '14 days',
                                                },
                                                {
                                                      value: '30',
                                                      label: '30 days',
                                                },
                                          ]}
                                          label="Expires In"
                                          value={String(form.expires_in_days)}
                                          onChange={(_, d) =>
                                                set(
                                                      'expires_in_days',
                                                      parseInt(d.value)
                                                )
                                          }
                                    />
                              </div>

                              {/* Description */}
                              <Field label="Task Description" required>
                                    <Textarea
                                          placeholder="List steps clearly: 1. Go to… 2. Click Follow… 3. Screenshot…"
                                          value={form.description}
                                          onChange={(_, d) =>
                                                set('description', d.value)
                                          }
                                          resize="vertical"
                                          rows={4}
                                    />
                              </Field>

                              {/* Proof Instructions */}
                              <Field label="Proof Requirements">
                                    <Textarea
                                          placeholder="e.g., Screenshot showing you've followed the account + your username"
                                          value={form.proof_instructions}
                                          onChange={(_, d) =>
                                                set(
                                                      'proof_instructions',
                                                      d.value
                                                )
                                          }
                                          resize="vertical"
                                          rows={3}
                                    />
                              </Field>

                              {/* Toggles */}
                              <div className={styles.checkboxGroup}>
                                    <CheckboxCard
                                          icon={<Camera16Regular />}
                                          label="Require Screenshot Proof"
                                          description="Workers must upload a screenshot as proof."
                                          checked={form.requires_screenshot}
                                          onChange={(v) =>
                                                set('requires_screenshot', v)
                                          }
                                    />
                                    <CheckboxCard
                                          icon={
                                                <LayerDiagonalPerson16Regular />
                                          }
                                          label="Require Before & After Screenshots"
                                          description="Workers must show state before and after completing the task."
                                          checked={form.requires_before_proof}
                                          onChange={(v) =>
                                                set('requires_before_proof', v)
                                          }
                                    />
                                    <CheckboxCard
                                          icon={<Flash16Regular />}
                                          label="Auto-Approve Submissions"
                                          description="Pay workers automatically without manual review. Higher fraud risk."
                                          checked={form.auto_approve}
                                          onChange={(v) =>
                                                set('auto_approve', v)
                                          }
                                    />
                              </div>

                              {/* Submit */}
                              <Button
                                    type="submit"
                                    appearance="primary"
                                    size="large"
                                    disabled={loading || platforms.length === 0}
                                    icon={
                                          loading ? (
                                                <Spinner size="tiny" />
                                          ) : undefined
                                    }
                                    style={{
                                          width: '100%',
                                          borderRadius:
                                                tokens.borderRadiusCircular,
                                          height: '44px',
                                          fontWeight: tokens.fontWeightSemibold,
                                    }}
                              >
                                    {loading ? 'Posting Job…' : 'Create Job'}
                              </Button>
                        </form>
                  </div>

                  {/* ── Cost summary sidebar ── */}
                  <div className={styles.sidebar}>
                        <div className={styles.costCard}>
                              <span className={styles.costGlyph} aria-hidden>
                                    <Calculator20Regular />
                              </span>

                              <div className={styles.costTitle}>
                                    <Calculator20Regular
                                          style={{
                                                color: '#60a5fa',
                                                fontSize: 20,
                                          }}
                                    />
                                    <Text
                                          size={400}
                                          weight="semibold"
                                          style={{ color: '#ffffff' }}
                                    >
                                          Cost Summary
                                    </Text>
                              </div>

                              <div className={styles.costRows}>
                                    <CostRow
                                          label="Task Cost"
                                          value={`₦${totalCost.toLocaleString()}`}
                                    />
                                    <CostRow
                                          label="Platform Fee (10%)"
                                          value={`₦${platformFee.toLocaleString()}`}
                                    />
                                    <div className={styles.costDivider} />
                                    <div className={styles.costRow}>
                                          <Text
                                                size={400}
                                                weight="bold"
                                                style={{ color: '#ffffff' }}
                                          >
                                                Total Due
                                          </Text>
                                          <Text
                                                size={600}
                                                weight="bold"
                                                style={{ color: '#60a5fa' }}
                                          >
                                                ₦{grandTotal.toLocaleString()}
                                          </Text>
                                    </div>
                              </div>

                              <div className={styles.infoSteps}>
                                    <InfoStep
                                          n={1}
                                          text="Your job is reviewed for safety before going live."
                                    />
                                    <InfoStep
                                          n={2}
                                          text="Funds are held in escrow until each proof is approved."
                                    />
                                    <InfoStep
                                          n={3}
                                          text="Unused slots are refunded if the campaign ends early."
                                    />
                              </div>
                        </div>
                  </div>
            </div>
      );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const WInput: React.FC<{
      contentBefore?: React.ReactNode | any;
      label: string;
      type?:
            | 'number'
            | 'search'
            | 'text'
            | 'time'
            | 'email'
            | 'password'
            | 'tel'
            | 'url'
            | 'date'
            | 'datetime-local'
            | 'month'
            | 'week'
            | undefined;
      value: string;
      onChange?:
            | ((
                    ev: React.ChangeEvent<HTMLInputElement>,
                    data: InputOnChangeData
              ) => void)
            | undefined;
      placeholder?: string;
      required?: boolean;
}> = ({
      contentBefore,
      label,
      type = 'text',
      value,
      onChange,
      placeholder,
      required,
}) => {
      const isMobile = window.innerWidth < 640;
      return (
            <Field label={label} required={required}>
                  <Input
                        type={type}
                        size={isMobile ? 'large' : 'medium'}
                        placeholder={placeholder}
                        contentBefore={contentBefore}
                        value={value}
                        onChange={onChange}
                  />
            </Field>
      );
};
const WSelect: React.FC<{
      options: { value: string; label: string }[] | any[];
      label: string;
      value: string;
      onChange?:
            | ((
                    ev: React.ChangeEvent<HTMLSelectElement>,
                    data: SelectOnChangeData
              ) => void)
            | undefined;
      placeholder?: string;
      required?: boolean;
}> = ({ label, options, value, onChange, required, ...rest }) => {
      const isMobile = window.innerWidth < 640;
      return (
            <Field label={label} required={required} {...rest}>
                  <Select
                        size={isMobile ? 'large' : 'medium'}
                        value={String(value)}
                        onChange={onChange}
                  >
                        {options.map((o: { value: string; label: string }) => (
                              <option key={o.value} value={o.value}>
                                    {o.label}
                              </option>
                        ))}
                  </Select>
            </Field>
      );
};

const CostRow: React.FC<{ label: string; value: string }> = ({
      label,
      value,
}) => {
      const styles = useStyles();
      return (
            <div className={styles.costRow}>
                  <Text size={300} style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {label}
                  </Text>
                  <Text
                        size={300}
                        weight="semibold"
                        style={{ color: '#ffffff' }}
                  >
                        {value}
                  </Text>
            </div>
      );
};

const InfoStep: React.FC<{ n: number; text: string }> = ({ n, text }) => {
      const styles = useStyles();
      return (
            <div className={styles.infoStep}>
                  <div className={styles.infoStepNum}>{n}</div>
                  <Text
                        size={300}
                        style={{
                              color: 'rgba(221, 221, 221, 0.6)',
                              lineHeight: tokens.lineHeightBase200,
                        }}
                  >
                        {text}
                  </Text>
            </div>
      );
};

const CheckboxCard: React.FC<{
      icon: React.ReactNode;
      label: string;
      description?: string;
      checked: boolean;
      onChange: (checked: boolean) => void;
}> = ({ icon, label, description, checked, onChange }) => {
      const styles = useStyles();
      return (
            <div
                  className={`${styles.checkboxCard} ${checked ? styles.checkboxCardActive : ''}`}
                  onClick={() => onChange(!checked)}
            >
                  <Checkbox
                        checked={checked}
                        onChange={(_, d) => onChange(!!d.checked)}
                        onClick={(e) => e.stopPropagation()}
                  />
                  <div className={styles.checkboxMeta}>
                        <div
                              style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    columnGap: 6,
                              }}
                        >
                              <span
                                    style={{
                                          color: checked
                                                ? tokens.colorBrandForeground1
                                                : tokens.colorNeutralForeground3,
                                          fontSize: 14,
                                          display: 'flex',
                                    }}
                              >
                                    {icon}
                              </span>
                              <Text
                                    size={200}
                                    weight="semibold"
                                    style={{
                                          color: checked
                                                ? tokens.colorBrandForeground1
                                                : tokens.colorNeutralForeground1,
                                    }}
                              >
                                    {label}
                              </Text>
                        </div>
                        {description && (
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              >
                                    {description}
                              </Text>
                        )}
                  </div>
            </div>
      );
};

const SuccessOverlay: React.FC<{
      jobId: string;
      totalCost: number;
      onReset: () => void;
}> = ({ jobId, totalCost, onReset }) => {
      const styles = useStyles();
      return (
            <div className={styles.successOverlayWrap}>
                  <div className={styles.successCard}>
                        <div className={styles.successHead}>
                              <div className={styles.successIconBox}>
                                    <CheckmarkCircle24Regular
                                          style={{ fontSize: 22 }}
                                    />
                              </div>
                              <div>
                                    <Text size={300} weight="semibold" block>
                                          Job posted successfully!
                                    </Text>
                                    <Text
                                          size={100}
                                          style={{
                                                color: tokens.colorNeutralForeground3,
                                          }}
                                    >
                                          ID: {jobId.slice(0, 8)}…
                                    </Text>
                              </div>
                        </div>

                        <div className={styles.paymentBanner}>
                              <Text
                                    size={200}
                                    weight="semibold"
                                    style={{
                                          color: tokens.colorPaletteYellowForeground2,
                                          display: 'block',
                                    }}
                              >
                                    Payment Required
                              </Text>
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorPaletteYellowForeground2,
                                          marginTop: 4,
                                          display: 'block',
                                          lineHeight: tokens.lineHeightBase200,
                                    }}
                              >
                                    Your job is pending. Pay{' '}
                                    <strong>
                                          ₦{totalCost.toLocaleString()}
                                    </strong>{' '}
                                    to activate it and make it visible to
                                    workers.
                              </Text>
                        </div>

                        <div className={styles.successActions}>
                              <Button
                                    appearance="secondary"
                                    style={{
                                          flex: 1,
                                          borderRadius:
                                                tokens.borderRadiusCircular,
                                    }}
                                    onClick={onReset}
                              >
                                    Post another
                              </Button>
                              <Button
                                    appearance="primary"
                                    style={{
                                          flex: 1,
                                          borderRadius:
                                                tokens.borderRadiusCircular,
                                    }}
                                    icon={<ArrowRight16Regular />}
                                    iconPosition="after"
                                    onClick={() =>
                                          (window.location.href =
                                                '/dashboard/jobs')
                                    }
                              >
                                    View my jobs
                              </Button>
                        </div>
                  </div>
            </div>
      );
};

export default PostJob;
