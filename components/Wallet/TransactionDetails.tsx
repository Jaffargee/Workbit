import { WalletDeposit } from "@/types/types";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Briefcase, CheckCircle2, Clock, CreditCard, Hash, Share2, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";

interface TransactionDetailsProps {
      tx: any,
      deposits: WalletDeposit[],
}

const TransactionDetailsSheet = ({ tx, deposits } : TransactionDetailsProps) => {
      const [isRendered, setIsRendered] = useState(false);
      const [isAnimating, setIsAnimating] = useState(false);

      useEffect(() => {
      if (tx) {
            setIsRendered(true);
            // Let render trigger, then apply animation delay
            const frame = requestAnimationFrame(() => {
                  setIsAnimating(true);
            });
            return () => cancelAnimationFrame(frame);
      } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsRendered(false), 300); // match duration-300
            return () => clearTimeout(timer);
      }
      }, [tx]);

      if (!isRendered || !tx) return null;

      const isCredit = tx.type === "CREDIT";

      // Attempt to match credit deposits with flutterwave information
      const matchedDeposit = tx.source === "DEPOSIT" 
      ? deposits.find((dep: any) => dep.wallet_tx_id === tx.id || dep.tx_ref === tx.reference)
      : null;

      return (
            <Dialog.Root>
                  <Dialog.Trigger className="w-full">
                        <TrxTbleRow tx={tx} />
                  </Dialog.Trigger>
                  <Dialog.Portal>
                        <Dialog.Overlay className={`fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm ${isAnimating ? "opacity-100" : "opacity-0"}`} />
                        <Dialog.Content className="fixed inset-0 z-[2100] flex items-end md:items-center justify-center">
                              {/* Sheet / Drawer Container */}
                              <div className={`relative w-full md:max-w-md bg-white rounded-t-[24px] md:rounded-[24px] p-6 shadow-2xl border border-slate-100 z-10 transition-transform duration-300 ease-out max-h-[92vh] md:max-h-[85vh] overflow-y-auto flex flex-col ${
                                    isAnimating 
                                          ? "translate-y-0 md:scale-100" 
                                          : "translate-y-full md:scale-95 md:translate-y-0"
                                    }`}
                              >
                                    {/* Mobile drag handle */}
                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden shrink-0" />

                                    {/* Sheet Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-50 shrink-0">
                                          <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 border border-slate-100">
                                                <Hash size={14} />
                                                </span>
                                                <span className="text-xs font-mono font-bold text-slate-500 select-all tracking-wider">
                                                {tx.id.toUpperCase().slice(0, 18)}...
                                                </span>
                                          </div>
                                    
                                          <Dialog.Close className="p-1.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 text-slate-400 hover:text-slate-700" >
                                                <X size={18} />
                                          </Dialog.Close>
                                    </div>

                                    {/* Detailed Sheet Content */}
                                    <div className="py-6 space-y-6 flex-1 overflow-y-auto">
                                    
                                          {/* Main Hero Amount & Status Card */}
                                          <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                                                
                                                <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 border ${
                                                isCredit 
                                                ? "bg-emerald-100/50 border-emerald-200 text-emerald-600" 
                                                : "bg-rose-100/50 border-rose-200 text-rose-600"
                                                }`}>
                                                {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                                                </div>

                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Transaction Amount
                                                </p>
                                                <h2 className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${
                                                isCredit ? "text-emerald-600" : "text-rose-600"
                                                }`}>
                                                {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString()}
                                                </h2>

                                                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-100 shadow-sm text-slate-700">
                                                <span className={`w-1.5 h-1.5 rounded-full ${isCredit ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                Confirmed Audit
                                                </span>
                                          </div>

                                          {/* Details Metadata List */}
                                          <div className="space-y-4">
                                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                                Transaction Audit log
                                                </h4>

                                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-sm">
                                                
                                                {/* Row: Note / Memo */}
                                                <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-400 font-medium">Memo note</span>
                                                <span className="text-slate-950 font-medium leading-relaxed">
                                                      {tx.note || "System Ledger Transaction"}
                                                </span>
                                                </div>

                                                <hr className="border-slate-100" />

                                                {/* Row: Origin Source */}
                                                <div className="flex justify-between items-center py-1">
                                                <span className="text-xs text-slate-400 font-medium">Activity Source</span>
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                                                      {tx.source === "JOB_FUNDING" && <Briefcase size={12} className="text-indigo-500" />}
                                                      {tx.source === "DEPOSIT" && <CreditCard size={12} className="text-blue-500" />}
                                                      {tx.source === "WITHDRAWAL" && <ArrowUpRight size={12} className="text-orange-500" />}
                                                      <span>{tx.source}</span>
                                                </div>
                                                </div>

                                                {/* Row: Audit Timestamps */}
                                                <div className="flex justify-between items-center py-1">
                                                <span className="text-xs text-slate-400 font-medium">Logged Date</span>
                                                <span className="font-semibold text-slate-800 text-xs">
                                                      {new Date(tx.created_at).toLocaleString(undefined, {
                                                      dateStyle: "medium",
                                                      timeStyle: "short"
                                                      })}
                                                </span>
                                                </div>

                                                {/* Row: Reference */}
                                                {tx.reference && (
                                                <div className="flex justify-between items-center py-1">
                                                      <span className="text-xs text-slate-400 font-medium">Channel Ref</span>
                                                      <span className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-100 px-2 py-0.5 rounded">
                                                      {tx.reference}
                                                      </span>
                                                </div>
                                                )}
                                                </div>
                                          </div>

                                          {/* Ledger Impact Box */}
                                          <div className="space-y-4">
                                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                                      Ledger Balance impact
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Before Balance</span>
                                                            <span className="text-sm font-bold font-mono text-slate-600">
                                                                  ₦{tx.balance_before?.toLocaleString() ?? "0"}
                                                            </span>
                                                      </div>
                                                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Post Balance</span>
                                                            <span className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
                                                                  ₦{tx.balance_after?.toLocaleString() ?? "0"}
                                                                  <ArrowRight size={12} className="text-blue-500 animate-pulse" />
                                                            </span>
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Payment gateway section (FLW Deposit details) */}
                                          {matchedDeposit && (
                                                <div className="space-y-4 pt-1">
                                                <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                                      Verified Gateway Context
                                                </h4>
                                                </div>

                                                <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/10 to-blue-50/50 p-4 rounded-2xl border border-blue-100/40 text-sm space-y-3">
                                                      <div className="flex justify-between items-center">
                                                            <span className="text-xs text-slate-500 font-medium">Gateway Partner</span>
                                                            <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">Flutterwave</span>
                                                      </div>

                                                      <div className="flex justify-between items-center">
                                                            <span className="text-xs text-slate-500 font-medium">Payment Mode</span>
                                                            <span className="text-xs font-semibold capitalize text-slate-800">
                                                            {matchedDeposit.payment_type?.replace("_", " ") || "Credit / Debit Card"}
                                                            </span>
                                                      </div>

                                                      {matchedDeposit.flw_ref && (
                                                            <div className="flex justify-between items-start gap-4">
                                                                  <span className="text-xs text-slate-500 font-medium shrink-0">Gateway Ref</span>
                                                                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-white border border-slate-100 p-1.5 rounded text-right break-all">
                                                                        {matchedDeposit.flw_ref}
                                                                  </span>
                                                            </div>
                                                      )}

                                                      <div className="flex justify-between items-center">
                                                            <span className="text-xs text-slate-500 font-medium">Status code</span>
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                                                  <CheckCircle2 size={12} /> SUCCESSFUL
                                                            </span>
                                                      </div>
                                                </div>
                                                </div>
                                          )}
                                    </div>

                                    {/* Audit footer */}
                                    <div className="pt-4 border-t border-slate-50 flex gap-3 shrink-0">
                                          <button 
                                                onClick={() => {
                                                // Simulate a share feature
                                                if (navigator.share) {
                                                navigator.share({
                                                      title: 'Escrow Transaction Audit',
                                                      text: `Receipt for: ${tx.note}. Amount: ₦${tx.amount.toLocaleString()}`,
                                                }).catch(err => console.log(err));
                                                } else {
                                                navigator.clipboard.writeText(`Audit Ref: ${tx.id} - ₦${tx.amount}`);
                                                alert("Receipt details copied to clipboard!");
                                                }
                                                }}
                                                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                                          >
                                                <Share2 size={14} />
                                                <span>Share Audit</span>
                                          </button>
                                    
                                          <Dialog.Close className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all">
                                                <div className="flex flex-row items-center justify-center w-full h-full relative">
                                                      <span>Dismiss Details</span>
                                                </div>
                                          </Dialog.Close>
                                    </div>
                              </div>
                        </Dialog.Content>
                  </Dialog.Portal>
            </Dialog.Root>
      );
};


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
                              <p className="text-slate-800 text-xs md:text-base font-medium truncate text-left">
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

export default TransactionDetailsSheet;