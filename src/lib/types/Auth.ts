export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  whatsapp_support_phone: string;
  account_type: string;
  is_active: boolean;
  roles: string[];
  permissions: string[]; // ADDED
  shipping_company: unknown | null;
  staff_member: {
    id: string;
    department: {
      id: string;
      name_ar: string;
      name_en: string;
    } | null;
    job_title: string;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null;
  delivery_agent: unknown | null;
  addresses?: unknown[];
  last_login_at: string;
  created_at: string;
}
