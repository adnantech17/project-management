import React, { FC, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  id?: string;
}

const TextArea: FC<TextAreaProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const textAreaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const baseClasses =
    "w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical";
  const errorClasses = error
    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300";
  const textAreaClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textAreaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea id={textAreaId} className={textAreaClasses} {...props} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default TextArea;
