import React, { useState } from 'react';
import { StaticLayout, useProseStyles } from './StaticLayout';
import {
      makeStyles,
      tokens,
      Button,
      Input,
      Textarea,
      Select,
      Field,
      MessageBar,
      MessageBarBody,
      Spinner,
} from '@fluentui/react-components';
import {
      MailRegular,
      PersonRegular,
      ClipboardTaskRegular,
      CheckmarkCircleRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
      layout: {
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '48px',
            alignItems: 'flex-start',
            '@media (max-width: 760px)': {
                  gridTemplateColumns: '1fr',
            },
      },
      form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
      },
      row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            '@media (max-width: 500px)': {
                  gridTemplateColumns: '1fr',
            },
      },
      sidebar: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
      },
      infoCard: {
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '12px',
            padding: '20px',
      },
      infoTitle: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 4px',
      },
      infoVal: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            margin: 0,
            wordBreak: 'break-word',
      },
      infoIcon: {
            color: tokens.colorBrandForeground1,
            marginBottom: '8px',
      },
      successInner: {
            textAlign: 'center',
            padding: '40px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
      },
      successIcon: {
            color: tokens.colorPaletteGreenForeground1,
      },
      successTitle: {
            fontSize: tokens.fontSizeBase600,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: 0,
      },
      successSub: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            margin: 0,
            maxWidth: '360px',
      },
});

const SUBJECTS = [
      'General enquiry',
      'Job dispute',
      'Withdrawal problem',
      'Account issue',
      'Subscription / billing',
      'Technical issue',
      'Report a user',
      'Partnership or press',
      'Other',
];

interface FormState {
      name: string;
      email: string;
      subject: string;
      message: string;
}

const ContactUs: React.FC = () => {
      const styles = useStyles();
      const p = useProseStyles();

      const [form, setForm] = useState<FormState>({
            name: '',
            email: '',
            subject: '',
            message: '',
      });
      const [loading, setLoading] = useState(false);
      const [sent, setSent] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const set = (key: keyof FormState) => (val: string) =>
            setForm((f) => ({ ...f, [key]: val }));

      const handleSubmit = async () => {
            if (!form.name || !form.email || !form.subject || !form.message) {
                  setError('Please fill in all fields.');
                  return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                  setError('Please enter a valid email address.');
                  return;
            }
            setError(null);
            setLoading(true);
            try {
                  // TODO: wire to Supabase edge function or email service
                  await new Promise((r) => setTimeout(r, 1200));
                  setSent(true);
            } catch {
                  setError('Something went wrong. Please try again or email us directly.');
            } finally {
                  setLoading(false);
            }
      };

      if (sent) {
            return (
                  <StaticLayout eyebrow="Contact" title="Get in touch">
                        <div className={styles.successInner}>
                              <CheckmarkCircleRegular
                                    fontSize={56}
                                    className={styles.successIcon}
                              />
                              <h2 className={styles.successTitle}>
                                    Message received!
                              </h2>
                              <p className={styles.successSub}>
                                    We typically reply within 24 hours on
                                    business days. Keep an eye on{' '}
                                    <strong>{form.email}</strong>.
                              </p>
                              <Button
                                    appearance="outline"
                                    onClick={() => {
                                          setForm({
                                                name: '',
                                                email: '',
                                                subject: '',
                                                message: '',
                                          });
                                          setSent(false);
                                    }}
                              >
                                    Send another message
                              </Button>
                        </div>
                  </StaticLayout>
            );
      }

      return (
            <StaticLayout
                  eyebrow="Contact"
                  title="Get in touch"
                  meta="We read every message and aim to reply within 24 hours on business days."
            >
                  <div className={styles.layout}>
                        {/* Form */}
                        <div className={styles.form}>
                              {error && (
                                    <MessageBar intent="error">
                                          <MessageBarBody>{error}</MessageBarBody>
                                    </MessageBar>
                              )}

                              <div className={styles.row}>
                                    <Field label="Your name" required>
                                          <Input
                                                contentBefore={<PersonRegular />}
                                                placeholder="Ada Okonkwo"
                                                value={form.name}
                                                onChange={(_, d) =>
                                                      set('name')(d.value)
                                                }
                                          />
                                    </Field>
                                    <Field label="Email address" required>
                                          <Input
                                                contentBefore={<MailRegular />}
                                                placeholder="you@example.com"
                                                type="email"
                                                value={form.email}
                                                onChange={(_, d) =>
                                                      set('email')(d.value)
                                                }
                                          />
                                    </Field>
                              </div>

                              <Field label="Subject" required>
                                    <Select
                                          value={form.subject}
                                          onChange={(_, d) =>
                                                set('subject')(d.value)
                                          }
                                    >
                                          <option value="" disabled>
                                                Select a topic…
                                          </option>
                                          {SUBJECTS.map((s) => (
                                                <option key={s} value={s}>
                                                      {s}
                                                </option>
                                          ))}
                                    </Select>
                              </Field>

                              <Field label="Message" required>
                                    <Textarea
                                          placeholder="Describe your issue or question in as much detail as possible. Include your username, job ID, or transaction ID if relevant."
                                          value={form.message}
                                          onChange={(_, d) =>
                                                set('message')(d.value)
                                          }
                                          resize="vertical"
                                          rows={7}
                                    />
                              </Field>

                              <Button
                                    appearance="primary"
                                    size="large"
                                    icon={
                                          loading ? (
                                                <Spinner size="tiny" />
                                          ) : (
                                                <ClipboardTaskRegular />
                                          )
                                    }
                                    disabled={loading}
                                    onClick={handleSubmit}
                              >
                                    {loading ? 'Sending…' : 'Send message'}
                              </Button>
                        </div>

                        {/* Sidebar */}
                        <div className={styles.sidebar}>
                              <div className={styles.infoCard}>
                                    <div className={styles.infoIcon}>
                                          <MailRegular fontSize={22} />
                                    </div>
                                    <p className={styles.infoTitle}>
                                          General support
                                    </p>
                                    <p className={styles.infoVal}>
                                          support@workbit.app
                                    </p>
                              </div>
                              <div className={styles.infoCard}>
                                    <div className={styles.infoIcon}>
                                          <MailRegular fontSize={22} />
                                    </div>
                                    <p className={styles.infoTitle}>
                                          Legal &amp; privacy
                                    </p>
                                    <p className={styles.infoVal}>
                                          legal@workbit.app
                                    </p>
                              </div>
                              <div className={styles.infoCard}>
                                    <div className={styles.infoIcon}>
                                          <MailRegular fontSize={22} />
                                    </div>
                                    <p className={styles.infoTitle}>
                                          Partnerships &amp; press
                                    </p>
                                    <p className={styles.infoVal}>
                                          hello@workbit.app
                                    </p>
                              </div>
                              <div className={styles.infoCard}>
                                    <p className={styles.infoTitle}>
                                          Response time
                                    </p>
                                    <p className={styles.infoVal}>
                                          We aim to reply within 24 hours,
                                          Monday – Friday.
                                    </p>
                              </div>
                              <p className={p.p} style={{ fontSize: tokens.fontSizeBase200 }}>
                                    For billing disputes or withdrawal issues,
                                    please include your registered email and
                                    any relevant transaction ID or job ID so we
                                    can investigate faster.
                              </p>
                        </div>
                  </div>
            </StaticLayout>
      );
};

export default ContactUs;