import React, { useEffect, useState } from "react";
import { useApp } from "../../AppContext";
import { PLATFORMS } from "../../constants";
import {
      Search,
      Filter,
      Clock,
      Users,
      ArrowRight,
      CheckCircle2,
} from "lucide-react";
import { Platform } from "../../types/types";
import { supabase } from "@/server/supabase";
import { useNavigate } from "react-router-dom";

const Marketplace: React.FC = () => {

      const { jobs: jbs, user, subscribe, submitProof } = useApp();
      const [filter, setFilter] = useState<Platform | "All">("All");
      const [searchTerm, setSearchTerm] = useState("");
      const [selectedJob, setSelectedJob] = useState<any | null>(null);
      const [proof, setProof] = useState("");
      const [submitted, setSubmitted] = useState(false);

      const [jobs, setJobs] = useState([]);

      const filteredJobs = jobs.filter((job) => {
            const matchesPlatform = filter === "All" || job.platforms.name === filter;
            const matchesSearch = job.title
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
            return matchesPlatform && matchesSearch;
      });

      const navigate = useNavigate();

      const handleSubmitProof = (e: React.FormEvent) => {
            e.preventDefault();
            if (!proof) return;
            submitProof({ jobId: selectedJob.id, proofData: proof });
            setSubmitted(true);
            setTimeout(() => {
                  setSelectedJob(null);
                  setSubmitted(false);
                  setProof("");
            }, 2000);
      };

      useEffect(() => {

            async function fetchJobs() {
                  const { data, error } = await supabase.from('jobs').select('*, platforms (*)');
                  if (error) {
                        alert('Error');
                        console.log(error);
                  }

                  setJobs(data);
                  console.log(data);
                  
            }

            fetchJobs();

      }, [])

      return (
            <div className="space-y-8 pb-20">

                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                              <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                              />
                              <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                          setSearchTerm(e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                              />
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                              <button
                                    onClick={() => setFilter("All")}
                                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${filter === "All" ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                              >
                                    All Platforms
                              </button>
                              {PLATFORMS.map((p) => (
                                    <button
                                          key={p.name}
                                          onClick={() => setFilter(p.name)}
                                          className={`px-6 py-2.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-2 ${filter === p.name ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
                                    >
                                          {p.icon} {p.name}
                                    </button>
                              ))}
                        </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                              <div
                                    key={job.id}
                                    className="bg-white cursor-pointer rounded-[2rem] border border-slate-100 p-6 flex flex-col hover:shadow-xl hover:shadow-blue-100 transition-all group"
                              >
                                    <div className="flex justify-between items-start mb-6">
                                          <div
                                                className={`p-3 rounded-2xl text-white ${PLATFORMS.find((p) => p.name.includes(job.platforms.name))?.color}`}
                                          >
                                                {
                                                      PLATFORMS.find((p) => p.name === job.platforms.name,)?.icon
                                                }
                                          </div>
                                          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                                                {job.platforms.name}
                                          </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                          {job.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                                          {job.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                          <div className="space-y-1">
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                                      Payout
                                                </p>
                                                <p className="text-lg font-black text-slate-900">
                                                      ₦{job.payout_amount}
                                                </p>
                                          </div>
                                          <div className="space-y-1 text-right">
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                                      Slots
                                                </p>
                                                <p className="text-lg font-black text-slate-900">
                                                      {job.total_slots}
                                                </p>
                                          </div>
                                    </div>

                                    <button onClick={() => {
                                          navigate(`/marketplace/${job.id}`)
                                          setSelectedJob(job);
                                    }} className="mt-auto w-full bg-slate-900 text-white py-3 cursor-pointer rounded-full font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                          Perform Task <ArrowRight size={18} />
                                    </button>
                              </div>
                        ))}
                  </div>

                  {/* Modal for Job Details */}
                  <Modal selectedJob={selectedJob} user={user} submitted={submitted} setSelectedJob={setSelectedJob} subscribe={subscribe} setProof={setProof} handleSubmitProof={handleSubmitProof} proof={proof} />
            </div>
      );
};


const Modal = ({ selectedJob, user, submitted, setSelectedJob, subscribe, setProof, handleSubmitProof, proof }: { selectedJob: any, user: any, submitted: any, setSelectedJob: any, subscribe: any, setProof: any, handleSubmitProof: any, proof: any }) => {
      return selectedJob 
      && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                  <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        {!user?.isSubscribed ? (
                              <div className="p-10 text-center space-y-6">
                                    <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                          <Filter size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                          Subscription Required
                                    </h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                          You must be an active
                                          subscriber (₦5,000/year)
                                          to perform tasks and earn
                                          money.
                                    </p>
                                    <div className="flex gap-3 pt-4">
                                          <button
                                                onClick={() =>
                                                      setSelectedJob(
                                                            null,
                                                      )
                                                }
                                                className="flex-1 border-2 border-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                onClick={() => {
                                                      subscribe();
                                                      setSelectedJob(
                                                            null,
                                                      );
                                                }}
                                                className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                          >
                                                Subscribe Now
                                          </button>
                                    </div>
                              </div>
                        ) : submitted ? (
                              <div className="p-10 text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                          <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                          Proof Submitted!
                                    </h3>
                                    <p className="text-slate-500">
                                          Your submission has been
                                          sent to the creator for
                                          review. You'll be credited
                                          once approved.
                                    </p>
                              </div>
                        ) : (
                              <div className="flex flex-col h-full">
                                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                          <div>
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                      {
                                                            selectedJob.title
                                                      }
                                                </h3>
                                                <p className="text-blue-600 font-semibold">
                                                      Reward: ₦
                                                      {
                                                            selectedJob.payout_amount
                                                      }
                                                </p>
                                          </div>
                                          <button
                                                onClick={() =>
                                                      setSelectedJob(
                                                            null,
                                                      )
                                                }
                                                className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                                          >
                                                <ArrowRight
                                                      size={24}
                                                      className="rotate-180"
                                                />
                                          </button>
                                    </div>
                                    <div className="p-8 overflow-y-auto max-h-[60vh] space-y-8 scrollbar-hide">
                                          <div className="space-y-3">
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                      <Clock
                                                            size={
                                                                  18
                                                            }
                                                      />{" "}
                                                      Instructions
                                                </h4>
                                                <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed whitespace-pre-wrap border border-slate-100">
                                                      {
                                                            selectedJob.description
                                                      }
                                                </div>
                                          </div>
                                          <div className="space-y-3">
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                      <Users
                                                            size={
                                                                  18
                                                            }
                                                      />{" "}
                                                      Required Proof
                                                </h4>
                                                <p className="text-slate-500 text-sm italic">
                                                      {
                                                            selectedJob.proof_instruction
                                                      }
                                                </p>
                                          </div>
                                          <form
                                                onSubmit={
                                                      handleSubmitProof
                                                }
                                                className="space-y-4"
                                          >
                                                <label className="block space-y-2">
                                                      <span className="text-sm font-bold text-slate-800">
                                                            Submit
                                                            Your
                                                            Proof
                                                      </span>
                                                      <textarea
                                                            required
                                                            placeholder="Link, Username, or describe your screenshot..."
                                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500 min-h-[120px]"
                                                            value={
                                                                  proof
                                                            }
                                                            onChange={(
                                                                  e,
                                                            ) =>
                                                                  setProof(
                                                                        e
                                                                              .target
                                                                              .value,
                                                                  )
                                                            }
                                                      />
                                                </label>
                                                <button
                                                      type="submit"
                                                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                                >
                                                      Submit Proof
                                                </button>
                                          </form>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
}


export default Marketplace;