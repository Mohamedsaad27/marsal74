import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { OrderAssignDialog } from "@/components/admin/OrderAssignDialog";
import { OrderDeliveryProofsDialog } from "@/components/admin/OrderDeliveryProofsDialog";
import { OrderStatusDialog } from "@/components/admin/OrderStatusDialog";
import { OrderStatusTimeline } from "@/components/admin/OrderStatusTimeline";
import { OrderWaybillDialog } from "@/components/admin/OrderWaybillDialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { assignOrderAgent, fetchOrderById, updateOrderStatus } from "@/lib/admin/orders-api";
import type { OrderDetail, OrderListItem } from "@/lib/admin/orders-types";
import {
  approvalLabel,
  formatAmount,
  formatDateTime,
  ORDER_STATUS_OPTIONS,
} from "@/lib/admin/orders-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Camera, Loader2, Phone, Printer, RefreshCw, UserCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/shipments/$orderId")({
  component: OrderDetailPage,
});

// ─── Reusable sub-components ─────────────────────────────────────────────────

function SectionCard({
  title,
  tableName,
  children,
}: {
  title: string;
  tableName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <p className="text-sm font-semibold">{title}</p>
        {tableName && (
          <code className="text-[10px] font-medium text-muted-foreground">{tableName}</code>
        )}
      </div>
      {children}
    </section>
  );
}

function FieldGrid({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 p-4 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function InfoCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [proofsOpen, setProofsOpen] = useState(false);
  const [waybillOpen, setWaybillOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrderById(orderId);
      if (!response.isSuccess || !response.data) throw new Error(response.message);
      setDetail(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل الطلب");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  // Bridge to dialogs that expect OrderListItem
  const listItem: OrderListItem | null = detail
    ? {
        order: detail.order,
        customer_name: detail.customer_info.customer_name,
        customer_phone: detail.customer_info.customer_phone,
        governorate_name: detail.governorate_name,
        city_name: detail.city_name,
        company_name: detail.company_name,
        agent_name: detail.agent_name,
        original_amount: detail.financials.original_amount,
        collected_amount: detail.financials.collected_amount,
        status_key: detail.status_key,
      }
    : null;

  const handleAssign = async (agentId: string) => {
    setSaving(true);
    try {
      const response = await assignOrderAgent(orderId, agentId);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setAssignOpen(false);
      void loadDetail(); // refresh to show new agent
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل التعيين");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: number, note: string) => {
    setSaving(true);
    try {
      const response = await updateOrderStatus(orderId, status, note);
      if (!response.isSuccess) throw new Error(response.message);
      toast.success(response.message);
      setStatusOpen(false);
      void loadDetail(); // refresh timeline + badge
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!detail) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <p className="text-muted-foreground">الطلب غير موجود</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to="/shipments">العودة للقائمة</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const statusLabel =
    ORDER_STATUS_OPTIONS.find((o) => o.code === detail.order.status)?.label ??
    String(detail.order.status);

  const hasCity = detail.city_name && detail.city_name !== "—";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      {/* ── Back + header ── */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="mb-3 rounded-xl text-muted-foreground">
          <Link to="/shipments">
            <ArrowRight className="ms-2 h-4 w-4" />
            العودة للطلبات
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-2xl font-extrabold tracking-tight md:text-3xl">
                {detail.order.internal_code}
              </h1>
              <StatusBadge status={detail.status_key} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {detail.order.reference_no && <></>}
            </p>
            {detail.notes && (
              <p className="mt-1 text-sm text-muted-foreground">ملاحظات: {detail.notes}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setAssignOpen(true)}>
              <UserCheck className="ms-2 h-4 w-4" />
              تعيين مندوب
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => setStatusOpen(true)}>
              <RefreshCw className="ms-2 h-4 w-4" />
              تغيير الحالة
            </Button>
            {/* <Button variant="outline" className="rounded-xl" onClick={() => setProofsOpen(true)}>
              <Camera className="ms-2 h-4 w-4" />
              إثباتات ({detail.delivery_proofs.length})
            </Button> */}
            <Button
              className="rounded-xl gradient-brand shadow-glow"
              onClick={() => setWaybillOpen(true)}
            >
              <Printer className="ms-2 h-4 w-4" />
              طباعة البوليصة
            </Button>
          </div>
        </div>
      </div>

      {/* ── Quick-glance cards ── */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="الشركة" value={detail.company_name} sub={detail.company_phone} />
        <InfoCard
          label="المندوب"
          value={detail.agent_name ?? <span className="text-warning">غير معيّن</span>}
          sub={detail.agent_phone ?? undefined}
        />
        <InfoCard label="تاريخ التعيين" value={formatDateTime(detail.order.assigned_at)} />
        <InfoCard label="تاريخ التسليم" value={formatDateTime(detail.order.delivered_at)} />
      </div>

      {/* ── Main grid: details left, timeline right ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Customer */}
          <SectionCard title="بيانات العميل">
            <FieldGrid
              rows={[
                { label: "الاسم", value: detail.customer_info.customer_name },
                {
                  label: "الهاتف",
                  value: (
                    <a
                      href={`tel:${detail.customer_info.customer_phone}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {detail.customer_info.customer_phone}
                    </a>
                  ),
                },
                {
                  label: "هاتف بديل",
                  value: detail.customer_info.phone_alt ? (
                    <a
                      href={`tel:${detail.customer_info.phone_alt}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {detail.customer_info.phone_alt}
                    </a>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </SectionCard>

          {/* Address */}
          <SectionCard title="عنوان التوصيل">
            <FieldGrid
              rows={[
                {
                  label: "المحافظة",
                  value: detail.governorate_name,
                },
                {
                  label: "المدينة",
                  value: hasCity ? detail.city_name : "—",
                },
                { label: "العنوان التفصيلي", value: detail.address.address_line },
              ]}
            />
          </SectionCard>

          {/* Items */}
          <SectionCard title="محتوى الشحنة">
            <FieldGrid
              rows={[
                {
                  label: "الوصف",
                  value: detail.items[0]?.item_description ?? detail.notes ?? "—",
                },
                { label: "الكمية الإجمالية", value: detail.items[0]?.total_quantity ?? "—" },
                {
                  label: "الكمية المسلّمة",
                  value: detail.items[0]?.delivered_quantity ?? "—",
                },
                {
                  label: "الكمية المرتجعة",
                  value: detail.items[0]?.returned_quantity ?? "—",
                },
              ]}
            />
          </SectionCard>

          {/* Financials */}
          <SectionCard title="المالية">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-right text-xs font-semibold text-muted-foreground">
                    {[
                      "المبلغ الأصلي",
                      "المبلغ المعتمد",
                      "المحصّل",
                      "رسوم الشحن",
                      "العمولة",
                      "صافي الشركة",
                      "تسوية",
                    ].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[
                      formatAmount(detail.financials.original_amount),
                      formatAmount(detail.financials.approved_amount),
                      formatAmount(detail.financials.collected_amount),
                      formatAmount(detail.financials.shipping_fee),
                      formatAmount(detail.financials.commission_amount),
                      formatAmount(detail.financials.net_due_company),
                      detail.financials.is_settled === 1 ? (
                        <Badge key="settled" variant="default">
                          مسوّى
                        </Badge>
                      ) : (
                        <Badge key="unsettled" variant="secondary">
                          غير مسوّى
                        </Badge>
                      ),
                    ].map((cell, i) => (
                      <td
                        key={i}
                        className="border-b border-border/60 px-4 py-3 tabular-nums last:border-0"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Schedule — only render if any schedule field is present */}
          {detail.schedule &&
            (detail.schedule.expected_delivery_date ||
              detail.schedule.postponed_date ||
              detail.schedule.schedule_notes) && (
              <SectionCard title="الجدولة" tableName="order_schedule">
                <FieldGrid
                  rows={[
                    {
                      label: "تاريخ التسليم المتوقع",
                      value: formatDateTime(detail.schedule.expected_delivery_date),
                    },
                    {
                      label: "تاريخ التأجيل",
                      value: formatDateTime(detail.schedule.postponed_date),
                    },
                    { label: "ملاحظات الجدولة", value: detail.schedule.schedule_notes },
                  ]}
                />
              </SectionCard>
            )}

          {/* Approvals — only render if approval data exists */}
          {detail.approval && (
            <SectionCard title="الموافقات" tableName="order_approvals">
              <FieldGrid
                rows={[
                  {
                    label: "يتطلب موافقة",
                    value: detail.approval.requires_approval === 1 ? "نعم" : "لا",
                  },
                  {
                    label: "حالة الموافقة",
                    value: (
                      <Badge
                        variant={detail.approval.approval_granted === 1 ? "default" : "secondary"}
                      >
                        {approvalLabel(detail.approval.approval_granted)}
                      </Badge>
                    ),
                  },
                  {
                    label: "بواسطة",
                    value: detail.approved_by_name ?? detail.approval.approved_by ?? "—",
                  },
                  {
                    label: "في",
                    value: formatDateTime(detail.approval.approved_at),
                  },
                ]}
              />
            </SectionCard>
          )}

          {/* Raw order fields */}
          {/* <SectionCard title="بيانات الطلب" tableName="orders">
            <FieldGrid
              rows={[
                {
                  label: "order_id",
                  value: <code className="text-xs">{detail.order.order_id}</code>,
                },
                { label: "reference_no", value: detail.order.reference_no },
                { label: "internal_code", value: detail.order.internal_code },
                {
                  label: "status",
                  value: `${detail.order.status} — ${statusLabel}`,
                },
                {
                  label: "shipping_company_id",
                  value: <code className="text-xs">{detail.order.shipping_company_id ?? "—"}</code>,
                },
                {
                  label: "delivery_agent_id",
                  value: <code className="text-xs">{detail.order.delivery_agent_id ?? "—"}</code>,
                },
                { label: "created_at", value: formatDateTime(detail.order.created_at) },
                { label: "updated_at", value: formatDateTime(detail.order.updated_at) },
              ]}
            />
          </SectionCard> */}
        </div>

        {/* ── Right column: status timeline ── */}
        <OrderStatusTimeline entries={detail.status_history} />
      </div>

      {/* ── Dialogs ── */}
      <OrderAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        order={listItem}
        onSave={handleAssign}
        loading={saving}
      />
      <OrderStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={listItem}
        onSave={handleStatusChange}
        loading={saving}
      />
      <OrderDeliveryProofsDialog
        open={proofsOpen}
        onOpenChange={setProofsOpen}
        internalCode={detail.order.internal_code}
        proofs={detail.delivery_proofs}
      />
      <OrderWaybillDialog open={waybillOpen} onOpenChange={setWaybillOpen} order={detail} />
    </AppShell>
  );
}
