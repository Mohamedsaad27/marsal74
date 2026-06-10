export interface DepartmentManager {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Department {
  id: string;
  name_ar: string;
  name_en: string;
  description: string;
  manager: DepartmentManager | null;
  is_active: boolean;
  staff_count: number;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDepartmentPayload {
  name_ar: string;
  name_en: string;
  description: string;
  manager_id?: string | null; // still send id on create/update
  is_active: boolean;
}

export interface DepartmentsResponse {
  kpis: {
    total_departments: number;
    total_active: number;
    total_members: number;
  };
  items: Department[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}
