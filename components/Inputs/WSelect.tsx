import React from 'react';

export type SelectOptions = { value: string, data: string }

type WSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
      value?: string,
      options: SelectOptions[],
      name: string,
      icon?: React.ReactNode,
      label?: string,
      error?: string;
      className?: string;
}

const WSelect = ({ value, options, name, icon, label, error, className, ...rest }: WSelectProps ) => {
      return (
            <div className="space-y-2 w-full">
                  <label htmlFor={name} className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
                        {icon && icon} {label}
                  </label>
                  <select {...rest} id={name} name={name} className={`w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-all text-md ${className}`}>
                        {
                              options.map((option, index) => (
                                    <option key={index} value={option.value}>{option.data}</option>
                              ))
                        }
                  </select>
                  {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>
      )
}

export default WSelect;