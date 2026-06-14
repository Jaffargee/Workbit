import React from 'react';
import {
      makeStyles,
      tokens,
      Text,
      Button,
      Badge,
      Card,
      CardHeader,
      Divider,
      Avatar,
} from '@fluentui/react-components';
import {
      WalletCreditCard24Regular,
      ArrowTrending24Regular as ArrowTrendingUp24Regular,
      People24Regular,
      Briefcase24Regular,
      ChevronRight16Regular,
      BroadActivityFeed20Regular as ActivityFeed20Regular,
      Alert20Regular,
} from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authentication';

// ─── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      root: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXXL,
            padding: tokens.spacingHorizontalXL,
      },

      // Hero Banner
      hero: {
            position: 'relative',
            background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackgroundPressed} 100%)`,
            borderRadius: tokens.borderRadiusXLarge,
            padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacingVerticalL,
            overflow: 'hidden',
            boxShadow: tokens.shadow16,
      },
      heroContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
            position: 'relative',
            zIndex: 1,
      },
      heroTitle: {
            color: tokens.colorNeutralForegroundOnBrand,
            fontSize: tokens.fontSizeBase600,
            fontWeight: tokens.fontWeightSemibold,
            lineHeight: tokens.lineHeightBase600,
      },
      heroSubtitle: {
            color: tokens.colorNeutralForegroundOnBrand,
            opacity: 0.85,
            fontSize: tokens.fontSizeBase300,
      },
      heroActions: {
            display: 'flex',
            gap: tokens.spacingHorizontalM,
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
      },

      // Stat cards grid
      statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: tokens.spacingHorizontalL,
      },
      statCard: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalL,
            padding: tokens.spacingVerticalL,
            borderRadius: tokens.borderRadiusLarge,
            cursor: 'default',
      },
      statIconWrap: {
            width: '48px',
            height: '48px',
            borderRadius: tokens.borderRadiusMedium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
      },
      statLabel: {
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            marginBottom: tokens.spacingVerticalXS,
      },
      statValue: {
            fontSize: tokens.fontSizeBase600,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            lineHeight: tokens.lineHeightBase600,
      },

      // Main content grid
      contentGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: tokens.spacingHorizontalXL,
            '@media (max-width: 768px)': {
                  gridTemplateColumns: '1fr',
            },
      },

      // Section header
      sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacingVerticalM,
      },
      sectionTitle: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
      },

      // Job card
      jobCard: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacingVerticalM,
            borderRadius: tokens.borderRadiusLarge,
            marginBottom: tokens.spacingVerticalS,
            '&:last-child': {
                  marginBottom: 0,
            },
      },
      jobLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalM,
      },
      jobIconWrap: {
            width: '44px',
            height: '44px',
            borderRadius: tokens.borderRadiusMedium,
            background: tokens.colorNeutralBackground3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorNeutralForeground3,
            flexShrink: 0,
      },
      jobTitle: {
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            fontSize: tokens.fontSizeBase300,
      },
      jobMeta: {
            color: tokens.colorNeutralForeground3,
            fontSize: tokens.fontSizeBase200,
            marginTop: '2px',
      },
      jobRight: {
            textAlign: 'right',
      },
      jobAmount: {
            fontWeight: tokens.fontWeightBold,
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground1,
      },
      jobPerTask: {
            color: tokens.colorPaletteLightGreenForeground1,
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
      },

      // Activity log
      activityCard: {
            borderRadius: tokens.borderRadiusLarge,
            overflow: 'hidden',
      },
      activityItem: {
            display: 'flex',
            gap: tokens.spacingHorizontalM,
            padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
            '&:hover': {
                  background: tokens.colorNeutralBackground2,
            },
      },
      activityIcon: {
            marginTop: '2px',
            color: tokens.colorNeutralForeground3,
            flexShrink: 0,
      },
      activityMsg: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground1,
            fontWeight: tokens.fontWeightMedium,
      },
      activityTime: {
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
            marginTop: '2px',
      },
});

// ─── StatCard ────────────────────────────────────────────────────────────────

const STAT_ICON_COLORS: Record<string, { bg: string; color: string }> = {
      blue: {
            bg: tokens.colorBrandBackground2,
            color: tokens.colorBrandForeground1,
      },
      green: {
            bg: tokens.colorPaletteLightGreenBackground2,
            color: tokens.colorPaletteLightGreenForeground1,
      },
      amber: {
            bg: tokens.colorPaletteGoldBackground2,
            color: tokens.colorPaletteGoldForeground2,
      },
      indigo: {
            bg: tokens.colorPaletteLavenderBackground2,
            color: tokens.colorPaletteLavenderForeground2,
      },
};

const StatCard: React.FC<{
      label: string;
      value: string;
      icon: React.ReactNode;
      accent: 'blue' | 'green' | 'amber' | 'indigo';
}> = ({ label, value, icon, accent }) => {
      const styles = useStyles();
      const { bg, color } = STAT_ICON_COLORS[accent];

      return (
            <Card className={styles.statCard}>
                  <div
                        className={styles.statIconWrap}
                        style={{ background: bg, color }}
                  >
                        {icon}
                  </div>
                  <div>
                        <Text className={styles.statLabel} block>
                              {label}
                        </Text>
                        <Text className={styles.statValue} block>
                              {value}
                        </Text>
                  </div>
            </Card>
      );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
      const styles = useStyles();
      const navigate = useNavigate();
      const { profile } = useAuth();

      const balance = profile?.wallet?.balance ?? 0;
      const totalEarnings = profile?.wallet?.balance ?? 0;
      const referralIncome =
            profile?.referral_rewards?.reduce(
                  (acc, curr) => acc + (curr.reward_amount ?? 0),
                  0,
            ) ?? 0;
      const activeTaskCount = profile?.jobs?.length ?? 0;

      const activities = [
            {
                  msg: 'Withdrawal of ₦2,000 processed.',
                  time: '2 hours ago',
                  icon: <ChevronRight16Regular />,
            },
            {
                  msg: 'Job approved: IG Follow.',
                  time: '5 hours ago',
                  icon: <Alert20Regular />,
            },
            {
                  msg: 'New referral registered.',
                  time: '1 day ago',
                  icon: <People24Regular />,
            },
      ];

      return (
            <div className={styles.root}>
                  {/* ── Hero Banner ───────────────────────────── */}
                  <div className={styles.hero}>
                        <div className={styles.heroContent}>
                              <Text className={styles.heroTitle} as="h2" block>
                                    Welcome back,{' '}
                                    {profile?.first_name} {profile?.last_name}! 👋
                              </Text>
                              <Text className={styles.heroSubtitle} block>
                                    You have {activeTaskCount} new jobs waiting
                                    for you today.
                              </Text>
                        </div>
                        <div className={styles.heroActions}>
                              <Link to="/marketplace">
                                    <Button appearance="primary" size="large" shape="circular">
                                          Browse Jobs
                                    </Button>
                              </Link>
                              <Link to="/postjob">
                                    <Button appearance="outline" size="large" shape="circular"
                                          style={{
                                                color: tokens.colorNeutralForegroundOnBrand,
                                                borderColor: tokens.colorNeutralForegroundOnBrand,
                                          }}
                                    >
                                          Post a Job
                                    </Button>
                              </Link>
                        </div>
                  </div>

                  {/* ── Stat Cards ────────────────────────────── */}
                  <div className={styles.statsGrid}>
                        <StatCard
                              label="Wallet Balance"
                              value={`₦${balance.toLocaleString()}`}
                              icon={<WalletCreditCard24Regular />}
                              accent="blue"
                        />
                        <StatCard
                              label="Total Earnings"
                              value={`₦${totalEarnings.toLocaleString()}`}
                              icon={<ArrowTrendingUp24Regular />}
                              accent="green"
                        />
                        <StatCard
                              label="Referral Income"
                              value={`₦${referralIncome.toLocaleString()}`}
                              icon={<People24Regular />}
                              accent="amber"
                        />
                        <StatCard
                              label="Active Tasks"
                              value={activeTaskCount.toLocaleString()}
                              icon={<Briefcase24Regular />}
                              accent="indigo"
                        />
                  </div>

                  {/* ── Content Grid ──────────────────────────── */}
                  <div className={styles.contentGrid}>
                        {/* Featured Opportunities */}
                        <div>
                              <div className={styles.sectionHeader}>
                                    <Text className={styles.sectionTitle} as="h3">
                                          Featured Opportunities
                                    </Text>
                                    <Button
                                          appearance="transparent"
                                          size="small"
                                          iconPosition="after"
                                          icon={<ChevronRight16Regular />}
                                          onClick={() => navigate('/marketplace')}
                                    >
                                          View all
                                    </Button>
                              </div>

                              <div>
                                    {profile?.jobs?.slice(0, 3).map((job) => (
                                          <Card key={job.id} className={styles.jobCard}>
                                                <div className={styles.jobLeft}>
                                                      <div className={styles.jobIconWrap}>
                                                            <Briefcase24Regular />
                                                      </div>
                                                      <div>
                                                            <Text className={styles.jobTitle} block>
                                                                  {job.title}
                                                            </Text>
                                                            <Text className={styles.jobMeta} block>
                                                                  {job.platforms} •{' '}
                                                                  {job.total_slots - job.filled_slots} slots left
                                                            </Text>
                                                      </div>
                                                </div>
                                                <div className={styles.jobRight}>
                                                      <Text className={styles.jobAmount} block>
                                                            ₦{job.payout_amount}
                                                      </Text>
                                                      <Text className={styles.jobPerTask} block>
                                                            Per Task
                                                      </Text>
                                                </div>
                                          </Card>
                                    ))}
                              </div>
                        </div>

                        {/* Activity Log */}
                        <div>
                              <div className={styles.sectionHeader}>
                                    <Text className={styles.sectionTitle} as="h3">
                                          Activity Log
                                    </Text>
                                    <ActivityFeed20Regular
                                          style={{ color: tokens.colorNeutralForeground3 }}
                                    />
                              </div>

                              <Card className={styles.activityCard}>
                                    {activities.map((item, i) => (
                                          <React.Fragment key={i}>
                                                <div className={styles.activityItem}>
                                                      <span className={styles.activityIcon}>
                                                            {item.icon}
                                                      </span>
                                                      <div>
                                                            <Text className={styles.activityMsg} block>
                                                                  {item.msg}
                                                            </Text>
                                                            <Text className={styles.activityTime} block>
                                                                  {item.time}
                                                            </Text>
                                                      </div>
                                                </div>
                                                {i < activities.length - 1 && <Divider />}
                                          </React.Fragment>
                                    ))}
                              </Card>
                        </div>
                  </div>
            </div>
      );
};

export default Dashboard;