import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/brand/Logo";
import { login, saveSession } from "../lib/auth/Auth.api";
import loginHero from "@/login.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const data = await login(email.trim(), password);
      saveSession(data, remember);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="login-page">
      <div className="login-split">
        {/* Left section (illustration / branding) */}
        <aside className="login-illustration">
          <img
            src={loginHero}
            alt="Express Pro — خدمات شحن وتوصيل"
            className="login-illustrationImg"
          />
        </aside>

        {/* Right section (login form) */}
        <section className="login-formPane">
          <div className="login-content">
            <div className="space-y-4 text-center">
              <Logo variant="wordmark" className="mx-auto" />

              <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                لوحة الإدارة
              </span>

              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-[2rem]">
                مرحباً بعودتك
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground">
                سجّل دخولك لإدارة الشحنات والمناديب والتحصيلات والتقارير من لوحة واحدة.
              </p>
            </div>

            <div className="login-card border border-border/80 bg-card/90 shadow-elevated backdrop-blur-sm">
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@marsal.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={loading}
                      className="h-12 rounded-xl border-border/80 bg-muted/30 pr-10 text-sm focus-visible:bg-card"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      كلمة المرور
                    </Label>
                    <Link
                      to="/reset-password"
                      className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loading}
                      className="h-12 rounded-xl border-border/80 bg-muted/30 pl-10 pr-10 text-sm focus-visible:bg-card"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      disabled={loading}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                    disabled={loading}
                    className="rounded-md"
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-sm font-normal text-muted-foreground"
                  >
                    تذكرني على هذا الجهاز
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl gradient-brand text-base font-bold shadow-glow transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول…
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      تسجيل الدخول
                      <ArrowLeft className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              بتسجيل الدخول أنت توافق على{" "}
              <button type="button" className="font-medium text-foreground/80 hover:underline">
                شروط الاستخدام
              </button>{" "}
              و{" "}
              <button type="button" className="font-medium text-foreground/80 hover:underline">
                سياسة الخصوصية
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
