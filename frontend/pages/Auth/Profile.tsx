import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "@/components/Auth/AuthInput";
import {
      Banknote, CheckCircle2, Loader2,
      Phone, User, MapPin, CreditCard,
      Calendar,
} from "lucide-react";
import AuthSelect from "@/components/Auth/AuthSelect";
import AuthSelectList from "@/components/Auth/AuthSelectList";
import { NigerianStates } from "@/constants";
import { Gender, NigerianState, ProfileSetupPayload, UserType, ValidationError } from "@/types/types";
import { supabase } from "@/server/supabase";
import { useAuth } from "@/contexts/authentication";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateProfile(data: ProfileSetupPayload): ValidationError[] {
  const errs: ValidationError[] = [];

  if (!data.p_first_name.trim())
    errs.push({ field: 'p_first_name', message: 'First name is required' });

  if (!data.p_last_name.trim())
    errs.push({ field: 'p_last_name', message: 'Last name is required' });

  if (!data.p_phone.trim()) {
    errs.push({ field: 'p_phone', message: 'Phone number is required' });
  } else if (!/^\+?[0-9]{10,14}$/.test(data.p_phone.replace(/\s/g, ''))) {
    errs.push({ field: 'p_phone', message: 'Enter a valid Nigerian phone number' });
  }

  if (!data.p_state)
    errs.push({ field: 'p_state', message: 'Please select your state' });

  if (!data.p_bank_name.trim())
    errs.push({ field: 'p_bank_name', message: 'Bank name is required' });

  if (!/^\d{10}$/.test(data.p_account_number.trim()))
    errs.push({ field: 'p_account_number', message: 'Account number must be exactly 10 digits' });

  if (!data.p_account_name.trim())
    errs.push({ field: 'p_account_name', message: 'Account name is required' });

  return errs;
}

function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}

function getGeneralError(errors: ValidationError[]): string | undefined {
  return errors.find(e => e.field === 'general')?.message;
}

// ─── Field Error Message ─────────────────────────────────────────────────────

const FieldError = ({ errors, field }: { errors: ValidationError[], field: string }) => {
  const msg = getFieldError(errors, field);
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1 ml-1">{msg}</p>;
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string; }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const Profile = () => {
      const navigate = useNavigate();
      const [loading, setLoading] = useState(false);
      const [done, setDone] = useState(false);
      const [errors, setErrors] = useState<ValidationError[]>([]);

      const { user } = useAuth();

      const [form, setForm] = useState<ProfileSetupPayload>({
            p_first_name:     '',
            p_last_name:      '',
            p_phone:          '',
            p_email:          '',
            p_gender:         'MALE' as Gender,
            p_dob:            '',
            p_state:          '' as NigerianState,
            p_user_type:      'WORKER' as UserType,
            p_bank_name:      '',
            p_account_number: '',
            p_account_name:   '',
      });

      const set = (field: keyof ProfileSetupPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
            // Clear the error for this field as the user types
            setErrors(prev => prev.filter(err => err.field !== field));
      };

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();

            const validationErrors = validateProfile(form);
            if (validationErrors.length > 0) {
                  setErrors(validationErrors);
                  // Scroll to first error
                  document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
            }

            setLoading(true);
            setErrors([]);

            try {
                  const { data, error } = await supabase.rpc('insert_user_profile', {
                        p_first_name:     form.p_first_name.trim(),
                        p_last_name:      form.p_last_name.trim(),
                        p_email:          user?.email ?? '',
                        p_phone:          form.p_phone.trim(),
                        p_gender:         form.p_gender,
                        p_dob:            form.p_dob,
                        p_state:          form.p_state,
                        p_user_type:      form.p_user_type, // Pass this separately as required by SQL
                        p_bank_name:      form.p_bank_name.trim(),
                        p_account_number: form.p_account_number.trim(),
                        p_account_name:   form.p_account_name.trim().toUpperCase(),
                        metadata:         {} // Pass empty or extra metadata if needed
                  });


                  if (error) {
                        setErrors([{ field: 'general', message: error.message }]);
                        return;
                  }

                  if (data?.success) {
                        setDone(true);
                        setTimeout(() => navigate('/dashboard'), 1500);
                  }

            } catch (err: any) {
                  setErrors([{ field: 'general', message: 'Something went wrong. Please try again.' }]);
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="flex flex-col w-full space-y-5">

                  {/* General error */}
                  {getGeneralError(errors) && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
                              {getGeneralError(errors)}
                        </div>
                  )}

                  {/* Success */}
                  {done && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                              <div>
                                    <p className="text-green-800 text-sm font-semibold">Profile created!</p>
                                    <p className="text-green-600 text-xs mt-0.5">Redirecting to your dashboard…</p>
                              </div>
                        </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                        {/* ── Personal Info ─────────────────────────────────────── */}
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border-slate-200 border">
                              <SectionHeader
                                    icon={<User size={15} />}
                                    title="Personal Information"
                                    subtitle="Your name and basic details"
                              />

                              <div className="grid md:grid-cols-1 md:grid-cols-2 gap-3">
                                    <div data-error={getFieldError(errors, 'p_first_name') ? '' : undefined}>
                                          <AuthInput
                                                disabled={loading}
                                                type="text"
                                                value={form.p_first_name}
                                                id="p_first_name"
                                                name="p_first_name"
                                                label="First Name"
                                                placeholder="John"
                                                required
                                                onChange={set('p_first_name')}
                                                className="bg-white"
                                          />
                                          <FieldError errors={errors} field="p_first_name" />
                                    </div>

                                    <div>
                                          <AuthInput
                                                disabled={loading}
                                                type="text"
                                                value={form.p_last_name}
                                                id="p_last_name"
                                                name="p_last_name"
                                                label="Last Name"
                                                placeholder="Doe"
                                                required
                                                onChange={set('p_last_name')}
                                                className="bg-white"
                                          />
                                          <FieldError errors={errors} field="p_last_name" />
                                    </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                    <div data-error={getFieldError(errors, 'p_phone') ? '' : undefined}>
                                          <AuthInput
                                                disabled={loading}
                                                type="tel"
                                                value={form.p_phone}
                                                id="p_phone"
                                                name="p_phone"
                                                icon={<Phone size={14} />}
                                                label="Phone Number"
                                                placeholder="+234 801 234 5678"
                                                required
                                                onChange={set('p_phone')}
                                                className="bg-white"
                                          />
                                          <FieldError errors={errors} field="p_phone" />
                                    </div>
                                    <div data-error={getFieldError(errors, 'dob') ? '' : undefined}>
                                          <AuthInput
                                                disabled={loading}
                                                type="date"
                                                value={form.p_dob}
                                                id="p_dob"
                                                name="p_dob"
                                                icon={<Calendar size={14} />}
                                                label="Date of Birth"
                                                placeholder="Date of Birth"
                                                required
                                                onChange={set('p_dob')}
                                                className="bg-white"
                                          />
                                          <FieldError errors={errors} field="p_dob" />
                                    </div>
                              </div>

                              <div className="grid md:grid-cols-1 md:grid-cols-2 gap-3">
                                    <AuthSelect
                                          disabled={loading}
                                          value={form.p_gender}
                                          id="p_gender"
                                          name="p_gender"
                                          label="Gender"
                                          options={[
                                                { value: 'MALE',             data: 'Male' },
                                                { value: 'FEMALE',           data: 'Female' },
                                                { value: 'OTHER',            data: 'Other' },
                                                { value: 'PREFER_NOT_TO_SAY', data: 'Prefer not to say' },
                                          ]}
                                          onChange={set('p_gender')}
                                          className="bg-white"
                                    />

                                    <div>
                                          <AuthSelectList
                                                disabled={loading}
                                                label="State"
                                                value={form.p_state as NigerianState}
                                                onChange={(e) => {
                                                      setForm(prev => ({ ...prev, p_state: e.target.value as NigerianState }));
                                                      setErrors(prev => prev.filter(err => err.field !== 'p_state'));
                                                }}
                                                className="bg-white"
                                          />
                                          <FieldError errors={errors} field="p_state" />
                                    </div>
                              </div>

                              <AuthSelect
                                    disabled={loading}
                                    value={form.p_user_type}
                                    id="p_user_type"
                                    name="p_user_type"
                                    label="I want to"
                                    options={[
                                          { value: 'WORKER',   data: 'Earn money by completing tasks (Worker)' },
                                          { value: 'EMPLOYER', data: 'Post tasks and hire workers (Employer)' },
                                          { value: 'BOTH',     data: 'Both — earn and post tasks' },
                                    ]}
                                    onChange={set('p_user_type')}
                                    className="bg-white"
                              />
                        </div>

                        {/* ── Bank Details ──────────────────────────────────────── */}
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border-slate-200 border">
                              <SectionHeader
                                    icon={<CreditCard size={15} />}
                                    title="Payment Details"
                                    subtitle="Where your earnings will be sent"
                              />

                              <div>
                                    <AuthInput
                                          disabled={loading}
                                          type="text"
                                          value={form.p_bank_name}
                                          id="p_bank_name"
                                          name="p_bank_name"
                                          icon={<Banknote size={14} />}
                                          label="Bank Name"
                                          placeholder="e.g. GTBank, Access Bank"
                                          required
                                          onChange={set('p_bank_name')}
                                          className="bg-white"
                                    />
                                    <FieldError errors={errors} field="p_bank_name" />
                              </div>

                              <div>
                                    <AuthInput
                                          disabled={loading}
                                          type="text"
                                          value={form.p_account_number}
                                          id="p_account_number"
                                          name="p_account_number"
                                          icon={<Banknote size={14} />}
                                          label="Account Number"
                                          placeholder="10-digit NUBAN"
                                          maxLength={10}
                                          required
                                          onChange={set('p_account_number')}
                                          className="bg-white"
                                    />
                                    <FieldError errors={errors} field="p_account_number" />
                              </div>

                              <div>
                                    <AuthInput
                                          disabled={loading}
                                          type="text"
                                          value={form.p_account_name}
                                          id="p_account_name"
                                          name="p_account_name"
                                          icon={<Banknote size={14} />}
                                          label="Account Name"
                                          placeholder="As it appears on your bank statement"
                                          required
                                          onChange={(e) => {
                                                setForm(prev => ({
                                                      ...prev,
                                                      p_account_name: e.target.value.toUpperCase(),
                                                }));
                                                setErrors(prev => prev.filter(err => err.field !== 'p_account_name'));
                                          }}
                                          className="bg-white"
                                    />
                                    <FieldError errors={errors} field="p_account_name" />
                              </div>

                              <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border-blue-700 border">
                                    <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                    Your account details are encrypted and only used for withdrawals.
                                    You can update them anytime from your profile settings.
                                    </p>
                              </div>
                        </div>

                        {/* ── Submit ───────────────────────────────────────────── */}
                        <button type="submit" disabled={loading || done} className="w-full bg-blue-600 text-white py-3.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" >
                              {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Setting up your account…</>
                              ) : done ? (
                                    <><CheckCircle2 size={18} /> All done!</>
                              ) : (
                                    'Complete Setup & Go to Dashboard'
                              )}
                        </button>

                        <p className="text-center text-xs text-slate-400">
                              By continuing, you agree to our{' '}
                              <a href="/terms" className="text-blue-600 hover:underline">Terms</a>
                              {' '}and{' '}
                              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                        </p>

                  </form>
            </div>
      );

};

export default Profile;