import React from 'react';
import { StaticLayout, useProseStyles } from './StaticLayout';
import { SUBSCRIPTION_FEE } from '@/constants';

const RefundPolicy: React.FC = () => {
      const p = useProseStyles();

      return (
            <StaticLayout
                  eyebrow="Legal"
                  title="Refund Policy"
                  meta="Last updated: June 30, 2026"
            >
                  <div className={p.callout}>
                        This policy explains when and how Workbit issues
                        refunds. It covers subscription fees, escrow deposits,
                        and unused job budgets.
                  </div>

                  <section className={p.section}>
                        <h2 className={p.h2}>
                              1. Subscription fees (Workers)
                        </h2>
                        <p className={p.p}>
                              The annual Worker subscription (currently ₦
                              {SUBSCRIPTION_FEE.toLocaleString()}/year) is{' '}
                              <strong className={p.strong}>
                                    generally non-refundable
                              </strong>{' '}
                              once the subscription has been activated and you
                              have gained access to the platform's job
                              submission features. This is consistent with
                              standard practice for digital access products.
                        </p>
                        <p className={p.p}>
                              We may issue a full refund at our discretion if:
                        </p>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    You were charged more than once for the
                                    same subscription period due to a
                                    technical error.
                              </li>
                              <li className={p.li}>
                                    You were charged for a renewal after
                                    submitting a valid cancellation request
                                    before the renewal date.
                              </li>
                              <li className={p.li}>
                                    A subscription was activated on your
                                    account without your authorization
                                    (contact us immediately and include
                                    evidence).
                              </li>
                        </ul>
                        <p className={p.p}>
                              Refund requests must be submitted within{' '}
                              <strong className={p.strong}>7 days</strong> of
                              the charge to{' '}
                              <strong className={p.strong}>
                                    support@workbit.app
                              </strong>{' '}
                              with the subject line "Refund Request."
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>
                              2. Escrow deposits (Job Owners)
                        </h2>
                        <p className={p.p}>
                              Funds deposited into a Job Owner's Workbit
                              wallet are held in escrow and belong to the
                              Job Owner until reserved for a specific job.
                        </p>
                        <ul className={p.ul}>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Unreserved wallet balance:
                                    </strong>{' '}
                                    Can be withdrawn to your linked bank
                                    account at any time via the Wallet page.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Reserved (active job) funds:
                                    </strong>{' '}
                                    Funds reserved for an active job are
                                    locked until the job closes. Unfilled
                                    slots are automatically released back to
                                    your wallet when a job closes.
                              </li>
                              <li className={p.li}>
                                    <strong className={p.strong}>
                                          Disputed funds:
                                    </strong>{' '}
                                    Held until the dispute is resolved; not
                                    eligible for withdrawal while under
                                    review.
                              </li>
                        </ul>
                        <p className={p.p}>
                              Payment gateway processing fees (charged by our
                              payment provider at the point of deposit) are
                              not refundable by Workbit, as we don't receive
                              or retain those fees.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>3. How refunds are paid</h2>
                        <p className={p.p}>
                              Approved refunds are returned to the original
                              payment method where possible. If that's not
                              possible (e.g. the card is no longer active),
                              we'll credit the amount to your Workbit wallet
                              or arrange a bank transfer. Refunds typically
                              process within 5–10 business days depending on
                              your bank.
                        </p>
                  </section>

                  <section className={p.section}>
                        <h2 className={p.h2}>4. Contact us</h2>
                        <p className={p.p}>
                              To request a refund or ask a question about this
                              policy, email{' '}
                              <strong className={p.strong}>
                                    support@workbit.app
                              </strong>{' '}
                              or use the{' '}
                              <a href="/contact">Contact page</a>.
                        </p>
                  </section>
            </StaticLayout>
      );
};

export default RefundPolicy;