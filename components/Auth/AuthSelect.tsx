// import React from 'react';

// export type SelectOptions = { value: string; data: string };

// type AuthSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
//       value?: string;
//       options: SelectOptions[];
//       name: string;
//       icon?: React.ReactNode;
//       label?: string;
//       error?: string;
//       className?: string;
// };

// const AuthSelect = ({
//       value,
//       options,
//       name,
//       icon,
//       label,
//       error,
//       className,
//       ...rest
// }: AuthSelectProps) => {
//       return (
//             <div className="space-y-2 w-full">
//                   <label
//                         htmlFor={name}
//                         className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1"
//                   >
//                         {icon && icon} {label}
//                   </label>
//                   <select
//                         {...rest}
//                         className={`w-full appearance-none bg-slate-50 border border-slate-200 px-5 py-2 rounded-md focus:outline-none focus:border-blue-500 transition-all text-md ${className}`}
//                   >
//                         {options.map((option, index) => (
//                               <option key={index} value={option.value}>
//                                     {option.data}
//                               </option>
//                         ))}
//                   </select>
//                   {error && <p className="text-red-500 text-xs">{error}</p>}
//             </div>
//       );
// };

// export default AuthSelect;

import React from 'react';
import {
      Dropdown,
      Option,
      Label,
      makeStyles,
      tokens,
} from '@fluentui/react-components';
import type { DropdownProps } from '@fluentui/react-components';

export type SelectOptions = { value: string; data: string };

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
      dropdown: {
            width: '100%',
            minHeight: '42px',
            fontSize: tokens.fontSizeBase400,
            borderRadius: tokens.borderRadiusLarge,
      },
      error: {
            color: tokens.colorPaletteRedForeground1,
            fontSize: tokens.fontSizeBase200,
            marginTop: '2px',
      },
});

type AuthSelectProps = Omit<DropdownProps, 'onOptionSelect'> & {
      value?: string;
      options: SelectOptions[];
      name: string;
      icon?: React.ReactNode;
      label?: string;
      error?: string;
      onChange?: (value: string) => void;
};

const AuthSelect: React.FC<AuthSelectProps> = ({
      value,
      options,
      name,
      icon,
      label,
      error,
      onChange,
      className,
      ...rest
}) => {
      const styles = useStyles();
      const selectedLabel = options.find((o) => o.value === value)?.data ?? '';

      return (
            <div className={styles.wrap}>
                  {label && (
                        <Label htmlFor={name} className={styles.label}>
                              {icon}
                              {label}
                        </Label>
                  )}
                  <Dropdown
                        id={name}
                        size="large"
                        value={selectedLabel}
                        selectedOptions={value ? [value] : []}
                        className={`${styles.dropdown} ${className ?? ''}`}
                        onOptionSelect={(_, data) => {
                              if (data.optionValue)
                                    onChange?.(data.optionValue);
                        }}
                        {...rest}
                  >
                        {options.map((option) => (
                              <Option
                                    key={option.value}
                                    value={option.value}
                                    text={option.data}
                              >
                                    {option.data}
                              </Option>
                        ))}
                  </Dropdown>
                  {error && <span className={styles.error}>{error}</span>}
            </div>
      );
};

export default AuthSelect;
