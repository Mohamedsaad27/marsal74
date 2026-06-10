import { ORDER_DETAILS } from "@/lib/admin/orders-data";
import type { ApiResponse, CreateOrderPayload, OrderDetail, OrderListItem } from "@/lib/admin/orders-types";
import { ORDER_STATUS_TO_KEY } from "@/lib/admin/orders-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toListItem(detail: OrderDetail): OrderListItem {
  return {
    order: { ...detail.order },
    customer_name: detail.customer_info.customer_name,
    customer_phone: detail.customer_info.customer_phone,
    governorate_name: detail.governorate_name,
    city_name: detail.city_name,
    company_name: detail.company_name,
    agent_name: detail.agent_name,
    original_amount: detail.financials.original_amount,
    collected_amount: detail.financials.collected_amount,
    status_key: detail.status_key,
  };
}

export async function fetchOrders(): Promise<ApiResponse<OrderListItem[]>> {
  await delay(400);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: ORDER_DETAILS.map(toListItem),
  };
}

export async function fetchOrderById(orderId: string): Promise<ApiResponse<OrderDetail | null>> {
  await delay(350);
  const detail = ORDER_DETAILS.find((item) => item.order.order_id === orderId);
  if (!detail) {
    return { isSuccess: false, message: "الطلب غير موجود", data: null };
  }
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: structuredClone(detail),
  };
}

export async function fetchOrderByCode(code: string): Promise<ApiResponse<OrderDetail | null>> {
  await delay(350);
  const detail = ORDER_DETAILS.find(
    (item) => item.order.internal_code === code || item.order.reference_no === code,
  );
  if (!detail) {
    return { isSuccess: false, message: "الطلب غير موجود", data: null };
  }
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: structuredClone(detail),
  };
}

/** Design-only stubs — toast on UI, no persistence */
export async function createOrder(_payload: CreateOrderPayload): Promise<ApiResponse<null>> {
  await delay(500);
  return { isSuccess: true, message: "تم إنشاء الطلب (واجهة تصميمية)", data: null };
}

export async function assignOrderAgent(_orderId: string, _agentId: string): Promise<ApiResponse<null>> {
  await delay(400);
  return { isSuccess: true, message: "تم تعيين المندوب (واجهة تصميمية)", data: null };
}

export async function updateOrderStatus(
  _orderId: string,
  _status: number,
  _note?: string,
): Promise<ApiResponse<null>> {
  await delay(400);
  return { isSuccess: true, message: "تم تحديث حالة الطلب (واجهة تصميمية)", data: null };
}

export async function exportOrdersExcel(): Promise<ApiResponse<{ filename: string }>> {
  await delay(600);
  return {
    isSuccess: true,
    message: "جاري تحميل ملف Excel (واجهة تصميمية)",
    data: { filename: "orders-export-2026-05-24.xlsx" },
  };
}

export function statusMatchesKpiFilter(status: number, filter: string): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pending_assignment":
      return status === 1;
    case "in_delivery":
      return status === 2 || status === 3;
    case "delivered":
      return status === 4 || status === 5;
    case "delayed_rejected":
      return [6, 7, 8, 9, 10, 11].includes(status);
    case "returned":
      return status === 12;
    default:
      return String(status) === filter;
  }
}

export function computeKpiCounts(items: OrderListItem[]) {
  const total = items.length;
  return {
    all: total,
    pending_assignment: items.filter((i) => i.order.status === 1).length,
    in_delivery: items.filter((i) => [2, 3].includes(i.order.status)).length,
    delivered: items.filter((i) => [4, 5].includes(i.order.status)).length,
    delayed_rejected: items.filter((i) => [6, 7, 8, 9, 10, 11].includes(i.order.status)).length,
    returned: items.filter((i) => i.order.status === 12).length,
  };
}

export { ORDER_STATUS_TO_KEY };
