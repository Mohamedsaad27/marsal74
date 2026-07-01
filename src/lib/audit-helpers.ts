/**
 * audit-helpers.ts
 * Central place for:
 *  - API response types
 *  - event-code → AuditAction mapping
 *  - ACTION_META / SEVERITY_META display config
 *  - mapApiItemToEntry()  ← converts raw API item → AuditEntry used by the UI
 */

import {
  CheckCircle2,
  Download,
  Eye,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  RotateCcw,
  LogIn,
  LogOut,
  RefreshCw,
  UserCheck,
  XCircle,
  Wallet,
  HandCoins,
  Undo2,
  KeyRound,
  Power,
  PowerOff,
} from "lucide-react";
import type {
  AuditAction,
  AuditEntry,
  AuditSeverity,
} from "@/components/admin/AuditLogDetailDialog";
// ─── Coded-value maps (for rendering old/new values, not just labels) ─────────

export const ACCOUNT_TYPE_LABELS: Record<number, string> = {
  1: "مدير نظام",
  2: "شركة شحن",
  3: "مندوب توصيل",
  4: "موظف إداري",
};

export const COMMISSION_TYPE_LABELS: Record<number, string> = {
  1: "نسبة مئوية",
  2: "مبلغ ثابت",
};

export const VEHICLE_TYPE_LABELS: Record<number, string> = {
  1: "دراجة نارية",
  2: "سيارة",
};

export const ORDER_STATUS_LABELS: Record<number, string> = {
  1: "بانتظار التوزيع",
  2: "معيّن لمندوب",
  3: "خرج للتوصيل",
  4: "بانتظار الموافقة",
  5: "تم التوصيل",
  6: "تم التوصيل بتغيير سعر",
  7: "تسليم جزئي",
  8: "رفض + دفع رسوم الشحن",
  9: "رفض وعدم دفع رسوم الشحن",
  10: "ألغى العميل",
  11: "لا يوجد رد",
  12: "الهاتف مغلق",
  13: "تهرّب / مختفي",
  14: "منطقة غير آمنة",
  15: "مؤجل",
  16: "خارج المحافظة",
  17: "رقم هاتف خاطئ",
};

// Maps a field key → the code→label lookup that applies to its value.
// Used by ValuesDiff / metadata rendering to turn raw numbers into Arabic text.
export const FIELD_VALUE_MAPS: Record<string, Record<number, string>> = {
  account_type: ACCOUNT_TYPE_LABELS,
  commission_type: COMMISSION_TYPE_LABELS,
  vehicle_type: VEHICLE_TYPE_LABELS,
  status: ORDER_STATUS_LABELS,
  status_id: ORDER_STATUS_LABELS,
};
// ─── Raw API types ─────────────────────────────────────────────────────────────

export type ApiAuditItem = {
  id: number;
  event: { code: number; label: string };
  actor_type: number;
  actor_type_label: string;
  actor?: { id: string; name: string; phone?: string };
  auditable_type: string;
  auditable_id: string;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
};

// ─── Event-code → AuditAction ─────────────────────────────────────────────────
// Extend this map as new event codes appear in the API.

export const EVENT_CODE_MAP: Record<number, AuditAction> = {
  1: "created",
  2: "updated",
  3: "deleted",
  4: "restored",
  5: "login",
  6: "logout",
  7: "status_changed",
  8: "assigned",
  9: "approved",
  10: "rejected",
  11: "settled",
  12: "collected",
  13: "returned",
  14: "exported",
  15: "password_changed",
  16: "activated",
  17: "deactivated",
};

// ─── Display metadata ──────────────────────────────────────────────────────────

export const ACTION_META: Record<AuditAction, { label: string; icon: LucideIcon; tone: string }> = {
  created: {
    label: "إنشاء",
    icon: Plus,
    tone: "bg-success/10 text-success",
  },

  updated: {
    label: "تعديل",
    icon: Pencil,
    tone: "bg-info/10 text-info",
  },

  deleted: {
    label: "حذف",
    icon: Trash2,
    tone: "bg-destructive/10 text-destructive",
  },

  restored: {
    label: "استعادة",
    icon: RotateCcw,
    tone: "bg-info/10 text-info",
  },

  login: {
    label: "تسجيل دخول",
    icon: LogIn,
    tone: "bg-primary/10 text-primary",
  },

  logout: {
    label: "تسجيل خروج",
    icon: LogOut,
    tone: "bg-muted text-muted-foreground",
  },

  status_changed: {
    label: "تغيير الحالة",
    icon: RefreshCw,
    tone: "bg-info/10 text-info",
  },

  assigned: {
    label: "تعيين",
    icon: UserCheck,
    tone: "bg-primary/10 text-primary",
  },

  approved: {
    label: "موافقة",
    icon: CheckCircle2,
    tone: "bg-success/10 text-success",
  },

  rejected: {
    label: "رفض",
    icon: XCircle,
    tone: "bg-destructive/10 text-destructive",
  },

  settled: {
    label: "تسوية",
    icon: Wallet,
    tone: "bg-success/10 text-success",
  },

  collected: {
    label: "تحصيل",
    icon: HandCoins,
    tone: "bg-success/10 text-success",
  },

  returned: {
    label: "إرجاع",
    icon: Undo2,
    tone: "bg-warning/15 text-warning",
  },

  exported: {
    label: "تصدير",
    icon: Download,
    tone: "bg-warning/15 text-warning",
  },

  password_changed: {
    label: "تغيير كلمة المرور",
    icon: KeyRound,
    tone: "bg-warning/15 text-warning",
  },

  activated: {
    label: "تفعيل",
    icon: Power,
    tone: "bg-success/10 text-success",
  },

  deactivated: {
    label: "إلغاء التفعيل",
    icon: PowerOff,
    tone: "bg-destructive/10 text-destructive",
  },
};

export const SEVERITY_META: Record<AuditSeverity, { label: string; className: string }> = {
  info: { label: "معلومة", className: "bg-info/10 text-info border-info/20" },
  success: { label: "نجاح", className: "bg-success/10 text-success border-success/20" },
  warning: { label: "تحذير", className: "bg-warning/15 text-warning border-warning/30" },
  critical: { label: "حرج", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

// ─── Severity derivation ───────────────────────────────────────────────────────

/**
 * Derive a UI severity level from the API event code and actor_type.
 * Adjust thresholds to match business rules.
 */
function deriveSeverity(item: ApiAuditItem): AuditSeverity {
  const { code } = item.event;
  if (code === 3) return "critical"; // delete
  if (code === 9) return "critical"; // permission change
  if (code === 17) return "warning"; // disable user
  if (code === 5 && item.actor_type === 4) return "success"; // system login
  if (code === 5) return "success"; // manual login
  if (code === 8) return "warning"; // export
  return "info";
}

// ─── Auditable type → human label ─────────────────────────────────────────────

const AUDITABLE_TYPE_LABELS: Record<string, string> = {
  users: "المستخدمون",
  roles: "الأدوار",
  governorates: "المحافظات",
  cities: "المدن",
  shipping_companies: "شركات الشحن",
  delivery_agents: "المناديب",
  orders: "الطلبات",
};

function labelAuditableType(raw: string): string {
  return AUDITABLE_TYPE_LABELS[raw] ?? raw;
}

// ─── Main mapper ───────────────────────────────────────────────────────────────

export function mapApiItemToEntry(item: ApiAuditItem): AuditEntry {
  const action: AuditAction = EVENT_CODE_MAP[item.event.code] ?? "updated";
  const severity = deriveSeverity(item);

  // Prefer actor.name; fall back to actor_type_label for system events
  const user = item.actor?.name ?? item.actor_type_label ?? "—";
  const role = item.actor_type_label ?? "—";

  // Use the human-readable event label from the API (e.g. "تم التعطيل") as the
  // action label override — stored in the entry so the dialog can display it.
  const eventLabel = item.event.label;

  // Build a readable "target" from description or auditable metadata
  const target = item.description
    ? item.description.length > 60
      ? item.description.slice(0, 57) + "…"
      : item.description
    : `${labelAuditableType(item.auditable_type)} #${item.auditable_id.slice(0, 8)}`;

  // Format ISO timestamp → "YYYY-MM-DD HH:mm:ss"
  const createdAt = item.created_at.replace("T", " ").replace(/\.\d+Z$/, "");

  return {
    id: item.id,
    createdAt,
    user,
    role,
    action,
    eventLabel, // raw API label for overriding display
    module: labelAuditableType(item.auditable_type),
    auditableType: item.auditable_type, // kept for entity-drill-down URL
    auditableId: item.auditable_id,
    target,
    ip: item.ip_address || "—",
    severity,
    description: item.description,
    oldValues: item.old_values,
    newValues: item.new_values,
    metadata: item.metadata,
    actorType: item.actor_type,
    actor: item.actor ?? null,
  };
}
// ─── String-coded value maps (e.g. metadata.action discriminators) ────────────

export const ACTION_DISCRIMINATOR_LABELS: Record<string, string> = {
  sync_permissions: "مزامنة الصلاحيات",
  order_agent_assignment: "تعيين مندوب للطلب",
};

// Maps a field key → the string-value lookup that applies to its value.
export const FIELD_STRING_VALUE_MAPS: Record<string, Record<string, string>> = {
  action: ACTION_DISCRIMINATOR_LABELS,
};
