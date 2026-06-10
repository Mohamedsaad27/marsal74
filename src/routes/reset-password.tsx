import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { OtpVerificationStep } from "@/components/auth/OtpVerificationStep";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { useOtpResend } from "@/components/auth/use-otp-resend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestOtp, resetPassword } from "@/lib/auth/password";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

type Step = "identify" | "verify" | "password" | "success";

function ResetPasswordPage() {
  const [step, setStep] = useState<Step>("identify");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const { cooldown, sending, canResend, startCooldown, runWithSending } = useOtpResend();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);
    try {
      await requestOtp({
        email: email.trim(),
      });
      startCooldown();
      setOtp("");
      setOtpError(null);
      setStep("verify");
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إرسال رمز التحقق");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("يرجى إدخال رمز التحقق");
      return;
    }

    setOtpError(null);
    setStep("password");
  };

  const handleResendOtp = async () => {
    await runWithSending(async () => {
      await requestOtp({
        email: email.trim(),
      });
      setOtp("");
      setOtpError(null);
      toast.success("تم إعادة إرسال رمز التحقق");
    });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await resetPassword({
        email: email.trim(),
        otp,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setStep("success");
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إعادة تعيين كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    identify: {
      title: "إعادة تعيين كلمة المرور",
      description: "أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.",
    },
    verify: {
      title: "تحقق من الرمز",
      description: "أدخل رمز التحقق المرسل إلى بريدك الإلكتروني للمتابعة.",
    },
    password: {
      title: "كلمة مرور جديدة",
      description: "اختر كلمة مرور قوية لحسابك.",
    },
    success: {
      title: "تم بنجاح",
      description: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
    },
  }[step];

  return (
    <AuthPageLayout
      badge="استعادة الحساب"
      title={stepMeta.title}
      description={stepMeta.description}
      footer={
        step !== "success" ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              العودة لتسجيل الدخول
            </Link>
          </p>
        ) : null
      }
    >
      {step === "identify" && (
        <form className="space-y-5" onSubmit={handleRequestOtp}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              البريد الإلكتروني
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@marsal.io"
                className="h-12 rounded-xl border-border/80 bg-muted/30 pr-10 text-sm focus-visible:bg-card"
                dir="ltr"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow"
            disabled={loading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            إرسال رمز التحقق
          </Button>
        </form>
      )}

      {step === "verify" && (
        <OtpVerificationStep
          email={email}
          otp={otp}
          onOtpChange={setOtp}
          onSubmitOtp={handleVerifyOtp}
          onResend={handleResendOtp}
          verifying={loading}
          resending={sending}
          canResend={canResend}
          cooldown={cooldown}
          error={otpError}
        />
      )}

      {step === "password" && (
        <form className="space-y-5" onSubmit={handleResetPassword}>
          <PasswordFields
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
            حفظ كلمة المرور الجديدة
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن باستخدام كلمة المرور الجديدة.
          </p>
          <Button
            asChild
            className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow"
          >
            <Link to="/login">تسجيل الدخول</Link>
          </Button>
        </div>
      )}
    </AuthPageLayout>
  );
}
