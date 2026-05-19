import React, { useState, useEffect } from "react";
import {
      HelpCircle, Info, Calculator, Link,
      Workflow, Loader2, CheckCircle, AlertCircle,
} from "lucide-react";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/contexts/authentication";
import { Platform, JobPostPayload, JobType, JobStatus, Platform_ } from "@/types/types";
import { NetworkService } from "@/utils/network_service";
import NetworkError from "@/components/NetworkError";
import AuthInput from "@/components/Auth/AuthInput";
import AuthSelect from "@/components/Auth/AuthSelect";

const MAX_RETRIES = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(days: number): string {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostJobForm {
      platform_id: string;
      job_type: JobType;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      total_slots: number;
      expires_in_days: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PostJob: React.FC = () => {
      const { user: usr } = useAuth();
      const [platforms, setPlatforms] = useState<Platform_[]>([]);
      const [platformError, setPlatformError] = useState('');
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState<{ job_id: string; total_cost: number } | null>(null);
      const [submitError, setSubmitError] = useState('');

      const [form, setForm] = useState<PostJobForm>({
            platform_id:            '',
            job_type:               'FOLLOW',
            target_url:             '',
            payout_amount:          150,
            payout_currency:        'NGN',
            auto_approve:           false,
            requires_screenshot:    true,
            requires_before_proof:  false,
            proof_instructions:     '',
            title:                  '',
            description:            '',
            total_slots:            10,
            expires_in_days:        7,
      });

      const totalCost  = form.total_slots * form.payout_amount;
      const platformFee = totalCost * 0.1;
      const grandTotal  = totalCost + platformFee;

      // ── Load platforms ─────────────────────────────────────────────────────────

      useEffect(() => {
      const fetchPlatforms = async () => {
            const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
            if (!NetworkService.isOnline()) {
                  setPlatformError('No internet connection.');
                  await delay(1500);
                  continue;
            }

            const { data, error } = await supabase
                  .from('platforms')
                  .select('*')
                  .eq('is_active', true);

            if (error) {
                  if (attempt === MAX_RETRIES) {
                  setPlatformError('Could not load platforms. Please refresh the page.');
                  }
                  await delay(1000 * attempt);
                  continue;
            }

            if (data?.length) {
                  setPlatforms(data as Platform_[]);
                  setForm(prev => ({ ...prev, platform_id: data[0].id }));
            }

            return; // success
            } catch {
            if (attempt === MAX_RETRIES) {
                  setPlatformError('Could not load platforms. Please refresh the page.');
            }
            }
            }
      };

      fetchPlatforms();
      }, []);

      // ── Submit ─────────────────────────────────────────────────────────────────

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setSubmitError('');

            if (!form.platform_id) {
                  setSubmitError('Please select a platform.');
                  return;
            }
            if (!form.target_url.trim()) {
                  setSubmitError('Target URL is required.');
                  return;
            }
            if (!form.title.trim()) {
                  setSubmitError('Job title is required.');
                  return;
            }

            setLoading(true);

            try {
                  // Uses the post_job_with_funding RPC — creates job + funding atomically
                  const { data, error } = await supabase.rpc('create_job_with_funding', {
                        p_platform_id:           form.platform_id,
                        p_job_type:              form.job_type,
                        p_target_url:            form.target_url.trim(),
                        p_payout_amount:         form.payout_amount,
                        p_payout_currency:       form.payout_currency,
                        p_auto_approve:          form.auto_approve,
                        p_requires_screenshot:   form.requires_screenshot,
                        p_requires_before_proof: form.requires_before_proof,
                        p_proof_instructions:    form.proof_instructions.trim(),
                        p_title:                 form.title.trim(),
                        p_description:           form.description.trim(),
                        p_total_slots:           form.total_slots,
                        p_expires_at:            addDays(form.expires_in_days),
                  });

                  if (error) {
                        setSubmitError(error.message);
                        return;
                  }

                  if (data?.success) {
                        setSuccess({ job_id: data.job_id, total_cost: data.escrow_amount + data.platform_fee });
                  }

            } catch (err: any) {
                  setSubmitError('An unexpected error occurred. Please try again.');
            } finally {
                  setLoading(false);
            }
      };

      const resetForm = () => {
      setSuccess(null);
      setForm(prev => ({
            ...prev,
            title: '', description: '', target_url: '',
            proof_instructions: '', total_slots: 10, payout_amount: 150,
      }));
      };

      if (!NetworkService.isOnline()) return <NetworkError />;

      return (
            <div className="grid lg:grid-cols-5 gap-4 px-4 py-4">

                  {/* ── Form ─────────────────────────────────────────────────────────── */}
                  <div className="lg:col-span-3">
                        <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">

                              {success && (
                                    <SuccessOverlay
                                          jobId={success.job_id}
                                          totalCost={success.total_cost}
                                          onReset={resetForm}
                                    />
                              )}

                              <form onSubmit={handleSubmit} className="space-y-6">

                                    {submitError && (
                                          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                                                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-red-700 text-sm">{submitError}</p>
                                          </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                          <AuthInput
                                                id="job_title"
                                                name="job_title"
                                                label="Job Title"
                                                placeholder="e.g., Follow my X account"
                                                icon={<HelpCircle size={14} className="text-slate-400" />}
                                                value={form.title}
                                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                          />

                                          <AuthSelect
                                                label="Platform"
                                                name="platform"
                                                id="platform"
                                                icon={<Info size={14} className="text-slate-400" />}
                                                value={form.platform_id}
                                                options={platforms.map(p => ({ value: p.id, data: p.name }))}
                                                onChange={e => setForm(prev => ({ ...prev, platform_id: e.target.value }))}
                                                error={platformError}
                                          />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                          <AuthInput
                                                id="target_url"
                                                name="target_url"
                                                label="Target URL"
                                                type="url"
                                                placeholder="https://x.com/yourprofile"
                                                icon={<Link size={14} className="text-slate-400" />}
                                                value={form.target_url}
                                                onChange={e => setForm(prev => ({ ...prev, target_url: e.target.value }))}
                                          />

                                          <AuthSelect
                                                label="Task Type"
                                                name="job_type"
                                                id="job_type"
                                                icon={<Workflow size={14} className="text-slate-400" />}
                                                value={form.job_type}
                                                options={[
                                                      { value: 'FOLLOW',  data: 'Follow' },
                                                      { value: 'LIKE',    data: 'Like' },
                                                      { value: 'COMMENT', data: 'Comment' },
                                                      { value: 'RETWEET', data: 'Retweet' },
                                                      { value: 'SAVE',    data: 'Save' },
                                                      { value: 'SHARE',   data: 'Share' },
                                                ]}
                                                onChange={e => setForm(prev => ({ ...prev, job_type: e.target.value as JobType }))}
                                          />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
                                          <AuthInput
                                                name="total_slots"
                                                id="total_slots"
                                                label="Worker Slots"
                                                type="number"
                                                placeholder="10"
                                                icon={<Info size={14} className="text-slate-400" />}
                                                value={form.total_slots}
                                                onChange={e => setForm(prev => ({
                                                      ...prev, total_slots: Math.max(1, parseInt(e.target.value) || 1),
                                                }))}
                                          />

                                          <AuthInput
                                                name="payout_amount"
                                                id="payout_amount"
                                                label="Payout per Task (₦)"
                                                type="number"
                                                placeholder="150"
                                                icon={<Info size={14} className="text-slate-400" />}
                                                value={form.payout_amount}
                                                onChange={e => setForm(prev => ({
                                                      ...prev, payout_amount: Math.max(1, parseInt(e.target.value) || 1),
                                                }))}
                                          />

                                          <AuthSelect
                                                label="Expires In"
                                                name="expires_in_days"
                                                id="expires_in_days"
                                                value={String(form.expires_in_days)}
                                                options={[
                                                      { value: '1',  data: '1 day' },
                                                      { value: '3',  data: '3 days' },
                                                      { value: '7',  data: '7 days' },
                                                      { value: '14', data: '14 days' },
                                                      { value: '30', data: '30 days' },
                                                ]}
                                                onChange={e => setForm(prev => ({ ...prev, expires_in_days: parseInt(e.target.value) }))}
                                          />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                          <span className="text-sm font-bold text-slate-700">Task Description</span>
                                          <textarea
                                                required
                                                placeholder="List steps clearly: 1. Go to... 2. Click Follow... 3. Screenshot…"
                                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 min-h-[100px] text-sm"
                                                value={form.description}
                                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                          />
                                    </div>

                                    {/* Proof Instructions */}
                                    <div className="space-y-2">
                                          <span className="text-sm font-bold text-slate-700">Proof Requirements</span>
                                          <textarea
                                                placeholder="e.g., Screenshot showing you've followed the account + your username"
                                                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:border-blue-500 min-h-[80px] text-sm"
                                                value={form.proof_instructions}
                                                onChange={e => setForm(prev => ({ ...prev, proof_instructions: e.target.value }))}
                                          />
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3">
                                          <PostJobCheckbox
                                                idname="requires_screenshot"
                                                label="Require Screenshot Proof"
                                                description="Workers must upload a screenshot as proof."
                                                checked={form.requires_screenshot}
                                                onChange={e => setForm(prev => ({ ...prev, requires_screenshot: e.target.checked }))}
                                          />
                                          <PostJobCheckbox
                                                idname="requires_before_proof"
                                                label="Require Before & After Screenshots"
                                                description="Workers must show state before and after completing the task."
                                                checked={form.requires_before_proof}
                                                onChange={e => setForm(prev => ({ ...prev, requires_before_proof: e.target.checked }))}
                                          />
                                          <PostJobCheckbox
                                                idname="auto_approve"
                                                label="Auto-Approve Submissions"
                                                description="Pay workers automatically without manual review. Higher fraud risk."
                                                checked={form.auto_approve}
                                                onChange={e => setForm(prev => ({ ...prev, auto_approve: e.target.checked }))}
                                          />
                                    </div>

                                    <button type="submit" disabled={loading || platforms.length === 0} className="w-full cursor-pointer bg-blue-600 text-white py-4 rounded-full font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed" >
                                          {loading ? (
                                                <><Loader2 size={20} className="animate-spin" /> Posting Job…</>
                                          ) : (
                                                'Post Job & Launch Campaign'
                                          )}
                                    </button>

                              </form>

                        </div>
                  </div>

                  {/* ── Cost Summary ─────────────────────────────────────────────────── */}
                  <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden sticky top-2">
                              <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Calculator size={120} />
                              </div>
                              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                                    <Calculator size={18} className="text-blue-400" /> Cost Summary
                              </h3>

                              <div className="space-y-4 relative z-10">
                                    <CostRow label="Task Cost" value={`₦${totalCost.toLocaleString()}`} />
                                    <CostRow label="Platform Fee (10%)" value={`₦${platformFee.toLocaleString()}`} />
                                    <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                          <span className="text-lg font-bold">Total Due</span>
                                          <span className="text-2xl font-black text-blue-400">₦{grandTotal.toLocaleString()}</span>
                                    </div>
                              </div>

                              <div className="mt-6 space-y-3 relative z-10">
                                    <InfoStep n={1} text="Your job is reviewed for safety before going live." />
                                    <InfoStep n={2} text="Funds are held in escrow until each proof is approved." />
                                    <InfoStep n={3} text="Unused slots are refunded if the campaign ends early." />
                              </div>
                        </div>
                  </div>

            </div>
      );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CostRow = ({ label, value }: { label: string; value: string }) => (
      <div className="flex justify-between items-center text-slate-400">
            <span>{label}</span>
            <span className="text-white font-medium">{value}</span>
      </div>
);

const InfoStep = ({ n, text }: { n: number; text: string }) => (
      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                  {n}
            </div>
            <p className="text-xs text-slate-300">{text}</p>
      </div>
);

const PostJobCheckbox = ({ label, description, idname, checked, onChange }: { label: string; description?: string; idname: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
      <label htmlFor={idname} className="flex items-start gap-3 cursor-pointer group">
            <input
                  type="checkbox"
                  id={idname}
                  name={idname}
                  checked={checked}
                  onChange={onChange}
                  className="mt-0.5 h-4 w-4 rounded accent-blue-600"
            />
            <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{label}</p>
                  {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            </div>
      </label>
);

const SuccessOverlay = ({ jobId, totalCost, onReset }: { jobId: string; totalCost: number; onReset: () => void; }) => (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-5">
                  <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                              <p className="font-bold text-slate-900">Job posted successfully!</p>
                              <p className="text-xs text-slate-400">ID: {jobId.slice(0, 8)}…</p>
                        </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <p className="text-sm text-amber-800 font-semibold">Payment Required</p>
                        <p className="text-xs text-amber-700 mt-1">
                              Your job is pending. Pay <strong>₦{totalCost.toLocaleString()}</strong> to activate it
                              and make it visible to workers.
                        </p>
                  </div>
                  <div className="flex gap-3">
                        <button onClick={onReset} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-semibold hover:bg-slate-200 transition-colors text-sm" >
                              Post another
                        </button>
                        <button onClick={() => window.location.href = '/dashboard/jobs'} className="flex-1 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm" >
                              View my jobs
                        </button>
                  </div>
            </div>
      </div>
);

export default PostJob;