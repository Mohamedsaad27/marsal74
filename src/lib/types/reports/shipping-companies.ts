// types/reports/shipping-companies.ts
export interface ShippingCompanySummary {
  total_companies: number;
  active_companies: number;
  signed_total_balance: string;
  total_orders: number;
  total_collected_amount: string;
}

export interface ShippingCompanyItem {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  is_active: boolean;
  balance: string;
  metrics: {
    total_orders: number;
    terminal_orders: number;
    total_collected_amount: string;
    total_system_commission_amount: string;
  };
  created_at: string;
}
