// types/reports/collections.ts
export interface CollectionSummary {
  total_collections: number;
  total_collected_amount: string;
  total_commission_amount: string;
  total_net_due: string;
  pending_cash_count: number;
  settled_count: number;
}

export interface CollectionItem {
  id: string;
  order: { id: string; reference_code: string };
  agent: { id: string; name: string };
  company: { id: string; name: string };
  collection_type: { code: number; label: string };
  collected_amount: string;
  commission_amount: string;
  net_due: string;
  cash_received_at: string | null;
  settlement_id: string | null;
  collected_at: string;
}
