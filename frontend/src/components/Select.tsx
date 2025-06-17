import React, { FC, SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  id?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select: FC<SelectProps> = ({
  label,
  error,
  className = "",
  id,
  options,
  placeholder,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const baseClasses =
    "w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
  const errorClasses = error
    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300";
  const selectClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select id={selectId} className={selectClasses} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Select; 