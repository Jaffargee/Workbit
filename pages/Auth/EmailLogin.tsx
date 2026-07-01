// import AuthInput, { AuthPasswdInput } from '@/components/Auth/AuthInput';
// import GoogleOAuth from '@/components/Auth/GoogleOAuth';
// import { supabase } from '@/server/supabase';
// import { ValidationError } from '@/types/auth_types';
// import { Email } from '@/types/types';
// import { AuthCredentials } from '@/types/auth_types';
// import AuthUIApi from '@/utils/auth_ui_api';
// import { ErrorService } from '@/utils/error_service';
// import { NetworkService } from '@/utils/network_service';
// import { AlertCircle, ArrowRight, Loader2, LockIcon, User } from 'lucide-react';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const EmailLogin = () => {
//       const [formData, setFormData] = useState<AuthCredentials>({
//             email: '' as Email,
//             password: '',
//       });
//       const [errors, setErrors] = useState<ValidationError[]>([]);
//       const [isLoading, setIsLoading] = useState<boolean>(false);

//       const navigate = useNavigate();

//       const handleSigning = async (e: any) => {
//             e.preventDefault();

//             if (!NetworkService.isOnline()) {
//                   setErrors([
//                         {
//                               field: 'generic',
//                               message: 'You appear to be offline. Please check your internet connection.',
//                         },
//                   ]);
//                   return;
//             }

//             setIsLoading(true);

//             try {
//                   const { data, error } =
//                         await supabase.auth.signInWithPassword({
//                               email: formData.email,
//                               password: formData.password,
//                         });

//                   if (error) {
//                         const userFriendlyError =
//                               ErrorService.handleSupabaseError(
//                                     error,
//                                     'handleSigning'
//                               );
//                         // Temporary: Show raw error message if available, for debugging
//                         const debugMessage =
//                               error.message ||
//                               (error as any).error_description ||
//                               JSON.stringify(error);
//                         setErrors([
//                               {
//                                     field: 'generic',
//                                     message: `${userFriendlyError.message} (Debug: ${debugMessage})`,
//                               },
//                         ]);
//                         return;
//                   }

//                   if (data.user) {
//                         setFormData({ email: '' as Email, password: '' });
//                         navigate('/auth/profile');
//                   }
//             } catch (error) {
//                   setErrors([
//                         {
//                               field: 'generic',
//                               message: 'An unexpected error occurred. Please try again later.',
//                         },
//                   ]);
//             } finally {
//                   setIsLoading(false);
//             }
//       };

//       return (
//             <div className="bg-white rounded-[2.5rem] space-y-6">
//                   {/* General Error Alert */}
//                   {AuthUIApi.getGeneralError(errors) && (
//                         <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
//                               <AlertCircle
//                                     className="text-red-500 flex-shrink-0 mt-0.5"
//                                     size={20}
//                               />
//                               <div className="flex-1">
//                                     <p className="text-red-800 text-sm font-medium">
//                                           Error
//                                     </p>
//                                     <p className="text-red-600 text-sm mt-1">
//                                           {AuthUIApi.getGeneralError(errors)}
//                                     </p>
//                               </div>
//                         </div>
//                   )}

//                   <form
//                         onSubmit={handleSigning}
//                         className="bg-white rounded-[2.5rem] border-none border-slate-100 space-y-6"
//                   >
//                         <div className="flex flex-col item-center-w-full relative space-y-6 md:gap-2">
//                               <AuthInput
//                                     type="email"
//                                     value={formData.email}
//                                     id="email"
//                                     name="email"
//                                     autoComplete="true"
//                                     icon={<User size={16} />}
//                                     label="Email address"
//                                     placeholder="Your account username"
//                                     required
//                                     onChange={(e) =>
//                                           setFormData({
//                                                 ...formData,
//                                                 email: e.target.value as Email,
//                                           })
//                                     }
//                               />

//                               <AuthPasswdInput
//                                     value={formData.password}
//                                     id="password"
//                                     name="password"
//                                     autoComplete="true"
//                                     icon={<LockIcon size={16} />}
//                                     label="Password"
//                                     placeholder="Your account password"
//                                     required
//                                     onChange={(e) =>
//                                           setFormData({
//                                                 ...formData,
//                                                 password: e.target.value,
//                                           })
//                                     }
//                               />
//                         </div>

//                         {/* Submit Button */}
//                         <div className="flex flex-row items-center justify-center w-full relative">
//                               <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className="w-full bg-blue-600 text-white py-3 rounded-full cursor-pointer text-md hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
//                                     aria-busy={isLoading}
//                               >
//                                     {isLoading ? (
//                                           <>
//                                                 <Loader2
//                                                       size={20}
//                                                       className="animate-spin"
//                                                 />
//                                                 Logging Account...
//                                           </>
//                                     ) : (
//                                           <>
//                                                 Sign In
//                                                 <ArrowRight size={20} />
//                                           </>
//                                     )}
//                               </button>
//                         </div>
//                   </form>

//                   {/* Divider */}
//                   <div className="flex flex-col w-full relative items-center justify-center space-y-4">
//                         <div className="flex flex-row items-center justify-center my-[20px] text-[#888] divider w-full">
//                               <div className="flex-1 h-px bg-gray-200" />
//                               <span className="bg-white px-4 z-[100] text-sm">
//                                     OR
//                               </span>
//                               <div className="flex-1 h-px bg-gray-200" />
//                         </div>
//                         <GoogleOAuth disabled={isLoading} />
//                   </div>
//             </div>
//       );
// };

// export default EmailLogin;

import AuthInput, { AuthPasswdInput } from '@/components/Auth/AuthInput';
import GoogleOAuth from '@/components/Auth/GoogleOAuth';
import ErrorDisplay from '@/components/Auth/ErrorDisplay';
import { supabase } from '@/server/supabase';
import { ValidationError } from '@/types/auth_types';
import { Email } from '@/types/types';
import { AuthCredentials } from '@/types/auth_types';
import AuthUIApi from '@/utils/auth_ui_api';
import { ErrorService } from '@/utils/error_service';
import { NetworkService } from '@/utils/network_service';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
      Button,
      Divider,
      Spinner,
      makeStyles,
      tokens,
} from '@fluentui/react-components';
import {
      ArrowRightRegular,
      PersonRegular,
      LockClosedRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
      root: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXL,
      },
      form: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXL,
      },
      fields: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalL,
      },
      submitBtn: {
            width: '100%',
            minHeight: '50px',
            borderRadius: tokens.borderRadiusCircular,
            fontWeight: tokens.fontWeightSemibold,
            fontSize: tokens.fontSizeBase400,
      },
      divider: {
            margin: `${tokens.spacingVerticalM} 0`,
      },
});

const EmailLogin = () => {
      const styles = useStyles();
      const [formData, setFormData] = useState<AuthCredentials>({
            email: '' as Email,
            password: '',
      });
      const [errors, setErrors] = useState<ValidationError[]>([]);
      const [isLoading, setIsLoading] = useState<boolean>(false);

      const navigate = useNavigate();

      const handleSigning = async (e: React.FormEvent) => {
            e.preventDefault();

            if (!NetworkService.isOnline()) {
                  setErrors([
                        {
                              field: 'generic',
                              message: 'You appear to be offline. Please check your internet connection.',
                        },
                  ]);
                  return;
            }

            setIsLoading(true);

            try {
                  const { data, error } =
                        await supabase.auth.signInWithPassword({
                              email: formData.email,
                              password: formData.password,
                        });

                  if (error) {
                        const userFriendlyError =
                              ErrorService.handleSupabaseError(
                                    error,
                                    'handleSigning'
                              );
                        const debugMessage =
                              error.message ||
                              (error as any).error_description ||
                              JSON.stringify(error);
                        setErrors([
                              {
                                    field: 'generic',
                                    message: `${userFriendlyError.message} (Debug: ${debugMessage})`,
                              },
                        ]);
                        return;
                  }

                  if (data.user) {
                        setFormData({ email: '' as Email, password: '' });
                        navigate('/auth/profile');
                  }
            } catch (error) {
                  setErrors([
                        {
                              field: 'generic',
                              message: 'An unexpected error occurred. Please try again later.',
                        },
                  ]);
            } finally {
                  setIsLoading(false);
            }
      };

      return (
            <div className={styles.root}>
                  {AuthUIApi.getGeneralError(errors) && (
                        <ErrorDisplay
                              err_msg={AuthUIApi.getGeneralError(errors)}
                        />
                  )}

                  <form onSubmit={handleSigning} className={styles.form}>
                        <div className={styles.fields}>
                              <AuthInput
                                    type="email"
                                    value={formData.email}
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    icon={<PersonRegular fontSize={16} />}
                                    label="Email address"
                                    placeholder="Your account username"
                                    required
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                email: e.target.value as Email,
                                          })
                                    }
                              />

                              <AuthPasswdInput
                                    value={formData.password}
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    icon={<LockClosedRegular fontSize={16} />}
                                    label="Password"
                                    placeholder="Your account password"
                                    required
                                    onChange={(e) =>
                                          setFormData({
                                                ...formData,
                                                password: e.target.value,
                                          })
                                    }
                              />
                        </div>

                        <Button
                              type="submit"
                              appearance="primary"
                              disabled={isLoading}
                              icon={
                                    isLoading ? (
                                          <Spinner size="tiny" />
                                    ) : (
                                          <ArrowRightRegular />
                                    )
                              }
                              iconPosition="after"
                              className={styles.submitBtn}
                        >
                              {isLoading ? 'Logging in…' : 'Sign In'}
                        </Button>
                  </form>

                  <Divider className={styles.divider}>OR</Divider>

                  <GoogleOAuth disabled={isLoading} />
            </div>
      );
};

export default EmailLogin;
