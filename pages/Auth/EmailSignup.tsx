import React, { useCallback, useState } from "react";
import { ArrowRight, User, LockIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import AuthInput, { AuthPasswdInput } from "@/components/Auth/AuthInput";
import GoogleOAuth from "@/components/Auth/GoogleOAuth";
import { supabase } from "@/server/supabase";
import { AuthCredentials, ValidationError } from "@/types/auth_types";
import { NetworkService } from "@/utils/network_service";
import ValidationService, { toEmail } from "@/utils/ui_validation_service";
import { ErrorService } from "@/utils/error_service";
import AuthUIApi from "@/utils/auth_ui_api";
import { Email } from "@/types/types";


const EmailSignup = () => {

      // State management
      const [formData, setFormData] = useState<AuthCredentials>({ email: '' as Email, password: '' });

      const [isLoading, setIsLoading] = useState(false);
      const [isSent, setIsSent] = useState(false);
      const [errors, setErrors] = useState<ValidationError[]>([]);
      const [signupData, setSignupData] = useState<any>(null);
      const [reqPasswd, setReqPasswd] = useState<string[]>([]);

      // Get redirect URL based on environment
      const getRedirectUrl = useCallback(() => {
            const baseUrl = process.env.LOCAL_DEV_URI || window.location.origin;
            return `${baseUrl}${process.env.AUTH_WORKBIT_VERIFIED_CALLBACK}`;
      }, []);

      // Handle input change with real-time validation clearing
      const handleInputChange = useCallback((field: 'email' | 'password', value: string) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (field === 'password') {
                  setReqPasswd(ValidationService.UIValidatePassword(value));
            }
            // Clear errors for this field as user types
            setErrors(prev => prev.filter(err => err.field !== field));
      }, []);

      // Handle form submission
      const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            // Reset errors
            setErrors([]);

            // 1. Check network connectivity
            if (!NetworkService.isOnline()) {
                  setErrors([{ 
                        field: 'generic', 
                        message: 'You appear to be offline. Please check your internet connection.' 
                  }]);
                  return;
            }

            // 2. Validate form inputs
            // const validationErrors = ValidationService.validateForm(formData);

            // if (validationErrors.length > 0) {

            //       setErrors(validationErrors);
            //       return;
            // }

            // 3. Start loading state
            setIsLoading(true);

            try {
                  // 4. Attempt signup with Supabase
                  const { data, error } = await supabase.auth.signUp({
                        email: formData.email.trim().toLowerCase(),
                        password: formData.password,
                        options: {
                              emailRedirectTo: getRedirectUrl(),
                              data: {
                                    // Optional: Add any metadata you want to store
                                    signup_source: 'web',
                                    signup_timestamp: new Date().toISOString(),
                              }
                        }
                  });

                  // 5. Handle errors
                  if (error) {
                        const userFriendlyError = ErrorService.handleSupabaseError(error, 'handleSignup');
                        setErrors([{ field: 'generic', message: userFriendlyError.message }]);
                        return;
                  }

                  // 6. Handle success
                  if (data?.user) {
                        setSignupData(data);
                        setIsSent(true);
                        // Clear form for security
                        setFormData({ email: '' as Email, password: '' });
                  }

            } catch (error: any) {
                  // 7. Handle unexpected errors
                  console.error('Unexpected error during signup:', error);

                  setErrors([{ 
                        field: 'generic', 
                        message: 'An unexpected error occurred. Please try again later.' 
                  }]);

            } finally {
                  // 8. Always stop loading state
                  setIsLoading(false);
            }
      };

      const requiredPasswordRequirements = (req: string) => {
            return reqPasswd.includes(req);
      }

      return (
            <div className="bg-white rounded-[2.5rem] space-y-6">

                  {/* General Error Alert */}
                  {AuthUIApi.getGeneralError(errors) && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                              <div className="flex-1">
                                    <p className="text-red-800 text-sm font-medium">Error</p>
                                    <p className="text-red-600 text-sm mt-1">{AuthUIApi.getGeneralError(errors)}</p>
                              </div>
                        </div>
                  )}

                  {/* Success Message */}
                  {isSent && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                              <div className="flex-1">
                                    <p className="text-green-800 text-sm font-medium">Check your email</p>
                                    <p className="text-green-600 text-sm mt-1">We've sent a confirmation link to <strong>{formData.email}</strong></p>
                              </div>
                        </div>
                  )}

                  <form onSubmit={handleSignup} className="bg-white rounded-[2.5rem] border-none max-sm:space-y-6" noValidate>

                        <div className="flex flex-col items-center w-full relative space-y-6 md:gap-2">

                              {/* Email Input */}
                              <div className="w-full">
                                    <AuthInput
                                          type="email"
                                          value={formData.email}
                                          id="email"
                                          name="email"
                                          icon={<User size={16} />}
                                          label="Email address"
                                          placeholder="name@example.com"
                                          required
                                          disabled={isLoading}
                                    //   autoComplete="email"
                                          onChange={(e) => handleInputChange('email', toEmail(e.target.value))}
                                          aria-invalid={!!AuthUIApi.getFieldError(errors, 'email')}
                                          aria-describedby={AuthUIApi.getFieldError(errors, 'email') ? 'email-error' : undefined}
                                    />
                                    {AuthUIApi.getFieldError(errors, 'email') && (
                                          <p id="email-error" className="text-red-500 text-sm mt-1 ml-2">
                                                {AuthUIApi.getFieldError(errors, 'email')}
                                          </p>
                                    )}
                              </div>

                              {/* Password Input */}
                              <div className="w-full">
                                    <AuthPasswdInput
                                          value={formData.password}
                                          id="password"
                                          name="password"
                                          icon={<LockIcon size={16} />}
                                          label="Password"
                                          placeholder="Min. 8 characters"
                                          required
                                          disabled={isLoading}
                                          autoComplete="new-password"
                                          onChange={(e) => handleInputChange('password', e.target.value)}
                                          aria-invalid={!!AuthUIApi.getFieldError(errors, 'password')}
                                          aria-describedby={AuthUIApi.getFieldError(errors, 'password') ? 'password-error' : undefined}
                                    />
                                    {AuthUIApi.getFieldError(errors, 'password') && (
                                          <p id="password-error" className="text-red-500 text-sm mt-1 ml-2">
                                                {AuthUIApi.getFieldError(errors, 'password')}
                                          </p>
                                    )}

                                    {/* Password Requirements Hint */}
                                    <div className={`text-xs text-gray-500 mt-2 ml-2 space-y-1 ${reqPasswd.length === 0 ? 'hidden' : ''}`}>
                                          <p>Password must contain:</p>
                                          <ul className="list-disc list-inside ml-2 space-y-0.5">
                                                <li className={requiredPasswordRequirements('passwd_len') ? 'text-green-700' : 'text-red-500'}>At least 8 characters</li>
                                                <li className={requiredPasswordRequirements('passwd_upper') && requiredPasswordRequirements('passwd_lower') ? 'text-green-700' : 'text-red-500'}>One uppercase and lowercase letter</li>
                                                <li className={requiredPasswordRequirements('passwd_number') && requiredPasswordRequirements('passwd_special') ? 'text-green-700' : 'text-red-500'}>One number and special character</li>
                                          </ul>
                                    </div>
                              </div>

                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-row items-center justify-center w-full relative">
                              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-full cursor-pointer text-md hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600" aria-busy={isLoading} >
                                    {isLoading ? (
                                          <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Creating Account...
                                          </>
                                    ) : (
                                          <>
                                                Sign Up
                                                <ArrowRight size={20} />
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

                  {/* Divider */}
                  <div className="flex flex-col w-full relative items-center justify-center space-y-4">
                        <div className="flex flex-row items-center justify-center my-[20px] text-[#888] divider w-full">
                              <div className="flex-1 h-px bg-gray-200" />
                                    <span className="bg-white px-4 z-[100] text-sm">OR</span>
                              <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <GoogleOAuth disabled={isLoading} />
                  </div>

                  {/* Email Confirmation Dialog */}
                  {/* {isSent && <ConfirmEmailDialog />} */}
                  {/* {isSent && <ConfirmEmailDialog email={formData.email} data={signupData} />} */}
            </div>
      );
};

export default EmailSignup;