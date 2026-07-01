import React from 'react';
import { StaticLayout, useProseStyles } from './StaticLayout';
import { SUBSCRIPTION_FEE, REFERRAL_BONUS } from '@/constants';

const TermsOfService: React.FC = () => {
      const p = useProseStyles();

      return (
            <StaticLayout
                  eyebrow="Legal"
                  title="Terms of Service"
                  meta="Last updated: June 30, 2026 · Effective for all Workbit accounts"
            >
                  <div className={p.callout}>
                        These Terms govern your use of Workbit, a micro-task
                        marketplace connecting <strong className={p.strong}>Job
                        Owners</strong> (businesses and individuals who post
                        social media engagement tasks) with{' '}
                        <strong className={p.strong}>Workers</strong> (users
                        who complete tasks for payment). By creating an
                        account, you agree to these Terms.
                  </div>

                  <section className={p.section}>
                        <h2 className={p.h2}>1. Who can use Workbit</h2>
                        <p className={p.p}>
                              You must be at least 18 years old and able to
                              form a binding contract under Nigerian law to
                              use Workbit. You're responsible for the accuracy
                              of the information you provide during
                              registration, including your name, phone
                              number, and any payout/bank details, and for
                              keeping your login credentials secure.
                        </p>
                        <p className={p.p}>
                              We may suspend or terminate accounts that
                              provide false information, are duplicated by
                              the same person to abuse referral bonuses or job
                              limits, or are used on behalf of someone who
                              hasn't agreed to these Terms.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>2. The Worker subscription</h2>
                        <p className={p.p}>
                              Posting proof of work and withdrawing earnings
                              requires an active annual subscription
                              (currently ₦
                              {SUBSCRIPTION_FEE.toLocaleString()}/year). The
                              subscription fee is non-refundable once paid,
                              except where required by law or expressly
                              stated otherwise in our Refund Policy.
                              Subscription pricing may change for future
                              billing cycles; we'll notify you before any
                              renewal at a new price.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>
                              3. Escrow, payments &amp; the wallet
                        </h2>
                        <p className={p.p}>
                              Every job must be fully funded by the Job Owner
                              before it becomes visible in the Marketplace.
                              Funds are held in Workbit's escrow ledger and
                              are reserved against that specific job — they
                              are not part of Workbit's general operating
                              funds and are not available for any other
                              purpose while reserved.
                        </p>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Release of funds.
                                    </strong>{' '}
                                    When a Job Owner approves a Worker's
                                    submitted proof, the reserved amount is
                                    credited to the Worker's Workbit wallet.
                                    This is recorded as an immutable,
                                    append-only ledger entry.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Withdrawals.
                                    </strong>{' '}
                                    Wallet balances can be withdrawn to a
                                    linked Nigerian bank account, subject to
                                    identity verification and any applicable
                                    processing fees, which are disclosed
                                    before you confirm a withdrawal.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Referral bonuses.
                                    </strong>{' '}
                                    Referral rewards (currently ₦
                                    {REFERRAL_BONUS.toLocaleString()}) are
                                    held as <em>pending</em> until the
                                    referred user completes their first paid
                                    job, and are forfeited if the referred
                                    account is found to violate these Terms.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          No interest.
                                    </strong>{' '}
                                    Workbit does not pay interest on escrowed
                                    or wallet balances.
                              </li>
                        </ul>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>4. Posting and completing jobs</h2>
                        <p className={p.p}>
                              Job Owners are solely responsible for the
                              legality and accuracy of the tasks they post.
                              Workers are solely responsible for completing
                              tasks genuinely and submitting truthful proof of
                              work (such as screenshots or links). Submitting
                              fabricated, edited, or recycled proof is grounds
                              for rejection, forfeiture of that job's payment,
                              and account suspension.
                        </p>
                        <p className={p.p}>
                              Workbit is a marketplace, not a party to the
                              underlying task. We don't guarantee that any
                              specific submission will be approved — approval
                              decisions are made by the Job Owner, subject to
                              the dispute process below.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>5. Prohibited activity</h2>
                        <p className={p.p}>You agree not to:</p>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    Post or request tasks involving hate
                                    speech, harassment, adult content,
                                    violence, fraud, election manipulation, or
                                    any illegal activity.
                              </li>
                              <li className={p.li}>
                                    Use bots, scripts, fake engagement
                                    farms, or multiple accounts to complete or
                                    inflate tasks.
                              </li>
                              <li className={p.li}>
                                    Attempt to pay or be paid outside the
                                    Workbit escrow system for a job listed on
                                    the platform.
                              </li>
                              <li className={p.li}>
                                    Probe, disrupt, reverse-engineer, or
                                    attempt unauthorized access to Workbit's
                                    systems, including its database, APIs, or
                                    payment infrastructure.
                              </li>
                        </ul>
                        <p className={p.p}>
                              Violations may result in immediate suspension,
                              forfeiture of pending balances tied to the
                              violation, and, where applicable, referral to
                              law enforcement.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>6. Disputes</h2>
                        <p className={p.p}>
                              If a Worker and Job Owner disagree about whether
                              a task was completed, either party can open a
                              dispute from the job's detail page. Disputes are
                              reviewed by Workbit; while a dispute is{' '}
                              <strong className={p.strong}>open</strong> or{' '}
                              <strong className={p.strong}>escalated</strong>,
                              the related funds remain locked in escrow and
                              are not released to either party until the
                              dispute is{' '}
                              <strong className={p.strong}>resolved</strong>.
                              Workbit's decision on a dispute is final.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>7. Account suspension &amp; termination</h2>
                        <p className={p.p}>
                              We may suspend or close an account for breach of
                              these Terms, suspected fraud, or to comply with
                              legal obligations. Wallet balances that are not
                              connected to an open dispute or investigation
                              remain withdrawable after closure, subject to
                              identity verification.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>8. Disclaimers &amp; limitation of liability</h2>
                        <p className={p.p}>
                              Workbit is provided "as is." We don't guarantee
                              uninterrupted availability, that every job will
                              be fairly evaluated, or that the platform will
                              be free of errors. To the maximum extent
                              permitted by Nigerian law, Workbit's liability
                              for any claim arising from your use of the
                              platform is limited to the amount held in your
                              wallet at the time of the claim.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>9. Changes to these Terms</h2>
                        <p className={p.p}>
                              We may update these Terms as Workbit evolves.
                              Material changes will be announced in-app or by
                              email at least 7 days before they take effect.
                              Continuing to use Workbit after changes take
                              effect means you accept the updated Terms.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>10. Governing law</h2>
                        <p className={p.p}>
                              These Terms are governed by the laws of the
                              Federal Republic of Nigeria. Any dispute not
                              resolved through Workbit's internal process will
                              be subject to the exclusive jurisdiction of the
                              Nigerian courts.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>11. Contact</h2>
                        <p className={p.p}>
                              Questions about these Terms? Reach us at{' '}
                              <strong className={p.strong}>
                                    legal@workbit.app
                              </strong>{' '}
                              or visit our{' '}
                              <a href="/contact">Contact page</a>.
                        </p>
                  </section>
            </StaticLayout>
      );
};

export default TermsOfService;