import React, { FC, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, className, width = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg w-full ${width} mx-4 max-h-[80vh] flex flex-col ${
          className || ""
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
 