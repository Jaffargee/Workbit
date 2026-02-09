import { NigerianStates } from '@/constants';
import { NigerianState } from '@/types/types';
import { LocateFixed } from 'lucide-react';
import React from 'react';

export type SelectOptions = NigerianState

type AuthSelectListProps = React.InputHTMLAttributes<HTMLInputElement> & {
      value?: NigerianState,
      options?: SelectOptions[],
      icon?: React.ReactNode,
      label?: string,
      required?: boolean,
      onChange?: (event: any) => any,
      disabled?: boolean,
      rest?: React.InputHTMLAttributes<HTMLInputElement>
}

const AuthSelectList = ({ value, options = NigerianStates, icon = <LocateFixed size={16} />, disabled, label, required, onChange, rest }: AuthSelectListProps ) => {
      return (
            <div className="space-y-2 w-full">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                        {icon && icon} {label}
                  </label>
                  <input disabled={disabled} list='states' onChange={onChange} value={value} placeholder={label} name='state' id='state' required={required} {...rest} className="w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-md mb-0" />

                  <datalist id='states'>
                        {
                              options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                              ))
                        }
                  </datalist>
            </div>
      )
}

export default AuthSelectList;