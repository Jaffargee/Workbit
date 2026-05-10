import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import {
      Wallet as WalletIcon,
      ArrowUpRight,
      ArrowDownLeft,
      PlusCircle,
      CreditCard,
      Clock,
      ChevronRight,
      EyeIcon,
      Share,
      Currency,
      BookOpen,
      PinIcon,
      Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/authentication";
import WInput from "@/components/Inputs/WInput";
import { supabase } from "@/server/supabase";
import NetworkError from "@/components/NetworkError";
import { Transaction } from "@/types/types";

const Wallet: React.FC = () => {
      const { user, withdraw } = useApp();
      const [showDeposit, setShowDeposit] = useState(false);
      const [amount, setAmount] = useState<number>();
      const [stackRef, setSTackRef] = useState("acv_9ee55786-2323-4760-98e2-6380c9cb3f68" +  Math.floor(Math.random() * 10001).toString());
      const [accessCode, setAccessCode] = useState("0peioxfhpn");

      const { profile, refreshUserProfile } = useAuth();

      const handleWithdraw = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                  const { data, error } = await supabase
                  .from('wallet_deposits')
                  .insert({
                        user_id: profile?.user_id,            // ID of the user making the deposit
                        wallet_id: profile?.wallet.id,        // The specific wallet being funded
                        amount: amount,             // The decimal amount (e.g., 5000.00)
                        currency: 'NGN',
                        status: 'PENDING',          // Default status until confirmed by webhook
                        paystack_reference: stackRef,
                        paystack_access_code: accessCode
                  })
                  .select()
                  .single();

                  if(error) {
                        alert('Error While depositing money into the wallet!');
                        return;
                  }

                  const { data: c_data, error: c_err } = await supabase.rpc('confirm_wallet_deposit', { p_paystack_reference: stackRef, p_amount: amount })

                  if (c_err) {
                        alert('Error While Confirming money into the wallet and wallet transaction!');
                        return;
                  }

                  setShowDeposit(false);
                  await refreshUserProfile();

            } catch (error) {
                  console.log('Unexpected Error!');
            }
      };


      return (
            <div className="space-y-4 pb-20">

                  <BalanceDashboard />

                  <div className="grid md:grid-cols-2 gap-4">

                        <ActionButtonContainer onDeposit={() => setShowDeposit(true)} />

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow- space-y-8">
                              <div className="space-y-4">
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
                              <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer">
                                    Download Statement{" "}
                                    <ChevronRight size={16} />
                              </button>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-100 shadow- overflow-hidden divide-y divide-slate-50">
                              {profile && profile?.wallet.wallet_transactions && profile.wallet.wallet_transactions.map((tx: any) => (
                                    <TrxTbleRow key={tx.id} tx={tx} />
                              ))}
                        </div>
                  </div>

                  {showDeposit && (
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                                          Withdraw Funds
                                    </h3>
                                    <form onSubmit={handleWithdraw} className="space-y-6">
                                          <WInput type="text" name="amount" icon={<Currency size={16} />} label="Amount" placeholder="₦10,000.00" onChange={(e) => setAmount(Number(e.target.value))} />
                                          <WInput name="stack_ref" icon={<BookOpen size={16} />} label="Reference" value={stackRef} placeholder="acv_9ee55786-2323-4760-98e2-6380c9cb3f68" onChange={(e) => setSTackRef(e.target.value)} />
                                          <WInput name="access_code" icon={<Lock size={16} />} label="Access Code" value={accessCode} placeholder="0peioxfhpn" onChange={(e) => setAccessCode(e.target.value)} />
                                          <div className="flex gap-3">
                                                <button type="button" onClick={() => setShowDeposit(false) } className="cursor-pointer flex-1 border-2 border-slate-100 text-slate-600 py-2 rounded-full">
                                                      Cancel
                                                </button>
                                                <button type="submit" className="cursor-pointer flex-1 bg-blue-600 text-white py-2 rounded-full shadow-xl shadow-blue-100">
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

const BalanceDashboard = () => {
      const { profile } = useAuth();

      return (
            <div className="bg-gradient-to-l from-slate-900 to-slate-900/90 shadow-md border-slate-700 border rounded-md text-white overflow-hidden">
                  <div className="flex flex-col w-full h-full relative px-4 py-4">

                        <BlDRow>
                              <div className="flex flex-col flex-1 relative">
                                    <div className="relative">
                                          <span className="text-slate-400">Workbit Escrow Wallet</span>
                                    </div>
                                    <div className="relative">
                                          <span className="text-slate-400 text-sm">{profile?.wallet.id} • REGULAR</span>
                                    </div>
                              </div>
                              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <WalletIcon
                                          className="text-blue-400"
                                          size={20}
                                    />
                              </div>
                        </BlDRow>

                        <BlDRow>
                              <div className="flex flex-1 h-full relative">
                                    <div className="flex gap-2 relative flex-row items-center justify-start">
                                          <button>
                                                <div className="flex flex-col relative items-center justify-center h-full w-full">
                                                      <span>
                                                            <EyeIcon size={20} color="#fff" />
                                                      </span>
                                                </div>
                                          </button>
                                    </div>
                              </div>
                              <div className="flex flex-col h-full relative">
                                    <p className="text-slate-400 text-sm">Available Balance</p>
                                    <p className="text-2xl text-white text-right w-full">
                                          ₦{profile?.wallet.balance.toLocaleString()}
                                    </p>
                              </div>
                        </BlDRow>

                  </div>
            </div>
      );
}

const ActionButtonContainer = ({ onDeposit, onWithdraw }: { onDeposit?: () => void, onWithdraw?: () => void }) => {
      return (
            <BlDRow>
                  <div className="flex flex-col w-full h-full relative py-2 rounded-md">
                        <div className="flex flex-col md:flex-row gap-4 relative z-10">
                              <WActionButton onClick={onWithdraw} text="Withdraw" icon={<ArrowUpRight size={20} />} className="border-blue-700 bg-white/50 text-blue-700" />
                              <WActionButton onClick={onDeposit} text="Deposit Funds" icon={<PlusCircle size={20} />} className="border-blue-600 text-white bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" />
                        </div>
                  </div>
            </BlDRow>
      )
}

const WActionButton = ({ text, icon, className, onClick }: { text: string, icon: React.ReactNode, className?: string, onClick?: () => void  }) => {
      return (
            <button onClick={onClick} className={`flex-1 rounded-full border flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${className}`}>
                  <div className="flex flex-row items-center justify-center w-full h-full relative py-4 px-4 gap-2">
                        <div className="flex h-full items-center justify-center relative">
                              <span>
                                    {icon}
                              </span>
                        </div>
                        <div className="flex h-full items-center justify-center relative">
                              <span>{text}</span>
                        </div>
                  </div>
            </button>
      )
}

const BlDRow = ({ children }: { children?: React.ReactNode }) => {
      return (
            <div className="flex flex-row items-center w-full relative">
                  {children}
            </div>
      )
}

const TrxTbleRow = ({ tx }: { tx: any }) => {
      return (
            <div key={tx.id} className="py-2 px-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                              {tx.amount > 0 ? (
                                    <ArrowDownLeft size={20} />
                              ) : (
                                    <ArrowUpRight size={20} />
                              )}
                        </div>
                        <div className="flex flex-col">
                              <p className="text-slate-900 text-sm">{tx.note}</p>
                              <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                          <Clock size={12} />{" "}
                                          {tx.created_at}
                                    </p>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.type === "CREDIT" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`} >
                                          {tx.type}
                                    </span>
                              </div>
                        </div>
                  </div>
                  <p className={`text-lg ${tx.type === "CREDIT" ? "text-emerald-600" : "text-red-600"}`}>
                        {tx.type === "CREDIT" ? `+₦${tx.amount.toLocaleString()}` : `-₦${tx.amount.toLocaleString()}`}
                  </p>
            </div>
      )
}

export default Wallet;