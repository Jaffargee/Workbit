import React, { useState } from "react";
import { useApp } from "../AppContext";
import {
      Wallet as WalletIcon,
      ArrowUpRight,
      ArrowDownLeft,
      PlusCircle,
      CreditCard,
      Clock,
      ChevronRight,
} from "lucide-react";

const Wallet: React.FC = () => {
      const { user, withdraw } = useApp();
      const [showWithdraw, setShowWithdraw] = useState(false);
      const [amount, setAmount] = useState("");

      const handleWithdraw = (e: React.FormEvent) => {
            e.preventDefault();
            const val = parseFloat(amount);
            if (val > (user?.wallet.balance || 0)) {
                  alert("Insufficient balance!");
                  return;
            }
            withdraw(val);
            setShowWithdraw(false);
            setAmount("");
            alert("Withdrawal request submitted! Expect arrival in 24 hours.");
      };

      return (
            <div className="space-y-8 pb-20">
                  <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                              <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                                <WalletIcon
                                                      className="text-blue-400"
                                                      size={24}
                                                />
                                          </div>
                                          <p className="text-lg font-medium text-slate-400">
                                                Main Balance
                                          </p>
                                    </div>
                                    <h2 className="text-6xl font-black">
                                          ₦
                                          {user?.wallet.balance.toLocaleString()}
                                    </h2>
                              </div>
                              <div className="flex gap-4 relative z-10 pt-10">
                                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/40">
                                          <PlusCircle size={20} /> Deposit Funds
                                    </button>
                                    <button
                                          onClick={() => setShowWithdraw(true)}
                                          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                                    >
                                          <ArrowUpRight size={20} /> Withdraw
                                    </button>
                              </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                              <div className="space-y-6">
                                    <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">
                                          Earnings Breakdown
                                    </h3>
                                    <div className="space-y-6">
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                            <ArrowDownLeft
                                                                  size={20}
                                                            />
                                                      </div>
                                                      <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                  Job Earnings
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                  From
                                                                  micro-tasks
                                                            </p>
                                                      </div>
                                                </div>
                                                <p className="font-bold text-emerald-600">
                                                      ₦
                                                      {user?.wallet.earnings.toLocaleString()}
                                                </p>
                                          </div>
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                                            <PlusCircle
                                                                  size={20}
                                                            />
                                                      </div>
                                                      <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                  Referrals
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                  Bonus rewards
                                                            </p>
                                                      </div>
                                                </div>
                                                <p className="font-bold text-amber-600">
                                                      ₦
                                                      {user?.wallet.referralEarnings.toLocaleString()}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                              <div className="pt-6 border-t border-slate-50">
                                    <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4">
                                          <CreditCard
                                                className="text-blue-600"
                                                size={24}
                                          />
                                          <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                                Refer friends and earn ₦500
                                                instantly on every successful
                                                subscription!
                                          </p>
                                    </div>
                              </div>
                        </div>
                  </div>

                  <div className="space-y-6">
                        <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-slate-800">
                                    Transaction History
                              </h3>
                              <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                    Download Statement{" "}
                                    <ChevronRight size={16} />
                              </button>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                              {[
                                    {
                                          id: "T1",
                                          type: "Earning",
                                          desc: "Proof Approved: IG Follow",
                                          amount: 20,
                                          date: "Mar 15, 2024",
                                          status: "Completed",
                                    },
                                    {
                                          id: "T2",
                                          type: "Referral",
                                          desc: "Referral Bonus: @john_doe",
                                          amount: 500,
                                          date: "Mar 14, 2024",
                                          status: "Completed",
                                    },
                                    {
                                          id: "T3",
                                          type: "Withdrawal",
                                          desc: "To Bank: **** 4567",
                                          amount: -5000,
                                          date: "Mar 12, 2024",
                                          status: "Pending",
                                    },
                                    {
                                          id: "T4",
                                          type: "Subscription",
                                          desc: "Annual Plan Activation",
                                          amount: -5000,
                                          date: "Mar 01, 2024",
                                          status: "Completed",
                                    },
                              ].map((tx) => (
                                    <div
                                          key={tx.id}
                                          className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                    >
                                          <div className="flex items-center gap-4">
                                                <div
                                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                                                >
                                                      {tx.amount > 0 ? (
                                                            <ArrowDownLeft
                                                                  size={20}
                                                            />
                                                      ) : (
                                                            <ArrowUpRight
                                                                  size={20}
                                                            />
                                                      )}
                                                </div>
                                                <div>
                                                      <p className="font-bold text-slate-900">
                                                            {tx.desc}
                                                      </p>
                                                      <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                  <Clock
                                                                        size={
                                                                              12
                                                                        }
                                                                  />{" "}
                                                                  {tx.date}
                                                            </p>
                                                            <span
                                                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                                                            >
                                                                  {tx.status}
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>
                                          <p
                                                className={`text-lg font-black ${tx.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}
                                          >
                                                {tx.amount > 0
                                                      ? `+₦${tx.amount}`
                                                      : `-₦${Math.abs(tx.amount)}`}
                                          </p>
                                    </div>
                              ))}
                        </div>
                  </div>

                  {showWithdraw && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                                          Withdraw Funds
                                    </h3>
                                    <form
                                          onSubmit={handleWithdraw}
                                          className="space-y-6"
                                    >
                                          <div className="space-y-2">
                                                <p className="text-sm font-bold text-slate-700">
                                                      Withdrawal Amount (₦)
                                                </p>
                                                <input
                                                      type="number"
                                                      required
                                                      placeholder="Min. ₦1,000"
                                                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500"
                                                      value={amount}
                                                      onChange={(e) =>
                                                            setAmount(
                                                                  e.target
                                                                        .value,
                                                            )
                                                      }
                                                />
                                                <p className="text-xs text-slate-400">
                                                      Current Balance: ₦
                                                      {user?.wallet.balance.toLocaleString()}
                                                </p>
                                          </div>
                                          <div className="space-y-2">
                                                <p className="text-sm font-bold text-slate-700">
                                                      Select Bank
                                                </p>
                                                <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500">
                                                      <option>
                                                            Kuda Microfinance
                                                            Bank
                                                      </option>
                                                      <option>
                                                            Access Bank
                                                      </option>
                                                      <option>GTBank</option>
                                                      <option>
                                                            Zenith Bank
                                                      </option>
                                                </select>
                                          </div>
                                          <div className="flex gap-3">
                                                <button
                                                      type="button"
                                                      onClick={() =>
                                                            setShowWithdraw(
                                                                  false,
                                                            )
                                                      }
                                                      className="flex-1 border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-bold"
                                                >
                                                      Cancel
                                                </button>
                                                <button
                                                      type="submit"
                                                      className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100"
                                                >
                                                      Confirm
                                                </button>
                                          </div>
                                    </form>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default Wallet;