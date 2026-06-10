import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface OtpVerificationStepProps {
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmitOtp: () => void;
  onResend: () => void;
  verifying?: boolean;
  resending?: boolean;
  canResend?: boolean;
  cooldown?: number;
  error?: string | null;
  className?: string;
  verificationMessage?: string;
}

export function OtpVerificationStep({
  email,
  otp,
  onOtpChange,
  onSubmitOtp,
  onResend,
  verifying = false,
  resending = false,
  canResend = true,
  cooldown = 0,
  error,
  className,
  verificationMessage,
}: OtpVerificationStepProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">تحقق من بريدك الإلكتروني</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {verificationMessage ?? (
                <>
                  أرسلنا رمز تحقق مكوّناً من 6 أرقام إلى{" "}
                  <span className="font-medium text-foreground" dir="ltr">
                    {email}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm font-semibold">أدخل رمز التحقق</p>
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={onOtpChange} dir="ltr">
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-12 w-11 rounded-xl border-border/80 text-base font-bold first:rounded-xl last:rounded-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error && <p className="text-center text-xs font-medium text-destructive">{error}</p>}
      </div>

      <Button
        type="button"
        className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow"
        onClick={onSubmitOtp}
        disabled={otp.length !== 6 || verifying}
      >
        {verifying && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
        تأكيد الرمز
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">لم يصلك الرمز؟</p>
        <Button
          type="button"
          variant="link"
          className="mt-1 h-auto p-0 text-sm font-semibold"
          onClick={onResend}
          disabled={!canResend}
        >
          {resending ? (
            <>
              <Loader2 className="ms-2 h-3.5 w-3.5 animate-spin" />
              جاري الإرسال...
            </>
          ) : cooldown > 0 ? (
            `إعادة الإرسال خلال ${cooldown} ث`
          ) : (
            "إعادة إرسال الرمز"
          )}
        </Button>
      </div>
    </div>
  );
}
