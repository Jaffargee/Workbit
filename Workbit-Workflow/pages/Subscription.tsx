import React from "react";
import { useApp } from "../AppContext";
import {
      ShieldCheck,
      CheckCircle2,
      Zap,
      Rocket,
      Award,
      CreditCard,
} from "lucide-react";

const Subscription: React.FC = () => {
      const { user, subscribe } = useApp();

      return (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
                  <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                              Simple, Transparent Pricing
                        </h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto font-medium">
                              Unlock full access to Nigeria's largest micro-job
                              network.
                        </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 items-stretch">
                        <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full opacity-60">
                              <div className="space-y-2 mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                          Standard User
                                    </h3>
                                    <p className="text-slate-500 font-medium">
                                          Basic access to view platform.
                                    </p>
                              </div>
                              <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black">
                                          ₦0
                                    </span>
                                    <span className="text-slate-400 font-bold">
                                          /year
                                    </span>
                              </div>
                              <div className="space-y-5 mb-12">
                                    {[
                                          {
                                                text: "Browse available jobs",
                                                inc: true,
                                          },
                                          {
                                                text: "Create job postings",
                                                inc: true,
                                          },
                                          { text: "Perform tasks", inc: false },
                                          {
                                                text: "Withdraw earnings",
                                                inc: false,
                                          },
                                    ].map((f, i) => (
                                          <div
                                                key={i}
                                                className={`flex items-center gap-3 ${f.inc ? "text-slate-700" : "text-slate-400 line-through"}`}
                                          >
                                                {f.inc ? (
                                                      <CheckCircle2
                                                            size={20}
                                                            className="text-slate-400"
                                                      />
                                                ) : (
                                                      <ShieldCheck size={20} />
                                                )}
                                                <span className="font-semibold">
                                                      {f.text}
                                                </span>
                                          </div>
                                    ))}
                              </div>
                              <button
                                    disabled
                                    className="mt-auto w-full bg-slate-100 text-slate-400 py-4 rounded-full font-bold cursor-not-allowed"
                              >
                                    Current Plan
                              </button>
                        </div>

                        <div className="bg-white p-12 rounded-[3rem] border-4 border-blue-600 shadow-2xl shadow-blue-100 flex flex-col h-full relative">
                              <div className="absolute top-0 right-12 transform -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-black tracking-widest uppercase">
                                    Popular
                              </div>

                              <div className="space-y-2 mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                          Earners Club
                                    </h3>
                                    <p className="text-slate-500 font-medium">
                                          Everything you need to grow your
                                          wallet.
                                    </p>
                              </div>
                              <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black">
                                          ₦5,000
                                    </span>
                                    <span className="text-slate-400 font-bold">
                                          /year
                                    </span>
                              </div>

                              <div className="space-y-5 mb-12">
                                    {[
                                          {
                                                text: "Perform unlimited tasks",
                                                icon: <Rocket size={20} />,
                                          },
                                          {
                                                text: "Earn ₦500 per referral",
                                                icon: <Award size={20} />,
                                          },
                                          {
                                                text: "Weekly wallet withdrawals",
                                                icon: <Zap size={20} />,
                                          },
                                          {
                                                text: "Priority customer support",
                                                icon: <ShieldCheck size={20} />,
                                          },
                                    ].map((f, i) => (
                                          <div
                                                key={i}
                                                className="flex items-center gap-3 text-slate-800"
                                          >
                                                <div className="text-blue-600">
                                                      {f.icon}
                                                </div>
                                                <span className="font-bold">
                                                      {f.text}
                                                </span>
                                          </div>
                                    ))}
                              </div>

                              <button
                                    onClick={() => {
                                          if (user?.isSubscribed) return;
                                          subscribe();
                                          alert(
                                                "Subscription successful! Welcome to the club.",
                                          );
                                    }}
                                    className={`mt-auto w-full py-4 rounded-full cursor-pointer font-black text-lg transition-all shadow-xl ${
                                          user?.isSubscribed
                                                ? "bg-emerald-500 text-white cursor-default"
                                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                    }`}
                              >
                                    {user?.isSubscribed ? (
                                          <span className="flex items-center justify-center gap-2">
                                                <CheckCircle2 /> Plan Active
                                          </span>
                                    ) : (
                                          "Subscribe Now"
                                    )}
                              </button>
                        </div>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shrink-0">
                              <CreditCard size={32} />
                        </div>
                        <div>
                              <h4 className="text-xl font-bold text-slate-900">
                                    Secure Payments via Paystack
                              </h4>
                              <p className="text-slate-500 font-medium mt-1">
                                    We use bank-grade security to process your
                                    subscriptions and deposits safely.
                              </p>
                        </div>
                  </div>
            </div>
      );
};

export default Subscription;