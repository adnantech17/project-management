import { useState, FC, ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "@/components/form/Input";

interface PasswordInputProps {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
}

const PasswordInput: FC<PasswordInputProps> = ({
  label = "Password",
  error,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        label={label}
        error={error}
        className={`pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer mt-6"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
