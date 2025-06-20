import React, { InputHTMLAttributes, FC } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  readonly?: boolean;
}

const Input: FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  readonly = false,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const baseClasses =
    "w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
  const errorClasses = error
    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300";
  const readonlyClasses = readonly
    ? "bg-gray-50 text-gray-700 cursor-not-allowed"
    : "";
  const inputClasses = `${baseClasses} ${errorClasses} ${readonlyClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        readOnly={readonly}
        tabIndex={readonly ? -1 : undefined}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
