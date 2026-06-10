import { COLLECTIONS } from "@/lib/admin/collections-data";
import type { AgentCollectionSummary, ApiResponse, CollectionRecord } from "@/lib/admin/collections-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let store = COLLECTIONS.map((item) => ({ ...item }));

export async function fetchCollections(): Promise<ApiResponse<CollectionRecord[]>> {
  await delay(400);
  return { isSuccess: true, message: "تمت العملية بنجاح", data: store.map((item) => ({ ...item })) };
}

export async function receiveCashFromAgent(
  agentId: string,
  collectionIds: string[],
  _note?: string,
): Promise<ApiResponse<null>> {
  await delay(500);
  void agentId;
  void collectionIds;
  return {
    isSuccess: true,
    message: "تم تسجيل استلام النقد من المندوب (واجهة تصميمية)",
    data: null,
  };
}

export async function exportCollections(): Promise<ApiResponse<{ filename: string }>> {
  await delay(500);
  return {
    isSuccess: true,
    message: "جاري تحميل ملف Excel (واجهة تصميمية)",
    data: { filename: "collections-export-2026-05-24.xlsx" },
  };
}

export function computeCollectionKpis(items: CollectionRecord[]) {
  const totalCollected = items.reduce((sum, item) => sum + item.collected_amount, 0);
  const totalCommission = items.reduce((sum, item) => sum + item.commission_amount, 0);
  const totalNetDue = items.reduce((sum, item) => sum + item.net_due_company, 0);
  const settledNet = items.filter((i) => i.is_settled === 1).reduce((sum, item) => sum + item.net_due_company, 0);
  const pendingHandoff = items.filter((i) => i.cash_received_by_admin === 0).length;
  return { totalCollected, totalCommission, totalNetDue, settledNet, pendingHandoff, total: items.length };
}

export function computeAgentSummaries(items: CollectionRecord[]): AgentCollectionSummary[] {
  const map = new Map<string, AgentCollectionSummary>();

  for (const item of items) {
    const existing = map.get(item.delivery_agent_id);
    const pending = item.cash_received_by_admin === 0 ? 1 : 0;
    const pendingAmount = item.cash_received_by_admin === 0 ? item.collected_amount : 0;

    if (existing) {
      existing.collections_count += 1;
      existing.total_collected += item.collected_amount;
      existing.total_commission += item.commission_amount;
      existing.total_net_due += item.net_due_company;
      existing.pending_handoff += pending;
      existing.pending_handoff_amount += pendingAmount;
    } else {
      map.set(item.delivery_agent_id, {
        delivery_agent_id: item.delivery_agent_id,
        agent_name: item.agent_name,
        collections_count: 1,
        total_collected: item.collected_amount,
        total_commission: item.commission_amount,
        total_net_due: item.net_due_company,
        pending_handoff: pending,
        pending_handoff_amount: pendingAmount,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.pending_handoff_amount - a.pending_handoff_amount);
}

export function getPendingCollectionsForAgent(items: CollectionRecord[], agentId: string): CollectionRecord[] {
  return items.filter((item) => item.delivery_agent_id === agentId && item.cash_received_by_admin === 0);
}
