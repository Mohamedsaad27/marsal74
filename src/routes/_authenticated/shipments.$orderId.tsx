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
import {
  ArrowRight,
  Camera,
  Loader2,
  Printer,
  RefreshCw,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/shipments/$orderId")({
  component: OrderDetailPage,
});

function DataTable({
  tableName,
  columns,
  rows,
}: {
  tableName: string;
  columns: { key: string; label: string }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <code className="text-xs font-bold text-primary">{tableName}</code>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-right text-xs font-semibold text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2.5">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-border/60 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-top">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

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
      toast.success(response.message);
      setAssignOpen(false);
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
      toast.success(response.message);
      setStatusOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحديث الحالة");
    } finally {
      setSaving(false);
    }
  };

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

  const statusLabel = ORDER_STATUS_OPTIONS.find((o) => o.code === detail.order.status)?.label ?? String(detail.order.status);

  return (
    <AppShell>
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
              ref: {detail.order.reference_no} — order_id:{" "}
              <code className="text-[10px]">{detail.order.order_id}</code>
            </p>
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
            <Button variant="outline" className="rounded-xl" onClick={() => setProofsOpen(true)}>
              <Camera className="ms-2 h-4 w-4" />
              إثباتات ({detail.delivery_proofs.length})
            </Button>
            <Button className="rounded-xl gradient-brand shadow-glow" onClick={() => setWaybillOpen(true)}>
              <Printer className="ms-2 h-4 w-4" />
              طباعة البوليصة
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "الشركة", value: detail.company_name },
          { label: "المندوب", value: detail.agent_name ?? "غير معيّن" },
          { label: "assigned_at", value: formatDateTime(detail.order.assigned_at) },
          { label: "delivered_at", value: formatDateTime(detail.order.delivered_at) },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs font-semibold text-muted-foreground">{card.label}</p>
            <p className="mt-1 font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <DataTable
            tableName="orders"
            columns={[
              { key: "field", label: "الحقل" },
              { key: "value", label: "القيمة" },
            ]}
            rows={[
              { field: "order_id", value: detail.order.order_id },
              { field: "reference_no", value: detail.order.reference_no },
              { field: "internal_code", value: detail.order.internal_code },
              { field: "shipping_company_id", value: detail.order.shipping_company_id ?? "—" },
              { field: "delivery_agent_id", value: detail.order.delivery_agent_id ?? "—" },
              { field: "status", value: `${detail.order.status} — ${statusLabel}` },
              { field: "created_at", value: formatDateTime(detail.order.created_at) },
              { field: "updated_at", value: formatDateTime(detail.order.updated_at) },
            ]}
          />

          <DataTable
            tableName="order_customer_info"
            columns={[
              { key: "customer_name", label: "customer_name" },
              { key: "customer_phone", label: "customer_phone" },
              { key: "phone_alt", label: "phone_alt" },
            ]}
            rows={[
              {
                customer_name: detail.customer_info.customer_name,
                customer_phone: detail.customer_info.customer_phone,
                phone_alt: detail.customer_info.phone_alt ?? "—",
              },
            ]}
          />

          <DataTable
            tableName="order_addresses"
            columns={[
              { key: "governorate", label: "governorate_id" },
              { key: "city", label: "city_id" },
              { key: "address_line", label: "address_line" },
            ]}
            rows={[
              {
                governorate: `${detail.address.governorate_id} (${detail.governorate_name})`,
                city: `${detail.address.city_id} (${detail.city_name})`,
                address_line: detail.address.address_line,
              },
            ]}
          />

          <DataTable
            tableName="order_items"
            columns={[
              { key: "item_description", label: "item_description" },
              { key: "total_quantity", label: "total_quantity" },
              { key: "delivered_quantity", label: "delivered_quantity" },
              { key: "returned_quantity", label: "returned_quantity" },
            ]}
            rows={detail.items.map((item) => ({
              item_description: item.item_description ?? "—",
              total_quantity: item.total_quantity,
              delivered_quantity: item.delivered_quantity ?? "—",
              returned_quantity: item.returned_quantity ?? "—",
            }))}
          />

          <DataTable
            tableName="order_financials"
            columns={[
              { key: "original_amount", label: "original_amount" },
              { key: "approved_amount", label: "approved_amount" },
              { key: "collected_amount", label: "collected_amount" },
              { key: "shipping_fee", label: "shipping_fee" },
              { key: "commission_amount", label: "commission_amount" },
              { key: "net_due_company", label: "net_due_company" },
              { key: "is_settled", label: "is_settled" },
            ]}
            rows={[
              {
                original_amount: formatAmount(detail.financials.original_amount),
                approved_amount: formatAmount(detail.financials.approved_amount),
                collected_amount: formatAmount(detail.financials.collected_amount),
                shipping_fee: formatAmount(detail.financials.shipping_fee),
                commission_amount: formatAmount(detail.financials.commission_amount),
                net_due_company: formatAmount(detail.financials.net_due_company),
                is_settled: detail.financials.is_settled === 1 ? "نعم" : "لا",
              },
            ]}
          />

          <DataTable
            tableName="order_approvals"
            columns={[
              { key: "requires_approval", label: "requires_approval" },
              { key: "approval_granted", label: "approval_granted" },
              { key: "approved_by", label: "approved_by" },
              { key: "approved_at", label: "approved_at" },
            ]}
            rows={
              detail.approval
                ? [
                    {
                      requires_approval: detail.approval.requires_approval === 1 ? "نعم" : "لا",
                      approval_granted: (
                        <Badge variant={detail.approval.approval_granted === 1 ? "default" : "secondary"}>
                          {approvalLabel(detail.approval.approval_granted)}
                        </Badge>
                      ),
                      approved_by: detail.approved_by_name ?? detail.approval.approved_by ?? "—",
                      approved_at: formatDateTime(detail.approval.approved_at),
                    },
                  ]
                : [{ requires_approval: "—", approval_granted: "لا يوجد", approved_by: "—", approved_at: "—" }]
            }
          />
        </div>

        <OrderStatusTimeline entries={detail.status_history} />
      </div>

      <OrderAssignDialog open={assignOpen} onOpenChange={setAssignOpen} order={listItem} onSave={handleAssign} loading={saving} />
      <OrderStatusDialog open={statusOpen} onOpenChange={setStatusOpen} order={listItem} onSave={handleStatusChange} loading={saving} />
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
