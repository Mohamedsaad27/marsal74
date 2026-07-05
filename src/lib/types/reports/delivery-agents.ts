// types/reports/delivery-agents.ts
export interface DeliveryAgentSummary {
  total_agents: number;
  available_agents: number;
  total_balance: string;
  total_orders: number;
  total_collected_amount: string;
}

export interface DeliveryAgentItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_available: boolean;
  balance: string;
  metrics: {
    total_orders: number;
    terminal_orders: number;
    total_collected_amount: string;
    total_commission_amount: string;
    total_net_due: string;
  };
  created_at: string;
}
