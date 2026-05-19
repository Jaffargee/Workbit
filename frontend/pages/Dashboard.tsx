import React, { useCallback, useEffect } from "react";
import {
      Wallet,
      TrendingUp,
      Users,
      Briefcase,
      ChevronRight,
      Activity,
      Bell,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authentication";

const StatCard: React.FC<{
      label: string;
      value: string;
      icon: React.ReactNode;
      color: string;
      bg: string;
}> = ({ label, value, icon, color, bg }) => (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow cursor-default group">
            <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  {icon}
            </div>
            <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                        {label}
                  </p>
                  <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
      </div>
);

const Dashboard = () => {

      const navigate = useNavigate();

      const { profile, user: usr } = useAuth();

            // 1. Wallet Balance (direct access)
      const balance = profile?.wallet?.balance || 0;

      // 2. Total Earnings (usually Balance + any historical withdrawals or specific earning fields)
      // If you don't have an "earnings" field, balance is the current default
      const totalEarnings = profile?.wallet?.balance || 0; 

      // 3. Referral Income (Summing up the reward_amount from the referral_rewards array)
      const referralIncome = profile?.referral_rewards?.reduce((acc, curr) => {
            return acc + (curr.reward_amount || 0);
      }, 0) || 0;

      // 4. Active Tasks (Length of the jobs array)
      const activeTasks = profile?.jobs?.length.toLocaleString() || (0).toLocaleString();

      useEffect(() => {

      }, []);

      return (
            <div className="space-y-8 animate-in fade-in duration-500">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-600 p-8 rounded-[1rem] text-white overflow-hidden relative shadow-lg shadow-blue-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="relative z-10 space-y-2">
                              <h2 className="text-3xl font-bold tracking-tight">
                                    Welcome back, {profile?.first_name + ' ' + profile?.last_name}! 👋
                              </h2>
                              <p className="text-blue-100 font-medium">You have {profile != null && profile?.jobs?.length} new jobs waiting for you today.</p>
                        </div>
                        <div className="relative z-10 flex gap-3">
                              <DashButton text="Browse Jobs" route="/marketplace" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg" />
                              <DashButton text="Post a Job" route="/postjob" className="bg-blue-500 text-white hover:bg-blue-400 border border-blue-400" />
                        </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                              label="Wallet Balance"
                              value={`₦${balance}`}
                              icon={<Wallet size={24} />}
                              color="text-blue-600"
                              bg="bg-blue-50"
                        />
                        <StatCard
                              label="Total Earnings"
                              value={`₦${totalEarnings}`}
                              icon={<TrendingUp size={24} />}
                              color="text-emerald-600"
                              bg="bg-emerald-50"
                        />
                        <StatCard
                              label="Referral Income"
                              value={`₦${referralIncome}`}
                              icon={<Users size={24} />}
                              color="text-amber-600"
                              bg="bg-amber-50"
                        />
                        <StatCard
                              label="Active Tasks"
                              value={activeTasks as string}
                              icon={<Briefcase size={24} />}
                              color="text-indigo-600"
                              bg="bg-indigo-50"
                        />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                              <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-800">
                                          Featured Opportunities
                                    </h3>
                                    <button
                                          onClick={() =>
                                                navigate("/marketplace")
                                          }
                                          className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                                    >
                                          View all <ChevronRight size={16} />
                                    </button>
                              </div>
                              <div className="grid gap-4">
                                    {profile?.jobs?.slice(0, 3).map((job) => (
                                          <div
                                                key={job.id}
                                                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors group"
                                          >
                                                <div className="flex items-center gap-4">
                                                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            <Briefcase
                                                                  size={22}
                                                            />
                                                      </div>
                                                      <div>
                                                            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                                  {job.title}
                                                            </h4>
                                                            <p className="text-sm text-slate-500">
                                                                  {job.platforms}{" "}
                                                                  •{" "}
                                                                  {job.total_slots -
                                                                        job.filled_slots}{" "}
                                                                  slots left
                                                            </p>
                                                      </div>
                                                </div>
                                                <div className="text-right">
                                                      <p className="text-lg font-bold text-slate-900">
                                                            ₦{job.payout_amount}
                                                      </p>
                                                      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                                                            Per Task
                                                      </p>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </div>

                        <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-800">
                                          Activity Log
                                    </h3>
                                    <Activity
                                          size={20}
                                          className="text-slate-400"
                                    />
                              </div>
                              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                                    {[
                                          {
                                                type: "withdrawal",
                                                msg: "Withdrawal of ₦2,000 processed.",
                                                time: "2 hours ago",
                                                icon: (
                                                      <ChevronRight size={14} />
                                                ),
                                          },
                                          {
                                                type: "earning",
                                                msg: "Job approved: IG Follow.",
                                                time: "5 hours ago",
                                                icon: <Bell size={14} />,
                                          },
                                          {
                                                type: "referral",
                                                msg: "New referral registered.",
                                                time: "1 day ago",
                                                icon: <Users size={14} />,
                                          },
                                    ].map((activity, i) => (
                                          <div
                                                key={i}
                                                className="p-4 flex gap-3 hover:bg-slate-50 transition-colors"
                                          >
                                                <div className="mt-1">
                                                      {activity.icon}
                                                </div>
                                                <div>
                                                      <p className="text-sm text-slate-800 font-medium">
                                                            {activity.msg}
                                                      </p>
                                                      <p className="text-xs text-slate-500 mt-1">
                                                            {activity.time}
                                                      </p>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </div>

            </div>
      );
};

const DashButton = ({text, route, className}: {className?: string, route: string, text: string}) => {
      const styleClassName = "px-6 py-3 cursor-pointer rounded-full font-bold transition-colors overflow-hidden " + className
      return (
            <Link to={route} className="cursor-pointer">
                  <button className={styleClassName}>
                       <div className="flex flex-col h-full w-full relative">
                              <div className="flex flex-col items-center justify-center relative h-full w-full">
                                    <span>{text}</span>
                              </div>
                       </div>
                  </button>
            </Link>
      )
}

export default Dashboard;