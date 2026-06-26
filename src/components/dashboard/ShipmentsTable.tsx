import { MoreHorizontal, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge, ShipmentStatus } from "./StatusBadge";
import { apiFetch } from "@/lib/admin/users.api";
import { PROFILE_BASE_URL } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
type RecentOrdersResponse = {
  isSuccess: boolean;
  message: string;
  data: Array<{
    order_id: string;
    internal_code: string;
    reference_code: string;
    customer_name: string;
    customer_phone: string;
    region: string;
    company_name: string;
    agent_name: string | null;
    agent_avatar_url: string | null;
    original_amount: number;
    collected_amount: number | null;
    status: number;
    status_label_ar: string;
    created_at: string;
  }>;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

type Row = {
  order_id: string;
  reference_no: string;
  internal_code: string;
  customer_name: string;
  customer_phone: string;
  region: string;
  company: string;
  agent: string;
  original_amount: string;
  collected_amount: string;
  status: ShipmentStatus;
  created_at: string;
};

async function getRecentOrders(search: string) {
  const response = await apiFetch<RecentOrdersResponse>(
    `/api/dashboard/recent-orders?per_page=15&page=1&status=&search=${encodeURIComponent(
      search,
    )}&sort_by=created_at&sort_dir=desc`,
    {
      method: "GET",
    },
    PROFILE_BASE_URL,
  );

  return response;
}

function mapStatus(status: number): ShipmentStatus {
  switch (status) {
    case 1:
      return "pending";

    case 2:
      return "in_delivery";

    case 3:
      return "delivered";

    default:
      return "pending";
  }
}

export function ShipmentsTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["recent-orders", debouncedSearch],
    queryFn: () => getRecentOrders(debouncedSearch),
    placeholderData: (previousData) => previousData, // ← keeps old rows visible
  });

  const rows: Row[] =
    data?.data.map((order) => ({
      order_id: order.order_id,
      reference_no: order.reference_code,
      internal_code: order.internal_code,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      region: order.region,
      company: order.company_name,
      agent: order.agent_name ?? "غير معين",
      original_amount: Number(order.original_amount).toFixed(2),
      collected_amount:
        order.collected_amount == null ? "—" : Number(order.collected_amount).toFixed(2),
      status: mapStatus(order.status),
      created_at: order.created_at,
    })) ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="text-center text-sm text-muted-foreground">جاري تحميل الطلبات...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="text-center text-sm text-destructive">فشل تحميل الطلبات</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-bold">أحدث الطلبات</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isFetching
              ? "جاري التحديث..."
              : error
                ? "تعذّر تحديث البيانات" // subtle, doesn't blow up the UI
                : `آخر ${data?.meta.per_page ?? 15} طلب`}
          </p>
        </div>
        <div className="relative w-72">
          <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب أو العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">الكود الداخلي</th>
              <th className="px-5 py-3">المرجع</th>
              <th className="px-5 py-3">العميل</th>
              <th className="px-5 py-3">المنطقة</th>
              <th className="px-5 py-3">الشركة</th>
              <th className="px-5 py-3">المندوب</th>
              <th className="px-5 py-3">المبلغ الأصلي</th>
              <th className="px-5 py-3">المحصّل</th>
              <th className="px-5 py-3">الحالة</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.order_id}
                className="border-b border-border/60 transition-colors hover:bg-muted/30 last:border-0"
              >
                <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                  #{r.internal_code}
                </td>

                <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground">
                  {r.reference_no}
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium">{r.customer_name}</p>
                  <p className="tabular-nums text-[11px] text-muted-foreground">
                    {r.customer_phone}
                  </p>
                </td>

                <td className="px-5 py-4 text-muted-foreground">{r.region}</td>

                <td className="px-5 py-4">{r.company}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                      {r.agent.charAt(0)}
                    </div>

                    <span>{r.agent}</span>
                  </div>
                </td>

                <td className="px-5 py-4 tabular-nums">
                  {r.original_amount}
                  <span className="mr-1 text-[10px] text-muted-foreground">ج.م</span>
                </td>

                <td className="px-5 py-4 font-semibold tabular-nums">
                  {r.collected_amount}

                  {r.collected_amount !== "—" && (
                    <span className="mr-1 text-[10px] text-muted-foreground">ج.م</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-muted-foreground">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
