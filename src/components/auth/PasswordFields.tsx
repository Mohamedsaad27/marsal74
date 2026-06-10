import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  error,
  required,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative">
        <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-12 rounded-xl border-border/80 bg-muted/30 pl-10 pr-10 text-sm focus-visible:bg-card",
            error && "border-destructive",
          )}
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

interface PasswordFieldsProps {
  currentPassword?: string;
  onCurrentPasswordChange?: (value: string) => void;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  errors?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  showCurrentPassword?: boolean;
}

export function PasswordFields({
  currentPassword = "",
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  errors,
  showCurrentPassword = false,
}: PasswordFieldsProps) {
  return (
    <div className="space-y-4">
      {showCurrentPassword && onCurrentPasswordChange && (
        <PasswordField
          id="current-password"
          label="كلمة المرور الحالية"
          value={currentPassword}
          onChange={onCurrentPasswordChange}
          error={errors?.currentPassword}
          required
        />
      )}
      <PasswordField
        id="new-password"
        label="كلمة المرور الجديدة"
        value={newPassword}
        onChange={onNewPasswordChange}
        error={errors?.newPassword}
        required
      />
      <PasswordField
        id="confirm-password"
        label="تأكيد كلمة المرور الجديدة"
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        error={errors?.confirmPassword}
        required
      />
    </div>
  );
}
