import { EyeIcon, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

type WInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
      name: string;
      icon?: React.ReactNode;
      label: string;
      prefix?: string;
      _under?: string | React.ReactNode;
      className?: string;
};

const EYE_ICON_SIZE = 16;
const EYE_ICON_COLOR = '#494949ff';

const WInput = ({
      name,
      icon,
      label,
      className,
      prefix,
      _under,
      ...rest
}: WInputProps) => {
      return (
            <div className="space-y-2 w-full relative">
                  <label
                        htmlFor={name}
                        className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1 relative"
                  >
                        {icon && icon} {label}
                  </label>
                  <input
                        className={`w-full ${prefix && 'indent-2'} relative appearance-none bg-slate-50 border border-slate-200 px-5 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-all text-md ${className}`}
                        id={name}
                        name={name}
                        {...rest}
                  />
                  {_under && (
                        <div className="px-1 text-xs text-slate-500">
                              {_under}
                        </div>
                  )}
                  {prefix && (
                        <div className="absolute left-3 top-[2.35rem] transform  text-slate-500 text-md pointer-events-none z-10">
                              {prefix}
                        </div>
                  )}
            </div>
      );
};

export const WPasswdInput = ({ name, icon, label, ...rest }: WInputProps) => {
      const [isHide, setHide] = useState<boolean>(true);

      return (
            <div className="space-y-2 w-full relative">
                  <label
                        htmlFor={name}
                        className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1"
                  >
                        {icon && icon} {label}
                  </label>
                  <div className="flex flex-row items-center w-full w-full relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl focus-within:outline-none focus-within:border-blue-500 transition-all">
                        <input
                              type={isHide ? 'password' : 'text'}
                              id={name}
                              name={name}
                              {...rest}
                              className="relative flex-1 appearance-none bg-[transparent] px-5 py-3 outline-none transition-all text-md"
                        />
                        <button
                              onClick={() => {
                                    setHide(!isHide);
                              }}
                              type="button"
                              className="h-ful w-[50px] flex flex-col absolute right-[2px] rounded-2xl cursor-pointer"
                        >
                              <div className="flex flex-col h-full w-full items-center justify-center px-2 py-2">
                                    {isHide ? (
                                          <EyeOff
                                                size={EYE_ICON_SIZE}
                                                color={EYE_ICON_COLOR}
                                          />
                                    ) : (
                                          <EyeIcon
                                                size={EYE_ICON_SIZE}
                                                color={EYE_ICON_COLOR}
                                          />
                                    )}
                              </div>
                        </button>
                  </div>
            </div>
      );
};

export default WInput;
