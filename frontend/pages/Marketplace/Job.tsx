import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../AppContext";
import {
      ArrowLeft,
      ExternalLink,
      CheckCircle2,
      AlertCircle,
      Clock,
      Users,
      Zap,
      ShieldCheck,
      UploadCloud,
      Eye,
      Camera,
      Check,
      FileText,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/contexts/authentication";

import { UserProfile } from "@/types/types";

// Platform structure matching your DB relation schemas
interface Platform {
      name: string;
      logo_url: string;
}

// Full Type definitions strictly aligned with public.jobs PostgreSQL table parameters
interface Job {
      id: string;
      user_id?: string;
      platform_id?: string;
      job_type: string;
      status: string;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      views_count: number;
      total_slots: number;
      filled_slots: number;
      applications_count: number;
      posted_at: string;
      completed_at?: string | null;
      expires_at: string;
      created_at?: string;
      platforms?: Platform;
}

interface PlatformStyle {
      name: string;
      color: string;
      text: string;
      bg: string;
      border: string;
      accent: string;
}

interface User {
      id: string;
      first_name: string;
      isSubscribed: boolean;
}

const PLATFORMSXL: PlatformStyle[] = [
      { name: "TikTok", color: "from-black via-slate-900 to-black", text: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", accent: "rose" },
      { name: "Instagram", color: "from-purple-600 via-pink-500 to-amber-500", text: "text-pink-600", bg: "bg-pink-50/70", border: "border-pink-100", accent: "pink" },
      { name: "Twitter / X", color: "from-slate-950 to-slate-900", text: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", accent: "slate" },
      { name: "YouTube", color: "from-red-600 to-red-700", text: "text-red-600", bg: "bg-red-50", border: "border-red-100", accent: "red" },
      { name: "Telegram", color: "from-blue-500 to-sky-400", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", accent: "blue" }
];

const JobDetail: React.FC = () => {
      
      const [submitted, setSubmitted] = useState<boolean>(false);
      const [uploading, setUploading] = useState<boolean>(false);
      const [job, setJob] = useState<Job>({} as Job);

      const platformInfo = useMemo<PlatformStyle>(() => {
            if (!job || !job.platforms) return PLATFORMSXL[0];
            return PLATFORMSXL.find((p) => p.name.includes(job.platforms?.name || "")) || PLATFORMSXL[0];
      }, [job]);

      const { job_id } = useParams();
      const { profile: user } = useAuth();

      async function GetJob(job_id: string): Promise<void> {
            const { data, error } = await supabase
                  .from("jobs")
                  .select('*, platforms (*)')
                  .eq("id", job_id)
                  .single();

            if (error) {
                  alert(error);
            }

            console.log(data);
            setJob(data);
      }

      useEffect(() => {
            GetJob(job_id as string);
      }, [job_id]);

      const subscribe = (): void => {
            setUploading(true);
            setTimeout(() => {
                  setUploading(false);
                  // setUser(prev => ({ ...prev, isSubscribed: true }));
            }, 1200);
      };

      const handleOnSubmit = async (
            e: React.FormEvent, 
            submitPayload: { proof: string; p_url: string; selectedImage: { img1: { name: string } | null; img2: { name: string } | null } }
      ): Promise<void> => {
            e.preventDefault();
            setUploading(true);

            // Simulating a high-fidelity loading response representing Supabase Upload pipeline
            setTimeout(() => {
                  setUploading(false);
                  setSubmitted(true);
            }, 2000);
      };

      return (
            <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-24 font-sans selection:bg-blue-600 selection:text-white">
                  {uploading && <UploadingState />}

                  {/* Header / Subnavigation breadcrumbs */}
                  {/* <div className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-40 backdrop-blur-md bg-white/90">
                        <div className="max-w-6xl mx-auto flex items-center justify-between">
                              <button 
                                    onClick={() => window.history.back()}
                                    className="flex items-center gap-2 text-xs  text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-100"
                              >
                                    <ArrowLeft size={14} />
                                    <span>Go Back</span>
                              </button>
                              
                              <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs  text-slate-400 uppercase tracking-widest">
                                          Secured Escrow Task
                                    </span>
                              </div>
                        </div>
                  </div> */}

                  <main className="max-w-6xl mx-auto px-4 pt-8 space-y-6">
                        
                        <Header job={job} platformInfo={platformInfo} />

                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                              
                              {/* Main Content Pane */}
                              <div className="lg:col-span-2 space-y-6">
                                    <JobHeroCard job={job} platformInfo={platformInfo} />
                                    <InstructionCard job={job} platformInfo={platformInfo} />
                              </div>

                              {/* Sidebar Audit Submission */}
                              <div className="space-y-6 lg:sticky lg:top-20">
                                    <SideBarForm 
                                          job={job} 
                                          user={user as UserProfile} 
                                          submitted={submitted}
                                          subscribe={subscribe}
                                          handleOnSubmit={handleOnSubmit} 
                                          platformInfo={platformInfo}
                                    />
                              </div>

                        </div>
                  </main>
            </div>
      );
};

interface HeaderProps {
      job: Job;
      platformInfo: PlatformStyle;
}

const Header: React.FC<HeaderProps> = ({ job, platformInfo }) => {
      return (
            <div className="space-y-2">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight leading-none">
                                    {job.title}
                              </h1>
                              <p className="text-xs text-slate-500 font-medium mt-1">
                                    Escrow Contract ID: <span className="font-mono text-slate-700 select-all ">{job.id}</span>
                              </p>
                        </div>

                        <div className="flex items-center gap-2">
                              <span className={`text-[10px]  uppercase tracking-wider px-3 py-1 rounded-full border ${platformInfo.bg} ${platformInfo.text} ${platformInfo.border}`}>
                                    {job.platforms?.name} Verified
                              </span>
                              <span className="text-[10px] bg-blue-50 text-blue-700  uppercase tracking-wider px-3 py-1 rounded-full border border-blue-100">
                                    Active
                              </span>
                        </div>
                  </div>
            </div>
      );
};

interface JobHeroCardProps {
      job: Job;
      platformInfo: PlatformStyle;
}

const JobHeroCard: React.FC<JobHeroCardProps> = ({ job, platformInfo }) => {
      const progressPercent = Math.min(100, Math.floor((job.filled_slots / job.total_slots) * 100));

      return (
            <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden p-6 md:p-8 space-y-6 relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                        <div className={`p-3 h-14 w-14 rounded-2xl text-white bg-gradient-to-tr ${platformInfo.color} overflow-hidden shadow-inner flex items-center justify-center shrink-0`}>
                              <img 
                                    src={job.platforms?.logo_url || "https://placehold.co/100x100"} 
                                    className="h-full w-full object-cover rounded-lg" 
                                    alt="Platform Logo"
                              />
                        </div>
                        <div>
                              <span className="block text-xs font-semibold text-slate-400 uppercase">Wages Collateralized</span>
                              <h3 className="text-lg font-semibold text-slate-900">Multi-Sig Escrow Shield</h3>
                        </div>
                  </div>

                  <div className="space-y-2">
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                              {job.description}
                        </p>
                  </div>

                  {/* Grid Specs from public.jobs schema */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400  uppercase tracking-wider mb-1">Guaranteed Payout</span>
                              <span className="text-base font-black text-slate-900 font-mono">
                                    {job.payout_currency === "NGN" ? "₦" : "$"}{job.payout_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400  uppercase tracking-wider mb-1">Total Available Slots</span>
                              <span className="text-base font-black text-slate-900 font-mono">{job.total_slots} Slots</span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400  uppercase tracking-wider mb-1">Earners Completed</span>
                              <span className="text-base font-black text-slate-900 font-mono">{job.filled_slots} Slots</span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              <span className="block text-[10px] text-slate-400  uppercase tracking-wider mb-1">Task Views</span>
                              <span className="text-base font-black text-slate-900 font-mono flex items-center gap-1">
                                    <Eye size={14} className="text-slate-400" />
                                    <span>{job.views_count}</span>
                              </span>
                        </div>
                  </div>

                  <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                              <span className="flex items-center gap-1.5">
                                    <Users size={14} className="text-slate-400" />
                                    <span>Slots Utilization</span>
                              </span>
                              <span className=" text-slate-800">{progressPercent}% Filled</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                              />
                        </div>
                  </div>
            </div>
      );
};

interface InstructionCardProps {
      job: Job;
      platformInfo: PlatformStyle;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ job, platformInfo }) => {
      return (
            <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                              <FileText size={18} />
                        </div>
                        <h3 className="text-base  text-slate-950">
                              Earners Audit Requirements
                        </h3>
                  </div>

                  <div className="space-y-4">
                        
                        {/* Step 1 */}
                        <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                                    01
                              </div>
                              <div className="space-y-1.5 flex-1 pt-1">
                                    <h4 className="text-xs  text-slate-900 uppercase tracking-wide">Perform Social Operation</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                          Navigate directly to the platform target landing point and complete the physical task (e.g. follow, like, join, or leave a review comment).
                                    </p>
                                    <a 
                                          href={job.target_url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-tr ${platformInfo.color} text-white text-xs  rounded-xl hover:opacity-90 transition-all shadow-md mt-1`}
                                    >
                                          <span>Go to task link ({job.platforms?.name})</span>
                                          <ExternalLink size={12} />
                                    </a>
                              </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                                    02
                              </div>
                              <div className="space-y-2 flex-1 pt-1">
                                    <h4 className="text-xs  text-slate-900 uppercase tracking-wide">Document proof of completion</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                          Take the required screenshots detailing the process before and after completion based on the instructions.
                                    </p>
                                    
                                    <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl space-y-1.5 text-xs text-amber-900">
                                          <span className=" flex items-center gap-1.5">
                                                <AlertCircle size={14} className="text-amber-600" />
                                                <span>Verification Rules:</span>
                                          </span>
                                          <p className="leading-relaxed font-medium whitespace-pre-wrap">{job.proof_instructions}</p>
                                    </div>
                              </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shrink-0">
                                    03
                              </div>
                              <div className="space-y-1.5 flex-1 pt-1">
                                    <h4 className="text-xs  text-slate-900 uppercase tracking-wide">Submit Verification Details</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                          Enter your social user handle/ID and attach the documented screenshot evidence inside the sidebar form on this page to trigger your payout review.
                                    </p>
                              </div>
                        </div>

                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center gap-3.5">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 shrink-0">
                              <ShieldCheck size={18} />
                        </div>
                        <div>
                              <h4 className="text-xs  text-slate-900 leading-none">Instant Escrow Release Shield</h4>
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                    Your payment is fully locked in escrow. Submissions are checked and approved by system verification parameters or human review within 24 hours.
                              </p>
                        </div>
                  </div>
            </div>
      );
};

interface SideBarFormProps {
      job: Job;
      user: UserProfile;
      submitted: boolean;
      subscribe: () => void;
      handleOnSubmit: (
            e: React.FormEvent, 
            submitPayload: { proof: string; p_url: string; selectedImage: { img1: { name: string } | null; img2: { name: string } | null } }
      ) => Promise<void>;
      platformInfo: PlatformStyle;
}

const SideBarForm: React.FC<SideBarFormProps> = ({ 
      job, 
      user, 
      submitted, 
      subscribe, 
      handleOnSubmit, 
      platformInfo 
}) => {
      const [proof, setProof] = useState<string>("");
      const [selectedImage1, setSelectedImage1] = useState<string | null>(null);
      const [selectedImage2, setSelectedImage2] = useState<string | null>(null);

      const [image1File, setImage1File] = useState<File | null>(null);
      const [image2File, setImage2File] = useState<File | null>(null);

      const handleFileChange1 = (e: React.ChangeEvent<HTMLInputElement>): void => {
            if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setSelectedImage1(URL.createObjectURL(file));
                  setImage1File(file);
            }
      };

      const handleFileChange2 = (e: React.ChangeEvent<HTMLInputElement>): void => {
            if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setSelectedImage2(URL.createObjectURL(file));
                  setImage2File(file);
            }
      };

      const isFormValid = useMemo<boolean>(() => {
            if (!proof.trim()) return false;
            if (job.requires_screenshot && !selectedImage1) return false;
            if (job.requires_before_proof && !selectedImage2) return false;
            return true;
      }, [proof, selectedImage1, selectedImage2, job]);

      // State check: Non-Subscribed Member View
      if (!user.is_subscribed) {
            return (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/60 text-center space-y-6">
                        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                              <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-2">
                              <h3 className="text-base  text-slate-900">
                                    Membership Required
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed px-2">
                                    You must be an active subscriber to begin earning from micro-tasks. Join the premium Earners Club today!
                              </p>
                        </div>
                        <button
                              onClick={subscribe}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full transition-all shadow-md shadow-blue-600/10 text-sm cursor-pointer"
                        >
                              Subscribe for ₦5,000 / month
                        </button>
                  </div>
            );
      }

      // State check: Successful Submission Output View
      if (submitted) {
            return (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/60 text-center space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                              <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                              <h3 className="text-base  text-slate-900">
                                    Proof Submitted!
                              </h3>
                              <p className="text-xs text-slate-500 leading-relaxed px-2">
                                    Your verification proof has been securely recorded. You will receive ₦{job.payout_amount} directly in your wallet once confirmed.
                              </p>
                        </div>
                        <button
                              onClick={() => (window.location.hash = "#/marketplace")}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-full  transition-all text-xs cursor-pointer"
                        >
                              Find More Jobs
                        </button>
                  </div>
            );
      }

      return (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/60 space-y-6">
                  <div className="border-b border-slate-50 pb-4">
                        <h3 className="text-base  text-slate-900">
                              Submit Task Proof
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                              Review guidelines, enter your verification handle, and upload your visual logs below.
                        </p>
                  </div>

                  <form 
                        onSubmit={(e) => handleOnSubmit(e, { 
                              proof, 
                              p_url: job.target_url, 
                              selectedImage: { 
                                    img1: image1File ? { name: image1File.name } : null, 
                                    img2: image2File ? { name: image2File.name } : null 
                              } 
                        })} 
                        className="space-y-5"
                  >
                        
                        <div className="space-y-2">
                              <label className="block text-xs  text-slate-700 uppercase tracking-wider">
                                    Your Account URL Handle
                              </label>
                              <input
                                    type="text"
                                    required
                                    placeholder="e.g. https://instagram.com/username"
                                    value={proof}
                                    onChange={(e) => setProof(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs font-medium text-slate-800 transition-all"
                              />
                        </div>

                        {/* Interactive File Selectors */}
                        {job.requires_screenshot && (
                              <div className="space-y-4 pt-1">
                                    
                                    {job.requires_before_proof && (
                                          <div className="space-y-2">
                                                <span className="block text-xs text-slate-700 uppercase tracking-wider">
                                                      1. Screenshot (Before Task)
                                                </span>
                                                
                                                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all group min-h-[90px]">
                                                      <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={handleFileChange2}
                                                      />
                                                      {selectedImage2 ? (
                                                            <div className="flex items-center gap-3 w-full">
                                                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                                                        <img src={selectedImage2} className="w-full h-full object-cover" alt="Preview Before" />
                                                                  </div>
                                                                  <div className="min-w-0 flex-1">
                                                                        <p className="text-[11px]  text-slate-800 truncate">{image2File?.name}</p>
                                                                        <p className="text-[9px] text-emerald-600  flex items-center gap-1 mt-0.5">
                                                                              <Check size={10} /> Ready to submit
                                                                        </p>
                                                                  </div>
                                                            </div>
                                                      ) : (
                                                            <div className="flex flex-col items-center justify-center text-center">
                                                                  <Camera size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                                                                  <span className="text-[12px] text-slate-700">Attach initial snapshot</span>
                                                                  <span className="text-[9px] text-slate-400 mt-0.5">JPEG, PNG up to 5MB</span>
                                                            </div>
                                                      )}
                                                </label>
                                          </div>
                                    )}

                                    <div className="space-y-2">
                                          <span className="block text-xs  text-slate-700 uppercase tracking-wider">
                                                {job.requires_before_proof ? "2. Screenshot (After Completion)" : "Screenshot Proof"}
                                          </span>

                                          <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-slate-50/50 rounded-xl cursor-pointer transition-all group min-h-[90px]">
                                                <input 
                                                      type="file" 
                                                      accept="image/*" 
                                                      className="hidden" 
                                                      onChange={handleFileChange1}
                                                      required
                                                />
                                                {selectedImage1 ? (
                                                      <div className="flex items-center gap-3 w-full">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                                                  <img src={selectedImage1} className="w-full h-full object-cover" alt="Preview Proof" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                  <p className="text-[12px] text-slate-800 truncate">{image1File?.name}</p>
                                                                  <p className="text-[9px] text-emerald-600  flex items-center gap-1 mt-0.5">
                                                                        <Check size={10} /> Ready to submit
                                                                  </p>
                                                            </div>
                                                      </div>
                                                ) : (
                                                      <div className="flex flex-col items-center justify-center text-center">
                                                            <UploadCloud size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors mb-1.5" />
                                                            <span className="text-[12px] text-slate-700">Upload proof image</span>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG up to 5MB</span>
                                                      </div>
                                                )}
                                          </label>
                                    </div>

                              </div>
                        )}

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex items-center gap-2.5">
                              {job.auto_approve ? (
                                    <>
                                          <Zap size={14} className="text-emerald-500 shrink-0" />
                                          <span className="text-[12px] text-slate-500 leading-none">Instant auto-approvals configured</span>
                                    </>
                              ) : (
                                    <>
                                          <Clock size={14} className="text-indigo-500 shrink-0" />
                                          <span className="text-[12px] text-slate-500 leading-none">Manually audited • 24h SLA</span>
                                    </>
                              )}
                        </div>

                        <button
                              type="submit"
                              disabled={!isFormValid}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3.5 rounded-full text-sm transition-all shadow-md shadow-blue-600/10 cursor-pointer text-center"
                        >
                              Finish & Submit Task
                        </button>

                  </form>
            </div>
      );
};

const UploadingState: React.FC = () => {
      return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2200] flex items-center justify-center">
                  <div className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl border border-slate-100 flex flex-col items-center justify-center space-y-4">
                        <div className="relative flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                              <UploadCloud className="absolute text-blue-600" size={18} />
                        </div>
                        <div className="text-center space-y-1">
                              <h4 className="text-sm  text-slate-900">Uploading Assets</h4>
                              <p className="text-[10px] text-slate-400">Verifying file metadata structure...</p>
                        </div>
                  </div>
            </div>
      );
};

export default JobDetail;