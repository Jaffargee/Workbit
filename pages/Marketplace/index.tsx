import React, { useEffect, useMemo, useState } from 'react';
import { PLATFORMS } from '../../constants';
import { Job, Platform } from '../../types/types';
import { supabase } from '@/server/supabase';
import { useNavigate } from 'react-router-dom';

import {
      // Layout & surface
      makeStyles,
      shorthands,
      tokens,
      // Components
      Avatar,
      Badge,
      Button,
      Dialog,
      DialogActions,
      DialogBody,
      DialogContent,
      DialogSurface,
      DialogTitle,
      DialogTrigger,
      Field,
      Input,
      ProgressBar,
      SearchBox,
      Skeleton,
      SkeletonItem,
      Spinner,
      Tab,
      TabList,
      Text,
      Textarea,
      Tooltip,
      // Icons (Fluent System Icons — bundled with v9)
      // You can swap these for any @fluentui/react-icons exports
} from '@fluentui/react-components';

import {
      CheckmarkCircle24Regular,
      ArrowRight16Regular,
      Camera16Regular,
      DocumentMultiple16Regular,
      Flash16Regular,
      People16Regular,
      CursorClickRegular as CursorClickRegular,
} from '@fluentui/react-icons';
import { useAuth } from '@/contexts/authentication';
import JobCard from '@/components/Jobs/JobCard';

// ─── Styles (makeStyles — Griffel CSS-in-JS, zero-runtime) ────────────────────

const useStyles = makeStyles({
      root: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalL,
            paddingBottom: tokens.spacingVerticalXXXL,
            paddingTop: tokens.spacingVerticalS,
            paddingLeft: tokens.spacingHorizontalS,
            paddingRight: tokens.spacingHorizontalS,
      },

      // ── Command / filter bar ──────────────────────────────────────────────
      commandBar: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            '@media (min-width: 768px)': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  columnGap: tokens.spacingHorizontalM,
            },
      },
      searchBox: {
            width: '100%',
            '@media (min-width: 768px)': {
                  maxWidth: '340px',
            },
      },
      tabListWrap: {
            overflowX: 'auto',
            // hide scrollbar cross-browser
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
      },

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
                  borderColor: tokens.colorBrandStroke1,
            },
      },
      cardCompleted: {
            opacity: 0.65,
            cursor: 'default',
            ':hover': {
                  boxShadow: tokens.shadow4,
                  transform: 'none',
                  borderColor: tokens.colorNeutralStroke2,
            },
      },
      cardHeader: {
            display: 'flex',
            alignItems: 'flex-start',
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
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground3,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
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
            rowGap: '2px',
      },
      payoutLabel: {
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: tokens.colorNeutralForeground3,
      },
      payoutValue: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            fontVariantNumeric: 'tabular-nums',
      },

      // ── Modal ─────────────────────────────────────────────────────────────
      modalReward: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorBrandForeground1,
      },
      infoBox: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground1,
            lineHeight: tokens.lineHeightBase300,
            whiteSpace: 'pre-wrap',
      },
      proofInstruction: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            fontStyle: 'italic',
      },
      successPanel: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            ...shorthands.padding(
                  tokens.spacingVerticalXXL,
                  tokens.spacingHorizontalXL
            ),
            rowGap: tokens.spacingVerticalM,
            textAlign: 'center',
      },

      // ── Skeleton card ─────────────────────────────────────────────────────
      skeletonCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
      },

      // ── Empty state ───────────────────────────────────────────────────────
      emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...shorthands.padding(tokens.spacingVerticalXXXL),
            rowGap: tokens.spacingVerticalS,
            color: tokens.colorNeutralForeground3,
      },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const Marketplace: React.FC = () => {
      const styles = useStyles();
      // const { user, subscribe, submitProof } = useApp();

      const { profile: user } = useAuth();

      const [filter, setFilter] = useState<Platform | 'All'>('All');
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedJob, setSelectedJob] = useState<Job | null>(null);
      const [proof, setProof] = useState('');
      const [submitted, setSubmitted] = useState(false);
      const [loading, setLoading] = useState(false);
      const [jobs, setJobs] = useState<Job[]>([]);

      const filteredJobs = jobs.filter((job) => {
            const matchesPlatform =
                  filter === 'All' || job.platforms.name === filter;
            const matchesSearch = job.title
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
            return matchesPlatform && matchesSearch;
      });

      const handleSubmitProof = () => {
            if (!proof || !selectedJob) return;
            // submitProof({ jobId: selectedJob.id, proofData: proof });
            setSubmitted(true);
            setTimeout(() => {
                  setSelectedJob(null);
                  setSubmitted(false);
                  setProof('');
            }, 2000);
      };

      useEffect(() => {
            async function fetchJobs() {
                  setLoading(true);
                  try {
                        const { data, error } = await supabase
                              .from('jobs')
                              .select('*, platforms (*)');
                        if (error) {
                              console.error(error);
                        } else {
                              setJobs(data as Job[]);
                        }
                  } catch (err) {
                        console.error(err);
                  } finally {
                        setLoading(false);
                  }
            }
            fetchJobs();
      }, []);

      return (
            <div className={styles.root}>
                  {/* ── Command bar ── */}
                  <div className={styles.commandBar}>
                        <SearchBox
                              className={styles.searchBox}
                              placeholder="Search jobs…"
                              value={searchTerm}
                              onChange={(_, d) => setSearchTerm(d.value)}
                              size="medium"
                        />

                        <div className={styles.tabListWrap}>
                              <TabList
                                    selectedValue={filter}
                                    onTabSelect={(_, d) =>
                                          setFilter(d.value as Platform | 'All')
                                    }
                                    size="medium"
                              >
                                    <Tab value="All">All Platforms</Tab>
                                    {PLATFORMS.map((p) => (
                                          <Tab
                                                key={p.name}
                                                value={p.name}
                                                icon={p.icon}
                                          >
                                                {p.name}
                                          </Tab>
                                    ))}
                              </TabList>
                        </div>
                  </div>

                  {/* ── Grid ── */}
                  <div className={styles.grid}>
                        {loading ? (
                              Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonJobCard key={i} />
                              ))
                        ) : filteredJobs.length === 0 ? (
                              <EmptyState
                                    searchTerm={searchTerm}
                                    platformFilter={filter}
                              />
                        ) : (
                              filteredJobs.map((job) => (
                                    <JobCard
                                          key={job.id}
                                          job={job}
                                          onClick={() => setSelectedJob(job)}
                                    />
                              ))
                        )}
                  </div>
            </div>
      );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonJobCard: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.skeletonCard}>
                  <Skeleton className="gap-2 flex flex-col">
                        <div
                              style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'center',
                              }}
                        >
                              <SkeletonItem
                                    shape="square"
                                    size={36}
                                    style={{
                                          borderRadius:
                                                tokens.borderRadiusSmall,
                                          flexShrink: 0,
                                    }}
                              />
                              <div
                                    style={{
                                          flex: 1,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 6,
                                    }}
                              >
                                    <SkeletonItem
                                          size={12}
                                          style={{ width: '60%' }}
                                    />
                                    <SkeletonItem
                                          size={16}
                                          style={{ width: '90%' }}
                                    />
                              </div>
                        </div>
                        <SkeletonItem size={12} />
                        <SkeletonItem size={12} style={{ width: '75%' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                              <SkeletonItem
                                    size={20}
                                    style={{
                                          width: 70,
                                          borderRadius:
                                                tokens.borderRadiusMedium,
                                    }}
                              />
                              <SkeletonItem
                                    size={20}
                                    style={{
                                          width: 80,
                                          borderRadius:
                                                tokens.borderRadiusMedium,
                                    }}
                              />
                        </div>
                        <SkeletonItem size={28} />
                        <SkeletonItem
                              size={28}
                              style={{
                                    borderRadius: tokens.borderRadiusMedium,
                              }}
                        />
                  </Skeleton>
            </div>
      );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ searchTerm: string; platformFilter: string }> = ({
      searchTerm,
      platformFilter,
}) => {
      const styles = useStyles();
      return (
            <div className={styles.emptyState}>
                  <Avatar
                        size={56}
                        icon={<People16Regular />}
                        color="neutral"
                  />
                  <Text size={400} weight="semibold">
                        No jobs found
                  </Text>
                  <Text
                        size={200}
                        style={{
                              color: tokens.colorNeutralForeground3,
                              textAlign: 'center',
                              maxWidth: 280,
                        }}
                  >
                        {searchTerm
                              ? `No jobs match "${searchTerm}".`
                              : platformFilter !== 'All'
                                ? `No active jobs for ${platformFilter} right now.`
                                : 'No active jobs available at the moment. Check back soon.'}
                  </Text>
            </div>
      );
};

export default Marketplace;
