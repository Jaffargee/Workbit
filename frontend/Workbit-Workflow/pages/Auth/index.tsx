import React, { useEffect, useState } from "react";
import { Logo } from "../../components/Logo";
import { User, Hash, Phone, ShieldCheck, Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthInput from "@/components/Auth/AuthInput";
import AuthSelect, { SelectOptions } from "@/components/Auth/AuthSelect";
import { EmailAuthSignup, Gender, NigerianState } from "@/types/types";
import AuthSelectList from "@/components/Auth/AuthSelectList";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/server/supabase";
import EmailSignup from "./EmailSignup";
import EmailLogin from "./EmailLogin";
import { useAuth } from "@/context/authentication";
import ErrorDisplay from "@/components/Auth/ErrorDisplay";
import { NigerianStates } from "@/constants";
import { ValidationError } from "@/types/auth_types";
import AuthUIApi from "@/utils/auth_ui_api";
import { isValidPhone, toPhone } from "@/utils/ui_validation_service";
import { NetworkService } from "@/utils/network_service";
import Loading from "@/components/Loading";

const Auth: React.FC<{ type: "login" | "register" | "profile" }> = ({ type }) => {

      const { isAuthenticated, profile, loading } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
            if (isAuthenticated && profile) {
                  navigate('/dashboard');
            }
      }, [isAuthenticated, profile, type, navigate]);
      
      if (loading || (isAuthenticated && profile)) {
            return (
                  <div className="flex flex-col w-full h-[100vh] items-center justify-center py-10">
                        <Loading />
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
                  <div className="md:min-w-[700px] min-w-sm space-y-6 relative z-10 bg-white px-2">

                        <div className="text-center space-y-4">
                              <div className="flex justify-center mb-8">
                                    <Logo size="lg" />
                              </div>
                              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {type === "login"
                                          ? "Welcome Back!"
                                          : type === "profile" ? "Setup You Account Profile": "Create Your Account"}
                              </h1>
                              <p className="text-slate-500 font-medium">
                                    {type === "login"
                                          ? "Enter your credentials to access your dashboard."
                                          : type === "profile" ? "Let’s personalize your profile to unlock your first earning opportunities." : "Join thousands of workers earning daily income."}
                              </p>
                        </div>

                        {
                              type === 'register' ? <EmailSignup /> : type === "profile" ? <Profile /> : <EmailLogin />
                        }

                        {
                              type !== 'profile' && 
                              <p className="text-center text-slate-500 font-medium">
                                    {type === "login"
                                          ? "Don't have an account?"
                                          : "Already have an account?"}{" "}
                                    <Link
                                          to={
                                                type === "login"
                                                      ? "/auth/signup"
                                                      : "/auth/login"
                                          }
                                          className="text-blue-600 font-bold hover:underline"
                                    >
                                          {type === "login"
                                                ? "Register here"
                                                : "Login here"}
                                    </Link>
                              </p>
                        }


                  </div>
            </div>
      );
};

const Profile = () => {

      const [loading, setLoading] = useState<boolean>(false);
      const [isSent, setSent] = useState<boolean>(false);
      const [error, setErrors] = useState<ValidationError[]>([]);
      const navigate = useNavigate();

      const [formData, setFormData] = useState<EmailAuthSignup>({
            p_first_name: "",
            p_last_name: "",
            p_phone: "",
            p_username: "",
            p_gender: 'Male' as Gender,
            p_state: '' as NigerianState,
            p_user_type: 'WORKER',
      });

      const handleSubmit = async (e:any) => {
            e.preventDefault();
            
            setLoading(true);

            if (!NetworkService.isOnline()) {
                  setErrors([{ 
                        field: 'general', 
                        message: 'You appear to be offline. Please check your internet connection.' 
                  }]);
                  return;
            }

            try {
                  const { data, error: insertError } = await supabase.rpc('insert_user_profile', formData);
                  
                  if(insertError) {
                        setErrors([{ 
                              field: 'general', 
                              message: insertError.message 
                        }]);
                        return;
                  }

                  if(data) {
                        setSent(true);
                        setErrors([]);
                        navigate('/dashboard');
                        return;
                  }
                  
            } catch (error) {
                  console.log(error);
            } finally {
                  setLoading(false);
            }

      }

      return (
            <div className="flex flex-col w-full space-y-6">

                  {
                        AuthUIApi.getGeneralError(error) &&
                        <ErrorDisplay err_msg={AuthUIApi.getGeneralError(error)} />
                  }

                  {isSent && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                              <div className="flex-1">
                                    <p className="text-green-800 text-sm font-medium">Your Profile have created successfully!</p>
                                    <p className="text-green-600 text-sm mt-1">Now you can proceed to your dashboard.</p>
                              </div>
                        </div>
                  )}

                  <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border-none border-slate-100 space-y-6">

                        <div className="flex flex-row items-center w-full relative gap-2">

                              <AuthInput disabled={loading} type="text" value={formData.p_first_name} id="fname" name="fname" icon={<User size={16} />} label="First Name" placeholder="Your first name" required
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                p_first_name: e.target.value,
                                          })
                                    }
                              />

                              <AuthInput disabled={loading} type="text" value={formData.p_last_name} id="lname" name="lname" icon={<User size={16} />} label="Last Name" placeholder="Your last name" required
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                p_last_name: e.target.value,
                                          })
                                    }
                              />
                              
                        </div>

                        <div className="flex flex-row items-center w-full relative gap-2">

                              <AuthInput disabled={loading} type="text" value={formData.p_username} id="username" name="username" icon={<User size={16} />} label="Username" placeholder="Choose your username" required
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                p_username: e.target.value,
                                          })
                                    }
                              />

                              <div className="flex flex-col w-full relative">
                                    <AuthInput disabled={loading} type="text" value={formData.p_phone} id="phone" name="phone" icon={<Phone size={16} />} label="Phone Number" placeholder="+234 81 ......." required
                                          onChange={(e) => {

                                                setFormData({
                                                      ...formData,
                                                      p_phone: e.target.value,
                                                })

                                                if(!isValidPhone(e.target.value)) {
                                                      setErrors(prevErrors => [
                                                            ...prevErrors.filter(err => err.field !== 'phone'),
                                                            { field: 'phone', message: 'Invalid phone number' }
                                                      ]);
                                                } else {
                                                      setErrors(prevErrors => prevErrors.filter(err => err.field !== 'phone'));
                                                }

                                          }}
                                    />
                                    {AuthUIApi.getFieldError(error, 'phone') &&
                                          <p id="state-error" className="text-red-500 text-sm mt-1 ml-2">
                                                <span>{AuthUIApi.getFieldError(error, 'phone')}</span>
                                          </p>
                                    }
                              </div>

                        </div>

                        <div className="flex flex-row items-center w-full relative gap-2">

                              <AuthSelect disabled={loading} value={formData.p_gender} id="gender" name="gender" options={[{value: "Male", data: "Male"}, {value: "Female", data: "Female"}]} icon={<User size={16} />} label="Gender"
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                p_gender: e.target.value,
                                          })
                                    }
                              />

                              <div className="flex flex-col w-full relative">
                                    <AuthSelectList disabled={loading} label="State" value={formData.p_state}
                                          onChange={(e) => {
                                                
                                                setFormData({
                                                      ...formData,
                                                      p_state: e.target.value,
                                                });

                                                if (!NigerianStates.includes(e.target.value as NigerianState)) {
                                                      setErrors(prevErrors => [
                                                            ...prevErrors.filter(err => err.field !== 'state'),
                                                            { field: 'state', message: 'Please choose a valid Nigerian state' }
                                                      ]);
                                                } else {
                                                      setErrors(prevErrors => prevErrors.filter(err => err.field !== 'state'));
                                                }
                                          }}
                                    />
                                    {AuthUIApi.getFieldError(error, 'state') &&
                                          <p id="state-error" className="text-red-500 text-sm mt-1 ml-2">
                                                <span>{AuthUIApi.getFieldError(error, 'state')}</span>
                                          </p>
                                    }
                              </div>

                        </div>

                        <div className="flex flex-row items-center w-full relative gap-2">

                              <AuthSelect disabled={loading} value={formData.p_user_type} id="user_type" name="user_type" options={[{value: "WORKER", data: "Worker"}, {value: "EMPLOYER", data: "Employer"}, {value: "BOTH", data: "Both"}]} icon={<User size={16} />} label="User Type"
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                p_user_type: e.target.value,
                                          })
                                    }
                              />

                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-row items-center justify-center w-full relative">
                              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-full cursor-pointer text-md hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 font-medium" aria-busy={loading} >
                                    {loading ? (
                                          <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Creating Account...
                                          </>
                                    ) : (
                                          <>
                                                Continue
                                          </>
                                    )}
                              </button>
                        </div>

                        {/* Terms and Privacy */}
                        <p className="text-center text-xs text-gray-500 mt-4">
                              By signing up, you agree to our{' '}
                              <a href="/terms" className="text-blue-600 hover:underline">
                                    Terms of Service
                              </a>{' '}
                              and{' '}
                              <a href="/privacy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                              </a>
                        </p>

                  </form>

                  {/* <ConfirmReferralDialog /> */}

            </div>
      )
}

export const ConfirmReferralDialog = () => {

      const [refferal, setRefferal] = useState<string>('');
      const { isAuthenticated } = useAuth();

      return (
            <div className="fixed top-0 left-0 h-full w-full z-100 bg-[#1111111d]">
                  <div className="flex flex-col items-center justify-center h-full w-full px-4">

                        {/* Main Dialog */}
                        <div className="flex relative bg-white overflow-hidden shadow-lg rounded-2xl md:min-w-[600px] min-h-[400px] max-sm:w-full">
                              <div className="flex relative p-6 h-full w-full">
                                    <div className="flex flex-col h-full w-full relative items-center justify-center space-y-4">

                                          <div className="flex flex-col w-full relative items-center justify-center gap-2">
                                                <p className="text-[1.5rem] text-center font-semibold ">
                                                      <span className="text-gray-700">Were you invited by someone?</span>
                                                </p>
                                                <p className="text-center text-gray-600">
                                                      If a friend invited you, enter their referral code now.
                                                      <br />
                                                      You won’t be able to add it later.
                                                </p>
                                          </div>
                                          
                                          <AuthInput style={{ textTransform: 'uppercase' }} type="text" id="ref_code" name="ref_code" icon={<Hash size={16} />} label="Referral Code (Optional)" placeholder="WB-ABC123" onChange={(e) => { setRefferal(e.target.value) }} />

                                          {/* Confirm Button */}
                                          <div className="flex flex-col w-full relative items-center justify-center my-2">
                                                <button disabled={refferal.length === 0} onClick={() => alert('Connected')} style={{opacity: refferal.length === 0 ? .7 : 1}} className="flex flex-col w-full overflow-hidden relative bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                                      <div className="flex flex-col px-4 py-3 items-center justify-center h-full w-full relative">
                                                            <span className="text-white font-medium">Confirm refferal</span>
                                                      </div>
                                                </button>
                                          </div>
                                          {/* Confirm Button */}

                                          {/* Continue Button */}
                                          <div className="flex flex-col w-full relative items-center justify-center my-2">
                                                <button className="flex flex-col w-full overflow-hidden relative bg-slate-100 hover:bg-slate-300 rounded-full cursor-pointer transition-colors">
                                                      <div className="flex flex-col px-4 py-3 items-center justify-center h-full w-full relative">
                                                            <span className="font-medium text-blue-600">Continue without code</span>
                                                      </div>
                                                </button>
                                          </div>
                                          {/* Continue Button */}

                                    </div>
                              </div>
                        </div>
                        {/* Main Dialog */}

                  </div>
            </div>
      )
}

export default Auth;