// src/hooks/useCurrentUser.ts
import { useSyncExternalStore } from "react";
import { getCurrentUser as readCurrentUser } from "@/lib/auth/Auth.api";

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
    department: {
      id: string;
      name_ar: string;
      name_en: string;
    } | null;
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

const listeners = new Set<() => void>();

let cachedSnapshot: CurrentUser | null = readCurrentUser() as CurrentUser | null;

export function notifyUserChanged() {
  cachedSnapshot = readCurrentUser() as CurrentUser | null; // re-parse ONCE here
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return cachedSnapshot;
}

function getServerSnapshot() {
  return null;
}

export function useCurrentUser() {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { user, hydrated: true };
}
