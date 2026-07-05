// types/reports/orders.ts
export interface OrderSummary {
  total_orders: number;
  terminal_orders: number;
  pending_orders: number;
  total_original_amount: string;
  total_collected_amount: string;
  total_net_due_company: string;
}

export interface OrderItem {
  id: string;
  reference_code: string;
  reference_no: string;
  status: { code: number; label: string; color: string };
  customer: { name: string; phone: string };
  company: { id: string; name: string };
  agent: { id: string; name: string } | null;
  address: { governorate: string; city: string | null; address_line: string };
  financials: {
    original_amount: string;
    collected_amount: string | null;
    commission_amount: string | null;
    net_due_company: string | null;
    is_settled: boolean;
  };
  assigned_at: string | null;
  delivered_at: string | null;
  created_at: string;
}
