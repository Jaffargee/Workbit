import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, tokens, Button } from '@fluentui/react-components';
import { ArrowLeftRegular, SearchRegular } from '@fluentui/react-icons';
import { Logo } from '@/components/Logo';

const useStyles = makeStyles({
      page: {
            minHeight: '100vh',
            backgroundColor: tokens.colorNeutralBackground1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
      },
      code: {
            fontSize: 'clamp(80px, 18vw, 160px)',
            fontWeight: tokens.fontWeightSemibold,
            lineHeight: 1,
            color: tokens.colorBrandForeground1,
            opacity: 0.15,
            letterSpacing: '-0.04em',
            margin: '0 0 -24px',
            display: 'block',
      },
      title: {
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 12px',
      },
      sub: {
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground3,
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto 32px',
      },
      actions: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
      },
      logo: {
            position: 'absolute',
            top: '24px',
            left: '24px',
      },
});

const NotFound: React.FC = () => {
      const styles = useStyles();

      return (
            <div className={styles.page}>
                  <div className={styles.logo}>
                        <Logo size="sm" />
                  </div>
                  <span className={styles.code}>404</span>
                  <h1 className={styles.title}>Page not found</h1>
                  <p className={styles.sub}>
                        The page you're looking for doesn't exist or may
                        have been moved. Let's get you back on track.
                  </p>
                  <div className={styles.actions}>
                        <Button
                              as={Link as never}
                              href="/"
                              appearance="primary"
                              icon={<ArrowLeftRegular />}
                        >
                              Back to home
                        </Button>
                        <Button
                              as={Link as never}
                              href="/marketplace"
                              appearance="outline"
                              icon={<SearchRegular />}
                        >
                              Browse jobs
                        </Button>
                  </div>
            </div>
      );
};

export default NotFound;