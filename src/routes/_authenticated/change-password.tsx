import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { useOtpResend } from "@/components/auth/use-otp-resend";
import { Button } from "@/components/ui/button";
import { changePassword, requestOtp } from "@/lib/auth/password";
export const Route = createFileRoute("/_authenticated/change-password")({
  component: ChangePasswordPage,
});

type Step = "password" | "success";

function ChangePasswordPage() {
  const [step, setStep] = useState<Step>("password");
  const [otp, setOtp] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const { cooldown, sending, canResend, startCooldown, runWithSending } = useOtpResend();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof passwordErrors = {};

    if (!currentPassword) {
      errors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }
    if (newPassword.length < 8) {
      errors.newPassword = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }
    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.newPassword = "كلمة المرور الجديدة يجب أن تختلف عن الحالية";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStep("success");
      toast.success("تم تغيير كلمة المرور بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const stepDescriptions = {
    request: "لحماية حسابك، سنرسل رمز تحقق إلى بريدك الإلكتروني قبل تغيير كلمة المرور.",
    verify: "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني.",
    password: "أدخل كلمة المرور الحالية واختر كلمة مرور جديدة.",
    success: "تم تحديث كلمة المرور بنجاح.",
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <Link
          to="/profile"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للملف الشخصي
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">تغيير كلمة المرور</h1>
          <p className="mt-1 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {step === "password" && (
            <form className="space-y-5" onSubmit={handleChangePassword}>
              <PasswordFields
                showCurrentPassword
                currentPassword={currentPassword}
                onCurrentPasswordChange={setCurrentPassword}
                newPassword={newPassword}
                onNewPasswordChange={setNewPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
                errors={passwordErrors}
              />

              <Button
                type="submit"
                className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow"
                disabled={loading}
              >
                {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                تحديث كلمة المرور
              </Button>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                تم تحديث كلمة المرور. استخدم كلمة المرور الجديدة في تسجيل الدخول القادم.
              </p>
              <Button
                asChild
                className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow"
              >
                <Link to="/profile">العودة للملف الشخصي</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
