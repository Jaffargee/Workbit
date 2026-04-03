import React, { useState, useEffect } from "react";
import { useApp } from "../../AppContext";
import { PLATFORMSXL } from "../../constants";
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
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { NetworkService } from "@/utils/network_service";
import NetworkError from "@/components/NetworkError";
import { supabase } from "@/server/supabase";
import { JobData } from "@/types/types";
import SideBarForm from "@/components/Marketplace/SideBarForm";
import InstructionCard from "@/components/Marketplace/InstructionCard";
import JobHeroCard from "@/components/Marketplace/JobHeroCard";
import Header from "@/components/Marketplace/Header";
import { useAuth } from "@/context/authentication";

const Job = () => {
      const { user, submitProof, subscribe } = useApp();
      const [submitted, setSubmitted] = useState(false);

      const { job_id } = useParams();
      const { user: usr } = useAuth();

      const [job, setJob] = useState<JobData>({} as JobData);
      const [uploading, setUploading] = useState<boolean>(false);

      if (!NetworkService.isOnline()) {
            return <NetworkError />;
      }

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
            GetJob(job_id);
      }, [job_id]);

      if (!job) {
            return (
                  <div className="flex flex-col items-center justify-center py-20">
                        <AlertCircle
                              size={48}
                              className="text-slate-300 mb-4"
                        />
                        <h2 className="text-2xl font-bold text-slate-900">
                              Job Not Found
                        </h2>
                        <p className="text-slate-500 mt-2">
                              The job you're looking for might have been
                              completed or removed.
                        </p>
                        <button
                              onClick={() =>
                                    (window.location.hash = "#/marketplace")
                              }
                              className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2"
                        >
                              <ArrowLeft size={18} /> Back to Marketplace
                        </button>
                  </div>
            );
      }

      const platformInfo = PLATFORMSXL.find((p) => p.name.includes(job.platforms && job.platforms.name));

      const handleOnSubmit = async (e: any, { proof, p_url, selectedImage }) => {
            e.preventDefault();

            const { data, error } = await supabase.storage.from('Screenshots').upload(`/${user.id}/${selectedImage.img1.name}`, selectedImage.img1);

            if (error) {
                  console.log(error);
            }

            if (data) {
                  const { data: subData, error } = await supabase.storage.from('Screenshots').upload(`/${user.id}/${selectedImage.img2.name}`, selectedImage.img2);

                  if (error) {
                        console.log(error);
                  }
                  
                  console.log(data, subData);
                  
            }

            console.log(p_url, proof);
      }

      const progress = (job.filled_slots / job.total_slots) * 100;

      return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 space-y-4">
                  
                  {
                        uploading &&
                        <UploadingState />
                  }
                  
                  {/* Header / Breadcrumb */}
                  <Header job={job} />

                  <div className="grid lg:grid-cols-3 gap-8">
                        
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                              {/* Job Hero Card */}
                              <JobHeroCard job={job} platformInfo={platformInfo} />
                              {/* Instructions Card */}
                              <InstructionCard job={job} />
                        </div>

                        {/* Sidebar: Application Form */}
                        <div className="space-y-6">
                              <SideBarForm job={job} handleOnSubmit={handleOnSubmit} />
                        </div>

                  </div>

            </div>
      );
};

const UploadingState = () => {
      return (
            <div className="fixed top-0 left-0 h-full w-full bg-[#00000010] backdrop-blur-sm z-[1000]">
                  <div className="flex flex-col items-center justify-center h-full w-full relative px-4 py-4">

                        <div className="flex relative flex-col space-y-4 items-center justify-center">
                              {/* Loader */}
                              <div className="block relative animate-spin border-4 border-t border-b rounded-full border-blue-600 h-[100px] w-[100px]" />

                              <div className="flex flex-col items-center justify-center">
                                    <div className="flex h-full flex-row items-center justify-center">
                                          <h2 className="text-xl">Uploading<span className="animate-bounce inline-block relative">...</span></h2>
                                    </div>
                              </div>
                        </div>

                  </div>
            </div>
      )
}

export default Job;


/*
                              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-lg sticky top-6">
                                    {!user?.isSubscribed ? (
                                          <div className="text-center space-y-6 py-4">
                                                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                                                      <ShieldCheck size={40} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">
                                                      Membership Required
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                      You must be an active
                                                      subscriber to earn from
                                                      tasks. Join the Earners
                                                      Club today!
                                                </p>
                                                <button
                                                      onClick={() =>
                                                            subscribe()
                                                      }
                                                      className="w-full bg-blue-600 text-white py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                                                >
                                                      Subscribe for ₦5,000
                                                </button>
                                          </div>
                                    ) : submitted ? (
                                          <div className="text-center space-y-6 py-8 animate-in zoom-in duration-300">
                                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                      <CheckCircle2 size={48} />
                                                </div>
                                                <h3 className="text-2xl font-bold text-slate-900">
                                                      Submitted!
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                      Your proof has been sent
                                                      for review. You'll receive
                                                      ₦{job.payout_amount} once
                                                      approved.
                                                </p>
                                                <button
                                                      onClick={() =>
                                                            (window.location.hash =
                                                                  "#/marketplace")
                                                      }
                                                      className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                                >
                                                      Find More Jobs
                                                </button>
                                          </div>
                                    ) : (
                                          <form
                                                onSubmit={handleSubmit}
                                                className="space-y-6"
                                          >
                                                <div className="space-y-2">
                                                      <h3 className="text-xl font-bold text-slate-900">
                                                            Submit Proof
                                                      </h3>
                                                      <p className="text-xs text-slate-500 font-medium">
                                                            Please provide
                                                            accurate proof as
                                                            instructed to ensure
                                                            your payout is
                                                            approved.
                                                      </p>
                                                </div>

                                                <div className="space-y-4">
                                                      <label className="block space-y-2">
                                                            <span className="text-sm font-bold text-slate-700">
                                                                  Proof Details
                                                            </span>
                                                            <textarea
                                                                  required
                                                                  placeholder={
                                                                        job.requires_screenshot
                                                                              ? "Upload link to screenshot or paste your username/ID..."
                                                                              : "Type your verification details here..."
                                                                  }
                                                                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:border-blue-500 min-h-[150px] transition-all"
                                                                  value={proof}
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

                                                      {job.requires_screenshot && (
                                                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                                                  <p className="text-xs text-blue-700 font-semibold flex items-center gap-2">
                                                                        <AlertCircle
                                                                              size={
                                                                                    14
                                                                              }
                                                                        />{" "}
                                                                        Remember
                                                                        to
                                                                        upload
                                                                        your
                                                                        screenshot
                                                                        to a
                                                                        cloud
                                                                        service
                                                                        (like
                                                                        Imgur)
                                                                        and
                                                                        paste
                                                                        the link
                                                                        here.
                                                                  </p>
                                                            </div>
                                                      )}

                                                      <button
                                                            type="submit"
                                                            className="w-full bg-blue-600 text-white py-2 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                                      >
                                                            Finish & Submit
                                                      </button>
                                                </div>
                                          </form>
                                    )}
                              </div>

                              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
                                    <Users
                                          className="text-slate-400"
                                          size={24}
                                    />
                                    <div>
                                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                Job Reliability
                                          </p>
                                          <p className="text-sm font-bold text-slate-900">
                                                {job.auto_approve
                                                      ? "Instant Payout"
                                                      : "Manual Review"}
                                          </p>
                                    </div>
                              </div>
*/