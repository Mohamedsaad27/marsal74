export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp_support_phone: string;
  account_type: string;
  is_active: boolean;
  roles: string[];
  shipping_company: unknown | null;
  staff_member: {
    staff_member_id: string;
    department: string;
    job_title: string;
    gender?: string;
  } | null;
  delivery_agent: unknown | null;
  last_login_at: string;
  created_at: string;
  gender?: string;
}
