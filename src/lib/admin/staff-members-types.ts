export interface StaffMemberProfile {
  id: string;
  department: {
    id: string;
    name_ar: string;
    name_en: string;
    is_active: boolean;
  };
  job_title: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  avatar: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;

  role: {
    name: string;
    label: string;
  };

  staff_member: StaffMemberProfile;
  addresses: StaffMemberAddress[];
}
export interface StaffMembersResponse {
  isSuccess: boolean;
  message: string;
  data: {
    counts: {
      total: number;
      active: number;
      inactive: number;
    };
    items: StaffMember[];
    type: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more: boolean;
  };
}
export interface StaffMembersResponse {
  isSuccess: boolean;
  message: string;
  data: {
    counts: {
      total: number;
      active: number;
      inactive: number;
    };
    items: StaffMember[];
    type: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more: boolean;
  };
}
export interface CreateStaffMemberPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  profile: {
    department_id: string;
    job_title: string;
    notes: string;
  };

  address: StaffMemberAddress;
}
export const STAFF_DEPARTMENTS = [
  "العمليات",
  "خدمة العملاء",
  "المالية",
  "تقنية المعلومات",
  "الموارد البشرية",
  "المبيعات",
] as const;

export interface StaffMemberAddress {
  address_id?: string;
  city_id: string;
  address_line: string;
  landmark: string;
  street: string;
  building_number: string;
  floor_number: string;
  apartment_number: string;
  is_default: boolean;
}
