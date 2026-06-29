import React from 'react';
import {
      Dialog,
      DialogSurface,
      DialogBody,
      DialogTitle,
      DialogContent,
      DialogActions,
      Button,
      Text,
      makeStyles,
      tokens,
} from '@fluentui/react-components';
import {
      CheckmarkCircle24Filled,
      DismissCircle24Filled,
} from '@fluentui/react-icons';

interface StatusDialogProps {
      isOpen: boolean;
      onClose: () => void;
      type: 'success' | 'error' | null;
      message: string;
}

const useStyles = makeStyles({
      surface: {
            maxWidth: '384px',
            width: 'calc(100% - 2rem)',
            borderRadius: tokens.borderRadiusXLarge,
            padding: tokens.spacingVerticalXXL,
            textAlign: 'center',
      },
      iconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginBottom: tokens.spacingVerticalL,
      },
      successIcon: {
            width: '64px',
            height: '64px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorPaletteGreenBackground2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorPaletteGreenForeground1,
      },
      errorIcon: {
            width: '64px',
            height: '64px',
            borderRadius: tokens.borderRadiusCircular,
            backgroundColor: tokens.colorPaletteRedBackground2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tokens.colorPaletteRedForeground1,
      },
      title: {
            fontSize: tokens.fontSizeBase500,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            marginBottom: tokens.spacingVerticalS,
            display: 'block',
      },
      description: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            lineHeight: tokens.lineHeightBase300,
            display: 'block',
            marginBottom: tokens.spacingVerticalXL,
      },
      actions: {
            justifyContent: 'center',
      },
      successButton: {
            width: '100%',
            borderRadius: tokens.borderRadiusCircular,
            paddingTop: tokens.spacingVerticalM,
            paddingBottom: tokens.spacingVerticalM,
            fontWeight: tokens.fontWeightSemibold,
            backgroundColor: tokens.colorPaletteGreenBackground3,
            color: tokens.colorNeutralForegroundOnBrand,
            ':hover': {
                  backgroundColor: tokens.colorPaletteGreenForeground1,
                  color: tokens.colorNeutralForegroundOnBrand,
            },
      },
      errorButton: {
            width: '100%',
            borderRadius: tokens.borderRadiusCircular,
            paddingTop: tokens.spacingVerticalM,
            paddingBottom: tokens.spacingVerticalM,
            fontWeight: tokens.fontWeightSemibold,
      },
});

const StatusDialog: React.FC<StatusDialogProps> = ({
      isOpen,
      onClose,
      type,
      message,
}) => {
      const styles = useStyles();

      if (!type) return null;

      const isSuccess = type === 'success';

      return (
      <Dialog
            open={isOpen}
            onOpenChange={(_, data) => !data.open && onClose()}
            modalType="alert"
      >
            <DialogSurface className={styles.surface}>
            <DialogBody>
                  {/* Status Icon */}
                  <div className={styles.iconWrapper}>
                        <div className={isSuccess ? styles.successIcon : styles.errorIcon}>
                        {isSuccess ? (
                              <CheckmarkCircle24Filled fontSize={20} />
                        ) : (
                              <DismissCircle24Filled fontSize={20} />
                        )}
                        </div>
                  </div>

                  {/* Title */}
                  <DialogTitle
                        action={null} // suppresses the default close button
                        as="h2"
                  >
                        <Text className={styles.title}>
                              {isSuccess ? 'Transaction Successful' : 'Transaction Failed'}
                        </Text>
                  </DialogTitle>

                  {/* Description */}
                  <DialogContent>
                        <Text className={styles.description}>{message}</Text>
                  </DialogContent>

                  {/* Action */}
                  <DialogActions className={styles.actions}>
                        <Button
                              appearance={isSuccess ? 'primary' : 'outline'}
                              className={isSuccess ? styles.successButton : styles.errorButton}
                              onClick={onClose}
                        >
                              {isSuccess ? 'Great, Thanks!' : 'Try Again'}
                        </Button>
                  </DialogActions>

            </DialogBody>
            </DialogSurface>
      </Dialog>
      );
};

export default StatusDialog;