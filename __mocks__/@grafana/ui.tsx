import React from 'react';

export const InlineLabel = ({ children, ...rest }: any) => (
  <label data-testid="inline-label" {...rest}>
    {children}
  </label>
);

export const Select = ({ options, value, onChange, isMulti }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMulti) {
      const selectedOptions = Array.from(e.target.selectedOptions).map((opt) =>
        options.find((o: any) => o.value === opt.value)
      );
      onChange(selectedOptions);
    } else {
      const selected = options.find((opt: any) => opt.value === e.target.value);
      onChange(selected);
    }
  };

  return (
    <select
      data-testid="select"
      value={isMulti ? undefined : value?.value || ''}
      onChange={handleChange}
      multiple={isMulti}
    >
      {!isMulti && (
        <option value="" disabled>
          Select...
        </option>
      )}
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
