import React from "react";
import { useApp } from "../AppContext";
import {
      User,
      ShieldCheck,
      Star,
      CheckCircle,
      Calendar,
      BadgeCheck,
      Briefcase,
      TrendingUp,
      CreditCard,
      Mail,
      Fingerprint,
} from "lucide-react";
import Button from "@/components/Profile/Button";
import ProfileImage, { ProfileData } from "@/components/Profile/ProfileImage";
import { useAuth } from "@/context/authentication";

const Profile: React.FC = () => {
      const { profile: user } = useAuth();

      if (!user) return null;

      return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                  {/* Header Profile Card */}
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">

                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        <div className="px-8 pb-8 -mt-12">

                              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
                                    <ProfileImage user={user} />
                                    <ProfileData user={user} />
                                    <div className="flex gap-2 pb-2 w-full md:w-auto">
                                          <Button className="flex-1 md:flex-none bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200" text="Edit Profile" />
                                    </div>
                              </div>

                              <Ratings user={user} />

                        </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                        {/* Financial Cards */}
                        <div className="space-y-6">
                              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <CreditCard
                                          size={20}
                                          className="text-blue-600"
                                    />{" "}
                                    Financial Health
                              </h3>
                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                    <div className="space-y-2">
                                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                Available Balance
                                          </p>
                                          <p className="text-4xl font-black text-blue-600">
                                                ₦{user.balance.toLocaleString()}
                                          </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-50">
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                            <TrendingUp
                                                                  size={20}
                                                            />
                                                      </div>
                                                      <span className="font-bold text-slate-700">
                                                            Total Earned
                                                      </span>
                                                </div>
                                                <span className="text-emerald-600 font-black">
                                                      ₦
                                                      {user.total_earned.toLocaleString()}
                                                </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                                                            <Briefcase
                                                                  size={20}
                                                            />
                                                      </div>
                                                      <span className="font-bold text-slate-700">
                                                            Total Spent
                                                      </span>
                                                </div>
                                                <span className="text-slate-900 font-black">
                                                      ₦
                                                      {user.total_spent.toLocaleString()}
                                                </span>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Identity Details */}
                        <div className="md:col-span-2 space-y-6">
                              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Fingerprint
                                          size={20}
                                          className="text-blue-600"
                                    />{" "}
                                    System Identification
                              </h3>

                              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50">
                                    <div className="py-4 first:pt-0">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Unique Identifier (UUID)
                                          </p>
                                          <div className="flex items-center justify-between">
                                                <code className="text-sm font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                                                      {user.user_id}
                                                </code>
                                                <button className="text-blue-600 font-bold text-xs hover:underline">
                                                      Copy
                                                </button>
                                          </div>
                                    </div>

                                    <div className="py-4">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                User Role
                                          </p>
                                          <p className="text-slate-800 font-bold capitalize">
                                                {user.user_type}
                                          </p>
                                    </div>

                                    <div className="py-4">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Account Status
                                          </p>
                                          <div className="flex items-center gap-2">
                                                <div
                                                      className={`w-3 h-3 rounded-full ${user.is_verified ? "bg-emerald-500" : "bg-amber-400"}`}
                                                ></div>
                                                <p className="text-slate-800 font-bold">
                                                      {user.is_verified
                                                            ? "Active & Verified"
                                                            : "Under Review"}
                                                </p>
                                          </div>
                                    </div>

                                    <div className="py-4 last:pb-0">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Referral Code
                                          </p>
                                          <p className="text-slate-800 font-bold">
                                                {user.ref_code}
                                          </p>
                                    </div>
                              </div>

                              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row gap-4 md:items-center justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div>
                                          <h4 className="text-xl font-bold">
                                                Want to earn more?
                                          </h4>
                                          <p className="text-slate-400 mt-1">
                                                Verify your identity to unlock
                                                higher payout jobs.
                                          </p>
                                    </div>
                                    <Button className="bg-white hover:bg-blue-50 text-slate-900 max-sm:w-full" text="Verify Now" />
                              </div>
                        </div>

                  </div>

            </div>
      );
};


const Ratings = ({ user }: { user: any }) => {

      const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
            });
      };

      return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-50">

                  <Stat icon={<CheckCircle size={12} className="text-emerald-500"/>} stat="Completed" data={user.completed_jobs} />
                  <Stat icon={<ShieldCheck size={12} className="text-blue-500"/>} stat="Verification" verfication={{ is_verified: user.is_verified }} />
                  <Stat icon={<Calendar size={12} className="text-slate-400"/>} stat="Joined" data={user.created_at} is_date />

            </div>
      )
}

const Stat = ({ icon, stat, data, is_date = false, verfication }: { icon: React.ReactNode, stat: string, data?: string, is_date?: boolean, verfication?: any }) => {

      const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
            });
      };

      return (
            <div className="space-y-1 text-center md:text-left">
                  <div className="text-xs text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                        <div className="flex flex-row items-center justify-center relative gap-1">
                              <span className="flex flex-col items-center">
                                   {icon}
                              </span>
                              <span>{stat}</span>
                        </div>
                  </div>
                  {
                        verfication ? (
                              <p className={`text-md ${verfication.is_verified ? "text-emerald-600" : "text-amber-500"}`}>
                                    {verfication.is_verified ? "Verified" : "Pending Verification"}
                              </p>
                        ) : (
                              <p className="text-md text-slate-900">
                                    {is_date ? formatDate(data) : data}
                              </p>
                        )
                  }
            </div>
      )
}


export default Profile;
