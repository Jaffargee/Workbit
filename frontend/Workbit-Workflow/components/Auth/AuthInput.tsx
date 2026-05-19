import { EyeIcon, EyeOff } from 'lucide-react'
import React, { useState } from 'react'

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
      type?: string,
      value?: string,
      id: string,
      name: string,
      icon?: React.ReactNode,
      label: string,
      readOnly?: boolean,
      disabled?: boolean,
      placeholder: string,
      required?: boolean,
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

const EYE_ICON_SIZE = 16;
const EYE_ICON_COLOR = '#494949ff'

const AuthInput = ({ name, icon, label, ...rest }: AuthInputProps) => {
      return (
            <div className="space-y-2 w-full">
                  <label htmlFor={name} className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                        {icon && icon} {label}
                  </label>
                  <input
                        className="w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-md"
                        {...rest}
                  />
            </div>
      )
}

export const AuthPasswdInput = ({ name, icon, label, ...rest }: AuthInputProps) => {

      const [isHide, setHide] = useState<boolean>(true);

      return (
            <div className="space-y-2 w-full relative">
                  <label htmlFor={name} className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                        {icon && icon} {label}
                  </label>
                  <div className="flex flex-row items-center w-full w-full relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl focus-within:outline-none focus-within:border-blue-500 transition-all">
                        <input
                              type={isHide ? 'password' : 'text'}
                              {...rest}
                              className="relative flex-1 appearance-none bg-[transparent] px-5 py-3 outline-none transition-all text-md"
                        />
                        <button onClick={() => { setHide(!isHide) }} type='button' className='h-ful w-[50px] flex flex-col absolute right-[2px] rounded-2xl cursor-pointer'>
                              <div className='flex flex-col h-full w-full items-center justify-center px-2 py-2'>
                                    {
                                          isHide ? <EyeOff size={EYE_ICON_SIZE} color={EYE_ICON_COLOR} /> : <EyeIcon size={EYE_ICON_SIZE} color={EYE_ICON_COLOR} />
                                    }
                              </div>
                        </button>
                  </div>
            </div>
      )
}

export default AuthInput;
