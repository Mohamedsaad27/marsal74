import { useEffect, useState } from "react";
import { Settings2, Loader2, BellRing, Moon, Volume2, Mail } from "lucide-react";
import { FormInput, FormSwitch } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { NotificationPreferencesState } from "@/lib/admin/notifications-types";
import { NOTIFICATION_TYPE_OPTIONS, notificationTypeLabel } from "@/lib/admin/notifications-types";

type Props = {
  preferences: NotificationPreferencesState | null;
  onSave: (prefs: NotificationPreferencesState) => Promise<void>;
  loading?: boolean;
  saving?: boolean;
};

export function NotificationPreferencesPanel({ preferences, onSave, loading = false, saving = false }: Props) {
  const [draft, setDraft] = useState<NotificationPreferencesState | null>(preferences);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  if (loading || !draft) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const updatePref = (
    type: number,
    field: "in_app_enabled" | "push_enabled" | "email_enabled",
    value: boolean,
  ) => {
    setDraft({
      ...draft,
      preferences: draft.preferences.map((p) =>
        p.notification_type === type ? { ...p, [field]: value } : p,
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">إعدادات عامة</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormSwitch
            label="تفعيل الصوت"
            checked={draft.sound_enabled}
            onCheckedChange={(v) => setDraft({ ...draft, sound_enabled: v })}
          />
          <FormSwitch
            label="ملخص يومي بالبريد"
            checked={draft.digest_enabled}
            onCheckedChange={(v) => setDraft({ ...draft, digest_enabled: v })}
          />
          <FormSwitch
            label="ساعات الهدوء"
            checked={draft.quiet_hours_enabled}
            onCheckedChange={(v) => setDraft({ ...draft, quiet_hours_enabled: v })}
          />
          {draft.quiet_hours_enabled && (
            <>
              <FormInput
                label="من"
                type="time"
                value={draft.quiet_hours_from}
                onChange={(e) => setDraft({ ...draft, quiet_hours_from: e.target.value })}
              />
              <FormInput
                label="إلى"
                type="time"
                value={draft.quiet_hours_to}
                onChange={(e) => setDraft({ ...draft, quiet_hours_to: e.target.value })}
              />
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">النوع</th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  <BellRing className="h-3.5 w-3.5" />
                  داخل التطبيق
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5" />
                  Push
                </span>
              </th>
              <th className="px-4 py-3">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  بريد
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {draft.preferences.map((pref) => (
              <tr key={pref.notification_type} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-semibold">{notificationTypeLabel(pref.notification_type)}</td>
                {(["in_app_enabled", "push_enabled", "email_enabled"] as const).map((field) => (
                  <td key={field} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pref[field]}
                        onCheckedChange={(v) => updatePref(pref.notification_type, field, v)}
                      />
                      <Label className="text-xs text-muted-foreground">{pref[field] ? "مفعّل" : "متوقف"}</Label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-4 text-xs text-muted-foreground">
        <Moon className="h-4 w-4 shrink-0" />
        <p>
          أثناء ساعات الهدوء، يتم إيقاف إشعارات Push فقط — تبقى الإشعارات داخل التطبيق متاحة.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          className="rounded-xl gradient-brand px-6 shadow-glow"
          onClick={() => onSave(draft)}
          disabled={saving}
        >
          {saving && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
          حفظ التفضيلات
        </Button>
      </div>
    </div>
  );
}
