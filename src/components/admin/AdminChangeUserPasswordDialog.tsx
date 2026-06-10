import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/admin/users.api";

type TargetUser = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: TargetUser | null | undefined;
};

export function AdminChangeUserPasswordDialog({ open, onOpenChange, user }: Props) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    }
  }, [open]);

  const handleSavePassword = async () => {
    if (!user) return;

    const errors: typeof passwordErrors = {};
    if (newPassword.length < 8) {
      errors.newPassword = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setLoading(true);
    try {
      console.log("Changing password for user", user.id, "to", newPassword);
      const res = await usersApi.changePassword(user.id, {
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      if (!res.isSuccess) throw new Error(res.message);
      toast.success(`تم تغيير كلمة مرور «${user.name}» بنجاح`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحديث كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="تغيير كلمة مرور المستخدم"
      description="حدّد كلمة المرور الجديدة للمستخدم."
      icon={Lock}
      badge="Super Admin"
      size="md"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSavePassword}
            disabled={loading || !user}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ كلمة المرور
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      {user && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-semibold">المستخدم المستهدف</p>
            <p className="mt-1 font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <PasswordFields
              newPassword={newPassword}
              onNewPasswordChange={setNewPassword}
              confirmPassword={confirmPassword}
              onConfirmPasswordChange={setConfirmPassword}
              errors={passwordErrors}
            />
          </div>
        </div>
      )}
    </AdminDialogShell>
  );
}
