import { JobData, Platform, UIPlatform } from '@/types/types'

const JobHeroCard = ({ job, platformInfo }: { job: JobData, platformInfo: UIPlatform }) => {

      const progress = (job.filled_slots / job.total_slots) * 100;

      return (
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-center max-sm:flex-col gap-4 pt-6 w-full">
                              <div className={`flex items-center justify-center w-[150px] h-[150px] rounded-full text-white ${platformInfo?.color}`}>
                                    {platformInfo?.icon}
                              </div>
                              <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
                                          {job.title}
                                    </h1>
                                    <p className="text-blue-600 font-semibold mt-1">
                                          {job.task_type} •{" "}
                                          {job.platform_id}
                                    </p>
                              </div>
                        </div>

                        <div className="bg-blue-50 px-6 py-4 rounded-xl text-center shrink-0 border border-blue-100">
                              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
                                    Payout Reward
                              </p>
                              <p className="text-3xl font-black text-blue-600">
                                    ₦{job.payout_amount?.toLocaleString()}
                              </p>
                        </div>

                  </div>

                  <div className="pt-6 border-t border-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">
                              Job Description
                        </h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {job.description}
                        </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                              <span>Task Completion</span>
                              <span>
                                    {job.filled_slots} /{" "}
                                    {job.total_slots} filled
                              </span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                                    style={{
                                          width: `${50}%`,
                                    }}
                              ></div>
                        </div>
                        <p className="text-xs font-medium text-slate-400 text-center italic">
                              Only {job.available_slots} slots
                              remaining. Act fast!
                        </p>
                  </div>
            </div>
      )
}

export default JobHeroCard