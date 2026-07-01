import React, { useState } from 'react';
import { StaticLayout, useProseStyles } from './StaticLayout';
import {
      makeStyles,
      tokens,
      Button,
      Input,
      Accordion,
      AccordionItem,
      AccordionHeader,
      AccordionPanel,
} from '@fluentui/react-components';
import {
      SearchRegular,
      WalletRegular,
      BriefcaseRegular,
      PersonRegular,
      ShieldCheckmarkRegular,
      QuestionCircleRegular,
      ChevronRightRegular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { SUBSCRIPTION_FEE, REFERRAL_BONUS } from '@/constants';

const useStyles = makeStyles({
      searchBar: {
            display: 'flex',
            gap: '8px',
            marginBottom: '48px',
      },
      searchInput: {
            flex: 1,
      },
      catGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '56px',
            '@media (max-width: 600px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
            },
      },
      catCard: {
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            ':hover': {
                  backgroundColor: tokens.colorNeutralBackground2,
                  borderColor: tokens.colorBrandStroke1,
            },
            transition: 'all 0.15s',
      },
      catIcon: {
            color: tokens.colorBrandForeground1,
      },
      catLabel: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
      },
      catCount: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
      },
      sectionTitle: {
            fontSize: tokens.fontSizeBase600,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            margin: '0 0 20px',
      },
      faqBlock: {
            marginBottom: '48px',
      },
      faqBlockHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      faqIcon: {
            color: tokens.colorBrandForeground1,
      },
      ctaBanner: {
            backgroundColor: tokens.colorNeutralBackground2,
            border: `1px solid ${tokens.colorNeutralStroke2}`,
            borderRadius: '16px',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '56px',
      },
      ctaText: {
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground1,
            fontWeight: tokens.fontWeightMedium,
            margin: 0,
      },
      ctaSub: {
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            margin: '4px 0 0',
      },
});

const faqs = [
      {
            id: 'account',
            icon: <PersonRegular fontSize={22} />,
            label: 'Account & Profile',
            items: [
                  {
                        q: 'How do I create a Workbit account?',
                        a: `Visit workbit.app, click "Get Started," and fill in your name, email, phone number, and a secure password. You'll receive a verification email — click the link to activate your account. Once verified, you can set up your profile and start browsing jobs.`,
                  },
                  {
                        q: 'Why do I need to verify my email?',
                        a: 'Email verification confirms you own the address, protects your account against unauthorized access, and is required before you can submit proof of work or receive payouts.',
                  },
                  {
                        q: 'Can I have more than one Workbit account?',
                        a: 'No. One person, one account. Duplicate accounts are a violation of our Terms of Service and may result in all related accounts being suspended and any pending balances forfeited.',
                  },
                  {
                        q: 'How do I update my profile information?',
                        a: 'Go to your profile page (the avatar icon in the navigation) and edit your name, phone number, or state. Some fields — like your email — require you to go through a verification step to change.',
                  },
                  {
                        q: 'What if I forget my password?',
                        a: 'On the login page, click "Forgot password." We\'ll send a password-reset link to your registered email. If you don\'t receive it within a few minutes, check your spam folder or contact support.',
                  },
            ],
      },
      {
            id: 'workers',
            icon: <BriefcaseRegular fontSize={22} />,
            label: 'Finding & Completing Jobs',
            items: [
                  {
                        q: 'What types of tasks are available on Workbit?',
                        a: 'Currently, Workbit focuses on social media engagement tasks: following accounts, liking posts, leaving comments, subscribing to channels, and sharing content across platforms including Instagram, TikTok, X (Twitter), Facebook, and YouTube.',
                  },
                  {
                        q: 'Do I need a subscription to browse jobs?',
                        a: `You can browse the Marketplace without a subscription. However, to submit proof of work and receive payment, an active annual subscription (₦${SUBSCRIPTION_FEE.toLocaleString()}/year) is required. This fee helps us keep the platform secure and high-quality.`,
                  },
                  {
                        q: 'How do I submit proof of work?',
                        a: 'Open the job from the Marketplace, complete the task on the relevant social media platform, then return to the job page and submit your proof — usually a screenshot or link showing the completed action. Proof goes to the Job Owner for review.',
                  },
                  {
                        q: 'What counts as valid proof?',
                        a: 'Valid proof clearly shows your account and the completed action at the same time — for example, a screenshot of the followed page while you\'re logged in, or a link to your comment. Edited screenshots, screenshots from someone else\'s account, or screenshots taken before completing the action will be rejected.',
                  },
                  {
                        q: 'How long does a Job Owner have to review my submission?',
                        a: 'Job Owners are expected to review submissions promptly. If a submission has not been reviewed within the review window shown on the job detail page, you can open a dispute and our team will step in.',
                  },
                  {
                        q: 'Can a Job Owner reject my proof unfairly?',
                        a: 'If you believe a rejection was unfair, open a dispute from the job detail page. Our team will review both sides — your submitted proof and the Job Owner\'s reason — and make a binding decision. Funds remain in escrow until the dispute is resolved.',
                  },
            ],
      },
      {
            id: 'wallet',
            icon: <WalletRegular fontSize={22} />,
            label: 'Wallet & Payments',
            items: [
                  {
                        q: 'What is the Workbit escrow wallet?',
                        a: 'Your Workbit wallet is a virtual account that holds funds in escrow. Job Owners deposit money into their wallet to fund jobs; Workers earn money into their wallet when submissions are approved. The wallet is backed by a double-entry ledger, so every naira is always accounted for.',
                  },
                  {
                        q: 'How do I deposit money as a Job Owner?',
                        a: 'Go to your Wallet page and click "Deposit." Choose the amount and complete the payment through our payment gateway. Once confirmed, the funds appear in your wallet and can be used to fund jobs.',
                  },
                  {
                        q: 'When does money appear in my wallet after a job is approved?',
                        a: 'Immediately. When a Job Owner clicks "Approve," the reserved amount is released and credited to your wallet in the same transaction. There\'s no delay.',
                  },
                  {
                        q: 'How do I withdraw my earnings?',
                        a: 'Go to your Wallet page and click "Withdraw." Enter the amount and your linked bank account details. Withdrawals are processed to Nigerian bank accounts. Depending on your bank, funds typically arrive within minutes to a few hours.',
                  },
                  {
                        q: 'Are there withdrawal fees?',
                        a: 'Workbit may charge a small processing fee per withdrawal. The exact fee is shown before you confirm. There are no hidden charges — what you see on the confirmation screen is what will be deducted.',
                  },
                  {
                        q: 'What happens to my wallet if I close my account?',
                        a: 'Any available wallet balance can be withdrawn before or after closure, subject to identity verification. Balances tied to open disputes or investigations are held until those are resolved.',
                  },
            ],
      },
      {
            id: 'jobs',
            icon: <ShieldCheckmarkRegular fontSize={22} />,
            label: 'Posting Jobs (Job Owners)',
            items: [
                  {
                        q: 'How do I post a job?',
                        a: 'Go to "Post a Job" from the navigation menu. Select the platform, describe the task, set the number of workers you need and the reward per worker, then fund the job from your wallet. Once funded, the job goes live on the Marketplace.',
                  },
                  {
                        q: 'Can I edit a job after it\'s posted?',
                        a: 'Some fields (like the task description) can be edited before any applications are received. Once workers have applied, the job is locked to protect their expectations. You can close the job early if needed.',
                  },
                  {
                        q: 'What if a worker submits fake proof?',
                        a: 'Reject the submission and provide a clear reason. If you suspect systematic fraud, report the account to our support team. Workbit investigates reported accounts and bans those found submitting fraudulent work.',
                  },
                  {
                        q: 'Can I get a refund on unfilled slots?',
                        a: 'Yes. If a job closes without all worker slots being filled, the reserved funds for unfilled slots are automatically returned to your wallet.',
                  },
            ],
      },
      {
            id: 'referrals',
            icon: <QuestionCircleRegular fontSize={22} />,
            label: 'Referrals & Other Questions',
            items: [
                  {
                        q: 'How does the referral programme work?',
                        a: `Share your unique referral link with someone. When they sign up using your link and complete their first paid job, you receive a ₦${REFERRAL_BONUS.toLocaleString()} bonus credited to your wallet. There's no limit to how many people you can refer.`,
                  },
                  {
                        q: 'Why is my referral bonus showing as "pending"?',
                        a: 'The bonus is pending until the person you referred completes their first approved job. This prevents referral fraud by ensuring only genuine, active users generate bonuses.',
                  },
                  {
                        q: 'Is Workbit available outside Nigeria?',
                        a: 'Workbit is currently built specifically for the Nigerian market. While nothing technically prevents international sign-ups, payouts are processed to Nigerian bank accounts only, and tasks are primarily Nigeria-relevant.',
                  },
                  {
                        q: 'How do I report a bug or technical problem?',
                        a: 'Use the Contact page and select "Technical Issue" as the subject. Describe what you were doing, what happened, and what you expected to happen. Screenshots help a lot. We aim to respond within 24 hours.',
                  },
            ],
      },
];

const HelpCenter: React.FC = () => {
      const styles = useStyles();
      const p = useProseStyles();
      const [query, setQuery] = useState('');

      const filtered = query.trim().length < 2
            ? faqs
            : faqs.map((cat) => ({
                    ...cat,
                    items: cat.items.filter(
                          (item) =>
                                item.q.toLowerCase().includes(query.toLowerCase()) ||
                                item.a.toLowerCase().includes(query.toLowerCase()),
                    ),
              })).filter((cat) => cat.items.length > 0);

      return (
            <StaticLayout
                  eyebrow="Help Center"
                  title="How can we help?"
                  meta="Answers to the most common questions about Workbit."
            >
                  {/* Search */}
                  <div className={styles.searchBar}>
                        <Input
                              className={styles.searchInput}
                              contentBefore={<SearchRegular />}
                              placeholder="Search help articles…"
                              value={query}
                              onChange={(_, d) => setQuery(d.value)}
                              size="large"
                        />
                  </div>

                  {/* Category shortcuts — only shown when not filtering */}
                  {query.trim().length < 2 && (
                        <div className={styles.catGrid}>
                              {faqs.map((cat) => (
                                    <a
                                          key={cat.id}
                                          href={`#${cat.id}`}
                                          className={styles.catCard}
                                    >
                                          <span className={styles.catIcon}>
                                                {cat.icon}
                                          </span>
                                          <span className={styles.catLabel}>
                                                {cat.label}
                                          </span>
                                          <span className={styles.catCount}>
                                                {cat.items.length} articles
                                          </span>
                                    </a>
                              ))}
                        </div>
                  )}

                  {/* FAQ accordion blocks */}
                  {filtered.length === 0 ? (
                        <p className={p.p} style={{ textAlign: 'center', paddingTop: '24px' }}>
                              No results for "{query}." Try different keywords or{' '}
                              <Link to="/contact">contact support</Link>.
                        </p>
                  ) : (
                        filtered.map((cat) => (
                              <div
                                    key={cat.id}
                                    id={cat.id}
                                    className={styles.faqBlock}
                              >
                                    <div className={styles.faqBlockHeader}>
                                          <span className={styles.faqIcon}>
                                                {cat.icon}
                                          </span>
                                          <h2 className={styles.sectionTitle}>
                                                {cat.label}
                                          </h2>
                                    </div>
                                    <Accordion collapsible multiple>
                                          {cat.items.map((item, i) => (
                                                <AccordionItem
                                                      key={i}
                                                      value={`${cat.id}-${i}`}
                                                >
                                                      <AccordionHeader>
                                                            {item.q}
                                                      </AccordionHeader>
                                                      <AccordionPanel>
                                                            <p className={p.p}>
                                                                  {item.a}
                                                            </p>
                                                      </AccordionPanel>
                                                </AccordionItem>
                                          ))}
                                    </Accordion>
                              </div>
                        ))
                  )}

                  {/* Still need help CTA */}
                  <div className={styles.ctaBanner}>
                        <div>
                              <p className={styles.ctaText}>
                                    Still can't find an answer?
                              </p>
                              <p className={styles.ctaSub}>
                                    Our support team typically replies within
                                    24 hours.
                              </p>
                        </div>
                        <Button
                              as={Link as never}
                              href="/contact"
                              appearance="primary"
                              icon={<ChevronRightRegular />}
                              iconPosition="after"
                        >
                              Contact support
                        </Button>
                  </div>
            </StaticLayout>
      );
};

export default HelpCenter;