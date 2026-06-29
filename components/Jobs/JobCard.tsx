import React from 'react';
import { Job, JobStatus } from '../../types/types';
import { useNavigate } from 'react-router-dom';
import {
      tokens,
      Avatar,
      Badge,
      Button,
      ProgressBar,
      Text,
      Tooltip,
} from '@fluentui/react-components';
import {
      ArrowRight16Regular,
      Camera16Regular,
      DocumentMultiple16Regular,
      Flash16Regular,
      People16Regular,
      CalendarLtr12Regular,
      CursorClickRegular as CursorClickRegular,
} from '@fluentui/react-icons';
import { useJobCardStyles } from './styles';
import { PLATFORM_COLORS } from '@/constants';

const STATUS_META: Record<JobStatus, { label: string; color: 'success' | 'warning' | 'danger' | 'subtle' | 'informative'; }> = {
      DRAFT:      { label: 'Draft',     color: 'subtle' },
      ACTIVE:     { label: 'Active',    color: 'success' },
      COMPLETED:  { label: 'Completed', color: 'informative' },
      EXPIRED:    { label: 'Expired',   color: 'danger' },
      CANCELLED:  { label: 'Cancelled', color: 'subtle' },
      PAUSED:  { label: 'Paused', color: 'warning' },
};

const JobCard: React.FC<{ job: Job; owner?: boolean; onClick: () => void }> = ({ job, owner, onClick }) => {
      const styles = useJobCardStyles();
      const navigate = useNavigate();

      const isCompleted = job.status === 'COMPLETED';
      const progressPercent = Math.min(
            100,
            Math.floor((job.filled_slots / job.total_slots) * 100)
      );

      const getButtonLabel = (status: JobStatus) => {
            switch (status) {
                  case 'ACTIVE': return 'Manage';
                  case 'DRAFT':   return 'Fund to Activate';
                  case 'COMPLETED': return 'View Summary';
                  case 'EXPIRED':
                  case 'CANCELLED': return 'View';
                  default: return 'View';
            }
      };
      
      return (
            <article
                  className={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
                  onClick={!isCompleted ? onClick : undefined}
                  role={!isCompleted ? 'button' : undefined}
                  tabIndex={!isCompleted ? 0 : undefined}
                  onKeyDown={
                        !isCompleted
                              ? (e) => e.key === 'Enter' && onClick()
                              : undefined
                  }
            >
                  {/* Header */}
                  <div className={styles.cardHeader}>
                        <Avatar
                              size={36}
                              image={{ src: job.platforms?.logo_url }}
                              name={job.platforms?.name}
                              style={{ borderRadius: tokens.borderRadiusCircular }}
                              color="colorful"
                        />

                        <div className={styles.cardHeaderInfo}>
                              <Text className={styles.platformName}>
                                    {job.platforms?.name ?? 'Social Task'}
                              </Text>
                        </div>

                        <Tooltip
                              content={
                                    isCompleted
                                          ? 'All slots filled'
                                          : 'Accepting submissions'
                              }
                              relationship="label"
                        >
                              <Badge
                                    appearance="filled"
                                    color={STATUS_META[job.status].color}
                                    size="small"
                                    className='w-15'
                              >
                                    {/* {isCompleted ? 'Filled' : 'Active'} */}
                                    {job.status}
                              </Badge>
                        </Tooltip>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                        {/* Meta row */}
                        <div
                              style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                              }}
                        >
                              <CursorClickRegular
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              />
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                          fontWeight: 600,
                                          textTransform: 'capitalize',
                                    }}
                              >
                                    {job.job_type.toLowerCase()} task
                              </Text>
                              <CalendarLtr12Regular
                                    style={{
                                          color: tokens.colorNeutralForeground4,
                                          marginLeft: 4,
                                    }}
                              />
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              >
                                    {new Date(
                                          job.posted_at as string
                                    ).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                    })}
                              </Text>
                        </div>

                        <Text className={styles.jobTitle}>{job.title}</Text>
                        <Text className={styles.description}>
                              {job.description}
                        </Text>

                        {/* Verification badges */}
                        <div className={styles.badgeRow}>
                              {job.requires_screenshot && (
                                    <Badge
                                          appearance="tint"
                                          color="informative"
                                          icon={<Camera16Regular />}
                                    >
                                          Requires Proof
                                    </Badge>
                              )}
                              {job.requires_before_proof && (
                                    <Badge
                                          appearance="tint"
                                          color="warning"
                                          icon={<DocumentMultiple16Regular />}
                                    >
                                          Before/After
                                    </Badge>
                              )}
                              {job.auto_approve && (
                                    <Badge
                                          appearance="tint"
                                          color="success"
                                          icon={<Flash16Regular />}
                                    >
                                          Auto-Approve
                                    </Badge>
                              )}
                        </div>

                        {/* Slots progress */}
                        <div>
                              <div className={styles.progressMeta}>
                                    <span
                                          style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                          }}
                                    >
                                          <People16Regular
                                                style={{ fontSize: 12 }}
                                          />
                                          Slots Filled
                                    </span>
                                    <span>
                                          <strong>{job.filled_slots}</strong>
                                          <span
                                                style={{
                                                      color: tokens.colorNeutralForeground4,
                                                }}
                                          >
                                                {' '}
                                                / {job.total_slots}
                                          </span>
                                    </span>
                              </div>
                              <ProgressBar
                                    value={progressPercent / 100}
                                    color={
                                          isCompleted
                                                ? 'warning'
                                                : progressPercent > 85
                                                  ? 'error'
                                                  : 'brand'
                                    }
                                    thickness="medium"
                              />
                        </div>
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                        <div className={styles.payoutBlock}>
                              <Text className={styles.payoutLabel}>
                                    Settle Payout:
                              </Text>
                              <Text className={styles.payoutValue}>
                                    {job.payout_currency === 'NGN' ? '₦' : '$'}
                                    {job.payout_amount.toLocaleString(
                                          undefined,
                                          { minimumFractionDigits: 2 }
                                    )}
                              </Text>
                        </div>

                        {
                              owner ? 
                              <Button
                                    appearance={isCompleted ? 'outline' : 'primary'}
                                    icon={<ArrowRight16Regular />}
                                    iconPosition="after"
                                    size="medium"
                                    disabled={isCompleted}
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/jobs/owner/${job.id}`);
                                    }}
                              >
                                    {getButtonLabel(job.status)}
                              </Button> :
                              <Button
                                    appearance={isCompleted ? 'outline' : 'primary'}
                                    icon={<ArrowRight16Regular />}
                                    iconPosition="after"
                                    size="medium"
                                    disabled={isCompleted}
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/marketplace/${job.id}`);
                                    }}
                              >
                                    {isCompleted ? 'Filled' : 'Start'}
                              </Button> 
                        }
                  </div>

            </article>
      );
};


export default JobCard;