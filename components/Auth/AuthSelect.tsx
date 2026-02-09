import React from 'react';

export type SelectOptions = { value: string, data: string }

type AuthSelectProps = React.SelectHTMLAttributes<HTMLInputElement> & {
      value?: string,
      options: SelectOptions[],
      id: string,
      name: string,
      icon?: React.ReactNode,
      label?: string,
      required?: boolean,
      onChange?: (event: any) => any,
      disabled?: boolean,
      readOnly?: boolean,
}

const AuthSelect = ({ value, options, id, name, icon, label, required, disabled, readOnly, onChange }: AuthSelectProps ) => {
      return (
            <div className="space-y-2 w-full">
                  <label htmlFor={name} className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                        {icon && icon} {label}
                  </label>
                  <select disabled={disabled} id={id} name={name} onChange={onChange} value={value} required={required} className="w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-md">
                        {
                              options.map((option, index) => (
                                    <option key={index} value={option.value}>{option.data}</option>
                              ))
                        }
                  </select>
            </div>
      )
}

export default AuthSelect;