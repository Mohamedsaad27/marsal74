import type { ActiveFlag } from "@/lib/admin/mock-data";

export type ApiResponse<T> = {
  isSuccess: boolean;
  message: string;
  data: T;
};

export type AgentZoneRecord = {
  agent_zone_id: string;
  delivery_agent_id: number;
  delivery_agent_name: string;
  governorate_id: number | null;
  governorate_name: string | null;
  city_id: number | null;
  city_name: string | null;
  is_primary: ActiveFlag;
  created_at: string;
  updated_at: string;
  /** internal zone row id */
  zone_row_id: number;
};

export type CreateAgentZonePayload = {
  delivery_agent_id: number;
  governorate_id: number;
  city_id: number;
  is_primary: ActiveFlag;
};

export type UpdateAgentZonePayload = CreateAgentZonePayload & {
  zone_row_id: number;
};

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
