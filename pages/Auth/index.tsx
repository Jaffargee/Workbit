// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import EmailSignup from './EmailSignup';
// import EmailLogin from './EmailLogin';
// import { Logo } from '@/components/Logo';
// import AuthInput from '@/components/Auth/AuthInput';
// import { Hash } from 'lucide-react';
// import { Profile } from './Profile';

// const Auth: React.FC<{ type: 'login' | 'register' | 'profile' }> = ({
//       type,
// }) => {
//       return (
//             <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
//                   <div className="md:min-w-[700px] min-w-sm space-y-6 relative z-10 bg-white px-2">
//                         <div className="text-center space-y-4">
//                               <div className="flex justify-center mb-8">
//                                     <Logo size="lg" />
//                               </div>
//                               <h1 className="text-4xl font-black text-slate-900 tracking-tight">
//                                     {type === 'login'
//                                           ? 'Welcome Back!'
//                                           : type === 'profile'
//                                             ? 'Setup You Account Profile'
//                                             : 'Create Your Account'}
//                               </h1>
//                               <p className="text-slate-500 font-medium">
//                                     {type === 'login'
//                                           ? 'Enter your credentials to access your dashboard.'
//                                           : type === 'profile'
//                                             ? 'Let’s personalize your profile to unlock your first earning opportunities.'
//                                             : 'Join thousands of workers earning daily income.'}
//                               </p>
//                         </div>

//                         {type === 'login' ? (
//                               <EmailLogin />
//                         ) : type === 'profile' ? (
//                               <Profile />
//                         ) : (
//                               <EmailSignup />
//                         )}

//                         {type !== 'profile' && (
//                               <p className="text-center text-slate-500 font-medium">
//                                     {type === 'login'
//                                           ? "Don't have an account?"
//                                           : 'Already have an account?'}{' '}
//                                     <Link
//                                           to={
//                                                 type === 'login'
//                                                       ? '/auth/signup'
//                                                       : '/auth/login'
//                                           }
//                                           className="text-blue-600 font-bold hover:underline"
//                                     >
//                                           {type === 'login'
//                                                 ? 'Register here'
//                                                 : 'Login here'}
//                                     </Link>
//                               </p>
//                         )}

//                         {/* <ConfirmReferralDialog /> */}
//                   </div>
//             </div>
//       );
// };

// const ConfirmReferralDialog = () => {
//       const [refferal, setRefferal] = useState<string>('');

//       return (
//             <div className="fixed top-0 left-0 h-full w-full z-100 bg-[#1111111d]">
//                   <div className="flex flex-col items-center justify-center h-full w-full px-4">
//                         {/* Main Dialog */}
//                         <div className="flex relative bg-white overflow-hidden shadow-lg rounded-2xl md:min-w-[600px] min-h-[400px] max-sm:w-full">
//                               <div className="flex relative p-6 h-full w-full">
//                                     <div className="flex flex-col h-full w-full relative items-center justify-center space-y-4">
//                                           <div className="flex flex-col w-full relative items-center justify-center gap-2">
//                                                 <p className="text-[1.5rem] text-center font-semibold ">
//                                                       <span className="text-gray-700">
//                                                             Were you invited by
//                                                             someone?
//                                                       </span>
//                                                 </p>
//                                                 <p className="text-center text-gray-600">
//                                                       If a friend invited you,
//                                                       enter their referral code
//                                                       now.
//                                                       <br />
//                                                       You won’t be able to add
//                                                       it later.
//                                                 </p>
//                                           </div>

//                                           <AuthInput
//                                                 style={{
//                                                       textTransform:
//                                                             'uppercase',
//                                                 }}
//                                                 type="text"
//                                                 id="ref_code"
//                                                 name="ref_code"
//                                                 icon={<Hash size={16} />}
//                                                 label="Referral Code (Optional)"
//                                                 placeholder="WB-ABC123"
//                                                 onChange={(e) => {
//                                                       setRefferal(
//                                                             e.target.value
//                                                       );
//                                                 }}
//                                           />

//                                           {/* Confirm Button */}
//                                           <div className="flex flex-col w-full relative items-center justify-center my-2">
//                                                 <button
//                                                       disabled={
//                                                             refferal.length ===
//                                                             0
//                                                       }
//                                                       onClick={() =>
//                                                             alert('Connected')
//                                                       }
//                                                       style={{
//                                                             opacity:
//                                                                   refferal.length ===
//                                                                   0
//                                                                         ? 0.7
//                                                                         : 1,
//                                                       }}
//                                                       className="flex flex-col w-full overflow-hidden relative bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
//                                                 >
//                                                       <div className="flex flex-col px-4 py-3 items-center justify-center h-full w-full relative">
//                                                             <span className="text-white font-medium">
//                                                                   Confirm
//                                                                   refferal
//                                                             </span>
//                                                       </div>
//                                                 </button>
//                                           </div>
//                                           {/* Confirm Button */}

//                                           {/* Continue Button */}
//                                           <div className="flex flex-col w-full relative items-center justify-center my-2">
//                                                 <button className="flex flex-col w-full overflow-hidden relative bg-slate-100 hover:bg-slate-300 rounded-full cursor-pointer transition-colors">
//                                                       <div className="flex flex-col px-4 py-3 items-center justify-center h-full w-full relative">
//                                                             <span className="font-medium text-blue-600">
//                                                                   Continue
//                                                                   without code
//                                                             </span>
//                                                       </div>
//                                                 </button>
//                                           </div>
//                                           {/* Continue Button */}
//                                     </div>
//                               </div>
//                         </div>
//                         {/* Main Dialog */}
//                   </div>
//             </div>
//       );
// };

// export default Auth;

import React from 'react';
import { Link } from 'react-router-dom';
import EmailSignup from './EmailSignup';
import EmailLogin from './EmailLogin';
import { Logo } from '@/components/Logo';
import { Profile } from './Profile';
import {
      makeStyles,
      tokens,
      Text,
      Link as FluentLink,
} from '@fluentui/react-components';

const useStyles = makeStyles({
      page: {
            minHeight: '100vh',
            backgroundColor: tokens.colorNeutralBackground1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: tokens.spacingHorizontalXXL,
      },
      container: {
            width: '100%',
            maxWidth: '700px',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXXL,
      },
      header: {
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacingVerticalM,
      },
      logoWrap: {
            marginBottom: tokens.spacingVerticalM,
      },
      title: {
            fontSize: tokens.fontSizeHero700,
            fontWeight: tokens.fontWeightBold,
            color: tokens.colorNeutralForeground1,
            letterSpacing: '-0.02em',
      },
      subtitle: {
            fontSize: tokens.fontSizeBase400,
            color: tokens.colorNeutralForeground3,
            fontWeight: tokens.fontWeightMedium,
      },
      switchText: {
            textAlign: 'center',
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground3,
            fontWeight: tokens.fontWeightMedium,
      },
});

const Auth: React.FC<{ type: 'login' | 'register' | 'profile' }> = ({
      type,
}) => {
      const styles = useStyles();

      return (
            <div className={styles.page}>
                  <div className={styles.container}>
                        <div className={styles.header}>
                              <div className={styles.logoWrap}>
                                    <Logo size="lg" />
                              </div>
                              <Text className={styles.title} as="h1">
                                    {type === 'login'
                                          ? 'Welcome Back!'
                                          : type === 'profile'
                                            ? 'Setup Your Account Profile'
                                            : 'Create Your Account'}
                              </Text>
                              <Text className={styles.subtitle}>
                                    {type === 'login'
                                          ? 'Enter your credentials to access your dashboard.'
                                          : type === 'profile'
                                            ? "Let's personalize your profile to unlock your first earning opportunities."
                                            : 'Join thousands of workers earning daily income.'}
                              </Text>
                        </div>

                        {type === 'login' ? (
                              <EmailLogin />
                        ) : type === 'profile' ? (
                              <Profile />
                        ) : (
                              <EmailSignup />
                        )}

                        {type !== 'profile' && (
                              <Text className={styles.switchText}>
                                    {type === 'login'
                                          ? "Don't have an account? "
                                          : 'Already have an account? '}
                                    <FluentLink
                                          as={Link}
                                          to={
                                                type === 'login'
                                                      ? '/auth/signup'
                                                      : '/auth/login'
                                          }
                                    >
                                          {type === 'login'
                                                ? 'Register here'
                                                : 'Login here'}
                                    </FluentLink>
                              </Text>
                        )}
                  </div>
            </div>
      );
};

export default Auth;
