import { cn } from "@/lib/utils";

// Aligned with orders.status + business doc 6.x scenarios
export type ShipmentStatus =
  | "pending"
  | "assigned"
  | "in_delivery"
  | "awaiting_approval"
  | "delivered"
  | "delivered_price_changed"
  | "partial_delivery"
  | "refused_paid_shipping"
  | "refused_no_payment"
  | "customer_cancelled"
  | "no_answer"
  | "phone_off"
  | "postponed"
  | "unsafe_area"
  | "outside_governorate"
  | "wrong_phone"
  | "returned";

const map: Record<ShipmentStatus, { label: string; cls: string }> = {
  pending: {
    label: "بانتظار التوزيع",
    cls: "bg-muted text-muted-foreground ring-border",
  },

  assigned: {
    label: "تم التعيين",
    cls: "bg-info/10 text-info ring-info/20",
  },

  in_delivery: {
    label: "قيد التوصيل",
    cls: "bg-blue-100 text-blue-700 ring-blue-200",
  },

  awaiting_approval: {
    label: "بانتظار الموافقة",
    cls: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  },

  delivered: {
    label: "تم التسليم",
    cls: "bg-success/10 text-success ring-success/20",
  },

  delivered_price_changed: {
    label: "تم التسليم بتغيير سعر",
    cls: "bg-success/10 text-success ring-success/20",
  },

  partial_delivery: {
    label: "تسليم جزئي",
    cls: "bg-success/10 text-success ring-success/20",
  },

  refused_paid_shipping: {
    label: "رفض + دفع رسوم الشحن",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },

  refused_no_payment: {
    label: "رفض وعدم الدفع",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },

  customer_cancelled: {
    label: "ألغى العميل",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },

  no_answer: {
    label: "لا يوجد رد",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },

  phone_off: {
    label: "الهاتف مغلق",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },

  postponed: {
    label: "مؤجل",
    cls: "bg-warning/15 text-warning ring-warning/25",
  },

  unsafe_area: {
    label: "منطقة غير آمنة",
    cls: "bg-warning/15 text-warning ring-warning/25",
  },
  outside_governorate: {
    label: "خارج المحافظة",
    cls: "bg-warning/15 text-warning ring-warning/25",
  },
  wrong_phone: {
    label: "رقم الهاتف خاطئ",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },
  returned: {
    label: "تم الإرجاع",
    cls: "bg-destructive/10 text-destructive ring-destructive/20",
  },
};
export function StatusBadge({ status }: { status?: ShipmentStatus }) {
  const s = status ? map[status] : undefined;

  if (!s) {
    return (
      <span className="rounded-full px-2 py-1 text-xs bg-muted text-muted-foreground">
        حالة غير معروفة
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        s.cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
