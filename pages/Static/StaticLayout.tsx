import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, tokens, Button } from '@fluentui/react-components';
import { Logo } from '@/components/Logo';
import { ArrowLeftRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
      page: {
            backgroundColor: tokens.colorNeutralBackground1,
            minHeight: '100vh',
      },
      nav: {
            position: 'sticky',
            top: 0,
            zIndex: 30,
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      navInner: {
            maxWidth: '900px',
            margin: '0 auto',
            height: '64px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '@media (max-width: 600px)': { padding: '0 16px', height: '56px' },
      },
      main: {
            maxWidth: '760px',
            margin: '0 auto',
            padding: '64px 24px 96px',
            '@media (max-width: 600px)': { padding: '36px 16px 64px' },
      },
      header: {
            marginBottom: '40px',
      },
      eyebrow: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorBrandForeground1,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
      },
      h1: {
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            letterSpacing: '-0.01em',
            margin: '0 0 12px',
      },
      meta: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
      },
      footer: {
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            padding: '32px 24px',
            textAlign: 'center',
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
      },
});

interface StaticLayoutProps {
      eyebrow?: string;
      title: string;
      meta?: string;
      children: React.ReactNode;
}

export const StaticLayout: React.FC<StaticLayoutProps> = ({
      eyebrow,
      title,
      meta,
      children,
}) => {
      const styles = useStyles();

      return (
            <div className={styles.page}>
                  <nav className={styles.nav}>
                        <div className={styles.navInner}>
                              <Logo size="sm" />
                              <Button
                                    as={Link as never}
                                    href="/"
                                    appearance="subtle"
                                    icon={<ArrowLeftRegular />}
                              >
                                    Back home
                              </Button>
                        </div>
                  </nav>

                  <main className={styles.main}>
                        <div className={styles.header}>
                              {eyebrow && (
                                    <div className={styles.eyebrow}>
                                          {eyebrow}
                                    </div>
                              )}
                              <h1 className={styles.h1}>{title}</h1>
                              {meta && (
                                    <p className={styles.meta}>{meta}</p>
                              )}
                        </div>
                        {children}
                  </main>

                  <footer className={styles.footer}>
                        © {new Date().getFullYear()} Workbit Technologies.
                        All rights reserved.
                  </footer>
            </div>
      );
};

// ─── Shared prose styles for legal/help content ────────────────────────────

export const useProseStyles = makeStyles({
      section: {
            marginBottom: '36px',
      },
      h2: {
            fontSize: tokens.fontSizeBase600,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 12px',
      },
      h3: {
            fontSize: tokens.fontSizeBase500,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '20px 0 8px',
      },
      p: {
            fontSize: tokens.fontSizeBase300,
            lineHeight: '1.7',
            color: tokens.colorNeutralForeground2,
            margin: '0 0 14px',
      },
      ul: {
            margin: '0 0 14px',
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
      },
      li: {
            fontSize: tokens.fontSizeBase300,
            lineHeight: '1.7',
            color: tokens.colorNeutralForeground2,
      },
      strong: {
            color: tokens.colorNeutralForeground1,
            fontWeight: tokens.fontWeightSemibold,
      },
      callout: {
            backgroundColor: tokens.colorNeutralBackground2,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: tokens.fontSizeBase300,
            lineHeight: '1.6',
            color: tokens.colorNeutralForeground2,
            margin: '0 0 14px',
      },
});