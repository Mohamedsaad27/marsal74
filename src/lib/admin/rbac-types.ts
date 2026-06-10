export interface Permission {
  id: number;
  name: string;
  label_ar: string;
  label_en: string;
  group: string;
  group_label_ar: string | null;
  guard_name?: string;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at?: string;
}

export interface ApiListResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T[];
}

export interface PermissionGroup {
  group: string;
  groupLabel: string;
  permissions: Permission[];
}
