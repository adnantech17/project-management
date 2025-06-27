import React, { FC } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

interface RichTextEditorProps {
  label?: string;
  error?: string;
  id?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  label,
  error,
  className = "",
  id,
  readonly = false,
  value = "",
  onChange,
  placeholder,
  disabled = false,
  required = false,
}) => {
  const editorId = id || label?.toLowerCase().replace(/\s+/g, "-");

  if (readonly) {
    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="prose prose-sm max-w-none text-gray-900">
          {value ? (
            <MDEditor.Markdown 
              source={value} 
              style={{ 
                backgroundColor: 'transparent',
                color: 'inherit'
              }}
            />
          ) : (
            <span className="text-gray-500 italic">No description provided</span>
          )}
        </div>
      </div>
    );
  }

  const editorClasses = `
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={editorId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`rounded-lg border ${editorClasses}`}>
        <MDEditor
          value={value}
          onChange={(val) => onChange?.(val || "")}
          preview="edit"
          hideToolbar={disabled}
          visibleDragbar={false}
          data-color-mode="light"
          height={200}
          style={{
            backgroundColor: disabled ? '#f9fafb' : 'white',
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
