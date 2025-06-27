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
}) => {
  const editorId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const editorClasses = `
    ${error ? 'border-red-300' : 'border-gray-300'}
    ${readonly ? 'opacity-60' : ''}
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
        </label>
      )}
      <div className={`rounded-lg border ${editorClasses}`}>
        <MDEditor
          value={value}
          onChange={(val) => onChange?.(val || "")}
          preview={readonly ? "preview" : "edit"}
          hideToolbar={readonly || disabled}
          visibleDragbar={false}
          data-color-mode="light"
          height={200}
          style={{
            backgroundColor: readonly || disabled ? '#f9fafb' : 'white',
          }}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
