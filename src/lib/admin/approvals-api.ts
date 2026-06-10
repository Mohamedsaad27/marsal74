import { APPROVAL_HISTORY, APPROVAL_REQUESTS, MOCK_COMPANY_REVIEWER } from "@/lib/admin/approvals-data";
import type {
  ApiResponse,
  ApprovalHistoryEntry,
  ApprovalRequest,
} from "@/lib/admin/approvals-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let requestStore = APPROVAL_REQUESTS.map((item) => ({ ...item }));
let historyStore = APPROVAL_HISTORY.map((item) => ({ ...item }));

function appendHistory(entry: Omit<ApprovalHistoryEntry, "id">) {
  historyStore = [{ ...entry, id: `ah-${Date.now()}` }, ...historyStore];
}

export async function fetchApprovalRequests(): Promise<ApiResponse<ApprovalRequest[]>> {
  await delay(400);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: requestStore.map((item) => ({ ...item })),
  };
}

export async function fetchApprovalHistory(): Promise<ApiResponse<ApprovalHistoryEntry[]>> {
  await delay(300);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: [...historyStore].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}

export async function approveRequest(
  id: string,
  note?: string,
  reviewer?: { id: string; name: string; role: ApprovalHistoryEntry["actor_role"] },
): Promise<ApiResponse<ApprovalRequest>> {
  await delay(400);
  const index = requestStore.findIndex((item) => item.approval_request_id === id);
  if (index === -1) {
    return { isSuccess: false, message: "الطلب غير موجود", data: null as unknown as ApprovalRequest };
  }
  if (requestStore[index].approval_status !== 1) {
    return { isSuccess: false, message: "يمكن مراجعة الطلبات المعلّقة فقط", data: requestStore[index] };
  }

  const reviewerInfo = reviewer ?? { id: "usr-admin-01", name: "سارة محمود", role: "admin" as const };
  const now = new Date().toISOString();

  requestStore[index] = {
    ...requestStore[index],
    approval_status: 2,
    resolved_at: now,
    resolved_by: reviewerInfo.name,
    review_note: note?.trim() || null,
    expires_at: null,
    updated_at: now,
  };

  appendHistory({
    approval_request_id: id,
    ref: requestStore[index].ref,
    action: "approved",
    actor_id: reviewerInfo.id,
    actor_name: reviewerInfo.name,
    actor_role: reviewerInfo.role,
    note: note?.trim() || null,
    from_status: 1,
    to_status: 2,
    created_at: now,
  });

  return {
    isSuccess: true,
    message: "تمت الموافقة على الطلب (واجهة تصميمية)",
    data: { ...requestStore[index] },
  };
}

export async function rejectRequest(
  id: string,
  note?: string,
  reviewer?: { id: string; name: string; role: ApprovalHistoryEntry["actor_role"] },
): Promise<ApiResponse<ApprovalRequest>> {
  await delay(400);
  const index = requestStore.findIndex((item) => item.approval_request_id === id);
  if (index === -1) {
    return { isSuccess: false, message: "الطلب غير موجود", data: null as unknown as ApprovalRequest };
  }
  if (requestStore[index].approval_status !== 1) {
    return { isSuccess: false, message: "يمكن مراجعة الطلبات المعلّقة فقط", data: requestStore[index] };
  }

  const reviewerInfo = reviewer ?? { id: "usr-admin-01", name: "سارة محمود", role: "admin" as const };
  const now = new Date().toISOString();

  requestStore[index] = {
    ...requestStore[index],
    approval_status: 3,
    resolved_at: now,
    resolved_by: reviewerInfo.name,
    review_note: note?.trim() || null,
    expires_at: null,
    updated_at: now,
  };

  appendHistory({
    approval_request_id: id,
    ref: requestStore[index].ref,
    action: "rejected",
    actor_id: reviewerInfo.id,
    actor_name: reviewerInfo.name,
    actor_role: reviewerInfo.role,
    note: note?.trim() || null,
    from_status: 1,
    to_status: 3,
    created_at: now,
  });

  return {
    isSuccess: true,
    message: "تم رفض الطلب (واجهة تصميمية)",
    data: { ...requestStore[index] },
  };
}

export function computeApprovalKpis(items: ApprovalRequest[]) {
  return {
    pending: items.filter((i) => i.approval_status === 1).length,
    approved: items.filter((i) => i.approval_status === 2).length,
    rejected: items.filter((i) => i.approval_status === 3).length,
    expired: items.filter((i) => i.approval_status === 4).length,
    urgent: items.filter((i) => i.approval_status === 1 && (expiresInMinutes(i.expires_at) ?? 999) <= 30).length,
  };
}

export function getPendingApprovals(items: ApprovalRequest[]): ApprovalRequest[] {
  return items
    .filter((i) => i.approval_status === 1)
    .sort((a, b) => {
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aExp - bExp;
    });
}

export function filterByCompany(items: ApprovalRequest[], companyId: string): ApprovalRequest[] {
  return items.filter((item) => item.shipping_company_id === companyId);
}

export function getHistoryForRequest(requestId: string, history: ApprovalHistoryEntry[]): ApprovalHistoryEntry[] {
  return history
    .filter((entry) => entry.approval_request_id === requestId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getCompanyReviewer(companyId: string) {
  if (companyId === MOCK_COMPANY_REVIEWER.company_id) {
    return { id: MOCK_COMPANY_REVIEWER.id, name: MOCK_COMPANY_REVIEWER.name, role: "company" as const };
  }
  return { id: `usr-comp-${companyId}`, name: "مسؤول الشركة", role: "company" as const };
}

function expiresInMinutes(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60));
}
