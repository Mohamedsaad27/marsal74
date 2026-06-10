import { DELIVERY_AGENTS } from "@/lib/admin/delivery-agents-data";
import { GOVERNORATES, CITIES } from "@/lib/admin/locations-data";

export const AGENT_ZONE_AGENT_OPTIONS = DELIVERY_AGENTS.map((agent) => ({
  value: String(agent.id),
  label: agent.name,
}));

export const AGENT_ZONE_GOVERNORATE_OPTIONS = GOVERNORATES.filter((g) => g.is_active === 1).map((g) => ({
  value: String(g.id),
  label: g.name_ar,
}));

export function getAgentZoneCityOptions(governorateId: string) {
  if (!governorateId) return [];
  return CITIES.filter((c) => c.is_active === 1 && String(c.governorate_id) === governorateId).map((c) => ({
    value: String(c.id),
    label: c.name_ar,
  }));
}

export { GOVERNORATES, CITIES };
