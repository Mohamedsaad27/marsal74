import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, Camera, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/admin/users.api.ts";
import { PROFILE_BASE_URL } from "@/lib/utils";
export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    avatar: "",
  });

  type MeResponse = {
    isSuccess: boolean;
    data: {
      user_id: string;
      name: string;
      email: string;
      phone: string;
      avatar: string;
      account_type: string;
      is_active: boolean;
      staff_member: {
        department: string;
        job_title: string;
      } | null;
    };
  };

  // In the component:
  const [meta, setMeta] = useState({ account_type: "", department: "", job_title: "" });

  useEffect(() => {
    apiFetch<MeResponse>("/auth/me")
      .then(({ data }) => {
        setProfile({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          gender: "male",
          avatar: data.avatar ?? "",
        });
        setMeta({
          account_type: data.account_type ?? "",
          department: data.staff_member?.department ?? "",
          job_title: data.staff_member?.job_title ?? "",
        });
      })
      .catch(() => {});
  }, []);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("gender", profile.gender);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await apiFetch("/api/profile", { method: "POST", body: formData }, PROFILE_BASE_URL);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">الملف الشخصي</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تحديث بيانات حسابك وكلمة المرور وتفضيلات العرض
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 rounded-2xl">
                {avatarPreview && (
                  <AvatarImage src={avatarPreview} className="rounded-2xl object-cover" />
                )}
                {profile.avatar && !avatarPreview && (
                  <AvatarImage src={profile.avatar} className="rounded-2xl object-cover" />
                )}
                <AvatarFallback className="rounded-2xl gradient-brand text-3xl font-bold text-white">
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card shadow-soft hover:bg-muted"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <h2 className="mt-4 text-lg font-bold">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge className="mt-3 rounded-lg font-mono text-[10px]" variant="secondary">
              {meta.account_type || "—"}
            </Badge>

            {(meta.department || meta.job_title) && (
              <div className="mt-4 w-full space-y-2 rounded-xl bg-muted/30 p-3 text-right text-sm">
                {meta.department && (
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">القسم</span>
                    <span className="font-medium">{meta.department}</span>
                  </p>
                )}
                {meta.job_title && (
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">المسمى</span>
                    <span className="font-medium">{meta.job_title}</span>
                  </p>
                )}
              </div>
            )}
            <Button variant="outline" className="mt-4 w-full rounded-xl" asChild>
              <Link to="/change-password">
                <Lock className="ml-2 h-4 w-4" />
                تغيير كلمة المرور
              </Link>
            </Button>
          </div>
        </div>

        {/* Main form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">البيانات الأساسية</h3>
                <p className="text-xs text-muted-foreground">الاسم، البريد، الهاتف، والجنس</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>الاسم الكامل</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  البريد الإلكتروني
                </Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  className="h-11 rounded-xl"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  رقم الهاتف
                </Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="h-11 rounded-xl tabular-nums"
                  dir="ltr"
                />
              </div>
              {/* <div className="space-y-2">
                <Label>الجنس</Label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-sm"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div> */}
            </div>
          </div>

          {/* Save bar */}
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
              saved
                ? "border-success/40 bg-success/5"
                : error
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border bg-muted/20",
            )}
          >
            {saved ? (
              <span className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                تم حفظ التغييرات بنجاح
              </span>
            ) : error ? (
              <span className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">تأكد من صحة البيانات قبل الحفظ</span>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setError(null)}>
                إلغاء
              </Button>
              <Button
                className="rounded-xl gradient-brand shadow-glow"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
