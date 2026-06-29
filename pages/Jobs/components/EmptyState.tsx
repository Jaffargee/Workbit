import React from 'react';
import {
      tokens,
      Text,
      Button,
} from '@fluentui/react-components';
import {
      Add16Regular,
      BriefcaseRegular,
} from '@fluentui/react-icons';

import { usePageStyles } from '../styles'

const EmptyState: React.FC<{ filtered: boolean; onPost: () => void }> = ({ filtered, onPost }) => {
      const styles = usePageStyles();
      return (
            <div className={styles.emptyState}>
                  <BriefcaseRegular className={styles.emptyIcon} />
                  <Text size={500} weight="semibold" style={{ color: tokens.colorNeutralForeground2 }}>
                        {filtered ? 'No jobs match your filters' : 'No jobs posted yet'}
                  </Text>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3, maxWidth: 320 }}>
                        {filtered
                              ? 'Try adjusting your search or status filter to find your jobs.'
                              : 'Post your first job to start receiving submissions from workers.'}
                  </Text>
                  {!filtered && (
                        <Button appearance="primary" icon={<Add16Regular />} onClick={onPost}>
                              Post a Job
                        </Button>
                  )}
            </div>
      );
};

export default EmptyState;