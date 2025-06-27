import React, { FC, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
  title?: string;
  actions?: ReactNode;
}

const Modal: FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className, 
  width = "max-w-2xl", 
  title,
  actions 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg w-full ${width} mx-4 max-h-[90vh] flex flex-col ${
          className || ""
        }`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {actions && (
          <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
 