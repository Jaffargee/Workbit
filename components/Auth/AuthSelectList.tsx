// import { NigerianStates } from '@/constants';
// import { NigerianState } from '@/types/types';
// import { LocateFixed } from 'lucide-react';
// import React from 'react';

// export type SelectOptions = NigerianState;

// type AuthSelectListProps = React.InputHTMLAttributes<HTMLInputElement> & {
//       value?: NigerianState;
//       options?: SelectOptions[];
//       icon?: React.ReactNode;
//       label?: string;
//       required?: boolean;
//       onChange?: (event: any) => any;
//       disabled?: boolean;
//       rest?: React.InputHTMLAttributes<HTMLInputElement>;
//       className?: string;
// };

// const AuthSelectList = ({
//       value,
//       options = NigerianStates,
//       icon = <LocateFixed size={16} />,
//       disabled,
//       label,
//       required,
//       onChange,
//       className,
//       rest,
// }: AuthSelectListProps) => {
//       return (
//             <div className="space-y-2 w-full">
//                   <label className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
//                         {icon && icon} {label}
//                   </label>
//                   <input
//                         disabled={disabled}
//                         list="states"
//                         onChange={onChange}
//                         value={value}
//                         placeholder={label}
//                         name="state"
//                         id="state"
//                         required={required}
//                         {...rest}
//                         className={`w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-all text-md mb-0 ${className}`}
//                   />

//                   <datalist id="states">
//                         {options.map((option, index) => (
//                               <option key={index} value={option}>
//                                     {option}
//                               </option>
//                         ))}
//                   </datalist>
//             </div>
//       );
// };

// export default AuthSelectList;

import React from 'react';
import {
      Combobox,
      Option,
      Label,
      makeStyles,
      tokens,
} from '@fluentui/react-components';
import type { ComboboxProps } from '@fluentui/react-components';
import { LocationRegular } from '@fluentui/react-icons';
import { NigerianStates } from '@/constants';
import { NigerianState } from '@/types/types';

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
      combobox: {
            width: '100%',
            minHeight: '42px',
            fontSize: tokens.fontSizeBase400,
            borderRadius: tokens.borderRadiusLarge,
      },
});

type AuthSelectListProps = Omit<ComboboxProps, 'onOptionSelect' | 'value'> & {
      value?: NigerianState;
      options?: NigerianState[];
      icon?: React.ReactNode;
      label?: string;
      required?: boolean;
      disabled?: boolean;
      onChange?: (value: string) => void;
};

const AuthSelectList: React.FC<AuthSelectListProps> = ({
      value,
      options = NigerianStates,
      icon = <LocationRegular fontSize={16} />,
      disabled,
      label,
      required,
      onChange,
      className,
      ...rest
}) => {
      const styles = useStyles();

      return (
            <div className={styles.wrap}>
                  <Label htmlFor="state" className={styles.label}>
                        {icon}
                        {label}
                        {required && ' *'}
                  </Label>
                  <Combobox
                        id="state"
                        size="large"
                        disabled={disabled}
                        value={value ?? ''}
                        placeholder={label}
                        className={`${styles.combobox} ${className ?? ''}`}
                        freeform
                        onOptionSelect={(_, data) => {
                              if (data.optionValue)
                                    onChange?.(data.optionValue);
                        }}
                        onChange={(e) => onChange?.(e.target.value)}
                        {...rest}
                  >
                        {options.map((option) => (
                              <Option key={option} value={option}>
                                    {option}
                              </Option>
                        ))}
                  </Combobox>
            </div>
      );
};

export default AuthSelectList;
