import React from 'react';

export const InlineLabel = ({ children, ...rest }: any) => (
  <label data-testid="inline-label" {...rest}>
    {children}
  </label>
);

export const Select = ({ options, value, onChange }: any) => (
  <select
    data-testid="select"
    value={value?.value || ''}
    onChange={(e) => {
      const selected = options.find((opt: any) => opt.value === e.target.value);
      onChange(selected);
    }}
  >
    <option value="" disabled>
      Select...
    </option>
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
