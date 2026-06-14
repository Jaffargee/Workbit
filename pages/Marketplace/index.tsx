// import React, { useEffect, useMemo, useState } from "react";
// import { PLATFORMS } from "../../constants";
// import {
//       Search,
//       Filter,
//       Clock,
//       Users,
//       ArrowRight,
//       CheckCircle2,
//       FileText,
//       Zap,
//       ImageIcon,
//       MousePointerClick,
// } from "lucide-react";
// import { Job, Platform } from "../../types/types";
// import { supabase } from "@/server/supabase";
// import { useNavigate } from "react-router-dom";
// import { WCard } from '@/components/Card';

// const Marketplace: React.FC = () => {

//       const [filter, setFilter] = useState<Platform | "All">("All");
//       const [searchTerm, setSearchTerm] = useState("");
//       const [selectedJob, setSelectedJob] = useState<any | null>(null);
//       const [proof, setProof] = useState("");
//       const [submitted, setSubmitted] = useState(false);
//       const [loading, setLoading] = useState<boolean>(false);

//       const [jobs, setJobs] = useState<Job[]>([]);

//       const filteredJobs = jobs.filter((job) => {
//             const matchesPlatform = filter === "All" || job.platforms.name === filter;
//             const matchesSearch = job.title
//                   .toLowerCase()
//                   .includes(searchTerm.toLowerCase());
//             return matchesPlatform && matchesSearch;
//       });

//       const handleSubmitProof = (e: React.FormEvent) => {
//             e.preventDefault();
//             if (!proof) return;
//             submitProof({ jobId: selectedJob.id, proofData: proof });
//             setSubmitted(true);
//             setTimeout(() => {
//                   setSelectedJob(null);
//                   setSubmitted(false);
//                   setProof("");
//             }, 2000);
//       };

//       useEffect(() => {

//             async function fetchJobs() {
//                   setLoading(true);
//                   try {
//                         const { data, error } = await supabase.from('jobs').select('*, platforms (*)');
//                         if (error) {
//                               alert('Error');
//                               console.log(error);
//                         }
//                         setJobs(data as any);
//                   } catch (error) {
//                         console.log(error);
//                   } finally {
//                         setLoading(false);
//                   }
//             }

//             fetchJobs();

//       }, [])

//       return (
//             <div className="space-y-8 pb-20 px-2 py-2">

//                   <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
//                         <div className="relative w-full md:w-96">
//                               <Search
//                                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                                     size={18}
//                               />
//                               <input
//                                     type="text"
//                                     placeholder="Search jobs..."
//                                     value={searchTerm}
//                                     onChange={(e) =>
//                                           setSearchTerm(e.target.value)
//                                     }
//                                     className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
//                               />
//                         </div>
//                         <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
//                               <button
//                                     onClick={() => setFilter("All")}
//                                     className={`px-6 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${filter === "All" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
//                               >
//                                     All Platforms
//                               </button>
//                               {PLATFORMS.map((p) => (
//                                     <PlatformPill key={p.name} icon={p.icon} label={p.name} active={filter === p.name} onClick={() => setFilter(p.name)} />
//                               ))}
//                         </div>
//                   </div>

//                   {
//                         loading ? (
//                               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
//                                     {Array.from({ length: 6 }).map((_, i) => (
//                                           <SkeletonCard key={i} />
//                                     ))}
//                               </div>
//                          ) : (
//                               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//                                     {filteredJobs.map((job) => (
//                                           <JobCard key={job.id} job={job} onClick={() => {}} />
//                                     ))}
//                               </div>
//                         )
//                   }

//                   {/* Modal for Job Details */}
//                   <Modal selectedJob={selectedJob} user={user} submitted={submitted} setSelectedJob={setSelectedJob} subscribe={subscribe} setProof={setProof} handleSubmitProof={handleSubmitProof} proof={proof} />
//             </div>
//       );
// };

// const Modal = ({ selectedJob, user, submitted, setSelectedJob, subscribe, setProof, handleSubmitProof, proof }: { selectedJob: any, user: any, submitted: any, setSelectedJob: any, subscribe: any, setProof: any, handleSubmitProof: any, proof: any }) => {
//       return selectedJob
//       && (
//             <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
//                   <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
//                         {!user?.isSubscribed ? (
//                               <div className="p-10 text-center space-y-6">
//                                     <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
//                                           <Filter size={40} />
//                                     </div>
//                                     <h3 className="text-2xl font-bold text-slate-900">
//                                           Subscription Required
//                                     </h3>
//                                     <p className="text-slate-500 max-w-sm mx-auto">
//                                           You must be an active
//                                           subscriber (₦5,000/year)
//                                           to perform tasks and earn
//                                           money.
//                                     </p>
//                                     <div className="flex gap-3 pt-4">
//                                           <button
//                                                 onClick={() =>
//                                                       setSelectedJob(
//                                                             null,
//                                                       )
//                                                 }
//                                                 className="flex-1 border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
//                                           >
//                                                 Cancel
//                                           </button>
//                                           <button
//                                                 onClick={() => {
//                                                       subscribe();
//                                                       setSelectedJob(
//                                                             null,
//                                                       );
//                                                 }}
//                                                 className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
//                                           >
//                                                 Subscribe Now
//                                           </button>
//                                     </div>
//                               </div>
//                         ) : submitted ? (
//                               <div className="p-10 text-center space-y-4">
//                                     <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
//                                           <CheckCircle2 size={40} />
//                                     </div>
//                                     <h3 className="text-2xl font-bold text-slate-900">
//                                           Proof Submitted!
//                                     </h3>
//                                     <p className="text-slate-500">
//                                           Your submission has been
//                                           sent to the creator for
//                                           review. You'll be credited
//                                           once approved.
//                                     </p>
//                               </div>
//                         ) : (
//                               <div className="flex flex-col h-full">
//                                     <div className="p-8 border-b border-slate-100 flex justify-between items-center">
//                                           <div>
//                                                 <h3 className="text-2xl font-bold text-slate-900">
//                                                       {
//                                                             selectedJob.title
//                                                       }
//                                                 </h3>
//                                                 <p className="text-blue-600 font-semibold">
//                                                       Reward: ₦
//                                                       {
//                                                             selectedJob.payout_amount
//                                                       }
//                                                 </p>
//                                           </div>
//                                           <button
//                                                 onClick={() =>
//                                                       setSelectedJob(
//                                                             null,
//                                                       )
//                                                 }
//                                                 className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
//                                           >
//                                                 <ArrowRight
//                                                       size={24}
//                                                       className="rotate-180"
//                                                 />
//                                           </button>
//                                     </div>
//                                     <div className="p-8 overflow-y-auto max-h-[60vh] space-y-8 scrollbar-hide">
//                                           <div className="space-y-3">
//                                                 <h4 className="font-bold text-slate-800 flex items-center gap-2">
//                                                       <Clock
//                                                             size={
//                                                                   18
//                                                             }
//                                                       />{" "}
//                                                       Instructions
//                                                 </h4>
//                                                 <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed whitespace-pre-wrap border border-slate-100">
//                                                       {
//                                                             selectedJob.description
//                                                       }
//                                                 </div>
//                                           </div>
//                                           <div className="space-y-3">
//                                                 <h4 className="font-bold text-slate-800 flex items-center gap-2">
//                                                       <Users
//                                                             size={
//                                                                   18
//                                                             }
//                                                       />{" "}
//                                                       Required Proof
//                                                 </h4>
//                                                 <p className="text-slate-500 text-sm italic">
//                                                       {
//                                                             selectedJob.proof_instruction
//                                                       }
//                                                 </p>
//                                           </div>
//                                           <form
//                                                 onSubmit={
//                                                       handleSubmitProof
//                                                 }
//                                                 className="space-y-4"
//                                           >
//                                                 <label className="block space-y-2">
//                                                       <span className="text-sm font-bold text-slate-800">
//                                                             Submit
//                                                             Your
//                                                             Proof
//                                                       </span>
//                                                       <textarea
//                                                             required
//                                                             placeholder="Link, Username, or describe your screenshot..."
//                                                             className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500 min-h-[120px]"
//                                                             value={
//                                                                   proof
//                                                             }
//                                                             onChange={(
//                                                                   e,
//                                                             ) =>
//                                                                   setProof(
//                                                                         e
//                                                                               .target
//                                                                               .value,
//                                                                   )
//                                                             }
//                                                       />
//                                                 </label>
//                                                 <button
//                                                       type="submit"
//                                                       className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
//                                                 >
//                                                       Submit Proof
//                                                 </button>
//                                           </form>
//                                     </div>
//                               </div>
//                         )}
//                   </div>
//             </div>
//       );
// }

// const JobCard = ({ job, onClick }: { job: Job, onClick: () => void }) => {
//       const PLATFORMS = [
//             { id: "p1", name: "TikTok", color: "from-black via-slate-900 to-black", text: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100", logo_url: "https://placehold.co/100x100/000000/ffffff?text=TikTok" },
//             { id: "p2", name: "Instagram", color: "from-purple-600 via-pink-500 to-amber-500", text: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", logo_url: "https://placehold.co/100x100/E1306C/ffffff?text=Insta" },
//             { id: "p3", name: "Twitter / X", color: "from-slate-900 to-slate-950", text: "text-slate-900", bg: "bg-slate-100", border: "border-slate-200", logo_url: "https://placehold.co/100x100/1DA1F2/ffffff?text=X" },
//             { id: "p4", name: "YouTube", color: "from-red-600 to-red-700", text: "text-red-600", bg: "bg-red-50", border: "border-red-100", logo_url: "https://placehold.co/100x100/FF0000/ffffff?text=YT" },
//             { id: "p5", name: "Telegram", color: "from-blue-400 to-blue-500", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", logo_url: "https://placehold.co/100x100/2481cc/ffffff?text=TG" }
//       ];

//       const navigate = useNavigate();

//       const isCompleted = job.status === "COMPLETED";
//       const progressPercent = Math.min(100, Math.floor((job.filled_slots / job.total_slots) * 100));

//       // Determine platform style characteristics dynamically
//       const platformMeta = useMemo(() => {
//       return PLATFORMS.find(p => p.name === job.platforms?.name) || {
//             color: "from-blue-600 to-indigo-600",
//             text: "text-blue-600",
//             bg: "bg-blue-50",
//             border: "border-blue-100"
//       };
//       }, [job.platforms?.name]);

//       return (
//             <div
//                   onClick={onClick}
//                   className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/[0.04] hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full ${
//                   isCompleted ? "border-slate-100 opacity-80" : "border-slate-200/80 hover:border-blue-500/40"
//                   }`}
//             >

//                   {/* Top Brand Banner Header */}
//                   <div className="p-5 pb-4 border-b border-slate-50 space-y-3">
//                         <div className="flex items-center justify-between gap-3">
//                               <div className="flex items-center gap-3 min-w-0">
//                                     {/* Logo box */}
//                                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${platformMeta.color} text-white shadow-inner font-black text-sm p-1 shrink-0 overflow-hidden`}>
//                                     <img  src={job.platforms?.logo_url || "https://placehold.co/100x100"}  alt={job.platforms?.name} className="w-full h-full object-cover rounded-lg"
//                                           // onError={(e) => {
//                                           //       e.target.onerror = null;
//                                           //       e.target.src = `https://placehold.co/100x100?text=${job.platforms?.name[0]}`;
//                                           // }}
//                                     />
//                                     </div>

//                                     <div className="min-w-0">
//                                           <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${platformMeta.bg} ${platformMeta.text} ${platformMeta.border} border`}>
//                                                 {job.platforms?.name || "Social Task"}
//                                           </span>
//                                     </div>
//                               </div>

//                               {/* Quick status pill */}
//                               <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
//                                     isCompleted
//                                     ? "bg-slate-50 border-slate-200 text-slate-500"
//                                     : "bg-emerald-500/10 border-emerald-500/15 text-emerald-600 animate-pulse"
//                               }`}>
//                                     {isCompleted ? "Filled" : "Active"}
//                               </span>
//                         </div>

//                         {/* Dynamic task category badge */}
//                         <div className="flex items-center gap-1.5 text-xs text-slate-500">
//                               <MousePointerClick size={12} className="text-slate-400" />
//                               <span className="font-semibold text-slate-600 capitalize">
//                                     {job.job_type.toLowerCase()} Task
//                               </span>
//                               <span className="text-slate-300">•</span>
//                               <Clock size={12} className="text-slate-400" />
//                               <span className="text-[10px]">
//                                     {new Date(job.posted_at as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
//                               </span>
//                         </div>
//                   </div>

//                   {/* Card Core Content Section */}
//                   <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
//                         <div className="space-y-2">
//                               <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
//                                     {job.title}
//                               </h3>
//                               <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
//                                     {job.description}
//                               </p>
//                         </div>

//                         {/* Verification Badges Grid ( screenshot required / auto-approve ) */}
//                         <div className="flex flex-wrap gap-1.5 pt-1">
//                               {job.requires_screenshot && (
//                                     <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-50/50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100/30">
//                                           <ImageIcon size={10} />
//                                           <span>Requires Proof</span>
//                                     </div>
//                               )}
//                               {job.requires_before_proof && (
//                                     <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100/30">
//                                           <FileText size={10} />
//                                           <span>Before/After Proof</span>
//                                     </div>
//                               )}
//                               {job.auto_approve && (
//                                     <div className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100/30">
//                                           <Zap size={10} />
//                                           <span>Auto-Approve</span>
//                                     </div>
//                               )}
//                         </div>

//                         {/* Dynamic Progress / Slots Visualizer */}
//                         <div className="space-y-1.5">
//                               <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
//                                     <span className="flex items-center gap-1">
//                                           <Users size={12} className="text-slate-400" />
//                                           <span>Slots Filled</span>
//                                     </span>
//                                     <span className="font-bold text-slate-700">
//                                           {job.filled_slots} <span className="text-slate-400 font-medium">/ {job.total_slots}</span>
//                                     </span>
//                               </div>

//                               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                                     <div
//                                     className={`h-full rounded-full transition-all duration-500 ${
//                                     isCompleted
//                                           ? "bg-slate-300"
//                                           : progressPercent > 85
//                                           ? "bg-rose-500"
//                                           : "bg-gradient-to-r from-blue-500 to-indigo-500"
//                                     }`}
//                                     style={{ width: `${progressPercent}%` }}
//                                     />
//                               </div>
//                         </div>
//                   </div>

//                   {/* Compact Interactive Payout Row / Action Button */}
//                   <div className="bg-slate-50/75 p-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
//                         <div>
//                               <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
//                                     Settle Payout
//                               </span>
//                               <span className="text-sm font-black text-slate-900 font-mono">
//                                     {job.payout_currency === "NGN" ? "₦" : "$"}{job.payout_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                               </span>
//                         </div>

//                         <button disabled={isCompleted} onClick={() => navigate(`/marketplace/${job.id}`)}
//                               className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm group/btn cursor-pointer ${
//                                     isCompleted
//                                     ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
//                                     : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/15"
//                               }`}
//                         >
//                               <span>{isCompleted ? "Filled" : "Start"}</span>
//                               <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
//                         </button>
//                   </div>

//             </div>
//       );
// };

// export default Marketplace;

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const PlatformPill = ({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active: boolean; onClick: () => void; }) => (
//       <button
//             onClick={onClick}
//             className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2
//                   ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}
//       >
//             {icon} {label}
//       </button>
// );

// const SkeletonCard = () => (
//       <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4 animate-pulse">
//             <div className="flex justify-between">
//                   <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
//                   <div className="w-16 h-6 bg-slate-100 rounded-full" />
//             </div>
//             <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
//             <div className="h-3 bg-slate-100 rounded w-full" />
//             <div className="h-3 bg-slate-100 rounded w-2/3" />
//             <div className="grid grid-cols-2 gap-3">
//                   <div className="h-16 bg-slate-100 rounded-xl" />
//                   <div className="h-16 bg-slate-100 rounded-xl" />
//             </div>
//             <div className="h-10 bg-slate-100 rounded-full" />
//       </div>
// );

// const EmptyState = ({
//   searchTerm, platformFilter,
// }: {
//   searchTerm: string; platformFilter: string;
// }) => (
//   <div className="flex flex-col items-center justify-center py-20 space-y-3">
//     <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
//       <Search size={24} className="text-slate-400" />
//     </div>
//     <h3 className="text-lg font-bold text-slate-800">No jobs found</h3>
//     <p className="text-sm text-slate-400 text-center max-w-xs">
//       {searchTerm
//         ? `No jobs match "${searchTerm}".`
//         : platformFilter !== 'All'
//           ? `No active jobs for ${platformFilter} right now.`
//           : 'No active jobs available at the moment. Check back soon.'
//       }
//     </p>
//   </div>
// );

import React, { useEffect, useMemo, useState } from 'react';
import { PLATFORMS } from '../../constants';
import { Job, Platform } from '../../types/types';
import { supabase } from '@/server/supabase';
import { useNavigate } from 'react-router-dom';

import {
      // Layout & surface
      makeStyles,
      shorthands,
      tokens,
      // Components
      Avatar,
      Badge,
      Button,
      Dialog,
      DialogActions,
      DialogBody,
      DialogContent,
      DialogSurface,
      DialogTitle,
      DialogTrigger,
      Field,
      Input,
      ProgressBar,
      SearchBox,
      Skeleton,
      SkeletonItem,
      Spinner,
      Tab,
      TabList,
      Text,
      Textarea,
      Tooltip,
      // Icons (Fluent System Icons — bundled with v9)
      // You can swap these for any @fluentui/react-icons exports
} from '@fluentui/react-components';

import {
      CheckmarkCircle24Regular,
      ArrowRight16Regular,
      Camera16Regular,
      DocumentMultiple16Regular,
      Flash16Regular,
      People16Regular,
      LockClosed20Regular,
      CalendarLtr12Regular,
      CursorClickRegular as CursorClickRegular,
} from '@fluentui/react-icons';
import { useAuth } from '@/contexts/authentication';

// ─── Styles (makeStyles — Griffel CSS-in-JS, zero-runtime) ────────────────────

const useStyles = makeStyles({
      root: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalL,
            paddingBottom: tokens.spacingVerticalXXXL,
            paddingTop: tokens.spacingVerticalS,
            paddingLeft: tokens.spacingHorizontalS,
            paddingRight: tokens.spacingHorizontalS,
      },

      // ── Command / filter bar ──────────────────────────────────────────────
      commandBar: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            '@media (min-width: 768px)': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  columnGap: tokens.spacingHorizontalM,
            },
      },
      searchBox: {
            width: '100%',
            '@media (min-width: 768px)': {
                  maxWidth: '340px',
            },
      },
      tabListWrap: {
            overflowX: 'auto',
            // hide scrollbar cross-browser
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
      },

      // ── Grid ─────────────────────────────────────────────────────────────
      grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: tokens.spacingHorizontalM,
      },

      // ── Job card ─────────────────────────────────────────────────────────
      card: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            // boxShadow: tokens.shadow2,
            overflow: 'hidden',
            cursor: 'pointer',
            transition:
                  'box-shadow 0.15s ease, transform 0.12s ease, border-color 0.15s ease',
            ':hover': {
                  boxShadow: tokens.shadow16,
                  transform: 'translateY(-2px)',
                  borderColor: tokens.colorBrandStroke1,
            },
      },
      cardCompleted: {
            opacity: 0.65,
            cursor: 'default',
            ':hover': {
                  boxShadow: tokens.shadow4,
                  transform: 'none',
                  borderColor: tokens.colorNeutralStroke2,
            },
      },
      cardHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            columnGap: tokens.spacingHorizontalS,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      },
      cardHeaderInfo: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2px',
            flex: 1,
            minWidth: 0,
      },
      platformName: {
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground3,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
      },
      jobTitle: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorNeutralForeground1,
            lineHeight: tokens.lineHeightBase300,
            // two-line clamp
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
      },
      cardBody: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
            flex: 1,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
      },
      description: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            lineHeight: tokens.lineHeightBase200,
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
      },
      badgeRow: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacingHorizontalXS,
      },
      progressMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: tokens.fontSizeBase100,
            color: tokens.colorNeutralForeground3,
            marginBottom: tokens.spacingVerticalXS,
      },
      cardFooter: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
            borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
            backgroundColor: tokens.colorNeutralBackground2,
      },
      payoutBlock: {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2px',
      },
      payoutLabel: {
            fontSize: tokens.fontSizeBase100,
            fontWeight: tokens.fontWeightSemibold,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: tokens.colorNeutralForeground3,
      },
      payoutValue: {
            fontSize: tokens.fontSizeBase400,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            fontVariantNumeric: 'tabular-nums',
      },

      // ── Modal ─────────────────────────────────────────────────────────────
      modalReward: {
            fontSize: tokens.fontSizeBase300,
            fontWeight: tokens.fontWeightSemibold,
            color: tokens.colorBrandForeground1,
      },
      infoBox: {
            backgroundColor: tokens.colorNeutralBackground2,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalS,
                  tokens.spacingHorizontalM
            ),
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground1,
            lineHeight: tokens.lineHeightBase300,
            whiteSpace: 'pre-wrap',
      },
      proofInstruction: {
            fontSize: tokens.fontSizeBase200,
            color: tokens.colorNeutralForeground3,
            fontStyle: 'italic',
      },
      successPanel: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            ...shorthands.padding(
                  tokens.spacingVerticalXXL,
                  tokens.spacingHorizontalXL
            ),
            rowGap: tokens.spacingVerticalM,
            textAlign: 'center',
      },

      // ── Skeleton card ─────────────────────────────────────────────────────
      skeletonCard: {
            backgroundColor: tokens.colorNeutralBackground1,
            ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
            borderRadius: tokens.borderRadiusMedium,
            ...shorthands.padding(
                  tokens.spacingVerticalM,
                  tokens.spacingHorizontalM
            ),
            display: 'flex',
            flexDirection: 'column',
            rowGap: tokens.spacingVerticalS,
      },

      // ── Empty state ───────────────────────────────────────────────────────
      emptyState: {
            gridColumn: '1 / -1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            ...shorthands.padding(tokens.spacingVerticalXXXL),
            rowGap: tokens.spacingVerticalS,
            color: tokens.colorNeutralForeground3,
      },
});

// ─── Platform meta helper ─────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
      TikTok: '#010101',
      Instagram: '#E1306C',
      'Twitter / X': '#1DA1F2',
      YouTube: '#FF0000',
      Telegram: '#2481cc',
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Marketplace: React.FC = () => {
      const styles = useStyles();
      // const { user, subscribe, submitProof } = useApp();

      const { profile: user } = useAuth();

      const [filter, setFilter] = useState<Platform | 'All'>('All');
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedJob, setSelectedJob] = useState<Job | null>(null);
      const [proof, setProof] = useState('');
      const [submitted, setSubmitted] = useState(false);
      const [loading, setLoading] = useState(false);
      const [jobs, setJobs] = useState<Job[]>([]);

      const filteredJobs = jobs.filter((job) => {
            const matchesPlatform =
                  filter === 'All' || job.platforms.name === filter;
            const matchesSearch = job.title
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
            return matchesPlatform && matchesSearch;
      });

      const handleSubmitProof = () => {
            if (!proof || !selectedJob) return;
            // submitProof({ jobId: selectedJob.id, proofData: proof });
            setSubmitted(true);
            setTimeout(() => {
                  setSelectedJob(null);
                  setSubmitted(false);
                  setProof('');
            }, 2000);
      };

      useEffect(() => {
            async function fetchJobs() {
                  setLoading(true);
                  try {
                        const { data, error } = await supabase
                              .from('jobs')
                              .select('*, platforms (*)');
                        if (error) {
                              console.error(error);
                        } else {
                              setJobs(data as Job[]);
                        }
                  } catch (err) {
                        console.error(err);
                  } finally {
                        setLoading(false);
                  }
            }
            fetchJobs();
      }, []);

      return (
            <div className={styles.root}>
                  {/* ── Command bar ── */}
                  <div className={styles.commandBar}>
                        <SearchBox
                              className={styles.searchBox}
                              placeholder="Search jobs…"
                              value={searchTerm}
                              onChange={(_, d) => setSearchTerm(d.value)}
                              size="medium"
                        />

                        <div className={styles.tabListWrap}>
                              <TabList
                                    selectedValue={filter}
                                    onTabSelect={(_, d) =>
                                          setFilter(d.value as Platform | 'All')
                                    }
                                    size="medium"
                              >
                                    <Tab value="All">All Platforms</Tab>
                                    {PLATFORMS.map((p) => (
                                          <Tab
                                                key={p.name}
                                                value={p.name}
                                                icon={p.icon}
                                          >
                                                {p.name}
                                          </Tab>
                                    ))}
                              </TabList>
                        </div>
                  </div>

                  {/* ── Grid ── */}
                  <div className={styles.grid}>
                        {loading ? (
                              Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonJobCard key={i} />
                              ))
                        ) : filteredJobs.length === 0 ? (
                              <EmptyState
                                    searchTerm={searchTerm}
                                    platformFilter={filter}
                              />
                        ) : (
                              filteredJobs.map((job) => (
                                    <JobCard
                                          key={job.id}
                                          job={job}
                                          onClick={() => setSelectedJob(job)}
                                    />
                              ))
                        )}
                  </div>
            </div>
      );
};

// ─── Job Card ─────────────────────────────────────────────────────────────────

const JobCard: React.FC<{ job: Job; onClick: () => void }> = ({
      job,
      onClick,
}) => {
      const styles = useStyles();
      const navigate = useNavigate();

      const isCompleted = job.status === 'COMPLETED';
      const progressPercent = Math.min(
            100,
            Math.floor((job.filled_slots / job.total_slots) * 100)
      );
      const accentColor =
            PLATFORM_COLORS[job.platforms?.name] ?? tokens.colorBrandBackground;

      return (
            <article
                  className={`${styles.card} ${isCompleted ? styles.cardCompleted : ''}`}
                  onClick={!isCompleted ? onClick : undefined}
                  role={!isCompleted ? 'button' : undefined}
                  tabIndex={!isCompleted ? 0 : undefined}
                  onKeyDown={
                        !isCompleted
                              ? (e) => e.key === 'Enter' && onClick()
                              : undefined
                  }
            >
                  {/* Header */}
                  <div className={styles.cardHeader}>
                        <Avatar
                              size={36}
                              image={{ src: job.platforms?.logo_url }}
                              name={job.platforms?.name}
                              style={{ borderRadius: tokens.borderRadiusSmall }}
                              color="colorful"
                        />

                        <div className={styles.cardHeaderInfo}>
                              <Text className={styles.platformName}>
                                    {job.platforms?.name ?? 'Social Task'}
                              </Text>
                        </div>

                        <Tooltip
                              content={
                                    isCompleted
                                          ? 'All slots filled'
                                          : 'Accepting submissions'
                              }
                              relationship="label"
                        >
                              <Badge
                                    appearance="filled"
                                    color={isCompleted ? 'subtle' : 'success'}
                                    size="small"
                              >
                                    {isCompleted ? 'Filled' : 'Active'}
                              </Badge>
                        </Tooltip>
                  </div>

                  {/* Body */}
                  <div className={styles.cardBody}>
                        {/* Meta row */}
                        <div
                              style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                              }}
                        >
                              <CursorClickRegular
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              />
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                          fontWeight: 600,
                                          textTransform: 'capitalize',
                                    }}
                              >
                                    {job.job_type.toLowerCase()} task
                              </Text>
                              <CalendarLtr12Regular
                                    style={{
                                          color: tokens.colorNeutralForeground4,
                                          marginLeft: 4,
                                    }}
                              />
                              <Text
                                    size={100}
                                    style={{
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              >
                                    {new Date(
                                          job.posted_at as string
                                    ).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                    })}
                              </Text>
                        </div>

                        <Text className={styles.jobTitle}>{job.title}</Text>
                        <Text className={styles.description}>
                              {job.description}
                        </Text>

                        {/* Verification badges */}
                        <div className={styles.badgeRow}>
                              {job.requires_screenshot && (
                                    <Badge
                                          appearance="tint"
                                          color="informative"
                                          icon={<Camera16Regular />}
                                    >
                                          Requires Proof
                                    </Badge>
                              )}
                              {job.requires_before_proof && (
                                    <Badge
                                          appearance="tint"
                                          color="warning"
                                          icon={<DocumentMultiple16Regular />}
                                    >
                                          Before/After
                                    </Badge>
                              )}
                              {job.auto_approve && (
                                    <Badge
                                          appearance="tint"
                                          color="success"
                                          icon={<Flash16Regular />}
                                    >
                                          Auto-Approve
                                    </Badge>
                              )}
                        </div>

                        {/* Slots progress */}
                        <div>
                              <div className={styles.progressMeta}>
                                    <span
                                          style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                          }}
                                    >
                                          <People16Regular
                                                style={{ fontSize: 12 }}
                                          />
                                          Slots Filled
                                    </span>
                                    <span>
                                          <strong>{job.filled_slots}</strong>
                                          <span
                                                style={{
                                                      color: tokens.colorNeutralForeground4,
                                                }}
                                          >
                                                {' '}
                                                / {job.total_slots}
                                          </span>
                                    </span>
                              </div>
                              <ProgressBar
                                    value={progressPercent / 100}
                                    color={
                                          isCompleted
                                                ? 'warning'
                                                : progressPercent > 85
                                                  ? 'error'
                                                  : 'brand'
                                    }
                                    thickness="medium"
                              />
                        </div>
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                        <div className={styles.payoutBlock}>
                              <Text className={styles.payoutLabel}>
                                    Settle Payout
                              </Text>
                              <Text className={styles.payoutValue}>
                                    {job.payout_currency === 'NGN' ? '₦' : '$'}
                                    {job.payout_amount.toLocaleString(
                                          undefined,
                                          { minimumFractionDigits: 2 }
                                    )}
                              </Text>
                        </div>

                        <Button
                              appearance={isCompleted ? 'outline' : 'primary'}
                              icon={<ArrowRight16Regular />}
                              iconPosition="after"
                              size="medium"
                              disabled={isCompleted}
                              onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/marketplace/${job.id}`);
                              }}
                        >
                              {isCompleted ? 'Filled' : 'Start'}
                        </Button>
                  </div>
            </article>
      );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonJobCard: React.FC = () => {
      const styles = useStyles();
      return (
            <div className={styles.skeletonCard}>
                  <Skeleton className="gap-2 flex flex-col">
                        <div
                              style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'center',
                              }}
                        >
                              <SkeletonItem
                                    shape="square"
                                    size={36}
                                    style={{
                                          borderRadius:
                                                tokens.borderRadiusSmall,
                                          flexShrink: 0,
                                    }}
                              />
                              <div
                                    style={{
                                          flex: 1,
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 6,
                                    }}
                              >
                                    <SkeletonItem
                                          size={12}
                                          style={{ width: '60%' }}
                                    />
                                    <SkeletonItem
                                          size={16}
                                          style={{ width: '90%' }}
                                    />
                              </div>
                        </div>
                        <SkeletonItem size={12} />
                        <SkeletonItem size={12} style={{ width: '75%' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                              <SkeletonItem
                                    size={20}
                                    style={{
                                          width: 70,
                                          borderRadius:
                                                tokens.borderRadiusMedium,
                                    }}
                              />
                              <SkeletonItem
                                    size={20}
                                    style={{
                                          width: 80,
                                          borderRadius:
                                                tokens.borderRadiusMedium,
                                    }}
                              />
                        </div>
                        <SkeletonItem size={28} />
                        <SkeletonItem
                              size={28}
                              style={{
                                    borderRadius: tokens.borderRadiusMedium,
                              }}
                        />
                  </Skeleton>
            </div>
      );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ searchTerm: string; platformFilter: string }> = ({
      searchTerm,
      platformFilter,
}) => {
      const styles = useStyles();
      return (
            <div className={styles.emptyState}>
                  <Avatar
                        size={56}
                        icon={<People16Regular />}
                        color="neutral"
                  />
                  <Text size={400} weight="semibold">
                        No jobs found
                  </Text>
                  <Text
                        size={200}
                        style={{
                              color: tokens.colorNeutralForeground3,
                              textAlign: 'center',
                              maxWidth: 280,
                        }}
                  >
                        {searchTerm
                              ? `No jobs match "${searchTerm}".`
                              : platformFilter !== 'All'
                                ? `No active jobs for ${platformFilter} right now.`
                                : 'No active jobs available at the moment. Check back soon.'}
                  </Text>
            </div>
      );
};

export default Marketplace;
