import { tokens, makeStyles, shorthands } from '@fluentui/react-components';

export const usePageStyles = makeStyles({
      root: {
            minHeight: '100vh',
            backgroundColor: tokens.colorNeutralBackground2,
            padding: '32px 24px',
            boxSizing: 'border-box',
      },
      inner: {
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
      },

      // Header
      pageHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
      },
      pageTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
      },
      pageTitleIcon: {
            color: tokens.colorBrandForeground1,
            fontSize: '22px',
      },

      // Toolbar
      toolbar: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
      },
      searchInput: {
            minWidth: '220px',
            flexGrow: 1,
      },

      // Stats strip
      statsStrip: {
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
      },
      statCard: {
            flex: '1 1 140px',
            backgroundColor: tokens.colorNeutralBackground1,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: tokens.borderRadiusMedium,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
      },
      statValue: {
            fontSize: '22px',
            fontWeight: 700,
            color: tokens.colorNeutralForeground1,
            lineHeight: 1.2,
      },
      statLabel: {
            fontSize: '12px',
            color: tokens.colorNeutralForeground3,
            fontWeight: 500,
      },
      // Grid
      grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '16px',
      },


      // Empty state
      emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '72px 24px',
            gap: '14px',
            textAlign: 'center',
      },
      emptyIcon: {
            fontSize: '48px',
            color: tokens.colorNeutralForeground4,
      },
});
