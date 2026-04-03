import React from "react";
import { useApp } from "../AppContext";
import { Copy, Share2, Users, Gift, TrendingUp, Info } from "lucide-react";

const Referrals: React.FC = () => {
      const { user } = useApp();
      const refLink = `https://workbit.com/join?ref=${user?.referralCode}`;

      const copyToClipboard = () => {
            navigator.clipboard.writeText(refLink);
            alert("Link copied to clipboard!");
      };

      return (
            <div className="space-y-10 animate-in fade-in duration-500 pb-20">
                  <div className="bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl shadow-blue-200">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="flex-1 space-y-6 relative z-10">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-blue-100 font-bold text-xs uppercase tracking-widest">
                                    <Gift size={16} /> Earn More Together
                              </div>
                              <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                    Invite Friends & Earn ₦500 <br /> For Every
                                    Referral!
                              </h2>
                              <p className="text-blue-100 text-lg max-w-lg font-medium opacity-90">
                                    Share the Workbit opportunity with your
                                    network and build a passive income stream
                                    today.
                              </p>
                        </div>
                        <div className="bg-white/10 p-2 rounded-[2rem] backdrop-blur-md border border-white/20 shrink-0">
                              <div className="bg-white p-10 rounded-[1.8rem] space-y-6 text-slate-900 shadow-xl min-w-[320px]">
                                    <div className="space-y-2">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Your Referral Link
                                          </p>
                                          <div className="relative group">
                                                <input
                                                      type="text"
                                                      readOnly
                                                      value={refLink}
                                                      className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-4 rounded-2xl pr-14 text-sm font-mono text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                />
                                                <button
                                                      onClick={copyToClipboard}
                                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                                                >
                                                      <Copy size={18} />
                                                </button>
                                          </div>
                                    </div>
                                    <button className="w-full border-2 border-slate-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                                          <Share2 size={20} /> Share via
                                          WhatsApp
                                    </button>
                              </div>
                        </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {[
                              {
                                    label: "Total Referrals",
                                    value: user?.referralCount || 0,
                                    icon: <Users className="text-blue-600" />,
                                    bg: "bg-blue-50",
                              },
                              {
                                    label: "Success Subscriptions",
                                    value: Math.floor(
                                          (user?.referralCount || 0) * 0.7,
                                    ),
                                    icon: <Gift className="text-emerald-600" />,
                                    bg: "bg-emerald-50",
                              },
                              {
                                    label: "Total Earnings",
                                    value: `₦${user?.wallet.referralEarnings.toLocaleString()}`,
                                    icon: (
                                          <TrendingUp className="text-amber-600" />
                                    ),
                                    bg: "bg-amber-50",
                              },
                        ].map((stat, i) => (
                              <div
                                    key={i}
                                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4"
                              >
                                    <div
                                          className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}
                                    >
                                          {stat.icon}
                                    </div>
                                    <div>
                                          <p className="text-sm font-medium text-slate-500">
                                                {stat.label}
                                          </p>
                                          <h3 className="text-3xl font-black text-slate-900">
                                                {stat.value}
                                          </h3>
                                    </div>
                              </div>
                        ))}
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                              <Info className="text-blue-600" size={24} /> How
                              it Works
                        </h3>
                        <div className="grid md:grid-cols-3 gap-12">
                              {[
                                    {
                                          step: "1",
                                          title: "Share Link",
                                          desc: "Send your link to friends, family or post it on social media.",
                                    },
                                    {
                                          step: "2",
                                          title: "They Join",
                                          desc: "A friend signs up and activates their annual subscription.",
                                    },
                                    {
                                          step: "3",
                                          title: "Get Paid",
                                          desc: "Instantly receive ₦500 in your wallet as soon as they pay.",
                                    },
                              ].map((s, i) => (
                                    <div key={i} className="space-y-4 relative">
                                          <div className="text-6xl font-black text-slate-200 absolute -top-4 -left-2 opacity-50">
                                                0{s.step}
                                          </div>
                                          <div className="relative z-10 space-y-2">
                                                <h4 className="text-xl font-bold text-slate-800">
                                                      {s.title}
                                                </h4>
                                                <p className="text-slate-600 leading-relaxed">
                                                      {s.desc}
                                                </p>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </div>
            </div>
      );
};

export default Referrals;