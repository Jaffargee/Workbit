// import { EyeIcon, EyeOff } from 'lucide-react';
// import React, { useState } from 'react';

// type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
//       name: string;
//       icon?: React.ReactNode;
//       label: string;
//       className?: string;
// };

// const EYE_ICON_SIZE = 16;
// const EYE_ICON_COLOR = '#494949ff';

// const AuthInput = ({
//       name,
//       icon,
//       label,
//       className,
//       ...rest
// }: AuthInputProps) => {
//       return (
//             <div className="space-y-2 w-full">
//                   <label
//                         htmlFor={name}
//                         className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1"
//                   >
//                         {icon && icon} {label}
//                   </label>
//                   <input
//                         className={`w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-all text-md ${className}`}
//                         {...rest}
//                   />
//             </div>
//       );
// };

// export const AuthPasswdInput = ({
//       name,
//       icon,
//       label,
//       ...rest
// }: AuthInputProps) => {
//       const [isHide, setHide] = useState<boolean>(true);

//       return (
//             <div className="space-y-2 w-full relative">
//                   <label
//                         htmlFor={name}
//                         className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1"
//                   >
//                         {icon && icon} {label}
//                   </label>
//                   <div className="flex flex-row items-center w-full w-full relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl focus-within:outline-none focus-within:border-blue-500 transition-all">
//                         <input
//                               type={isHide ? 'password' : 'text'}
//                               {...rest}
//                               className="relative flex-1 appearance-none bg-[transparent] px-5 py-3 outline-none transition-all text-md"
//                         />
//                         <button
//                               onClick={() => {
//                                     setHide(!isHide);
//                               }}
//                               type="button"
//                               className="h-ful w-[50px] flex flex-col absolute right-[2px] rounded-2xl cursor-pointer"
//                         >
//                               <div className="flex flex-col h-full w-full items-center justify-center px-2 py-2">
//                                     {isHide ? (
//                                           <EyeOff
//                                                 size={EYE_ICON_SIZE}
//                                                 color={EYE_ICON_COLOR}
//                                           />
//                                     ) : (
//                                           <EyeIcon
//                                                 size={EYE_ICON_SIZE}
//                                                 color={EYE_ICON_COLOR}
//                                           />
//                                     )}
//                               </div>
//                         </button>
//                   </div>
//             </div>
//       );
// };

// export default AuthInput;

import React, { useState } from 'react';
import {
      Input,
      Label,
      makeStyles,
      tokens,
      type InputProps,
} from '@fluentui/react-components';
import { EyeRegular, EyeOffRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
      wrap: {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
            width: '100%',
      },
      label: {
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacingHorizontalXS,
            fontWeight: tokens.fontWeightSemibold,
            fontSize: tokens.fontSizeBase300,
            color: tokens.colorNeutralForeground1,
            paddingLeft: tokens.spacingHorizontalXS,
      },
      input: {
            width: '100%',
            // Large touch target to match the previous py-3/py-3.5 sizing
            '& input': {
                  // paddingTop: '8px',
                  // paddingBottom: '8px',
                  fontSize: tokens.fontSizeBase300,
            },
            borderRadius: tokens.borderRadiusLarge,
      },
});

type AuthInputProps = Omit<InputProps, 'size'> & {
      name: string;
      icon?: React.ReactNode;
      label: string;
};

const AuthInput: React.FC<AuthInputProps> = ({
      name,
      icon,
      label,
      className,
      ...rest
}) => {
      const styles = useStyles();

      return (
            <div className={styles.wrap}>
                  <Label htmlFor={name} className={styles.label}>
                        {icon}
                        {label}
                  </Label>
                  <Input
                        id={name}
                        name={name}
                        size="large"
                        contentBefore={<span>{icon}</span>}
                        //   className={`${styles.input} ${className ?? ''}`}
                        {...rest}
                  />
            </div>
      );
};

export const AuthPasswdInput: React.FC<AuthInputProps> = ({
      name,
      icon,
      label,
      ...rest
}) => {
      const styles = useStyles();
      const [isHidden, setIsHidden] = useState(true);

      return (
            <div className={styles.wrap}>
                  <Label htmlFor={name} className={styles.label}>
                        {icon}
                        {label}
                  </Label>
                  <Input
                        id={name}
                        name={name}
                        size="large"
                        type={isHidden ? 'password' : 'text'}
                        contentBefore={<span>{icon}</span>}
                        contentAfter={
                              <button
                                    type="button"
                                    onClick={() => setIsHidden((h) => !h)}
                                    aria-label={
                                          isHidden
                                                ? 'Show password'
                                                : 'Hide password'
                                    }
                                    style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: 'pointer',
                                          padding: '4px',
                                          color: tokens.colorNeutralForeground3,
                                    }}
                              >
                                    {isHidden ? (
                                          <EyeOffRegular fontSize={18} />
                                    ) : (
                                          <EyeRegular fontSize={18} />
                                    )}
                              </button>
                        }
                        className={styles.input}
                        {...rest}
                  />
            </div>
      );
};

export default AuthInput;
