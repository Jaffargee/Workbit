import React, { useEffect, useState, useCallback } from 'react';
import {
      tokens,
      Text,
      Button,
      Spinner,
      Input,
      Dropdown,
      Option,
      CounterBadge,
      MessageBar,
      MessageBarBody,
} from '@fluentui/react-components';
import {
      Add16Regular,
      SearchRegular,
      ArrowSyncRegular,
      BriefcaseRegular,
} from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';
import JobCard from '@/components/Jobs/JobCard';
import { Job, JobStatus } from '@/types/types';
import { usePageStyles } from './styles'
import { STATUS_META, ALL_STATUSES } from './constants'
import EmptyState from './components/EmptyState'

const Index: React.FC = () => {
      const styles = usePageStyles();
      const navigate = useNavigate();
      const { profile } = useAuth();

      const [jobs, setJobs] = useState<Job[]>([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');

      const fetchJobs = useCallback(async () => {
            if (!profile?.user_id) return;
            setLoading(true);
            setError(null);
            try {
                  const { data, error } = await supabase
                        .from('jobs')
                        .select('*, platforms (*)')
                        .eq('user_id', profile.user_id)
                        .order('created_at', { ascending: false });

                  if (error) throw error;
                  setJobs((data as Job[]) ?? []);
            } catch (err: any) {
                  setError(err.message ?? 'Failed to load jobs.');
            } finally {
                  setLoading(false);
            }
      }, [profile?.user_id]);

      useEffect(() => { fetchJobs(); }, [fetchJobs]);

      // Derived stats
      const stats = {
            total:     jobs.length,
            active:    jobs.filter(j => j.status === 'ACTIVE').length,
            completed: jobs.filter(j => j.status === 'COMPLETED').length,
            totalSpend: jobs.reduce((acc, j) => acc + j.payout_amount * j.filled_slots, 0),
      };

      const filteredJobs = jobs.filter(job => {
            const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase())
                  || job.platforms?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
      });

      const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'ALL';

      return (
            <div className={styles.root}>
                  <div className={styles.inner}>

                        {/* Page Header */}
                        <div className={styles.pageHeader}>
                              <div className={styles.pageTitle}>
                                    <BriefcaseRegular className={styles.pageTitleIcon} />
                                    <Text size={700} weight="bold">My Jobs</Text>
                                    {!loading && (
                                          <CounterBadge
                                                count={jobs.length}
                                                appearance="filled"
                                                color="brand"
                                                size="medium"
                                                style={{ marginLeft: 4 }}
                                          />
                                    )}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                          appearance="subtle"
                                          icon={<ArrowSyncRegular />}
                                          onClick={fetchJobs}
                                          disabled={loading}
                                    >
                                          Refresh
                                    </Button>
                                    <Button
                                          appearance="primary"
                                          icon={<Add16Regular />}
                                          onClick={() => navigate('/jobs/post')}
                                    >
                                          Post a Job
                                    </Button>
                              </div>
                        </div>

                        {/* Error */}
                        {error && (
                              <MessageBar intent="error">
                                    <MessageBarBody>{error}</MessageBarBody>
                              </MessageBar>
                        )}

                        {/* Stats Strip */}
                        {!loading && jobs.length > 0 && (
                              <div className={styles.statsStrip}>
                                    <div className={styles.statCard}>
                                          <Text className={styles.statValue}>{stats.total}</Text>
                                          <Text className={styles.statLabel}>Total Jobs</Text>
                                    </div>
                                    <div className={styles.statCard}>
                                          <Text className={styles.statValue} style={{ color: tokens.colorPaletteGreenForeground1 }}>
                                                {stats.active}
                                          </Text>
                                          <Text className={styles.statLabel}>Active Now</Text>
                                    </div>
                                    <div className={styles.statCard}>
                                          <Text className={styles.statValue}>{stats.completed}</Text>
                                          <Text className={styles.statLabel}>Completed</Text>
                                    </div>
                                    <div className={styles.statCard}>
                                          <Text className={styles.statValue} style={{ color: tokens.colorBrandForeground1 }}>
                                                ₦{stats.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                          </Text>
                                          <Text className={styles.statLabel}>Total Paid Out</Text>
                                    </div>
                              </div>
                        )}

                        {/* Toolbar */}
                        <div className={styles.toolbar}>
                              <Input
                                    className={styles.searchInput}
                                    placeholder="Search jobs or platforms…"
                                    contentBefore={<SearchRegular />}
                                    value={searchTerm}
                                    onChange={(_, d) => setSearchTerm(d.value)}
                              />
                              <Dropdown
                                    placeholder="All statuses"
                                    value={statusFilter === 'ALL' ? 'All statuses' : STATUS_META[statusFilter]?.label ?? statusFilter}
                                    onOptionSelect={(_, d) => setStatusFilter(d.optionValue as JobStatus | 'ALL')}
                                    style={{ minWidth: 160 }}
                              >
                                    {ALL_STATUSES.map(s => (
                                          <Option key={s} value={s}>
                                                {s === 'ALL' ? 'All statuses' : STATUS_META[s as JobStatus]?.label ?? s}
                                          </Option>
                                    ))}
                              </Dropdown>
                        </div>

                        {/* Content */}
                        {loading ? (
                              <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                                    <Spinner size="large" label="Loading your jobs…" />
                              </div>
                        ) : filteredJobs.length === 0 ? (
                              <EmptyState filtered={isFiltered} onPost={() => navigate('/jobs/post')} />
                        ) : (
                              <div className={styles.grid}>
                                    {filteredJobs.map(job => (
                                          <JobCard key={job.id} job={job} onClick={() => {}} owner />
                                    ))}
                              </div>
                        )}

                  </div>
            </div>
      );
};

export default Index;