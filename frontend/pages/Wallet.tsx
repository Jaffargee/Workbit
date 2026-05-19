import React, { useState } from "react";
import {
      Wallet as WalletIcon,
      ArrowUpRight,
      ArrowDownLeft,
      PlusCircle,
      CreditCard,
      Clock,
      ChevronRight,
      EyeIcon,
      Currency,
      Download,
      X,
      Loader,
} from "lucide-react";
import { useAuth } from "@/contexts/authentication";
import WInput from "@/components/Inputs/WInput";
import { supabase } from "@/server/supabase";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Dialog } from "radix-ui";
import StatusDialog from "@/components/StatusDialog";
import TransactionDetailsSheet from "@/components/Wallet/TransactionDetails";
import { WalletDeposit } from "@/types/types";

const Wallet: React.FC = () => {
      const { profile } = useAuth();

      const [statusOpen, setStatusOpen] = useState(false);
      const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
      const [statusMessage, setStatusMessage] = useState("");

      const triggerStatus = (type: "success" | "error", message: string) => {
            setStatusType(type);
            setStatusMessage(message);
            setStatusOpen(true);
      };

      function onWithdraw() {
            console.log(profile?.wallet)
            triggerStatus("success", "We couldn't confirm your deposit payment with Flutterwave.");
      }

      return (
            <div className="space-y-2 pb-20 max-w-5xl mx-auto">
                  
                  {/* Top Dashboard Section */}
                  <BalanceDashboard />

                  {/* Action & Stats Grid */}
                  <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                        <ActionButtonContainer onWithdraw={onWithdraw} triggerStatus={triggerStatus} />
                        <EarningsBreakdown />
                  </div>

                  {/* Transaction History Section */}
                  <div className="bg-white md:rounded-2xl border border-slate-100 px-2 md:p-2 space-y-4">
                        {/* Responsive Header */}
                        <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-4 px-4">
                              <h3 className="text-lg md:text-xl font-bold text-slate-800 truncate">
                                    Transaction History
                              </h3>
                              <button className="text-xs md:text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors shrink-0">
                                    <Download size={14} className="hidden sm:block" />
                                    <span className="hidden sm:inline">Download Statement</span>
                                    <span className="sm:hidden">Statement</span>
                                    <ChevronRight size={14} className="sm:hidden" />
                              </button>
                        </div>

                        {/* Transaction List */}
                        <div className="flex flex-col divide-y divide-slate-100">
                              {profile && profile.wallet.wallet_transactions && profile?.wallet.wallet_transactions?.length > 0 ? (
                                    profile.wallet.wallet_transactions.map((tx: any) => (
                                          <TransactionDetailsSheet deposits={profile?.wallet.wallet_deposits as WalletDeposit[]} key={tx.id} tx={tx} />
                                    ))
                              ) : (
                                    <div className="py-8 text-center text-slate-400 text-sm">
                                          No transactions found.
                                    </div>
                              )}
                        </div>
                  </div>

                  <StatusDialog
                        isOpen={statusOpen} 
                        type={statusType} 
                        message={statusMessage} 
                        onClose={() => setStatusOpen(false)} 
                  />
            </div>
      );
};

// --- Refactored Components ---

const BalanceDashboard = () => {
      const { profile } = useAuth();

      return (
            <div className="flex w-full px-4 py-2">
                  <div className="w-full relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-slate-900/10 border-slate-800 border rounded-2xl text-white overflow-hidden p-5 md:p-6">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        
                        <div className="relative flex flex-col gap-6">
                              <div className="flex items-start justify-between w-full">
                                    <div className="flex flex-col">
                                          <span className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wider mb-1">
                                                Workbit Escrow Wallet
                                          </span>
                                          <span className="text-slate-300 font-mono text-xs opacity-80">
                                                {profile?.wallet.id || "N/A"} • REGULAR
                                          </span>
                                    </div>
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shrink-0">
                                          <WalletIcon className="text-blue-400" size={20} />
                                    </div>
                              </div>

                              <div className="flex items-end justify-between w-full mt-2">
                                    <div className="flex flex-col">
                                          <p className="text-slate-400 text-sm mb-1">Available Balance</p>
                                          <div className="flex items-center gap-3">
                                                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                                      ₦{profile?.wallet.balance?.toLocaleString() || "0"}
                                                </p>
                                                <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors mt-1">
                                                      <EyeIcon size={18} className="text-slate-400" />
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
}

const EarningsBreakdown = () => {
      const { profile } = useAuth();

      return (
            <div className="bg-white p-5 md:rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <h3 className="font-semibold text-slate-800 text-sm md:text-base">
                        Earnings Breakdown
                  </h3>
                  
                  {/* Grid Layout for Stats */}
                  <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shrink-0">
                                    <ArrowDownLeft size={16} />
                              </div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5 truncate">Job Earnings</p>
                              <p className="text-base md:text-lg font-bold text-slate-800 truncate">
                                    ₦{profile?.wallet.balance?.toLocaleString() || "0"}
                              </p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3 shrink-0">
                                    <PlusCircle size={16} />
                              </div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5 truncate">Referrals</p>
                              <p className="text-base md:text-lg font-bold text-slate-800 truncate">
                                    ₦{profile?.wallet.balance?.toLocaleString() || "0"}
                              </p>
                        </div>
                  </div>

                  {/* Premium Promo Banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3.5 rounded-xl border border-blue-100/50 flex flex-row items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                              <CreditCard size={18} />
                        </div>
                        <p className="text-xs md:text-sm text-blue-900/80 leading-snug">
                              Earn <span className="font-bold text-blue-700">₦500 instantly</span> on every successful friend subscription.
                        </p>
                  </div>
            </div>
      );
}

const TrxTbleRow = ({ tx }: { tx: any }) => {
      const isCredit = tx.type === "CREDIT" &&  tx.amount > 0;

      return (
            <div className="py-2 px-2 flex items-center justify-between gap-3 hover:bg-slate-200/50 transition-colors group cursor-pointer">
                  {/* Left Side: Icon & Details (Using min-w-0 for Truncation) */}
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isCredit ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-rose-50 text-rose-600 group-hover:bg-rose-100"}`}>
                              {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        
                        <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-slate-800 text-xs md:text-base font-medium truncate">
                                    {tx.note || "Wallet Transaction"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                                          <Clock size={12} />
                                          {new Date(tx.created_at).toLocaleString()}
                                    </p>
                                    <span className={`shrink-0 px-2 py-[2px] rounded-full text-[9px] font-bold uppercase tracking-widest ${isCredit ? "bg-emerald-100/50 text-emerald-700" : "bg-rose-100/50 text-rose-700"}`} >
                                          {tx.type}
                                    </span>
                              </div>
                        </div>
                  </div>

                  {/* Right Side: Amount */}
                  <div className="shrink-0 text-right">
                        <p className={`text-sm md:text-base font-semibold ${isCredit ? "text-emerald-600" : "text-rose-600"}`}>
                              {isCredit ? "+" : "-"}₦{Math.abs(tx.amount).toLocaleString()}
                        </p>
                  </div>
            </div>
      )
}

const ActionButtonContainer = ({ onWithdraw, triggerStatus }: { onWithdraw?: () => void, triggerStatus: (type: "success" | "error", message: string) => void }) => {
      
      const { profile, refreshUserProfile } = useAuth();
      const [amount, setAmount] = useState<number>(0);
      const [loading, setLoading] = useState<boolean>(false);

      const config = {
            public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
            tx_ref: Date.now().toString(),
            amount: amount,
            currency: 'NGN',
            payment_options: 'card,mobilemoney,ussd',
            customer: {
                  email: profile?.user_contacts[0].email as string,
                  phone_number: profile?.user_contacts[0].phone as string,
                  name: profile?.first_name + ' ' + profile?.last_name,
            },
            meta: {
                  user_id: profile?.user_id,
                  email: profile?.user_contacts[0].email as string,
                  phone_number: profile?.user_contacts[0].phone as string,
                  name: profile?.first_name + ' ' + profile?.last_name,
            },
            customizations: {
                  title: 'Workbit',
                  description: 'Deposit funds into workbit escrow account for job funding.',
                  logo: 'http://192.168.1.44:4000/assets/workbit.webp',
            },
      };

      const handleFlutterPayment = useFlutterwave(config);
      
      const verifyPayment = async (transaction_id: number) => {
            try {
                  const { data, error } = await supabase.functions.invoke('verify-payment', { 
                        body: { transaction_id }, 
                  })
                  if (error) throw new Error(error);
                  return data;
            } catch (error: any) {
                  console.log(error.message)
            }
      };

      const initPayment = async () => {
            setLoading(true);
            handleFlutterPayment({
                  callback: async (response) => {
                        const verified_payment = await verifyPayment(response.transaction_id);
                        if (verified_payment.success) {
                              await refreshUserProfile();
                              triggerStatus("success", `₦${amount.toLocaleString()} deposited into your Escrow Wallet safely.`);
                        } else {
                              triggerStatus("error", "We couldn't confirm your deposit payment with Flutterwave.");
                        }
                        closePaymentModal();
                  },
                  onClose: () => {
                        console.log("User closed the modal");
                        setLoading(false);
                  },
          });
      }

      return (
            <div className="flex items-center w-full bg-white p-4 md:rounded-2xl border border-slate-200">
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                        <WActionButton 
                              onClick={onWithdraw} 
                              text="Withdraw" 
                              icon={<ArrowUpRight size={18} />} 
                              className="border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700" 
                        />
                        <DepostDialog loading={loading} amount={amount} setAmount={setAmount} onClick={initPayment} />
                  </div>
            </div>
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

const DepostDialog = ({ loading, amount, setAmount, onClick }: { loading: boolean, amount: number, setAmount: React.Dispatch<React.SetStateAction<number>>, onClick?: () => void }) => {
      return (
            <Dialog.Root>
                  <Dialog.Trigger className="flex-1 w-full relative outline-none">
                        <WActionButton text="Deposit" icon={<PlusCircle size={18} />} className="w-full border-blue-600 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" />
                  </Dialog.Trigger>
                  <Dialog.Portal>
                        <Dialog.Overlay className="fixed bg-slate-900/40 top-0 left-0 w-full h-full backdrop-blur-sm z-[1050]" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1100] shadow-xl border border-slate-100 flex flex-col bg-white rounded-2xl w-[calc(100%-2rem)] max-w-md px-6 py-6 m-0 animate-in zoom-in-95 duration-200">
                              <Dialog.Title className="text-xl font-bold text-slate-800 mb-1">Escrow Deposit</Dialog.Title>
                              <Dialog.Description className="text-sm text-slate-500 mb-5">
                                    Enter the amount you want to deposit into your secure wallet.
                              </Dialog.Description>
                              
                              <div className="flex flex-col w-full gap-5">
                                    <WInput 
                                          onKeyDown={(e) => { if (e.key === "Enter") onClick?.() }} 
                                          _under={amount > 0 && amount <= 100 ? <span className="text-rose-500 text-xs font-medium">Minimum deposit is ₦100</span> : undefined} 
                                          prefix="₦" 
                                          type="number" 
                                          name="amount" 
                                          icon={<Currency size={16} />} 
                                          label="Amount" 
                                          placeholder="10,000" 
                                          value={amount || ''} 
                                          onChange={(e) => setAmount(Number(e.target.value))} 
                                    />
                                    
                                    <div className="flex gap-3">
                                          <button disabled={amount <= 100 || loading} onClick={onClick} type="submit" className={`${(amount <= 100 || loading) && 'opacity-70'} cursor-pointer flex-1 bg-blue-700 hover:bg-blue-600 text-white rounded-full shadow-xl shadow-blue-100`}>
                                                <div className="flex flex-row items-center justify-center w-full h-full relative px-4 py-3 gap-2">
                                                      {
                                                            loading &&
                                                            <div className="flex flex-col h-full relative items-center justify-center">
                                                                  <Loader className="animate-spin" />
                                                            </div>
                                                      }
                                                      <div className="flex h-full items-center justify-center relative">
                                                            <span>Confirm</span>
                                                      </div>
                                                </div>
                                          </button>
                                    </div>
                                    <Dialog.Close className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
                                          <X size={20} strokeWidth={1.5} />
                                    </Dialog.Close>
                              </div>
                        </Dialog.Content>
                  </Dialog.Portal>
            </Dialog.Root>
      )
}

export default Wallet;
