import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive" />

      <h1 className="text-2xl font-bold"> لا تملك صلاحية الوصول</h1>

      <p className="text-muted-foreground">
        ليس لديك الصلاحية للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مسؤول
        النظام.
      </p>

      <div className="flex gap-3">
        <Button asChild className="rounded-xl">
          <Link to="/">العودة للوحة التحكم</Link>
        </Button>

        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/login">تسجيل الدخول</Link>
        </Button>
      </div>
    </div>
  );
}
