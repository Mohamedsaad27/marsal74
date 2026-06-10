import { cn } from "@/lib/utils";

// Aligned with orders.status + business doc 6.x scenarios
export type ShipmentStatus =
  | "pending"               // 1 — في انتظار التعيين
  | "assigned"              // 2 — تم التعيين للمندوب
  | "in_transit"            // 3 — قيد التوصيل
  | "delivered"             // 4 — تم التسليم
  | "partial_delivered"     // 5 — تسليم جزئي
  | "refused_paid_shipping" // 6 — رفض ودفع الشحن
  | "refused_no_payment"    // 7 — رفض بدون دفع
  | "postponed"             // 8 — مؤجل
  | "evading"               // 9 — تهرّب / مختفي
  | "unsafe_area"           // 10 — منطقة غير آمنة
  | "out_of_governorate"    // 11 — خارج المحافظة
  | "returned"              // 12 — مرتجع
  | "delayed";              // alias متأخرة

const map: Record<ShipmentStatus, { label: string; cls: string }> = {
  pending:               { label: "بانتظار التعيين",   cls: "bg-warning/15 text-warning ring-warning/25" },
  assigned:              { label: "تم التعيين",         cls: "bg-info/10 text-info ring-info/20" },
  in_transit:            { label: "قيد التوصيل",        cls: "bg-info/10 text-info ring-info/20" },
  delivered:             { label: "تم التسليم",         cls: "bg-success/10 text-success ring-success/20" },
  partial_delivered:     { label: "تسليم جزئي",         cls: "bg-success/10 text-success ring-success/20" },
  refused_paid_shipping: { label: "رفض + دفع الشحن",    cls: "bg-warning/15 text-warning ring-warning/25" },
  refused_no_payment:    { label: "رفض بدون دفع",       cls: "bg-destructive/10 text-destructive ring-destructive/20" },
  postponed:             { label: "مؤجل",               cls: "bg-warning/15 text-warning ring-warning/25" },
  evading:               { label: "تهرّب / مختفي",       cls: "bg-destructive/10 text-destructive ring-destructive/20" },
  unsafe_area:           { label: "منطقة غير آمنة",     cls: "bg-destructive/10 text-destructive ring-destructive/20" },
  out_of_governorate:    { label: "خارج المحافظة",      cls: "bg-muted text-muted-foreground ring-border" },
  returned:              { label: "مرتجع",              cls: "bg-muted text-muted-foreground ring-border" },
  delayed:               { label: "متأخرة",              cls: "bg-destructive/10 text-destructive ring-destructive/20" },
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const s = map[status];
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
