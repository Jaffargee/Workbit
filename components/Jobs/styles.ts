import { tokens, makeStyles, shorthands } from '@fluentui/react-components';

export const useJobCardStyles = makeStyles({
      // ── Grid ─────────────────────────────────────────────────────────────
      grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: tokens.spacingHorizontalM,
      },
      // ── Job card ─────────────────────────────────────────────────────────
      card: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            // boxShadow: tokens.shadow2,
            overflow: 'hidden',
            cursor: 'pointer',
            transition:
                  'box-shadow 0.15s ease, transform 0.12s ease, border-color 0.15s ease',
            ':hover': {
                  boxShadow: tokens.shadow16,
                  transform: 'translateY(-2px)',
                  borderTopColor: tokens.colorBrandStroke1,
                  borderRightColor: tokens.colorBrandStroke1,
                  borderBottomColor: tokens.colorBrandStroke1,
                  borderLeftColor: tokens.colorBrandStroke1,
            },
      },
      cardCompleted: {
            opacity: 0.65,
            cursor: 'default',
            ':hover': {
                  boxShadow: tokens.shadow4,
                  transform: 'none',
                  borderTopColor: tokens.colorNeutralStroke2,
                  borderRightColor: tokens.colorNeutralStroke2,
                  borderBottomColor: tokens.colorNeutralStroke2,
                  borderLeftColor: tokens.colorNeutralStroke2,
            },
      },
      cardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: tokens.spacingHorizontalS,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      cardHeaderInfo: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2px',
            flex: 1,
            minWidth: 0,
      },
      platformName: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground3,
            textTransform: 'uppercase',
      },
      jobTitle: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            lineHeight: tokens.lineHeightBase300,
            // two-line clamp
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
      },
      cardBody: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            flex: 1,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
      },
      description: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            lineHeight: tokens.lineHeightBase200,
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
      },
      badgeRow: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacingHorizontalXS,
      },
      progressMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
            marginBottom: tokens.spacingVerticalXS,
      },
      cardFooter: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            backgroundColor: tokens.colorNeutralBackground2,
      },
      payoutBlock: {
            display: 'flex',
            flexDirection: 'column',
            // rowGap: '8px',
            gap: '2px'
      },
      payoutLabel: {
            fontSize: tokens.fontSizeBase200,
            fontWeight: tokens.fontWeightSemibold,
            // textTransform: 'uppercase',
            // letterSpacing: '0.5px',
            color: tokens.colorNeutralForeground3,
      },
      payoutValue: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            fontVariantNumeric: 'tabular-nums',
      },
      proofInstruction: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            fontStyle: 'italic',
      },

});