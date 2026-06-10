import { RETURNS } from "@/lib/admin/returns-data";
import type { ApiResponse, ReturnRecord } from "@/lib/admin/returns-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let store = RETURNS.map((item) => ({ ...item }));

export async function fetchReturns(): Promise<ApiResponse<ReturnRecord[]>> {
  await delay(400);
  return { isSuccess: true, message: "تمت العملية بنجاح", data: store.map((item) => ({ ...item })) };
}

export async function receiveReturn(_returnId: string): Promise<ApiResponse<null>> {
  await delay(400);
  return { isSuccess: true, message: "تم استلام المرتجع من المندوب (واجهة تصميمية)", data: null };
}

export async function sendReturnToCompany(_returnId: string): Promise<ApiResponse<null>> {
  await delay(400);
  return { isSuccess: true, message: "تم تسليم المرتجع لشركة الشحن (واجهة تصميمية)", data: null };
}

export async function exportReturnsReport(): Promise<ApiResponse<{ filename: string }>> {
  await delay(500);
  return {
    isSuccess: true,
    message: "جاري تحميل التقرير (واجهة تصميمية)",
    data: { filename: "returns-report-2026-05-24.xlsx" },
  };
}

export function computeReturnKpis(items: ReturnRecord[]) {
  return {
    total: items.length,
    pending: items.filter((i) => i.return_status === 1).length,
    received: items.filter((i) => i.return_status === 2).length,
    sent: items.filter((i) => i.return_status === 3).length,
  };
}
