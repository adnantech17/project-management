import React, { FC, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md mx-4 ${
          className || ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
 