import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Copy,
  Globe,
  Monitor,
  ShieldAlert,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  ACTION_META,
  SEVERITY_META,
  FIELD_VALUE_MAPS,
  FIELD_STRING_VALUE_MAPS,
} from "@/lib/audit-helpers";

import { AUDIT_FIELD_LABELS } from "@/lib/audit-field-labels";
// ─── Types ─────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "restored"
  | "login"
  | "logout"
  | "status_changed"
  | "assigned"
  | "approved"
  | "rejected"
  | "settled"
  | "collected"
  | "returned"
  | "exported"
  | "password_changed"
  | "activated"
  | "deactivated";

export type AuditSeverity = "info" | "success" | "warning" | "critical";
function getFieldLabel(key: string) {
  return AUDIT_FIELD_LABELS[key] ?? key;
}
export type AuditEntry = {
  id: number;
  createdAt: string;
  user: string;
  role: string;
  action: AuditAction;
  eventLabel?: string; // raw label from API (e.g. "تم التعطيل")
  module: string;
  auditableType?: string;
  auditableId?: string;
  target: string;
  ip: string;
  severity: AuditSeverity;
  description: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  actorType?: number;
  actor?: { id: string; name: string; phone?: string } | null;
};

// ─── Internal helpers ──────────────────────────────────────────────────────────

const toneMap: Record<AuditSeverity, "default" | "destructive" | "success" | "import"> = {
  info: "default",
  success: "success",
  warning: "import",
  critical: "destructive",
};

function DetailRow({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {value !== undefined && (
          <div className="mt-1 text-sm font-medium text-foreground break-all">{value}</div>
        )}
        {children}
      </div>
    </div>
  );
}

function TechnicalBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/** Render a diff table for old_values / new_values */
function ValuesDiff({
  oldValues,
  newValues,
}: {
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}) {
  if (!oldValues && !newValues) return null;

  const keys = Array.from(
    new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})]),
  );

  const skipKeys = new Set(["welcome_whatsapp_url", "user_agent"]);
  const visibleKeys = keys.filter((k) => !skipKeys.has(k) && !isIdField(k));

  if (visibleKeys.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/30 text-muted-foreground">
            <th className="px-3 py-2 text-right font-semibold">الحقل</th>
            {oldValues && (
              <th className="px-3 py-2 text-right font-semibold text-destructive/80">القديم</th>
            )}
            {newValues && (
              <th className="px-3 py-2 text-right font-semibold text-success/80">الجديد</th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleKeys.map((key) => (
            <tr key={key} className="border-t border-border/50">
              <td className="px-3 py-2 font-mono text-muted-foreground"> {getFieldLabel(key)}</td>
              {oldValues && (
                <td className="px-3 py-2 text-destructive/90">
                  {fmt(key, (oldValues ?? {})[key])}
                </td>
              )}
              {newValues && (
                <td className="px-3 py-2 text-success">{fmt(key, (newValues ?? {})[key])}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  entry: AuditEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuditLogDetailDialog({ entry, open, onOpenChange }: Props) {
  if (!entry) return null;

  const actionMeta = ACTION_META[entry.action] ?? ACTION_META["updated"];
  const sevMeta = SEVERITY_META[entry.severity];
  const ActionIcon = actionMeta.icon;
  const tone = toneMap[entry.severity];

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined") navigator.clipboard.writeText(text);
  };

  const hasDiff = !!(entry.oldValues || entry.newValues);

  // Build raw payload for JSON copy (exclude internal UI fields)
  const rawPayload = {
    id: entry.id,
    created_at: entry.createdAt,
    actor: entry.actor ?? { name: entry.user, role: entry.role },
    actor_type: entry.role,
    event: entry.eventLabel ?? actionMeta.label,
    auditable_type: entry.auditableType,
    auditable_id: entry.auditableId,
    description: entry.description,
    ip_address: entry.ip,
    severity: entry.severity,
    old_values: entry.oldValues ?? null,
    new_values: entry.newValues ?? null,
    metadata: entry.metadata ?? null,
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={entry.eventLabel ?? actionMeta.label}
      description={entry.description}
      icon={
        entry.severity === "critical"
          ? AlertTriangle
          : entry.severity === "warning"
            ? ShieldAlert
            : Activity
      }
      tone={tone}
      badge={sevMeta.label}
      size="lg"
      footer={
        <>
          {/* <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => copyToClipboard(JSON.stringify(rawPayload, null, 2))}
          >
            <Copy className="ml-1.5 h-4 w-4" />
            نسخ JSON
          </Button> */}
          <Button variant="default" className="rounded-xl" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
              actionMeta.tone,
            )}
          >
            <ActionIcon className="h-3.5 w-3.5" />
            {entry.eventLabel ?? actionMeta.label}
          </span>
          <Badge variant="outline" className={cn("rounded-lg border", sevMeta.className)}>
            {sevMeta.label}
          </Badge>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{entry.module}</span>
          {entry.auditableId && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="font-mono text-xs text-muted-foreground">
                {/* {entry.auditableId.slice(0, 8)}… */}
              </span>
            </>
          )}
        </div>

        {/* Core fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailRow label="الفاعل" value={entry.user} icon={User} />
          <DetailRow label="نوع الفاعل" value={entry.role} />
          <DetailRow label="التاريخ والوقت" value={entry.createdAt} icon={Clock} />
          <DetailRow label="عنوان IP" value={entry.ip} icon={Globe} />
          {entry.auditableType && (
            <DetailRow label="نوع السجل" value={entry.module} icon={Monitor} />
          )}
          {entry.actor?.phone && <DetailRow label="رقم الهاتف" value={entry.actor.phone} />}
        </div>

        {/* Metadata (e.g. login metadata) */}
        {entry.metadata &&
          Object.keys(entry.metadata).length > 0 &&
          (() => {
            const visibleMetaKeys = Object.entries(entry.metadata).filter(([k]) => !isIdField(k));
            if (visibleMetaKeys.length === 0) return null;
            return (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 text-sm font-bold text-foreground">البيانات الإضافية</h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {visibleMetaKeys.map(([k, v]) => (
                      <TechnicalBadge key={k} label={getFieldLabel(k)} value={fmt(k, v)} />
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

        {/* Diff table */}
        {hasDiff && (
          <>
            <Separator />
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                التغييرات
              </h4>
              <ValuesDiff oldValues={entry.oldValues} newValues={entry.newValues} />
            </div>
          </>
        )}

        <Separator />

        {/* Raw JSON */}
        {/* <div>
          <h4 className="mb-2 text-sm font-bold text-foreground">البيانات الأولية (JSON)</h4>
          <pre className="max-h-56 overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-foreground modal-scroll">
            {JSON.stringify(rawPayload, null, 2)}
          </pre>
        </div> */}
      </div>
    </AdminDialogShell>
  );
}
/** Any field ending in _id, or exactly "id", is treated as an internal identifier and hidden. */
function isIdField(key: string): boolean {
  return key === "id" || key.endsWith("_id");
}

function fmt(key: string, v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "مفعّل" : "معطّل";

  const codeMap = FIELD_VALUE_MAPS[key];
  if (codeMap && typeof v === "number" && codeMap[v]) return codeMap[v];
  if (codeMap && typeof v === "string" && codeMap[Number(v)]) return codeMap[Number(v)];

  const stringMap = FIELD_STRING_VALUE_MAPS[key];
  if (stringMap && typeof v === "string" && stringMap[v]) return stringMap[v];

  if (typeof v === "string" && v.length > 80) return v.slice(0, 77) + "…";
  return String(v);
}
