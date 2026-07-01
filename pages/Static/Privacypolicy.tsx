import React from 'react';
import { StaticLayout, useProseStyles } from './StaticLayout';

const PrivacyPolicy: React.FC = () => {
      const p = useProseStyles();

      return (
            <StaticLayout
                  eyebrow="Legal"
                  title="Privacy Policy"
                  meta="Last updated: June 30, 2026"
            >
                  <div className={p.callout}>
                        This policy explains what personal data Workbit
                        collects, why we collect it, and the choices you have.
                        It applies to all Workbit users — Workers and Job
                        Owners alike.
                  </div>

                  <section className={p.section}>
                        <h2 className={p.h2}>1. Information we collect</h2>
                        <h3 className={p.h3}>Information you provide</h3>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    Account details: name, email, phone
                                    number, password (stored hashed), and
                                    profile photo.
                              </li>
                              <li className={p.li}>
                                    Identity &amp; payout information needed
                                    to verify withdrawals, such as bank
                                    account details.
                              </li>
                              <li className={p.li}>
                                    Job content: task descriptions, budgets,
                                    and proof-of-work submissions (links,
                                    screenshots).
                              </li>
                              <li className={p.li}>
                                    Anything you send us directly, like
                                    support messages or dispute evidence.
                              </li>
                        </ul>
                        <h3 className={p.h3}>Information collected automatically</h3>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    Device and usage data (browser type,
                                    approximate location from IP, pages
                                    visited) to keep the platform secure and
                                    improve it.
                              </li>
                              <li className={p.li}>
                                    Transaction records — deposits,
                                    reservations, releases, and withdrawals —
                                    stored in our escrow ledger.
                              </li>
                        </ul>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>2. How we use your information</h2>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    To operate the marketplace: matching
                                    Workers to jobs, processing escrow,
                                    releasing payments, and resolving
                                    disputes.
                              </li>
                              <li className={p.li}>
                                    To verify your identity before
                                    withdrawals, in line with anti-fraud and
                                    financial-services obligations.
                              </li>
                              <li className={p.li}>
                                    To detect fraud, fake accounts, and abuse
                                    of the referral or escrow systems.
                              </li>
                              <li className={p.li}>
                                    To send you transactional notifications
                                    (job approvals, payouts, security
                                    alerts) and, where you've opted in,
                                    product updates.
                              </li>
                              <li className={p.li}>
                                    To comply with legal obligations,
                                    including tax and financial record-keeping
                                    requirements.
                              </li>
                        </ul>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>3. Who we share data with</h2>
                        <p className={p.p}>
                              We don't sell your personal data. We share it
                              only with:
                        </p>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Payment processors
                                    </strong>{' '}
                                    (such as our payment gateway partner) to
                                    process deposits and withdrawals.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Infrastructure providers
                                    </strong>{' '}
                                    (such as our database and hosting
                                    providers) who process data on our
                                    behalf, under contract.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          The other party to a job,
                                    </strong>{' '}
                                    limited to what's needed to complete or
                                    verify that job (e.g. a Job Owner sees the
                                    proof a Worker submits).
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Law enforcement or regulators
                                    </strong>{' '}
                                    where legally required.
                              </li>
                        </ul>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>4. Data retention</h2>
                        <p className={p.p}>
                              We keep transaction and ledger records for as
                              long as required by Nigerian financial
                              record-keeping rules, even after an account is
                              closed. Other account data is retained while
                              your account is active and deleted or
                              anonymized within a reasonable period after
                              closure, unless we need it for fraud
                              prevention or legal compliance.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>5. Your rights</h2>
                        <p className={p.p}>
                              You can access, correct, or request deletion of
                              your personal data, and you can withdraw
                              marketing consent at any time, by emailing{' '}
                              <strong className={p.strong}>
                                    privacy@workbit.app
                              </strong>
                              . We'll respond within a reasonable timeframe.
                              Note that we may need to retain certain
                              transaction records even after a deletion
                              request, as described above.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>6. Security</h2>
                        <p className={p.p}>
                              We use industry-standard safeguards — encrypted
                              connections, hashed passwords, and row-level
                              access controls on our database — to protect
                              your data. No system is perfectly secure, and we
                              encourage you to use a strong, unique password
                              and report any suspicious account activity
                              immediately.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>7. Children's privacy</h2>
                        <p className={p.p}>
                              Workbit is not intended for anyone under 18. We
                              don't knowingly collect data from minors; if we
                              learn an account belongs to someone under 18,
                              we'll close it.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>8. Changes to this policy</h2>
                        <p className={p.p}>
                              We'll post updates here and, for material
                              changes, notify you in-app or by email before
                              they take effect.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>9. Contact</h2>
                        <p className={p.p}>
                              Questions about this policy?{' '}
                              <strong className={p.strong}>
                                    privacy@workbit.app
                              </strong>
                        </p>
                  </section>
            </StaticLayout>
      );
};

export default PrivacyPolicy;