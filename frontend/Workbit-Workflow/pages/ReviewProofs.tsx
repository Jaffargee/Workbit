import React from "react";
import { useApp } from "../AppContext";
import {
      CheckCircle,
      XCircle,
      Clock,
      ExternalLink,
      ShieldCheck,
} from "lucide-react";

const ReviewProofs: React.FC = () => {
      const { user, submissions, approveSubmission, rejectSubmission, jobs } =
            useApp();

      // In a real app, we'd filter submissions for jobs created by current user
      // Here we just show all for demo purposes
      const pendingSubmissions = submissions.filter(
            (s) => s.status === "pending",
      );

      return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                  <div className="flex items-center justify-between">
                        <div>
                              <h2 className="text-3xl font-bold text-slate-900">
                                    Review Proofs
                              </h2>
                              <p className="text-slate-500 mt-1">
                                    Verify task completion and release funds to
                                    workers.
                              </p>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 text-blue-600 font-bold border border-blue-100">
                              <ShieldCheck size={20} />{" "}
                              {pendingSubmissions.length} Pending
                        </div>
                  </div>

                  {pendingSubmissions.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
                              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                                    <Clock size={48} />
                              </div>
                              <h3 className="text-2xl font-bold text-slate-900">
                                    No Pending Proofs
                              </h3>
                              <p className="text-slate-500 max-w-sm mx-auto">
                                    You're all caught up! When workers complete
                                    your jobs, their submissions will appear
                                    here.
                              </p>
                        </div>
                  ) : (
                        <div className="space-y-6">
                              {pendingSubmissions.map((sub) => {
                                    const job = jobs.find(
                                          (j) => j.id === sub.jobId,
                                    );
                                    return (
                                          <div
                                                key={sub.id}
                                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-8 items-start hover:shadow-lg transition-shadow"
                                          >
                                                <div className="flex-1 space-y-6">
                                                      <div className="flex items-center justify-between">
                                                            <div>
                                                                  <h4 className="text-xl font-bold text-slate-900">
                                                                        {
                                                                              job?.title
                                                                        }
                                                                  </h4>
                                                                  <p className="text-sm text-slate-500 font-medium">
                                                                        Worker:{" "}
                                                                        <span className="text-blue-600">
                                                                              @
                                                                              {
                                                                                    sub.workerUsername
                                                                              }
                                                                        </span>{" "}
                                                                        •
                                                                        Submitted{" "}
                                                                        {new Date(
                                                                              sub.submittedAt,
                                                                        ).toLocaleTimeString()}
                                                                  </p>
                                                            </div>
                                                            <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-200">
                                                                  {
                                                                        job?.platform
                                                                  }
                                                            </div>
                                                      </div>

                                                      <div className="space-y-2">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                                  Worker Proof
                                                                  Data
                                                            </p>
                                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 font-medium whitespace-pre-wrap">
                                                                  {
                                                                        sub.proofData
                                                                  }
                                                            </div>
                                                      </div>
                                                </div>

                                                <div className="lg:w-48 space-y-3 w-full shrink-0">
                                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                                                            Release Funds?
                                                      </p>
                                                      <button
                                                            onClick={() =>
                                                                  approveSubmission(
                                                                        sub.id,
                                                                  )
                                                            }
                                                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                                                      >
                                                            <CheckCircle
                                                                  size={20}
                                                            />{" "}
                                                            Approve
                                                      </button>
                                                      <button
                                                            onClick={() =>
                                                                  rejectSubmission(
                                                                        sub.id,
                                                                  )
                                                            }
                                                            className="w-full border-2 border-red-50 text-red-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                                                      >
                                                            <XCircle
                                                                  size={20}
                                                            />{" "}
                                                            Reject
                                                      </button>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </div>
      );
};

export default ReviewProofs;