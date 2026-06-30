import React, { useState, useCallback, useRef } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Input,
  Textarea,
  Dropdown,
  Option,
  Tab,
  TabList,
  Badge,
  Spinner,
  Card,
  Text,
  Divider,
  Tooltip,
} from '@fluentui/react-components';
import type { SelectTabEvent, SelectTabData } from '@fluentui/react-components';
import {
  PlayRegular,
  DeleteRegular,
  CopyRegular,
  ArrowClockwiseRegular,
  DatabaseRegular,
  TableRegular,
  EyeRegular,
  CodeRegular,
  PlugConnectedRegular,
  PlugDisconnectedRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  ClockRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { supabase } from '@/server/supabase';

// ─── Utils ──────────────────────────────────────────────────────────────────

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type TargetKind = 'table' | 'view' | 'function';
type RunStatus = 'idle' | 'running' | 'success' | 'error';

interface ParamRow {
  id: string;
  key: string;
  value: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  kind: TargetKind;
  name: string;
  status: 'success' | 'error';
  durationMs: number;
  summary: string;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '0',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground3,
    fontFamily: tokens.fontFamilyMonospace,
  },

  // Sidebar
  sidebar: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sidebarTitle: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  connectionPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: tokens.borderRadiusCircular,
    fontSize: tokens.fontSizeBase200,
    fontFamily: tokens.fontFamilyBase,
    fontWeight: tokens.fontWeightMedium,
    marginLeft: 'auto',
  },
  connected: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  disconnected: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
  },

  sidebarBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  sectionLabel: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '8px 8px 4px',
  },
  targetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 8px',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  targetRowActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
  targetIconTable: { color: tokens.colorPaletteBlueForeground2, flexShrink: 0 },
  targetIconView: { color: tokens.colorPalettePurpleForeground2, flexShrink: 0 },
  targetIconFn: { color: tokens.colorPaletteMarigoldForeground2, flexShrink: 0 },

  customInputWrap: {
    padding: '8px',
  },

  // Main panel
  main: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mainHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mainHeaderTitle: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  mainHeaderActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
  },

  mainBody: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    overflow: 'hidden',
  },

  // Left: request builder
  builderPane: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: 'hidden',
  },
  builderScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  fieldGroup: {
    marginBottom: '18px',
  },
  fieldLabel: {
    display: 'block',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginBottom: '6px',
  },
  fieldHint: {
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginTop: '4px',
    display: 'block',
  },
  paramRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },

  // Right: output
  outputPane: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  outputTabs: {
    padding: '4px 16px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  outputScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 20px',
  },
  jsonBlock: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: tokens.colorNeutralForeground1,
    margin: 0,
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  logEntry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '9px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
  },
  logIconSuccess: { color: tokens.colorPaletteGreenForeground1, marginTop: '2px', flexShrink: 0 },
  logIconError: { color: tokens.colorPaletteRedForeground1, marginTop: '2px', flexShrink: 0 },
  logMeta: {
    display: 'flex',
    gap: '8px',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase100,
    marginTop: '2px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase300,
    gap: '8px',
    textAlign: 'center',
    padding: '0 40px',
  },
});

// ─── Known schema (edit to match your DB) ──────────────────────────────────

const KNOWN_TABLES = [
  'user_profiles',
  'wallets',
  'wallet_transactions',
  'jobs',
  'job_applications',
  'job_payments',
  'job_funding',
  'job_funding_ledger',
];

const KNOWN_VIEWS = ['wallet_balance_summary'];

const KNOWN_FUNCTIONS = [
  'release_payment',
  'verify_payment',
  'reserve_job_funding',
];

// ─── Component ──────────────────────────────────────────────────────────────

const SupabaseTestbench: React.FC = () => {
  const styles = useStyles();

  const [selectedKind, setSelectedKind] = useState<TargetKind>('table');
  const [selectedName, setSelectedName] = useState<string>('');
  const [customName, setCustomName] = useState('');

  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [limit, setLimit] = useState('20');
  const [params, setParams] = useState<ParamRow[]>([{ id: genId(), key: '', value: '' }]);

  const [status, setStatus] = useState<RunStatus>('idle');
  const [result, setResult] = useState<unknown>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [outputTab, setOutputTab] = useState<'result' | 'logs'>('result');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionState, setConnectionState] = useState<'connected' | 'checking' | 'disconnected'>('checking');

  const runStartRef = useRef<number>(0);

  // Connection check
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { error } = await supabase.from(KNOWN_TABLES[0]).select('*').limit(1);
        if (cancelled) return;
        setConnectionState(error ? 'disconnected' : 'connected');
      } catch {
        if (!cancelled) setConnectionState('disconnected');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeName = customName.trim() || selectedName;

  const selectTarget = (kind: TargetKind, name: string) => {
    setSelectedKind(kind);
    setSelectedName(name);
    setCustomName('');
    setResult(null);
    setErrorMessage(null);
    setStatus('idle');
  };

  const addParamRow = () => {
    setParams((p) => [...p, { id: genId(), key: '', value: '' }]);
  };

  const removeParamRow = (id: string) => {
    setParams((p) => p.filter((row) => row.id !== id));
  };

  const updateParamRow = (id: string, field: 'key' | 'value', val: string) => {
    setParams((p) => p.map((row) => (row.id === id ? { ...row, [field]: val } : row)));
  };

  const pushLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs((prev) => [
      {
        id: genId(),
        timestamp: new Date().toLocaleTimeString(),
        ...entry,
      },
      ...prev,
    ].slice(0, 100));
  };

  const runQuery = useCallback(async () => {
    if (!activeName) {
      setErrorMessage('Pick a table, view, or function first.');
      setStatus('error');
      return;
    }

    setStatus('running');
    setErrorMessage(null);
    setResult(null);
    runStartRef.current = performance.now();

    try {
      let data: unknown;
      let error: unknown = null;

      if (selectedKind === 'function') {
        const argObj: Record<string, unknown> = {};
        params.forEach((row) => {
          if (!row.key.trim()) return;
          let parsed: unknown = row.value;
          try {
            parsed = JSON.parse(row.value);
          } catch {
            // keep as raw string if not valid JSON
          }
          argObj[row.key.trim()] = parsed;
        });

        const res = await supabase.rpc(activeName, argObj);
        data = res.data;
        error = res.error;
      } else {
        let query = supabase.from(activeName).select('*');

        if (filterColumn.trim() && filterValue.trim()) {
          query = query.eq(filterColumn.trim(), filterValue.trim());
        }

        const parsedLimit = parseInt(limit, 10);
        if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
          query = query.limit(parsedLimit);
        }

        const res = await query;
        data = res.data;
        error = res.error;
      }

      const elapsed = Math.round(performance.now() - runStartRef.current);
      setDurationMs(elapsed);

      if (error) {
        const message = (error as { message?: string })?.message ?? 'Unknown error';
        setErrorMessage(message);
        setStatus('error');
        pushLog({
          kind: selectedKind,
          name: activeName,
          status: 'error',
          durationMs: elapsed,
          summary: message,
        });
        return;
      }

      setResult(data);
      setStatus('success');
      const rowCount = Array.isArray(data) ? data.length : data ? 1 : 0;
      pushLog({
        kind: selectedKind,
        name: activeName,
        status: 'success',
        durationMs: elapsed,
        summary: `${rowCount} row${rowCount === 1 ? '' : 's'} returned`,
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - runStartRef.current);
      setDurationMs(elapsed);
      const message = err instanceof Error ? err.message : 'Unexpected client error';
      setErrorMessage(message);
      setStatus('error');
      pushLog({
        kind: selectedKind,
        name: activeName,
        status: 'error',
        durationMs: elapsed,
        summary: message,
      });
    }
  }, [activeName, selectedKind, filterColumn, filterValue, limit, params]);

  const copyResult = () => {
    if (result === null) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const clearLogs = () => setLogs([]);

  const kindIcon = (kind: TargetKind) => {
    if (kind === 'table') return <TableRegular fontSize={16} className={styles.targetIconTable} />;
    if (kind === 'view') return <EyeRegular fontSize={16} className={styles.targetIconView} />;
    return <CodeRegular fontSize={16} className={styles.targetIconFn} />;
  };

  return (
    <div className={styles.root}>
      {/* ── Sidebar: schema browser ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <DatabaseRegular fontSize={20} color={tokens.colorBrandForeground1} />
          <span className={styles.sidebarTitle}>Supabase testbench</span>
          <Tooltip content={connectionState === 'connected' ? 'Client can reach the database' : 'No response from the database'} relationship="label">
            <span
              className={`${styles.connectionPill} ${
                connectionState === 'connected' ? styles.connected : styles.disconnected
              }`}
            >
              {connectionState === 'connected' ? (
                <PlugConnectedRegular fontSize={14} />
              ) : (
                <PlugDisconnectedRegular fontSize={14} />
              )}
              {connectionState === 'checking' ? 'Checking' : connectionState === 'connected' ? 'Connected' : 'Offline'}
            </span>
          </Tooltip>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.customInputWrap}>
            <Input
              placeholder="Type any table, view, or function name"
              value={customName}
              onChange={(_, d) => setCustomName(d.value)}
              size="small"
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.sectionLabel}>Tables</div>
          {KNOWN_TABLES.map((name) => (
            <div
              key={name}
              className={`${styles.targetRow} ${
                !customName && selectedKind === 'table' && selectedName === name ? styles.targetRowActive : ''
              }`}
              onClick={() => selectTarget('table', name)}
            >
              {kindIcon('table')}
              {name}
            </div>
          ))}

          <div className={styles.sectionLabel}>Views</div>
          {KNOWN_VIEWS.map((name) => (
            <div
              key={name}
              className={`${styles.targetRow} ${
                !customName && selectedKind === 'view' && selectedName === name ? styles.targetRowActive : ''
              }`}
              onClick={() => selectTarget('view', name)}
            >
              {kindIcon('view')}
              {name}
            </div>
          ))}

          <div className={styles.sectionLabel}>Functions</div>
          {KNOWN_FUNCTIONS.map((name) => (
            <div
              key={name}
              className={`${styles.targetRow} ${
                !customName && selectedKind === 'function' && selectedName === name ? styles.targetRowActive : ''
              }`}
              onClick={() => selectTarget('function', name)}
            >
              {kindIcon('function')}
              {name}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main panel ── */}
      <div className={styles.main}>
        <div className={styles.mainHeader}>
          {activeName ? kindIcon(selectedKind) : <ChevronRightRegular fontSize={16} color={tokens.colorNeutralForeground3} />}
          <span className={styles.mainHeaderTitle}>
            {activeName || 'No target selected'}
          </span>
          {activeName && (
            <Badge appearance="outline" size="small" shape="rounded">
              {selectedKind}
            </Badge>
          )}
          <div className={styles.mainHeaderActions}>
            <Button
              appearance="primary"
              icon={<PlayRegular />}
              onClick={runQuery}
              disabled={status === 'running' || !activeName}
            >
              {status === 'running' ? 'Running' : 'Run'}
            </Button>
          </div>
        </div>

        <div className={styles.mainBody}>
          {/* Left: request builder */}
          <div className={styles.builderPane}>
            <div className={styles.builderScroll}>
              {selectedKind === 'function' ? (
                <>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>Arguments</Text>
                    {params.map((row) => (
                      <div key={row.id} className={styles.paramRow}>
                        <Input
                          placeholder="param_name"
                          value={row.key}
                          onChange={(_, d) => updateParamRow(row.id, 'key', d.value)}
                          size="small"
                          style={{ flex: 1 }}
                        />
                        <Input
                          placeholder='value or JSON, e.g. "abc-123" or 42'
                          value={row.value}
                          onChange={(_, d) => updateParamRow(row.id, 'value', d.value)}
                          size="small"
                          style={{ flex: 2 }}
                        />
                        <Button
                          appearance="subtle"
                          icon={<DeleteRegular />}
                          size="small"
                          onClick={() => removeParamRow(row.id)}
                        />
                      </div>
                    ))}
                    <Button appearance="outline" size="small" onClick={addParamRow}>
                      Add argument
                    </Button>
                    <Text className={styles.fieldHint}>
                      Values try JSON.parse first, so numbers, booleans, and objects work as written. Plain text falls back to a string.
                    </Text>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>Filter (optional)</Text>
                    <div className={styles.paramRow}>
                      <Input
                        placeholder="column"
                        value={filterColumn}
                        onChange={(_, d) => setFilterColumn(d.value)}
                        size="small"
                        style={{ flex: 1 }}
                      />
                      <Text style={{ color: tokens.colorNeutralForeground3, fontFamily: tokens.fontFamilyMonospace }}>
                        =
                      </Text>
                      <Input
                        placeholder="value"
                        value={filterValue}
                        onChange={(_, d) => setFilterValue(d.value)}
                        size="small"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <Text className={styles.fieldHint}>Single equality filter against the selected table or view.</Text>
                  </div>

                  <div className={styles.fieldGroup}>
                    <Text className={styles.fieldLabel}>Row limit</Text>
                    <Input
                      value={limit}
                      onChange={(_, d) => setLimit(d.value.replace(/[^0-9]/g, ''))}
                      size="small"
                      style={{ width: '120px' }}
                    />
                  </div>
                </>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <div className={styles.fieldGroup}>
                <Text className={styles.fieldLabel}>Notes</Text>
                <Textarea
                  placeholder="Scratch space for what you're testing, expected output, edge cases to check…"
                  resize="vertical"
                  style={{ width: '100%', minHeight: '100px' }}
                />
              </div>
            </div>
          </div>

          {/* Right: output */}
          <div className={styles.outputPane}>
            <div className={styles.outputTabs}>
              <TabList
                selectedValue={outputTab}
                onTabSelect={(_: SelectTabEvent, data: SelectTabData) => setOutputTab(data.value as 'result' | 'logs')}
                size="small"
              >
                <Tab value="result">Result</Tab>
                <Tab value="logs">
                  Run log{logs.length > 0 ? ` (${logs.length})` : ''}
                </Tab>
              </TabList>
            </div>

            <div className={styles.outputScroll}>
              {outputTab === 'result' ? (
                status === 'idle' && result === null ? (
                  <div className={styles.emptyState}>
                    <DatabaseRegular fontSize={28} />
                    <Text>Pick a table, view, or function on the left, then press Run.</Text>
                  </div>
                ) : status === 'running' ? (
                  <div className={styles.emptyState}>
                    <Spinner size="small" label="Running query" labelPosition="below" />
                  </div>
                ) : status === 'error' ? (
                  <Card style={{ borderLeft: `3px solid ${tokens.colorPaletteRedBorder2}`, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <DismissCircleRegular fontSize={18} color={tokens.colorPaletteRedForeground1} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <pre className={styles.jsonBlock}>{errorMessage}</pre>
                    </div>
                  </Card>
                ) : (
                  <pre className={styles.jsonBlock}>{JSON.stringify(result, null, 2)}</pre>
                )
              ) : (
                <>
                  {logs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <ClockRegular fontSize={28} />
                      <Text>Runs you trigger will show up here.</Text>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={styles.logEntry}>
                        {log.status === 'success' ? (
                          <CheckmarkCircleRegular fontSize={16} className={styles.logIconSuccess} />
                        ) : (
                          <DismissCircleRegular fontSize={16} className={styles.logIconError} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div>
                            <strong>{log.name}</strong> ({log.kind})
                          </div>
                          <div>{log.summary}</div>
                          <div className={styles.logMeta}>
                            <span>{log.timestamp}</span>
                            <span>{log.durationMs}ms</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            <div className={styles.statusBar}>
              {status === 'success' && (
                <>
                  <CheckmarkCircleRegular fontSize={14} color={tokens.colorPaletteGreenForeground1} />
                  <span>Success</span>
                  <span>·</span>
                  <span>{durationMs}ms</span>
                  <span>·</span>
                  <span>{Array.isArray(result) ? `${result.length} rows` : result ? '1 row' : '0 rows'}</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <DismissCircleRegular fontSize={14} color={tokens.colorPaletteRedForeground1} />
                  <span>Failed</span>
                  {durationMs !== null && (
                    <>
                      <span>·</span>
                      <span>{durationMs}ms</span>
                    </>
                  )}
                </>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                <Tooltip content="Copy result as JSON" relationship="label">
                  <Button appearance="subtle" icon={<CopyRegular />} size="small" onClick={copyResult} disabled={!result} />
                </Tooltip>
                <Tooltip content="Clear run log" relationship="label">
                  <Button appearance="subtle" icon={<ArrowClockwiseRegular />} size="small" onClick={clearLogs} disabled={logs.length === 0} />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTestbench;