import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/admin/users.api";

type CurrentUser = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | "";
  account_type: string;
  is_active: boolean;
  staff_member: {
    id: string;
    department: string;
    job_title: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  shipping_company: null;
  delivery_agent: null;
  last_login_at: string;
  created_at: string;
  permissions: string[];
};

type MeResponse = {
  isSuccess: boolean;
  message: string;
  data: CurrentUser;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    apiFetch<MeResponse>("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true));
  }, []);

  return { user, hydrated };
}
