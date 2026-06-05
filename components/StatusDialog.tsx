import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog } from "radix-ui";

interface StatusDialogProps {
      isOpen: boolean;
      onClose: () => void;
      type: "success" | "error" | null;
      message: string;
}

const StatusDialog: React.FC<StatusDialogProps> = ({ isOpen, onClose, type, message }) => {
      if (!type) return null;

      const isSuccess = type === "success";

      return (
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                  <Dialog.Overlay className="fixed bg-slate-900/40 top-0 left-0 w-full h-full backdrop-blur-sm z-[1050]" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1100] shadow-lg border border-slate-100 flex flex-col bg-white rounded-xl w-[calc(100%-2rem)] max-w-sm p-8 text-center animate-in zoom-in duration-200">
                        
                        {/* Status Icon Presentation */}
                        <div className="flex justify-center mb-5">
                              {isSuccess ? (
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                                          <CheckCircle2 size={36} />
                                    </div>
                              ) : (
                                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                                          <XCircle size={36} />
                                    </div>
                              )}
                        </div>

                        {/* Title & Feedback message */}
                        <Dialog.Title className="text-xl font-bold text-slate-900 mb-2">
                              {isSuccess ? "Transaction Successful" : "Transaction Failed"}
                        </Dialog.Title>
                        
                        <Dialog.Description className="text-sm text-slate-500 leading-relaxed mb-6">
                              {message}
                        </Dialog.Description>

                        {/* Action Button */}
                        <button
                              onClick={onClose}
                              className={`w-full py-3 rounded-full font-semibold shadow-lg transition-all cursor-pointer ${
                                    isSuccess 
                                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-100" 
                                          : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-100"
                              }`}
                        >
                              {isSuccess ? "Great, Thanks!" : "Try Again"}
                        </button>
                  </Dialog.Content>
            </Dialog.Root>
      );
};

export default StatusDialog;