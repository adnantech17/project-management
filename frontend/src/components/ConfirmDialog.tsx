import React, { FC } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}) => {
  const getIconColor = () => {
    switch (variant) {
      case "danger":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-red-600";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "danger";
      case "warning":
        return "primary";
      case "info":
        return "primary";
      default:
        return "danger";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={getButtonVariant() as any}
              onClick={onConfirm}
              disabled={isLoading}
              loading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
