import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authentication';
import { supabase } from '@/server/supabase';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import StatusDialog from '@/components/StatusDialog';
import TransactionDetailsSheet from '@/components/Wallet/TransactionDetails';
import { Wallet as WalletProps, WalletDeposit } from '@/types/types';

import {
      makeStyles,
      tokens,
      Button,
      Text,
      Badge,
      Dialog,
      DialogActions,
      DialogBody,
      DialogContent,
      DialogSurface,
      DialogTitle,
      DialogTrigger,
      Field,
      Input,
      Spinner,
      Divider,
      ProgressBar,
} from '@fluentui/react-components';

import {
      WalletCreditCardRegular,
      ArrowUpRightRegular,
      ArrowDownLeftRegular,
      AddCircleRegular,
      PaymentRegular,
      ClockRegular,
      ArrowDownloadRegular,
      EyeRegular,
      MoneyRegular,
      PersonArrowRightRegular,
      ShieldCheckmarkRegular,
      StarRegular,
      ArrowTrendingRegular,
      GiftRegular,
      ChevronRightRegular,
      LockClosedRegular,
      LockOpenRegular,
} from '@fluentui/react-icons';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      root: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalL,
            paddingBottom: '80px',
            maxWidth: '960px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: tokens.spacingHorizontalM,
            paddingRight: tokens.spacingHorizontalM,
            paddingTop: tokens.spacingVerticalM,
      },

      // ── Balance hero card ─────────────────────────────────────────────────
      balanceCard: {
            position: 'relative',
            background:
                  'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)',
            borderRadius: tokens.borderRadiusXLarge,
            padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
            color: '#ffffff',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      },
      balanceCardGlow1: {
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '220px',
            height: '220px',
            background:
                  'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 65%)',
            pointerEvents: 'none',
      },
      balanceCardGlow2: {
            position: 'absolute',
            bottom: '-30px',
            left: '10%',
            width: '180px',
            height: '180px',
            background:
                  'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
      },
      balanceCardGrid: {
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalXL,
      },
      balanceTopRow: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: tokens.spacingHorizontalM,
      },
      balanceMeta: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '4px',
      },
      balanceLabel: {
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            textTransform: 'uppercase' as const,
            letterSpacing: '1.2px',
            color: 'rgba(255,255,255,0.45)',
      },
      balanceWalletId: {
            fontSize: tokens.fontSizeBase100,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: tokens.fontFamilyMonospace,
            letterSpacing: '0.5px',
      },
      walletIconPill: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: tokens.borderRadiusCircular,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
      },
      balanceBottomRow: {
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: tokens.spacingHorizontalM,
      },
      balanceAmountCol: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '6px',
      },
      balanceSubLabel: {
            fontSize: tokens.fontSizeBase200,
            color: 'rgba(255,255,255,0.45)',
      },
      balanceAmountRow: {
            display: 'flex',
            alignItems: 'center',
            columnGap: tokens.spacingHorizontalS,
      },
      balanceAmount: {
            fontSize: '2.4rem',
            fontWeight: tokens.fontWeightBold,
            letterSpacing: '-1px',
            color: '#ffffff',
            lineHeight: 1.1,
      },
      eyeBtn: {
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: tokens.borderRadiusMedium,
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.15s',
            ':hover': {
                  background: 'rgba(255,255,255,0.14)',
                  color: '#ffffff',
            },
      },
      balanceStatPills: {
            display: 'flex',
            columnGap: tokens.spacingHorizontalS,
            flexWrap: 'wrap' as const,
            rowGap: '6px',
      },
      statPill: {
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: tokens.borderRadiusCircular,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: tokens.fontSizeBase100,
            color: 'rgba(255,255,255,0.65)',
            fontWeight: tokens.fontWeightSemibold,
      },

      // ── Quick stats row ───────────────────────────────────────────────────
      statsRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalM,
            '@media (min-width: 640px)': {
                  gridTemplateColumns: 'repeat(4, 1fr)',
            },
      },
      statCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusLarge,
            padding: tokens.spacingVerticalM,
            display: 'flex',
            flexDirection: 'column',
            rowGap: '6px',
      },
      statIconBox: {
            width: '36px',
            height: '36px',
            borderRadius: tokens.borderRadiusMedium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '4px',
            flexShrink: 0,
      },
      statValue: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
      },
      statLabel: {
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
            fontWeight: tokens.fontWeightSemibold,
      },

      // ── Mid grid ──────────────────────────────────────────────────────────
      midGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: tokens.spacingHorizontalM,
            '@media (min-width: 768px)': {
                  gridTemplateColumns: '1fr 1fr',
            },
      },

      // ── Action card ───────────────────────────────────────────────────────
      actionCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusLarge,
            padding: tokens.spacingVerticalM,
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
      },
      actionCardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      actionBtnRow: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            '@media (min-width: 480px)': {
                  flexDirection: 'row',
                  columnGap: tokens.spacingHorizontalS,
            },
      },
      actionBtn: {
            flex: 1,
            height: '46px',
            borderRadius: tokens.borderRadiusCircular,
            fontWeight: tokens.fontWeightSemibold,
      },
      securityNote: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
            backgroundColor: tokens.colorNeutralBackground2,
            borderRadius: tokens.borderRadiusMedium,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
      },

      // ── Earnings card ─────────────────────────────────────────────────────
      earningsCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusLarge,
            padding: tokens.spacingVerticalM,
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
      },
      earningsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalS,
      },
      earningCell: {
            backgroundColor: tokens.colorNeutralBackground2,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusMedium,
            padding: tokens.spacingVerticalM,
            display: 'flex',
            flexDirection: 'column',
            rowGap: '4px',
      },
      earningCellIcon: {
            width: '32px',
            height: '32px',
            borderRadius: tokens.borderRadiusSmall,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacingVerticalXS,
            flexShrink: 0,
      },
      promoBanner: {
            backgroundColor: tokens.colorBrandBackground2,
            border: `1px solid ${tokens.colorBrandStroke2}`,
            borderRadius: tokens.borderRadiusMedium,
            padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalS,
            cursor: 'pointer',
            transition: 'background 0.12s',
            ':hover': { backgroundColor: tokens.colorBrandBackground2Hover },
      },
      promoIconBox: {
            padding: '8px',
            backgroundColor: tokens.colorBrandBackground,
            borderRadius: tokens.borderRadiusSmall,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#fff',
      },

      // ── Spending progress ─────────────────────────────────────────────────
      spendingCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusLarge,
            padding: tokens.spacingVerticalM,
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
      },
      spendingRow: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
      },
      spendingItem: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '4px',
      },
      spendingItemHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
      },

      // ── Transaction card ──────────────────────────────────────────────────
      txCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusLarge,
            overflow: 'hidden',
      },
      txHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacingHorizontalM,
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
            padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
      },
      txEmpty: {
            padding: `${tokens.spacingVerticalXXXL} ${tokens.spacingHorizontalM}`,
            textAlign: 'center' as const,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            rowGap: tokens.spacingVerticalS,
      },
      txEmptyIcon: {
            width: '56px',
            height: '56px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorNeutralBackground2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacingVerticalS,
      },

      // ── Transaction row ───────────────────────────────────────────────────
      txRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacingHorizontalM,
            padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
            cursor: 'pointer',
            transition: 'background 0.12s',
            ':hover': { backgroundColor: tokens.colorNeutralBackground2 },
      },
      txLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
            flex: 1,
            minWidth: 0,
      },
      txIconBox: {
            width: '34px',
            height: '34px',
            borderRadius: tokens.borderRadiusCircular,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
      },
      txMeta: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
      },
      txNote: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
      },
      txTimestamp: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '2px',
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
            flexWrap: 'wrap' as const,
      },

      // ── Deposit dialog ────────────────────────────────────────────────────
      depositContent: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalM,
      },
      quickAmountRow: {
            display: 'flex',
            gap: tokens.spacingHorizontalXS,
            flexWrap: 'wrap' as const,
      },
      quickAmountBtn: {
            flex: '0 1 auto',
            minWidth: '70px',
            borderRadius: tokens.borderRadiusCircular,
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
      },
});

// ─── Root Page ────────────────────────────────────────────────────────────────

const Wallet: React.FC = () => {
      const styles = useStyles();
      const { profile } = useAuth();

      const [statusOpen, setStatusOpen] = useState(false);
      const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
      const [statusMessage, setStatusMessage] = useState('');

      const triggerStatus = (type: 'success' | 'error', message: string) => {
            setStatusType(type);
            setStatusMessage(message);
            setStatusOpen(true);
      };

      const { wallet, summary, loading, refresh } = useWallet();
      const balance = summary?.current_balance ?? 0;

      return (
            <div className={styles.root}>
                  {/* Hero balance card */}
                  <BalanceDashboard balanceLoading={loading} balance={balance} wallet={wallet} />

                  {/* Quick stats row */}
                  <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                              <div
                                    className={styles.statIconBox}
                                    style={{
                                          backgroundColor: '#dcfce7',
                                          color: '#16a34a',
                                    }}
                              >
                                    <ArrowDownLeftRegular fontSize={18} />
                              </div>
                              <Text className={styles.statLabel}>
                                    Total Earned
                              </Text>
                              <Text className={styles.statValue}>
                                    {/* ₦{balance.toLocaleString()} */}
                              </Text>
                        </div>
                        <div className={styles.statCard}>
                              <div
                                    className={styles.statIconBox}
                                    style={{
                                          backgroundColor: '#fef3c7',
                                          color: '#d97706',
                                    }}
                              >
                                    <ArrowUpRightRegular fontSize={18} />
                              </div>
                              <Text className={styles.statLabel}>
                                    Total Withdrawn
                              </Text>
                              <Text className={styles.statValue}>₦0</Text>
                        </div>
                        <div className={styles.statCard}>
                              <div
                                    className={styles.statIconBox}
                                    style={{
                                          backgroundColor: '#dbeafe',
                                          color: '#2563eb',
                                    }}
                              >
                                    <ArrowTrendingRegular fontSize={18} />
                              </div>
                              <Text className={styles.statLabel}>
                                    Jobs Completed
                              </Text>
                              <Text className={styles.statValue}>
                                    {profile?.wallet?.wallet_transactions?.filter(
                                          (t: any) => t.source === 'JOB_FUNDING'
                                    ).length ?? 0}
                              </Text>
                        </div>
                        <div className={styles.statCard}>
                              <div
                                    className={styles.statIconBox}
                                    style={{
                                          backgroundColor: '#f3e8ff',
                                          color: '#9333ea',
                                    }}
                              >
                                    <PersonArrowRightRegular fontSize={18} />
                              </div>
                              <Text className={styles.statLabel}>
                                    Referral Bonus
                              </Text>
                              <Text className={styles.statValue}>₦0</Text>
                        </div>
                  </div>

                  {/* Actions + Earnings */}
                  <div className={styles.midGrid}>
                        <ActionButtonContainer
                              triggerStatus={triggerStatus}
                              fetchBalance={refresh}
                              onWithdraw={() =>
                                    triggerStatus(
                                          'error',
                                          'Withdrawal coming soon.'
                                    )
                              }
                        />
                        <EarningsBreakdown />
                  </div>

                  {/* Spending overview */}
                  <SpendingOverview balance={summary?.current_balance ?? 0} />

                  {/* Transaction history */}
                  <div className={styles.txCard}>
                        <div className={styles.txHeader}>
                              <Text size={500} weight="semibold">
                                    Transaction History
                              </Text>
                              <Button
                                    appearance="subtle"
                                    icon={<ArrowDownloadRegular />}
                                    size="small"
                              >
                                    Statement
                              </Button>
                        </div>

                        <div
                              style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                              }}
                        >
                              {profile?.wallet?.wallet_transactions &&
                              profile?.wallet?.wallet_transactions?.length >
                                    0 ? (
                                    profile.wallet.wallet_transactions.map(
                                          (tx: any) => (
                                                <TransactionDetailsSheet
                                                      deposits={
                                                            profile?.wallet
                                                                  .wallet_deposits as WalletDeposit[]
                                                      }
                                                      key={tx.id}
                                                      tx={tx}
                                                />
                                          )
                                    )
                              ) : (
                                    <EmptyTransactions />
                              )}
                        </div>
                  </div>

                  <StatusDialog
                        isOpen={statusOpen}
                        type={statusType}
                        message={statusMessage}
                        onClose={() => setStatusOpen(false)}
                  />
            </div>
      );
};

// ─── Balance Dashboard ─────────────────────────────────────────────────────

const BalanceDashboard: React.FC<{ balanceLoading: boolean, balance: number, wallet: WalletProps | null }> = ({ balanceLoading, balance, wallet }) => {
      const styles = useStyles();
      const { profile } = useAuth();
      const [hidden, setHidden] = useState(false);
      

      return (
            <div className={styles.balanceCard}>
                  <div className={styles.balanceCardGlow1} />
                  <div className={styles.balanceCardGlow2} />

                  <div className={styles.balanceCardGrid}>
                        <div className={styles.balanceTopRow}>
                              <div className={styles.balanceMeta}>
                                    <span className={styles.balanceLabel}>
                                          Workbit Escrow Wallet
                                    </span>
                                    <span className={styles.balanceWalletId}>
                                          {profile?.wallet?.id?.slice(0, 16) ||
                                                'N/A'}{' '}
                                          • REGULAR
                                    </span>
                              </div>
                              <div className="flex flex-row items-center justify-center gap-4">
                                    <div className={styles.walletIconPill}>
                                          <WalletCreditCardRegular
                                                style={{
                                                      color: '#60a5fa',
                                                      fontSize: 18,
                                                }}
                                          />
                                          <Text
                                                style={{
                                                      color: 'rgba(255,255,255,0.6)',
                                                      fontSize: tokens.fontSizeBase100,
                                                      fontWeight:
                                                            tokens.fontWeightSemibold,
                                                }}
                                          >
                                                NGN
                                          </Text>
                                    </div>
                                    <div
                                          className={styles.walletIconPill}
                                          style={
                                          wallet?.is_frozen
                                                ? { backgroundColor: 'rgba(239,68,68,0.15)' }
                                                : { backgroundColor: 'rgba(96,165,250,0.15)' }
                                          }
                                          >
                                          {wallet?.is_frozen ? (
                                                <LockClosedRegular style={{ color: '#f87171', fontSize: 18 }} />
                                          ) : (
                                                <LockOpenRegular style={{ color: '#60a5fa', fontSize: 18 }} />
                                          )}
                                          <Text
                                                style={{
                                                      color: wallet?.is_frozen ? '#f87171' : 'rgba(255,255,255,0.6)',
                                                      fontSize: tokens.fontSizeBase100,
                                                      fontWeight: tokens.fontWeightSemibold,
                                                }}
                                          >
                                                {wallet?.is_frozen ? 'Frozen' : 'Active'}
                                          </Text>
                                    </div>
                              </div>
                        </div>

                        <div className={styles.balanceBottomRow}>
                              <div className={styles.balanceAmountCol}>
                                    <span className={styles.balanceSubLabel}>
                                          Available Balance
                                    </span>
                                    <div className={styles.balanceAmountRow}>
                                          {
                                                balanceLoading ? <span><Loader2 className='animate-spin' /></span>
                                                :
                                                <span
                                                      className={styles.balanceAmount}
                                                >
                                                      {hidden
                                                            ? '₦ ••••••'
                                                            : `₦${balance.toLocaleString()}`}
                                                </span>
                                          }
                                          <button
                                                className={styles.eyeBtn}
                                                onClick={() =>
                                                      setHidden((h) => !h)
                                                }
                                          >
                                                <EyeRegular
                                                      style={{ fontSize: 17 }}
                                                />
                                          </button>
                                    </div>
                              </div>

                              <div className={styles.balanceStatPills}>
                                    <span className={styles.statPill}>
                                          <ShieldCheckmarkRegular
                                                style={{
                                                      fontSize: 13,
                                                      color: '#34d399',
                                                }}
                                          />
                                          Secured
                                    </span>
                                    <span className={styles.statPill}>
                                          <StarRegular
                                                style={{
                                                      fontSize: 13,
                                                      color: '#fbbf24',
                                                }}
                                          />
                                          Regular
                                    </span>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

// ─── Spending Overview ─────────────────────────────────────────────────────
const SpendingOverview: React.FC<{ balance: number }> = ({ balance }) => {
      const styles = useStyles();

      const categories = [
            {
                  label: 'Job Funding',
                  value: balance * 0.6,
                  color: tokens.colorBrandBackground,
                  max: balance || 1,
            },
            {
                  label: 'Withdrawals',
                  value: 0,
                  color: '#f59e0b',
                  max: balance || 1,
            },
            {
                  label: 'Referral Bonus',
                  value: 0,
                  color: '#8b5cf6',
                  max: balance || 1,
            },
      ];

      return (
            <div className={styles.spendingCard}>
                  <div
                        style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                        }}
                  >
                        <Text size={400} weight="semibold">
                              Wallet Overview
                        </Text>
                        <Badge appearance="tint" color="brand" size="small">
                              This month
                        </Badge>
                  </div>

                  <div className={styles.spendingRow}>
                        {categories.map((cat) => (
                              <div
                                    key={cat.label}
                                    className={styles.spendingItem}
                              >
                                    <div className={styles.spendingItemHeader}>
                                          <Text
                                                size={200}
                                                style={{
                                                      color: tokens.colorNeutralForeground2,
                                                      fontWeight:
                                                            tokens.fontWeightSemibold,
                                                }}
                                          >
                                                {cat.label}
                                          </Text>
                                          <Text size={200} weight="bold">
                                                {/* ₦{cat.value.toLocaleString()} */}
                                          </Text>
                                    </div>
                                    <ProgressBar
                                          value={
                                                cat.max > 0
                                                      ? cat.value / cat.max
                                                      : 0
                                          }
                                          color="brand"
                                          thickness="large"
                                          style={{
                                                borderRadius:
                                                      tokens.borderRadiusCircular,
                                          }}
                                    />
                              </div>
                        ))}
                  </div>
            </div>
      );
};

// ─── Earnings Breakdown ────────────────────────────────────────────────────

const EarningsBreakdown: React.FC = () => {
      const styles = useStyles();
      const { profile } = useAuth();
      const balance = 0;

      return (
            <div className={styles.earningsCard}>
                  <Text size={300} weight="semibold">
                        Earnings Breakdown
                  </Text>

                  <div className={styles.earningsGrid}>
                        <div className={styles.earningCell}>
                              <div
                                    className={styles.earningCellIcon}
                                    style={{
                                          backgroundColor: '#dcfce7',
                                          color: '#16a34a',
                                    }}
                              >
                                    <ArrowDownLeftRegular fontSize={16} />
                              </div>
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                          fontWeight: tokens.fontWeightSemibold,
                                    }}
                              >
                                    Job Earnings
                              </Text>
                              <Text
                                    size={400}
                                    weight="bold"
                                    style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                    }}
                              >
                                    {/* ₦{balance.toLocaleString()} */}
                              </Text>
                        </div>

                        <div className={styles.earningCell}>
                              <div
                                    className={styles.earningCellIcon}
                                    style={{
                                          backgroundColor: '#fef3c7',
                                          color: '#d97706',
                                    }}
                              >
                                    <PersonArrowRightRegular fontSize={16} />
                              </div>
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                          fontWeight: tokens.fontWeightSemibold,
                                    }}
                              >
                                    Referrals
                              </Text>
                              <Text size={400} weight="bold">
                                    ₦0
                              </Text>
                        </div>

                        <div
                              className={styles.earningCell}
                              style={{ gridColumn: '1 / -1' }}
                        >
                              <div
                                    className={styles.earningCellIcon}
                                    style={{
                                          backgroundColor: '#dbeafe',
                                          color: '#2563eb',
                                    }}
                              >
                                    <WalletCreditCardRegular fontSize={16} />
                              </div>
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                          fontWeight: tokens.fontWeightSemibold,
                                    }}
                              >
                                    Total Deposited
                              </Text>
                              <Text size={400} weight="bold">
                                    {/* ₦{balance.toLocaleString()} */}
                              </Text>
                        </div>
                  </div>

                  <div className={styles.promoBanner}>
                        <div className={styles.promoIconBox}>
                              <GiftRegular style={{ fontSize: 18 }} />
                        </div>
                        <Text
                              size={200}
                              style={{
                                    color: tokens.colorBrandForeground1,
                                    lineHeight: tokens.lineHeightBase200,
                                    flex: 1,
                              }}
                        >
                              Earn <strong>₦500 instantly</strong> for every
                              friend you refer who subscribes.
                        </Text>
                        <ChevronRightRegular
                              style={{
                                    color: tokens.colorBrandForeground1,
                                    flexShrink: 0,
                                    fontSize: 16,
                              }}
                        />
                  </div>
            </div>
      );
};

// ─── Action Button Container ───────────────────────────────────────────────

const ActionButtonContainer: React.FC<{
      onWithdraw?: () => void;
      fetchBalance: () => void;
      triggerStatus: (type: 'success' | 'error', message: string) => void;
}> = ({ onWithdraw, triggerStatus, fetchBalance }) => {
      const styles = useStyles();
      const { profile, refreshUserProfile } = useAuth();
      const [amount, setAmount] = useState<number>(0);
      const [loading, setLoading] = useState(false);

      const config = {
            public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
            tx_ref: Date.now().toString(),
            amount,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
                  email: profile?.user_contacts[0].email as string,
                  phone_number: profile?.user_contacts[0].phone as string,
                  name: `${profile?.first_name} ${profile?.last_name}`,
            },
            meta: {
                  user_id: profile?.user_id,
                  email: profile?.user_contacts[0].email as string,
                  phone_number: profile?.user_contacts[0].phone as string,
                  name: `${profile?.first_name} ${profile?.last_name}`,
            },
            customizations: {
                  title: 'Workbit',
                  description: 'Deposit funds into Workbit escrow account.',
                  logo: 'http://192.168.1.44:4000/assets/workbit.webp',
            },
      };

      const handleFlutterPayment = useFlutterwave(config);

      const verifyPayment = async (transaction_id: number) => {
            const { data, error } = await supabase.functions.invoke(
                  'verify-payment',
                  { body: { transaction_id } }
            );
            if (error) throw new Error(error);
            console.log(data);
            await fetchBalance()
            return data;
      };

      const initPayment = async () => {
            setLoading(true);
            handleFlutterPayment({
                  callback: async (response) => {
                        try {
                              const verified = await verifyPayment(
                                    response.transaction_id
                              );
                              if (verified.success) {
                                    await refreshUserProfile();
                                    triggerStatus(
                                          'success',
                                          `₦${amount.toLocaleString()} deposited into your Escrow Wallet.`
                                    );
                              } else {
                                    triggerStatus(
                                          'error',
                                          "We couldn't confirm your deposit with Flutterwave."
                                    );
                              }
                        } catch {
                              triggerStatus(
                                    'error',
                                    'Payment verification failed.'
                              );
                        }
                        closePaymentModal();
                        setLoading(false);
                  },
                  onClose: () => setLoading(false),
            });
      };

      const QUICK_AMOUNTS = [500, 1000, 5000, 10000];

      return (
            <div className={styles.actionCard}>
                  <div className={styles.actionCardHeader}>
                        <Text size={300} weight="semibold">
                              Quick Actions
                        </Text>
                  </div>

                  <div className={styles.actionBtnRow}>
                        <Button
                              className={styles.actionBtn}
                              appearance="outline"
                              icon={<ArrowUpRightRegular />}
                              onClick={onWithdraw}
                              style={{
                                    borderColor: tokens.colorBrandStroke2,
                                    color: tokens.colorBrandForeground1,
                                    backgroundColor:
                                          tokens.colorBrandBackground2,
                              }}
                        >
                              Withdraw
                        </Button>

                        <DepositDialog
                              loading={loading}
                              amount={amount}
                              setAmount={setAmount}
                              onConfirm={initPayment}
                              actionClassName={styles.actionBtn}
                              quickAmounts={QUICK_AMOUNTS}
                              quickAmountBtnClass={styles.quickAmountBtn}
                              quickAmountRowClass={styles.quickAmountRow}
                              depositContentClass={styles.depositContent}
                        />
                  </div>

                  <div className={styles.securityNote}>
                        <ShieldCheckmarkRegular
                              style={{
                                    fontSize: 14,
                                    color: '#16a34a',
                                    flexShrink: 0,
                              }}
                        />
                        <Text
                              size={100}
                              style={{ color: tokens.colorNeutralForeground3 }}
                        >
                              Funds held in a double-entry escrow ledger. Fully
                              auditable.
                        </Text>
                  </div>
            </div>
      );
};

// ─── Deposit Dialog ────────────────────────────────────────────────────────

const DepositDialog: React.FC<{
      loading: boolean;
      amount: number;
      setAmount: React.Dispatch<React.SetStateAction<number>>;
      onConfirm: () => void;
      actionClassName?: string;
      quickAmounts: number[];
      quickAmountBtnClass: string;
      quickAmountRowClass: string;
      depositContentClass: string;
}> = ({
      loading,
      amount,
      setAmount,
      onConfirm,
      actionClassName,
      quickAmounts,
      quickAmountBtnClass,
      quickAmountRowClass,
      depositContentClass,
}) => {
      const [open, setOpen] = useState(false);

      return (
            <Dialog
                  open={open}
                  onOpenChange={(_, d) => setOpen(d.open)}
                  modalType="modal"
            >
                  <DialogTrigger disableButtonEnhancement>
                        <Button
                              className={actionClassName}
                              appearance="primary"
                              icon={<AddCircleRegular />}
                              style={{
                                    borderRadius: tokens.borderRadiusCircular,
                              }}
                        >
                              Deposit
                        </Button>
                  </DialogTrigger>

                  <DialogSurface style={{ maxWidth: 440 }}>
                        <DialogTitle>Escrow Deposit</DialogTitle>
                        <DialogBody>

                              <DialogContent>
                                    <Text
                                          size={200}
                                          style={{
                                                color: tokens.colorNeutralForeground3,
                                                display: 'block',
                                                marginBottom:
                                                      tokens.spacingVerticalM,
                                          }}
                                    >
                                          Enter the amount you want to deposit
                                          into your secure Workbit wallet.
                                    </Text>

                                    <div className={depositContentClass}>
                                          <div className={quickAmountRowClass}>
                                                {quickAmounts.map((q) => (
                                                      <Button
                                                            key={q}
                                                            className={
                                                                  quickAmountBtnClass
                                                            }
                                                            appearance={
                                                                  amount === q
                                                                        ? 'primary'
                                                                        : 'outline'
                                                            }
                                                            size="small"
                                                            onClick={() =>
                                                                  setAmount(q)
                                                            }
                                                      >
                                                            ₦
                                                            {q.toLocaleString()}
                                                      </Button>
                                                ))}
                                          </div>

                                          <Field
                                                label="Amount"
                                                validationState={
                                                      amount > 0 &&
                                                      amount <= 100
                                                            ? 'error'
                                                            : 'none'
                                                }
                                                validationMessage={
                                                      amount > 0 &&
                                                      amount <= 100
                                                            ? 'Minimum deposit is ₦100'
                                                            : undefined
                                                }
                                          >
                                                <Input
                                                      type="number"
                                                      contentBefore={
                                                            <Text size={200}>
                                                                  ₦
                                                            </Text>
                                                      }
                                                      contentAfter={
                                                            <MoneyRegular
                                                                  style={{
                                                                        color: tokens.colorNeutralForeground3,
                                                                  }}
                                                            />
                                                      }
                                                      placeholder="10,000"
                                                      value={
                                                            amount
                                                                  ? String(
                                                                          amount
                                                                    )
                                                                  : ''
                                                      }
                                                      onChange={(_, d) =>
                                                            setAmount(
                                                                  Number(
                                                                        d.value
                                                                  )
                                                            )
                                                      }
                                                      onKeyDown={(e) => {
                                                            if (
                                                                  e.key ===
                                                                        'Enter' &&
                                                                  amount > 100
                                                            )
                                                                  onConfirm();
                                                      }}
                                                      size="large"
                                                />
                                          </Field>
                                    </div>
                              </DialogContent>

                              <DialogActions>
                                    <DialogTrigger disableButtonEnhancement>
                                          <Button appearance="secondary">
                                                Cancel
                                          </Button>
                                    </DialogTrigger>
                                    <Button
                                          appearance="primary"
                                          disabled={amount <= 100 || loading}
                                          icon={
                                                loading ? (
                                                      <Spinner size="tiny" />
                                                ) : undefined
                                          }
                                          style={{
                                                minWidth: 'fit-content',
                                                whiteSpace: 'nowrap',
                                          }}
                                          onClick={onConfirm}
                                    >
                                          {loading
                                                ? 'Processing…'
                                                : 'Confirm Deposit'}
                                    </Button>
                              </DialogActions>
                        </DialogBody>
                  </DialogSurface>
            </Dialog>
      );
};

// ─── Empty state ───────────────────────────────────────────────────────────

const EmptyTransactions: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.txEmpty}>
                  <div className={styles.txEmptyIcon}>
                        <WalletCreditCardRegular
                              style={{
                                    fontSize: 26,
                                    color: tokens.colorNeutralForeground3,
                              }}
                        />
                  </div>
                  <Text
                        size={300}
                        weight="semibold"
                        style={{ color: tokens.colorNeutralForeground2 }}
                  >
                        No transactions yet
                  </Text>
                  <Text
                        size={200}
                        style={{
                              color: tokens.colorNeutralForeground3,
                              maxWidth: 240,
                              textAlign: 'center',
                        }}
                  >
                        Once you deposit or complete a job, your transactions
                        will appear here.
                  </Text>
            </div>
      );
};

// ─── Transaction Row (exported) ────────────────────────────────────────────

export const TrxTableRow: React.FC<{ tx: any }> = ({ tx }) => {
      const styles = useStyles();
      const isCredit = tx.type === 'CREDIT' && tx.amount > 0;

      return (
            <div className={styles.txRow}>
                  <div className={styles.txLeft}>
                        <div
                              className={styles.txIconBox}
                              style={{
                                    backgroundColor: isCredit
                                          ? '#dcfce7'
                                          : '#fee2e2',
                                    color: isCredit ? '#16a34a' : '#dc2626',
                              }}
                        >
                              {isCredit ? (
                                    <ArrowDownLeftRegular
                                          style={{ fontSize: 16 }}
                                    />
                              ) : (
                                    <ArrowUpRightRegular
                                          style={{ fontSize: 16 }}
                                    />
                              )}
                        </div>

                        <div className={styles.txMeta}>
                              <span className={styles.txNote}>
                                    {tx.note || 'Wallet Transaction'}
                              </span>
                              <div className={styles.txTimestamp}>
                                    <ClockRegular style={{ fontSize: 11 }} />
                                    <span>
                                          {new Date(
                                                tx.created_at
                                          ).toLocaleString()}
                                    </span>
                                    <Badge
                                          appearance="tint"
                                          color={
                                                isCredit ? 'success' : 'danger'
                                          }
                                          size="small"
                                          style={{
                                                marginLeft: 4,
                                                textTransform: 'uppercase',
                                                fontSize: 9,
                                                letterSpacing: '0.8px',
                                          }}
                                    >
                                          {tx.type}
                                    </Badge>
                              </div>
                        </div>
                  </div>

                  <Text
                        size={300}
                        weight="semibold"
                        style={{
                              color: isCredit ? '#16a34a' : '#dc2626',
                              flexShrink: 0,
                        }}
                  >
                        {isCredit ? '+' : '-'}₦
                        {/* {Math.abs(tx.amount).toLocaleString()} */}
                  </Text>
            </div>
      );
};

export default Wallet;
