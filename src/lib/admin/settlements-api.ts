import { COLLECTIONS } from "@/lib/admin/collections-data";
import type { CollectionRecord } from "@/lib/admin/collections-types";
import { SETTLEMENTS, SETTLEMENT_AGENT_OPTIONS, SETTLEMENT_COMPANY_OPTIONS } from "@/lib/admin/settlements-data";
import type {
  ApiResponse,
  CreateSettlementInput,
  MarkSettlementPaidInput,
  SettlementRecord,
  SettlementTypeCode,
} from "@/lib/admin/settlements-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let store = SETTLEMENTS.map((item) => ({ ...item, collection_ids: [...item.collection_ids] }));
let nextRef = 1043;

export async function fetchSettlements(): Promise<ApiResponse<SettlementRecord[]>> {
  await delay(400);
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: store.map((item) => ({ ...item, collection_ids: [...item.collection_ids] })),
  };
}

export async function createSettlement(input: CreateSettlementInput): Promise<ApiResponse<SettlementRecord>> {
  await delay(600);

  const collections = resolveCollections(input);
  const totalCollections = collections.reduce((sum, c) => sum + c.collected_amount, 0);
  const totalCommissions = collections.reduce((sum, c) => sum + c.commission_amount, 0);
  const netAmount = totalCollections - totalCommissions;

  const isAgent = input.settlement_type === 1;
  const partyLabel = isAgent
    ? SETTLEMENT_AGENT_OPTIONS.find((o) => o.value === input.party_id)?.label
    : SETTLEMENT_COMPANY_OPTIONS.find((o) => o.value === input.party_id)?.label;

  const record: SettlementRecord = {
    settlement_id: `stl-${Date.now()}`,
    settlement_ref: `STL-${nextRef++}`,
    settlement_type: input.settlement_type,
    settlement_status: 1,
    delivery_agent_id: isAgent ? input.party_id : null,
    agent_name: isAgent ? (partyLabel ?? null) : null,
    shipping_company_id: isAgent ? null : input.party_id,
    company_name: isAgent ? null : (partyLabel ?? null),
    initiated_by: "usr-admin-01",
    initiated_by_name: "سارة محمود",
    total_collections: totalCollections,
    total_commissions: totalCommissions,
    net_amount: netAmount,
    period_from: input.period_from,
    period_to: input.period_to,
    payment_method: null,
    payment_reference: null,
    paid_at: null,
    notes: input.notes ?? null,
    collection_ids: input.collection_ids,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store = [record, ...store];
  return {
    isSuccess: true,
    message: "تم إنشاء التسوية كمسودة (واجهة تصميمية)",
    data: { ...record, collection_ids: [...record.collection_ids] },
  };
}

export async function approveSettlement(settlementId: string): Promise<ApiResponse<SettlementRecord>> {
  await delay(500);
  const index = store.findIndex((item) => item.settlement_id === settlementId);
  if (index === -1) {
    return { isSuccess: false, message: "التسوية غير موجودة", data: null as unknown as SettlementRecord };
  }
  if (store[index].settlement_status !== 1) {
    return { isSuccess: false, message: "يمكن اعتماد المسودات فقط", data: store[index] };
  }

  store[index] = {
    ...store[index],
    settlement_status: 2,
    updated_at: new Date().toISOString(),
  };

  return {
    isSuccess: true,
    message: "تم اعتماد التسوية (واجهة تصميمية)",
    data: { ...store[index], collection_ids: [...store[index].collection_ids] },
  };
}

export async function markSettlementPaid(
  settlementId: string,
  input: MarkSettlementPaidInput,
): Promise<ApiResponse<SettlementRecord>> {
  await delay(500);
  const index = store.findIndex((item) => item.settlement_id === settlementId);
  if (index === -1) {
    return { isSuccess: false, message: "التسوية غير موجودة", data: null as unknown as SettlementRecord };
  }
  if (store[index].settlement_status !== 2) {
    return { isSuccess: false, message: "يمكن تحديد المعتمدة كمدفوعة فقط", data: store[index] };
  }

  const paidAt = new Date().toISOString();
  store[index] = {
    ...store[index],
    settlement_status: 3,
    payment_method: input.payment_method,
    payment_reference: input.payment_reference,
    paid_at: paidAt,
    updated_at: paidAt,
  };

  return {
    isSuccess: true,
    message: "تم تحديد التسوية كمدفوعة (واجهة تصميمية)",
    data: { ...store[index], collection_ids: [...store[index].collection_ids] },
  };
}

export async function exportSettlements(): Promise<ApiResponse<{ filename: string }>> {
  await delay(500);
  return {
    isSuccess: true,
    message: "جاري تحميل ملف Excel (واجهة تصميمية)",
    data: { filename: "settlements-export-2026-05-24.xlsx" },
  };
}

function resolveCollections(input: CreateSettlementInput): CollectionRecord[] {
  if (input.collection_ids.length > 0) {
    return COLLECTIONS.filter((c) => input.collection_ids.includes(c.collection_id));
  }
  return getEligibleCollections(input.settlement_type, input.party_id, input.period_from, input.period_to);
}

export function getEligibleCollections(
  type: SettlementTypeCode,
  partyId: string,
  periodFrom: string,
  periodTo: string,
): CollectionRecord[] {
  const from = new Date(periodFrom);
  const to = new Date(periodTo);
  to.setHours(23, 59, 59, 999);

  const settledIds = new Set(store.flatMap((s) => s.collection_ids));

  return COLLECTIONS.filter((item) => {
    if (item.is_settled === 1 || settledIds.has(item.collection_id)) return false;
    const collected = new Date(item.collected_at);
    if (collected < from || collected > to) return false;

    if (type === 1) return item.delivery_agent_id === partyId;
    return item.shipping_company_id === partyId;
  });
}

export function getLinkedCollections(settlement: SettlementRecord): CollectionRecord[] {
  return COLLECTIONS.filter((c) => settlement.collection_ids.includes(c.collection_id));
}

export function computeSettlementKpis(items: SettlementRecord[]) {
  const totalNet = items.reduce((sum, item) => sum + item.net_amount, 0);
  const draftNet = items.filter((i) => i.settlement_status === 1).reduce((sum, item) => sum + item.net_amount, 0);
  const approvedNet = items.filter((i) => i.settlement_status === 2).reduce((sum, item) => sum + item.net_amount, 0);
  const paidThisMonth = items
    .filter((i) => i.settlement_status === 3 && i.paid_at && isThisMonth(i.paid_at))
    .reduce((sum, item) => sum + item.net_amount, 0);

  return {
    total: items.length,
    totalNet,
    draftNet,
    approvedNet,
    paidThisMonth,
    draftCount: items.filter((i) => i.settlement_status === 1).length,
    approvedCount: items.filter((i) => i.settlement_status === 2).length,
    paidCount: items.filter((i) => i.settlement_status === 3).length,
  };
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function filterByPeriod(items: SettlementRecord[], periodFilter: string): SettlementRecord[] {
  if (periodFilter === "all") return items;

  const now = new Date();
  return items.filter((item) => {
    const periodEnd = new Date(item.period_to);
    if (periodFilter === "month") {
      return periodEnd.getFullYear() === now.getFullYear() && periodEnd.getMonth() === now.getMonth();
    }
    if (periodFilter === "last_month") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return periodEnd.getFullYear() === last.getFullYear() && periodEnd.getMonth() === last.getMonth();
    }
    if (periodFilter === "quarter") {
      const diffDays = (now.getTime() - periodEnd.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 90;
    }
    return true;
  });
}

export function filterCompanySettlements(items: SettlementRecord[], companyId: string): SettlementRecord[] {
  return items.filter((item) => item.settlement_type === 2 && item.shipping_company_id === companyId);
}
