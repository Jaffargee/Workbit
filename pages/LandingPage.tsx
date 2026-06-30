import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
      makeStyles,
      tokens,
      Button,
      Text,
      Spinner,
} from '@fluentui/react-components';
import {
      ShieldCheckmarkRegular,
      FlashRegular,
      WalletCreditCardRegular,
      PersonAddRegular,
      TargetRegular,
      CheckmarkCircleRegular,
      ArrowRightRegular,
      PhoneRegular,
      ChartMultipleRegular,
      LockClosedRegular,
      NavigationRegular,
      DismissRegular,
} from '@fluentui/react-icons';
import { Logo } from '../components/Logo';
import { useAuth } from '@/contexts/authentication';
import { supabase } from '@/server/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LandingStats {
      total_paid_out: number;
      active_jobs: number;
      workers_paid: number;
      jobs_completed: number;
}

// ─── Breakpoints ────────────────────────────────────────────────────────────
// tablet: <= 960px, mobile: <= 600px

const TABLET = '@media (max-width: 960px)';
const MOBILE = '@media (max-width: 600px)';

// ─── Styles ─────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
      page: {
            backgroundColor: tokens.colorNeutralBackground1,
            minHeight: '100vh',
            overflowX: 'hidden',
      },

      // Nav
      nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      navInner: {
            maxWidth: '1180px',
            margin: '0 auto',
            height: '72px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            [MOBILE]: {
                  height: '60px',
                  padding: '0 16px',
            },
      },
      navLinks: {
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            [TABLET]: {
                  display: 'none',
            },
      },
      navLink: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightMedium,
            color: tokens.colorNeutralForeground2,
            textDecoration: 'none',
            ':hover': { color: tokens.colorBrandForeground1 },
      },
      navActions: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            [MOBILE]: {
                  gap: '8px',
            },
      },
      navActionsDesktop: {
            [TABLET]: {
                  display: 'none',
            },
      },
      menuButton: {
            display: 'none',
            [TABLET]: {
                  display: 'inline-flex',
            },
      },
      mobileMenu: {
            display: 'none',
            [TABLET]: {
                  display: 'flex',
            },
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            backgroundColor: tokens.colorNeutralBackground1,
            flexDirection: 'column',
            padding: '24px',
            gap: '8px',
      },
      mobileNavLink: {
            fontSize: tokens.fontSizeBase500,
            fontWeight: tokens.fontWeightMedium,
            color: tokens.colorNeutralForeground1,
            textDecoration: 'none',
            padding: '14px 4px',
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      mobileMenuActions: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
      },

      // Hero
      hero: {
            paddingTop: '160px',
            paddingBottom: '80px',
            paddingLeft: '24px',
            paddingRight: '24px',
            [TABLET]: {
                  paddingTop: '120px',
                  paddingBottom: '56px',
                  paddingLeft: '20px',
                  paddingRight: '20px',
            },
            [MOBILE]: {
                  paddingTop: '92px',
                  paddingBottom: '40px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
            },
      },
      heroInner: {
            maxWidth: '760px',
            margin: '0 auto',
            textAlign: 'center',
      },
      eyebrow: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorBrandBackground2,
            color: tokens.colorBrandForeground2,
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            marginBottom: '28px',
            textAlign: 'left',
            [MOBILE]: {
                  marginBottom: '20px',
            },
      },
      h1: {
            fontSize: 'clamp(32px, 7vw, 56px)',
            lineHeight: '1.1',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
            [MOBILE]: {
                  margin: '0 0 14px',
            },
      },
      h1Accent: {
            color: tokens.colorBrandForeground1,
      },
      subhead: {
            fontSize: 'clamp(15px, 2.4vw, 18px)',
            lineHeight: '1.6',
            color: tokens.colorNeutralForeground3,
            margin: '0 0 36px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
            [MOBILE]: {
                  margin: '0 0 24px',
            },
      },
      heroActions: {
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            [MOBILE]: {
                  flexDirection: 'column',
                  alignItems: 'stretch',
            },
      },

      // Live stat banner
      liveStatCard: {
            maxWidth: '1180px',
            margin: '0 auto 96px',
            padding: '0 24px',
            [TABLET]: {
                  margin: '0 auto 64px',
                  padding: '0 20px',
            },
            [MOBILE]: {
                  margin: '0 auto 40px',
                  padding: '0 16px',
            },
      },
      liveStatInner: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '20px',
            padding: '40px 48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0',
            [TABLET]: {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  rowGap: '28px',
                  padding: '32px 24px',
            },
            [MOBILE]: {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  rowGap: '24px',
                  padding: '24px 16px',
                  borderRadius: '16px',
            },
      },
      statCell: {
            textAlign: 'center',
            padding: '0 16px',
            borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
            [TABLET]: {
                  borderRight: 'none',
                  borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
                  paddingBottom: '24px',
            },
            [MOBILE]: {
                  padding: '0 8px',
                  paddingBottom: '20px',
            },
      },
      statCellLast: {
            textAlign: 'center',
            padding: '0 16px',
            [MOBILE]: {
                  padding: '0 8px',
            },
      },
      statValue: {
            fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            letterSpacing: '-0.01em',
            display: 'block',
      },
      statValueAccent: {
            color: tokens.colorBrandForeground1,
      },
      statLabel: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            fontWeight: tokens.fontWeightMedium,
            marginTop: '6px',
            display: 'block',
      },

      // Generic section
      section: {
            padding: '88px 24px',
            [TABLET]: {
                  padding: '64px 20px',
            },
            [MOBILE]: {
                  padding: '48px 16px',
            },
      },
      sectionAlt: {
            backgroundColor: tokens.colorNeutralBackground2,
      },
      sectionInner: {
            maxWidth: '1180px',
            margin: '0 auto',
      },
      sectionHead: {
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto 64px',
            [MOBILE]: {
                  margin: '0 auto 36px',
            },
      },
      h2: {
            fontSize: 'clamp(26px, 4.5vw, 36px)',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            letterSpacing: '-0.01em',
            margin: '0 0 12px',
      },
      sectionSub: {
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground3,
            lineHeight: '1.6',
            margin: 0,
      },

      // How it works
      stepsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            [TABLET]: {
                  gridTemplateColumns: 'repeat(2, 1fr)',
            },
            [MOBILE]: {
                  gridTemplateColumns: '1fr',
                  gap: '16px',
            },
      },
      stepCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '16px',
            padding: '32px',
            [MOBILE]: {
                  padding: '24px',
            },
      },
      stepIconBox: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: tokens.colorBrandBackground2,
            color: tokens.colorBrandForeground2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
      },
      stepTitle: {
            fontSize: tokens.fontSizeBase500,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 8px',
      },
      stepDesc: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            lineHeight: '1.6',
            margin: 0,
      },

      // Trust / escrow explainer
      trustGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '56px',
            alignItems: 'center',
            [TABLET]: {
                  gridTemplateColumns: '1fr',
                  gap: '40px',
            },
      },
      trustList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
      },
      trustItem: {
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
      },
      trustIconBox: {
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: tokens.colorPaletteGreenBackground1,
            color: tokens.colorPaletteGreenForeground1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
      },
      trustItemTitle: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 4px',
      },
      trustItemDesc: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            lineHeight: '1.6',
            margin: 0,
      },
      trustVisual: {
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '20px',
            padding: '32px',
            [MOBILE]: {
                  padding: '20px',
            },
      },
      flowRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 0',
            flexWrap: 'wrap',
      },
      flowDivider: {
            borderTop: `1px dashed ${tokens.colorNeutralStroke2}`,
      },
      flowDot: {
            width: '10px',
            height: '10px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorBrandBackground,
            flexShrink: 0,
      },
      flowLabel: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground1,
            fontWeight: tokens.fontWeightMedium,
      },
      flowAmount: {
            marginLeft: 'auto',
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            fontFamily: tokens.fontFamilyMonospace,
      },

      // CTA band
      ctaSection: {
            padding: '96px 24px',
            backgroundColor: tokens.colorNeutralForeground1,
            [TABLET]: {
                  padding: '64px 20px',
            },
            [MOBILE]: {
                  padding: '48px 16px',
            },
      },
      ctaInner: {
            maxWidth: '640px',
            margin: '0 auto',
            textAlign: 'center',
      },
      ctaH2: {
            fontSize: 'clamp(26px, 4.5vw, 36px)',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralBackground1,
            letterSpacing: '-0.01em',
            margin: '0 0 16px',
      },
      ctaSub: {
            fontSize: tokens.fontSizeBase400,
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 32px',
            lineHeight: '1.6',
      },

      // Footer
      footer: {
            padding: '64px 24px 32px',
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            [MOBILE]: {
                  padding: '40px 16px 24px',
            },
      },
      footerInner: {
            maxWidth: '1180px',
            margin: '0 auto',
      },
      footerGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '48px',
            marginBottom: '48px',
            [TABLET]: {
                  gridTemplateColumns: '1fr 1fr',
                  gap: '32px',
            },
            [MOBILE]: {
                  gridTemplateColumns: '1fr',
                  gap: '28px',
                  marginBottom: '32px',
            },
      },
      footerDesc: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            lineHeight: '1.6',
            margin: '16px 0 0',
            maxWidth: '320px',
      },
      footerColTitle: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 16px',
      },
      footerLink: {
            display: 'block',
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            textDecoration: 'none',
            marginBottom: '12px',
            ':hover': { color: tokens.colorBrandForeground1 },
      },
      footerBottom: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '32px',
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            [MOBILE]: {
                  flexDirection: 'column',
                  gap: '16px',
                  textAlign: 'center',
            },
      },
});

// ─── Data hook ──────────────────────────────────────────────────────────────

function useLandingStats() {
      const [stats, setStats] = useState<LandingStats | null>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            let cancelled = false;
            (async () => {
                  try {
                        const { data, error } =
                              await supabase.rpc('get_landing_stats');
                        if (cancelled) return;
                        if (error) {
                              console.error('[useLandingStats]', error);
                              setStats(null);
                        } else {
                              setStats(data as LandingStats);
                        }
                  } finally {
                        if (!cancelled) setLoading(false);
                  }
            })();
            return () => {
                  cancelled = true;
            };
      }, []);

      return { stats, loading };
}

function formatNaira(amount: number): string {
      if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M+`;
      if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k+`;
      return `₦${amount.toLocaleString()}`;
}

function formatCount(n: number): string {
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k+`;
      return `${n}`;
}

// ─── Page ───────────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
      const styles = useStyles();
      const { stats, loading } = useLandingStats();

      return (
            <div className={styles.page}>
                  <Nav />
                  <Hero />
                  <LiveStats stats={stats} loading={loading} />
                  <HowItWorks />
                  <TrustSection />
                  <CtaBand />
                  <Footer />
            </div>
      );
};

// ─── Nav ────────────────────────────────────────────────────────────────────

const Nav: React.FC = () => {
      const styles = useStyles();
      const { isAuthenticated } = useAuth();
      const [menuOpen, setMenuOpen] = useState(false);

      // Lock body scroll while the mobile menu is open
      useEffect(() => {
            document.body.style.overflow = menuOpen ? 'hidden' : '';
            return () => {
                  document.body.style.overflow = '';
            };
      }, [menuOpen]);

      const closeMenu = () => setMenuOpen(false);

      return (
            <nav className={styles.nav}>
                  <div className={styles.navInner}>
                        <Logo />
                        <div className={styles.navLinks}>
                              <a
                                    href="#how-it-works"
                                    className={styles.navLink}
                              >
                                    How it works
                              </a>
                              <a href="#trust" className={styles.navLink}>
                                    Escrow and trust
                              </a>
                              <Link
                                    to="/marketplace"
                                    className={styles.navLink}
                              >
                                    Browse jobs
                              </Link>
                        </div>
                        <div className={styles.navActions}>
                              <div className={styles.navActionsDesktop}>
                                    {isAuthenticated ? (
                                          <Button
                                                as={Link as never}
                                                href="/dashboard"
                                                appearance="primary"
                                          >
                                                Go to dashboard
                                          </Button>
                                    ) : (
                                          <div
                                                style={{
                                                      display: 'flex',
                                                      gap: '16px',
                                                }}
                                          >
                                                <Button
                                                      as={Link as never}
                                                      href="/auth/login"
                                                      appearance="subtle"
                                                >
                                                      Log in
                                                </Button>
                                                <Button
                                                      as={Link as never}
                                                      href="/auth/signup"
                                                      appearance="primary"
                                                >
                                                      Get started
                                                </Button>
                                          </div>
                                    )}
                              </div>
                              <Button
                                    className={styles.menuButton}
                                    appearance="subtle"
                                    icon={
                                          menuOpen ? (
                                                <DismissRegular />
                                          ) : (
                                                <NavigationRegular />
                                          )
                                    }
                                    onClick={() => setMenuOpen((v) => !v)}
                                    aria-label={
                                          menuOpen ? 'Close menu' : 'Open menu'
                                    }
                              />
                        </div>
                  </div>

                  {menuOpen && (
                        <div className={styles.mobileMenu}>
                              <a
                                    href="#how-it-works"
                                    className={styles.mobileNavLink}
                                    onClick={closeMenu}
                              >
                                    How it works
                              </a>
                              <a
                                    href="#trust"
                                    className={styles.mobileNavLink}
                                    onClick={closeMenu}
                              >
                                    Escrow and trust
                              </a>
                              <Link
                                    to="/marketplace"
                                    className={styles.mobileNavLink}
                                    onClick={closeMenu}
                              >
                                    Browse jobs
                              </Link>

                              <div className={styles.mobileMenuActions}>
                                    {isAuthenticated ? (
                                          <Button
                                                as={Link as never}
                                                href="/dashboard"
                                                appearance="primary"
                                                size="large"
                                                onClick={closeMenu}
                                          >
                                                Go to dashboard
                                          </Button>
                                    ) : (
                                          <>
                                                <Button
                                                      as={Link as never}
                                                      href="/auth/signup"
                                                      appearance="primary"
                                                      size="large"
                                                      onClick={closeMenu}
                                                >
                                                      Get started
                                                </Button>
                                                <Button
                                                      as={Link as never}
                                                      href="/auth/login"
                                                      appearance="outline"
                                                      size="large"
                                                      onClick={closeMenu}
                                                >
                                                      Log in
                                                </Button>
                                          </>
                                    )}
                              </div>
                        </div>
                  )}
            </nav>
      );
};

// ─── Hero ───────────────────────────────────────────────────────────────────

const Hero: React.FC = () => {
      const styles = useStyles();
      const { isAuthenticated } = useAuth();

      return (
            <section className={styles.hero}>
                  <div className={styles.heroInner}>
                        <div className={styles.eyebrow}>
                              <ShieldCheckmarkRegular fontSize={16} />
                              <span>
                                    Payments held in escrow until work is
                                    approved
                              </span>
                        </div>
                        <h1 className={styles.h1}>
                              Get paid for tasks,
                              <br />
                              <span className={styles.h1Accent}>
                                    not promises
                              </span>
                        </h1>
                        <Text className={styles.subhead}>
                              Workbit holds every job&apos;s budget in escrow
                              before work starts. Finish the task, get approved,
                              and your wallet is credited — no chasing, no
                              excuses.
                        </Text>
                        <div className={styles.heroActions}>
                              <Button
                                    as={Link as never}
                                    href={
                                          isAuthenticated
                                                ? '/dashboard'
                                                : '/auth/signup'
                                    }
                                    appearance="primary"
                                    size="large"
                                    icon={<ArrowRightRegular />}
                                    iconPosition="after"
                              >
                                    Start earning
                              </Button>
                              <Button
                                    as={Link as never}
                                    href="/marketplace"
                                    appearance="outline"
                                    size="large"
                              >
                                    Browse open jobs
                              </Button>
                        </div>
                  </div>
            </section>
      );
};

// ─── Live stats ─────────────────────────────────────────────────────────────

const LiveStats: React.FC<{ stats: LandingStats | null; loading: boolean }> = ({
      stats,
      loading,
}) => {
      const styles = useStyles();

      const cells = [
            {
                  label: 'Paid out to workers',
                  value: stats ? formatNaira(stats.total_paid_out) : '—',
                  accent: true,
            },
            {
                  label: 'Jobs open right now',
                  value: stats ? formatCount(stats.active_jobs) : '—',
            },
            {
                  label: 'Workers paid',
                  value: stats ? formatCount(stats.workers_paid) : '—',
            },
            {
                  label: 'Jobs completed',
                  value: stats ? formatCount(stats.jobs_completed) : '—',
            },
      ];

      return (
            <div className={styles.liveStatCard}>
                  <div className={styles.liveStatInner}>
                        {loading ? (
                              <div
                                    style={{
                                          gridColumn: '1 / -1',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          padding: '20px 0',
                                    }}
                              >
                                    <Spinner
                                          size="small"
                                          label="Loading live numbers"
                                          labelPosition="after"
                                    />
                              </div>
                        ) : (
                              cells.map((c, i) => (
                                    <div
                                          key={c.label}
                                          className={
                                                i === cells.length - 1
                                                      ? styles.statCellLast
                                                      : styles.statCell
                                          }
                                    >
                                          <span
                                                className={
                                                      i === 0
                                                            ? `${styles.statValue} ${styles.statValueAccent}`
                                                            : styles.statValue
                                                }
                                          >
                                                {c.value}
                                          </span>
                                          <span className={styles.statLabel}>
                                                {c.label}
                                          </span>
                                    </div>
                              ))
                        )}
                  </div>
            </div>
      );
};

// ─── How it works ───────────────────────────────────────────────────────────

const HowItWorks: React.FC = () => {
      const styles = useStyles();

      const steps = [
            {
                  icon: <PersonAddRegular fontSize={22} />,
                  title: 'Create your account',
                  desc: 'Sign up free and verify your details. Your escrow wallet activates instantly.',
            },
            {
                  icon: <TargetRegular fontSize={22} />,
                  title: 'Pick a funded job',
                  desc: 'Every job you see is already paid for and sitting in escrow before you start.',
            },
            {
                  icon: <CheckmarkCircleRegular fontSize={22} />,
                  title: 'Get paid on approval',
                  desc: 'Submit proof of work. Once approved, your wallet is credited the same day.',
            },
      ];

      return (
            <section id="how-it-works" className={styles.section}>
                  <div className={styles.sectionInner}>
                        <div className={styles.sectionHead}>
                              <h2 className={styles.h2}>
                                    Three steps to your first payout
                              </h2>
                              <p className={styles.sectionSub}>
                                    No invoices, no waiting on a client to
                                    remember to pay you.
                              </p>
                        </div>
                        <div className={styles.stepsGrid}>
                              {steps.map((s) => (
                                    <div
                                          key={s.title}
                                          className={styles.stepCard}
                                    >
                                          <div className={styles.stepIconBox}>
                                                {s.icon}
                                          </div>
                                          <h3 className={styles.stepTitle}>
                                                {s.title}
                                          </h3>
                                          <p className={styles.stepDesc}>
                                                {s.desc}
                                          </p>
                                    </div>
                              ))}
                        </div>
                  </div>
            </section>
      );
};

// ─── Trust / escrow explainer ───────────────────────────────────────────────

const TrustSection: React.FC = () => {
      const styles = useStyles();

      const points = [
            {
                  icon: <LockClosedRegular fontSize={18} />,
                  title: 'Funds locked before you start',
                  desc: 'A job owner can\u2019t post work without funding it first. The money is reserved the moment the job goes live.',
            },
            {
                  icon: <WalletCreditCardRegular fontSize={18} />,
                  title: 'Instant wallet credit',
                  desc: 'Once a job owner approves your work, the release is a single transaction \u2014 no multi-day bank transfer delays.',
            },
            {
                  icon: <ChartMultipleRegular fontSize={18} />,
                  title: 'Every transaction is logged',
                  desc: 'Deposits, reservations, and releases are recorded in full, so you can see exactly where every naira moved.',
            },
      ];

      return (
            <section
                  id="trust"
                  className={`${styles.section} ${styles.sectionAlt}`}
            >
                  <div className={styles.sectionInner}>
                        <div className={styles.trustGrid}>
                              <div>
                                    <h2
                                          className={styles.h2}
                                          style={{ textAlign: 'left' }}
                                    >
                                          Your pay sits in escrow, not in
                                          someone&apos;s promise
                                    </h2>
                                    <p
                                          className={styles.sectionSub}
                                          style={{
                                                textAlign: 'left',
                                                marginBottom: '32px',
                                          }}
                                    >
                                          Workbit&apos;s escrow model means the
                                          money exists before the job is posted.
                                          Here&apos;s what that looks like end
                                          to end.
                                    </p>
                                    <div className={styles.trustList}>
                                          {points.map((p) => (
                                                <div
                                                      key={p.title}
                                                      className={
                                                            styles.trustItem
                                                      }
                                                >
                                                      <div
                                                            className={
                                                                  styles.trustIconBox
                                                            }
                                                      >
                                                            {p.icon}
                                                      </div>
                                                      <div>
                                                            <h3
                                                                  className={
                                                                        styles.trustItemTitle
                                                                  }
                                                            >
                                                                  {p.title}
                                                            </h3>
                                                            <p
                                                                  className={
                                                                        styles.trustItemDesc
                                                                  }
                                                            >
                                                                  {p.desc}
                                                            </p>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>

                              <div className={styles.trustVisual}>
                                    <div className={styles.flowRow}>
                                          <div className={styles.flowDot} />
                                          <span className={styles.flowLabel}>
                                                Job owner funds job
                                          </span>
                                          <span className={styles.flowAmount}>
                                                reserved
                                          </span>
                                    </div>
                                    <div className={styles.flowDivider} />
                                    <div className={styles.flowRow}>
                                          <div className={styles.flowDot} />
                                          <span className={styles.flowLabel}>
                                                Worker submits proof
                                          </span>
                                          <span className={styles.flowAmount}>
                                                pending review
                                          </span>
                                    </div>
                                    <div className={styles.flowDivider} />
                                    <div className={styles.flowRow}>
                                          <div
                                                className={styles.flowDot}
                                                style={{
                                                      backgroundColor:
                                                            tokens.colorPaletteGreenForeground1,
                                                }}
                                          />
                                          <span className={styles.flowLabel}>
                                                Work approved
                                          </span>
                                          <span className={styles.flowAmount}>
                                                released
                                          </span>
                                    </div>
                                    <div className={styles.flowDivider} />
                                    <div className={styles.flowRow}>
                                          <div
                                                className={styles.flowDot}
                                                style={{
                                                      backgroundColor:
                                                            tokens.colorPaletteGreenForeground1,
                                                }}
                                          />
                                          <span className={styles.flowLabel}>
                                                Worker wallet credited
                                          </span>
                                          <span className={styles.flowAmount}>
                                                complete
                                          </span>
                                    </div>
                              </div>
                        </div>
                  </div>
            </section>
      );
};

// ─── CTA band ───────────────────────────────────────────────────────────────

const CtaBand: React.FC = () => {
      const styles = useStyles();
      const { isAuthenticated } = useAuth();

      return (
            <section className={styles.ctaSection}>
                  <div className={styles.ctaInner}>
                        <h2 className={styles.ctaH2}>Start earning today</h2>
                        <p className={styles.ctaSub}>
                              Join workers already getting paid through
                              Workbit&apos;s escrow wallet.
                        </p>
                        <Button
                              as={Link as never}
                              href={
                                    isAuthenticated
                                          ? '/dashboard'
                                          : '/auth/signup'
                              }
                              appearance="primary"
                              size="large"
                              icon={<FlashRegular />}
                        >
                              Create your account
                        </Button>
                  </div>
            </section>
      );
};

// ─── Footer ─────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
      const styles = useStyles();

      return (
            <footer className={styles.footer}>
                  <div className={styles.footerInner}>
                        <div className={styles.footerGrid}>
                              <div>
                                    <Logo />
                                    <p className={styles.footerDesc}>
                                          An escrow-backed task marketplace
                                          built for Nigerian workers and the
                                          businesses that hire them.
                                    </p>
                              </div>
                              <div>
                                    <h4 className={styles.footerColTitle}>
                                          Platform
                                    </h4>
                                    <a
                                          href="/marketplace"
                                          className={styles.footerLink}
                                    >
                                          Marketplace
                                    </a>
                                    <a
                                          href="/post-job"
                                          className={styles.footerLink}
                                    >
                                          Post a job
                                    </a>
                                    <a
                                          href="#how-it-works"
                                          className={styles.footerLink}
                                    >
                                          How it works
                                    </a>
                              </div>
                              <div>
                                    <h4 className={styles.footerColTitle}>
                                          Support
                                    </h4>
                                    <a href="#" className={styles.footerLink}>
                                          Help center
                                    </a>
                                    <a href="#" className={styles.footerLink}>
                                          Contact us
                                    </a>
                                    <a href="#" className={styles.footerLink}>
                                          Terms of service
                                    </a>
                              </div>
                        </div>
                        <div className={styles.footerBottom}>
                              <span>
                                    © {new Date().getFullYear()} Workbit. All
                                    rights reserved.
                              </span>
                              <div style={{ display: 'flex', gap: '20px' }}>
                                    <PhoneRegular fontSize={18} />
                                    <ShieldCheckmarkRegular fontSize={18} />
                                    <ChartMultipleRegular fontSize={18} />
                              </div>
                        </div>
                  </div>
            </footer>
      );
};

export default LandingPage;