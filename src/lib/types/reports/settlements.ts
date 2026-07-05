// types/reports/settlements.ts
export interface SettlementSummary {
  total_settlements: number;
  total_collections: number;
  total_commissions: number;
  net_amount: number;
}

export interface SettlementItem {
  id: string;
  reference: string;
  settlement_type: { code: number; label: string };
  status: { code: number; label: string };
  entity: { id: string; name: string };
  collections_count: number;
  total_collections: string;
  total_commissions: string;
  net_amount: string;
  period_from: string;
  period_to: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}
