import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { HelpCircle, Info, Calculator, CheckCircle, Link, CheckCheck, CheckSquare, Workflow, InfoIcon, WifiOff, Loader2 } from "lucide-react";
import { supabase } from "@/server/supabase";
import { JobSubmission, Platform_, Status } from "@/types/types";
import { SupabaseErrorService } from "@/utils/error_service";
import { NetworkService } from "@/utils/network_service";
import { status, task } from "@/constants";
import { useAuth } from "@/context/authentication";
import NetworkError from "@/components/NetworkError";


const MAX_RETRIES = 3;

const PostJob: React.FC = () => {

      const { user } = useApp();
      const { user: usr } = useAuth();

      const { profile } = useAuth();
      const [platforms, setPlatforms] = useState<Platform_[]>([]);
      const [error, setError] = useState<{ message: string }>({ message: '' });
      const [formData, setFormData] = useState<JobSubmission>({
            title: "",
            platform_id: '',
            user_id: '',
            target_url: '',
            total_slots: 10,
            payout_amount: 15,
            description: "",
            proof_instructions: "",
            status: 'ACTIVE',
            task_type: 'FOLLOW',
            is_public: true,
            auto_approve: true,
            requires_screenshot: true,
      });

      const [success, setSuccess] = useState(false);

      const totalCost = formData.total_slots * formData.payout_amount;
      const platformFee = totalCost * 0.1;
      const grandTotal = totalCost + platformFee;

      const [loading, setLoading] = useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            try {

                  setLoading(true);

                  const { data, error } = await supabase.from('jobs').insert(formData);

                  if (error) {
                        console.log(error);
                  }

                  setSuccess(true);
                  console.log(formData);

                  setLoading(false);
                  
                  setTimeout(() => {
                        setSuccess(false);
                        setFormData({
                              title: "",
                              user_id: "",
                              platform_id: "",
                              target_url: '',
                              total_slots: 10,
                              payout_amount: 15,
                              description: "",
                              proof_instructions: "",
                              status: 'ACTIVE',
                              task_type: 'FOLLOW',
                              is_public: true,
                              auto_approve: true,
                              requires_screenshot: true,
                        });
                  }, 7000);

            } catch (error) {
                  console.log(error);
            } finally {
                  setLoading(false);
            }

      };

      if (!NetworkService.isOnline()) {
            return <NetworkError />
      }

      let attempts: number;
      
      useEffect(() => {

            const getPlatforms = async () => {
                  
                  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                  
                  for (attempts = 1; attempts <= MAX_RETRIES; attempts++) {
                        
                        try {

                              if (!NetworkService.isOnline()) {
                                    setError({ message: 'Check your internet connection.' });
                                    continue;
                              }

                              const { data, error } = await supabase.from("platforms").select("*");
                  
                              if (error) {
                                    const err = SupabaseErrorService.handleSupabaseError(error, 'getPlatforms');
                                    setError(err);
                                    // Continue to next attempt instead of returning immediately
                                    if (attempts === MAX_RETRIES) {
                                          console.error('Max retries reached. Failed to fetch platforms.');
                                          return;
                                    }
                                    await delay(1000)
                                    continue
                              }
                  
                              if (data) {
                                    setPlatforms(data as Platform_[]);
                                    setFormData({ ...formData, user_id: usr.id, platform_id: data[0].id });
                                    return;
                              }

                        } catch (error) {
                              const err = SupabaseErrorService.handleSupabaseError(error, 'getPlatforms');
                              setError(err);
                              if (attempts === MAX_RETRIES) {
                                    console.error('Max retries reached. Failed to fetch platforms.');
                                    return;
                              }
                        }
                        
                  }
      
            }

            getPlatforms();

      }, []);

      return (
            <div className="grid lg:grid-cols-5 gap-10">

                  <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-4 md:p-8 md:rounded-[2rem] border border-slate-100 shadow-sm">
                              <form onSubmit={handleSubmit} className="space-y-6">

                                    {
                                          success && <SuccessfullInformation formData={formData} />
                                    }

                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                          <PostJobInput 
                                                idname="job_title"
                                                label="Job Title"
                                                placeholder="e.g., Follow my Instagram account"
                                                icon={<HelpCircle size={14} className="text-slate-400" />} 
                                                value={formData.title} 
                                                onChange={(e: any) =>
                                                      setFormData({
                                                            ...formData,
                                                            title: e.target.value,
                                                      })
                                                }
                                          />

                                          <PostJobSelect 
                                                label="Platform"
                                                idname="platform"
                                                icon={<Info size={14} className="text-slate-400" />} 
                                                value={formData.platform_id} 
                                                options={platforms}
                                                onChange={(e: any) =>
                                                      setFormData({
                                                            ...formData,
                                                            platform_id: e.target.value,
                                                      })
                                                }
                                                error={error.message}
                                          />

                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                          <PostJobInput 
                                                idname="p_url"
                                                label="URL"
                                                type="url"
                                                placeholder="e.g., https://instagram.com/yourprofile"
                                                icon={<Link size={14} className="text-slate-400" />} 
                                                value={formData.target_url} 
                                                onChange={(e: any) =>
                                                      setFormData({
                                                            ...formData,
                                                            target_url: e.target.value,
                                                      })
                                                }
                                          />


                                          <PostJobSelect 
                                                label="Task"
                                                idname="task"
                                                icon={<Workflow size={16} className="text-slate-400" />} 
                                                value={formData.task_type} 
                                                options={task}
                                                onChange={(e: any) =>
                                                      setFormData({
                                                            ...formData,
                                                            task_type: e.target.value,
                                                      })
                                                }
                                          />

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                          <PostJobInput
                                                idname="w_kers"
                                                label="Workers Needed (Slots)" 
                                                icon={<Info size={14} className="text-slate-400" />} 
                                                value={formData.total_slots} 
                                                onChange={(e: any) => {
                                                      setFormData({
                                                            ...formData,
                                                            total_slots: parseInt(e.target.value) || 0
                                                      })}
                                                }
                                          />

                                          <PostJobInput
                                                idname="p_out"
                                                label="Payout per Task (₦)" 
                                                icon={<Info size={14} className="text-slate-400" />} 
                                                value={formData.payout_amount} 
                                                onChange={(e: any) => {
                                                      setFormData({
                                                            ...formData,
                                                            payout_amount: parseInt(e.target.value) || 0
                                                      })}
                                                }
                                          />

                                    </div>

                                    <label className="block space-y-2">
                                          <span className="text-sm font-bold text-slate-700">
                                                Detailed Instructions <span>(Optional)</span>
                                          </span>
                                          <textarea
                                                required
                                                placeholder="List steps clearly: 1. Search for... 2. Like... 3. Follow..."
                                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 min-h-[120px]"
                                                value={formData.description}
                                                onChange={(e) =>
                                                      setFormData({
                                                            ...formData,
                                                            description: e.target.value,
                                                      })
                                                }
                                          />
                                    </label>

                                    <PostJobCheckbox idname="req_scrn_proof" label="Require Screenshot Proof" description="Workers must submit a unique screenshot as proof of task completion." />
                                    <PostJobCheckbox idname="auto_arpvd" label="Auto-Approve Tasks" description="Automatically approve and pay workers upon task completion." />
                                    <PostJobCheckbox idname="is_public" label="Make Job Public" description="Allow this job to be visible and accessible to all workers." />
                                    <PostJobSelect idname="status" label="Status" icon={<Info size={14} className="text-slate-400" />} value="ACTIVE" options={status}
                                          onChange={(e: any) => {
                                                setFormData({
                                                      ...formData,
                                                      status: e.target.value
                                                })
                                          }}
                                    />

                                    <label className="block space-y-2">
                                          <span className="text-sm font-bold text-slate-700">
                                                Proof Required
                                          </span>
                                          <textarea
                                                required
                                                placeholder="e.g., Screenshot of profile following"
                                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 min-h-[120px]"
                                                value={formData.proof_instructions}
                                                onChange={(e) =>
                                                      setFormData({
                                                            ...formData,
                                                            proof_instructions: e.target.value,
                                                      })
                                                }
                                          />
                                    </label>

                                    <button onClick={handleSubmit} disabled={platforms.length === 0 || loading} style={{ opacity: platforms.length === 0 || loading ? .6 : 1 }} type="submit" className={`w-full cursor-pointer bg-blue-600 text-white py-4 rounded-full font-bold text-lg ${platforms.length === 0 || loading ? '' : 'hover:bg-blue-700' } transition-all shadow-xl shadow-blue-100`} >
                                          <div className="flex flex-row items-center justify-center w-full h-full gap-4">
                                                <span>
                                                      {loading && <Loader2 size={20} className="animate-spin" />}
                                                </span>
                                                <span>Post Job & Launch Campaign</span>
                                          </div>
                                    </button>

                              </form>
                        </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">

                        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Calculator size={120} />
                              </div>
                              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                    <Calculator size={20} className="text-blue-400" />{" "}
                                    Cost Summary
                              </h3>

                              <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-slate-400">
                                          <span>Task Cost</span>
                                          <span className="text-white font-medium">
                                                ₦{totalCost.toLocaleString()}
                                          </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400">
                                          <span>Platform Fee (10%)</span>
                                          <span className="text-white font-medium">
                                                ₦{platformFee.toLocaleString()}
                                          </span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                          <span className="text-lg font-bold">
                                                Total Amount
                                          </span>
                                          <span className="text-2xl font-black text-blue-400">
                                                ₦{grandTotal.toLocaleString()}
                                          </span>
                                    </div>
                              </div>

                              <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                                                1
                                          </div>
                                          <p className="text-xs text-slate-300">
                                                Jobs are reviewed for safety and authenticity.
                                          </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                                                2
                                          </div>
                                          <p className="text-xs text-slate-300">
                                                Funds are held in escrow until proof is approved.
                                          </p>
                                    </div>
                              </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                              <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                          Your Balance
                                    </p>
                                    <p className="text-2xl font-black text-slate-900">
                                          ₦
                                          {user?.wallet.balance.toLocaleString()}
                                    </p>
                              </div>
                              <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                                    Deposit
                              </button>
                        </div>

                  </div>
            </div>
      );
};


const PostJobInput = ({ label, type = "text", icon, idname, value, onChange, ...rest }: { value: string | number, type?: 'text' | 'number' | 'date' | 'url',  icon?: React.ReactNode, idname: string, label: string, onChange: (e?: any) => void | any } & React.InputHTMLAttributes<HTMLInputElement>) => {
      return (
            <label htmlFor={idname} className="block space-y-2">
                  <div className="flex flex-row items-center justify-start w-full relative gap-2">
                        <div className="flex h-full relative">
                              <span className="text-sm font-bold text-slate-700 flex items-center gap-2">{label}</span>
                        </div>
                        <div className="flex h-full relative">
                              {icon}
                        </div>
                  </div>
                  <div className="block relative w-full overflow-hidden">
                        <input
                              {...rest}
                              type={type}
                              min="5"
                              required
                              name={idname}
                              id={idname}
                              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                              value={value}
                              onChange={onChange}
                        />
                  </div>
            </label>
      )     
}

const PostJobCheckbox = ({ label, checked = false, idname, description, onChange }: { label: string, checked?: boolean, idname: string, description?: string, onChange?: (e: any) => void | any }) => {
      return (
            <div className="flex flex-row items-center w-full relative">
                  <label htmlFor={idname} className="flex flex-row items-center gap-2 w-full relative h-full">
                        {/* Checkbox */}
                        <div className="flex h-full relative items-center justify-center">
                              <input type="checkbox" name={idname} id={idname} className="h-5 w-5 bg-blue-600" onChange={onChange} />
                        </div>
                        {/* Check Text */}
                        <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">
                                    {label}
                              </span>
                              <span className="text-xs text-slate-500">
                                    {description}
                              </span>
                        </div>
                  </label>
            </div>
      )
}

const PostJobSelect = ({ label, icon, value, idname, options, onChange, error }: { label: string, icon?: React.ReactNode, value?: string, idname: string, options: any[], onChange: (e: any) => void | any, error?: string }) => {
      return (
            <div className="block relative space-y-2">
                  <label htmlFor={idname} className="block space-y-2">
                        <div className="flex flex-row items-center justify-start w-full relative gap-2">
                              <div className="flex h-full relative">
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-2">{label}</span>
                              </div>
                              <div className="flex h-full relative">
                                    {icon}
                              </div>
                        </div>
                        <select
                              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500"
                              value={value}
                              onChange={onChange}
                              id={idname}
                              name={idname}
                        >
                              {options.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                        </select>
                  </label>
                  {
                        error &&
                        <div className="flex flex-row relative w-full">
                              <span className="text-sm text-red-500">{error}</span>
                        </div>
                  }
            </div>
      )
}

const SuccessfullInformation = ({ formData }: { formData: any }) => {
      return (
            <div className="block fixed h-full w-full top-0 left-0 right-0 backdrop-blur-sm z-[1000]">
                  <div className="flex flex-col items-center justify-center h-full w-full relative px-4">
                        {/* Main Information Block */}
                        <div className="block shadow-md border-1 border-green-700 bg-green-50 overflow-hidden rounded-xl">
                              <div className="flex flex-col h-full w-full relative px-4 py-4">
                                    <div className="flex flex-row items-center h-full w-full relative gap-4">
                                          <div className="bg-emerald-50 text-green-700 rounded-full flex items-center justify-center">
                                                <CheckCircle size={16} />
                                          </div>
                                          <div className="flex flex-col w-full relative">
                                                <div className="flex flex-row items-center justify-start w-full relative">
                                                      <span className="text-green-700 font-semibold">Job successfully created!</span>
                                                </div>
                                                <p className="text-xs text-green-700">Your task has been listed with {formData.total_slots} slots for ₦{formData.payout_amount} each. Workers can start applying immediately.</p>
                                          </div>
                                    </div>
                                    <ul className="text-green-700 text-sm py-2 px-8">
                                          <li>
                                                <span>Funds are held securely in escrow until tasks are completed.</span>
                                          </li>
                                    </ul>
                              </div>
                        </div>

                        {/* Call to action Buttons */}
                        <div className="flex flex-col md:flex-row items-center justify-end py-4 w-full mx-auto max-w-[590px] gap-2">
                              <button type="button" className="py-2 px-8 min-w-[150px] w-full shadow-xl relative bg-blue-50 text-blue-500 overflow-hidden rounded-full cursor-pointer border-1 border-blue-500">
                                    <div className="flex h-full w-full relative items-center justify-center">
                                          <span>Post another job</span>
                                    </div>
                              </button>
                              <button type="button" className="py-2 px-8 min-w-[150px] w-full shadow-xl relative bg-blue-500 text-white overflow-hidden rounded-full cursor-pointer border-1 border-blue-500">
                                    <div className="flex h-full w-full relative items-center justify-center">
                                          <span>Go to Job Marketplace</span>
                                    </div>
                              </button>
                        </div>

                  </div>
            </div>
      )
}

export default PostJob;