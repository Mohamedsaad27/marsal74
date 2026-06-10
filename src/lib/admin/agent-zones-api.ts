import { fetchDeliveryAgents, saveAgentZones } from "@/lib/admin/delivery-agents-api";
import type { AgentZone, DeliveryAgent } from "@/lib/admin/delivery-agents-types";
import { CITIES, GOVERNORATES } from "@/lib/admin/locations-data";
import type {
  AgentZoneRecord,
  ApiResponse,
  CreateAgentZonePayload,
  UpdateAgentZonePayload,
} from "@/lib/admin/agent-zones-types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toRecord(agent: DeliveryAgent, zone: AgentZone): AgentZoneRecord {
  const timestamp = agent.created_at ?? new Date().toISOString();
  return {
    agent_zone_id: `az-${String(zone.id).padStart(4, "0")}`,
    zone_row_id: zone.id,
    delivery_agent_id: agent.id,
    delivery_agent_name: agent.name,
    governorate_id: zone.governorate_id,
    governorate_name: zone.governorate_name,
    city_id: zone.city_id,
    city_name: zone.city_name,
    is_primary: zone.is_primary,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function flattenRecords(agents: DeliveryAgent[]): AgentZoneRecord[] {
  return agents.flatMap((agent) => agent.zones.map((zone) => toRecord(agent, zone)));
}

function resolveLocation(governorateId: number, cityId: number) {
  const governorate = GOVERNORATES.find((g) => g.id === governorateId);
  const city = CITIES.find((c) => c.id === cityId);
  return { governorate, city };
}

function applyPrimaryFlag(zones: AgentZone[], primaryZoneId?: number): AgentZone[] {
  if (zones.length === 0) return zones;

  if (primaryZoneId != null) {
    return zones.map((zone) => ({ ...zone, is_primary: zone.id === primaryZoneId ? 1 : 0 }));
  }

  if (!zones.some((zone) => zone.is_primary === 1)) {
    return zones.map((zone, index) => ({ ...zone, is_primary: index === 0 ? 1 : 0 }));
  }

  return zones;
}

async function loadAgents(): Promise<DeliveryAgent[]> {
  const response = await fetchDeliveryAgents();
  if (!response.isSuccess) throw new Error(response.message);
  return response.data;
}

function findAgentByZoneId(agents: DeliveryAgent[], zoneRowId: number) {
  for (const agent of agents) {
    const zone = agent.zones.find((z) => z.id === zoneRowId);
    if (zone) return { agent, zone };
  }
  return null;
}

function hasDuplicateCity(agent: DeliveryAgent, cityId: number, excludeZoneId?: number): boolean {
  return agent.zones.some((zone) => zone.city_id === cityId && zone.id !== excludeZoneId);
}

export async function fetchAgentZones(): Promise<ApiResponse<AgentZoneRecord[]>> {
  await delay(350);
  const agents = await loadAgents();
  return {
    isSuccess: true,
    message: "تمت العملية بنجاح",
    data: flattenRecords(agents).sort((a, b) => a.delivery_agent_name.localeCompare(b.delivery_agent_name, "ar")),
  };
}

export async function createAgentZone(payload: CreateAgentZonePayload): Promise<ApiResponse<AgentZoneRecord[]>> {
  await delay(500);
  const agents = await loadAgents();
  const agent = agents.find((item) => item.id === payload.delivery_agent_id);
  if (!agent) {
    return { isSuccess: false, message: "المندوب غير موجود", data: [] };
  }

  const { governorate, city } = resolveLocation(payload.governorate_id, payload.city_id);
  if (!governorate || !city) {
    return { isSuccess: false, message: "المحافظة أو المدينة غير صالحة", data: flattenRecords(agents) };
  }

  if (hasDuplicateCity(agent, payload.city_id)) {
    return { isSuccess: false, message: "هذه المدينة مضافة مسبقاً لهذا المندوب", data: flattenRecords(agents) };
  }

  const newZone: AgentZone = {
    id: 0,
    delivery_agent_id: agent.id,
    governorate_id: governorate.id,
    governorate_name: governorate.name_ar,
    city_id: city.id,
    city_name: city.name_ar,
    is_primary: payload.is_primary,
  };

  let zones = agent.zones.map((zone) => ({
    ...zone,
    is_primary: payload.is_primary === 1 ? 0 : zone.is_primary,
  }));
  zones.push(newZone);

  if (payload.is_primary !== 1) {
    zones = applyPrimaryFlag(zones);
  }

  await saveAgentZones(agent.id, zones);
  const refreshed = await loadAgents();
  return {
    isSuccess: true,
    message: "تمت إضافة منطقة المندوب (واجهة تصميمية)",
    data: flattenRecords(refreshed),
  };
}

export async function updateAgentZone(payload: UpdateAgentZonePayload): Promise<ApiResponse<AgentZoneRecord[]>> {
  await delay(500);
  const agents = await loadAgents();
  const match = findAgentByZoneId(agents, payload.zone_row_id);
  if (!match) {
    return { isSuccess: false, message: "المنطقة غير موجودة", data: flattenRecords(agents) };
  }

  const { agent, zone } = match;

  if (payload.delivery_agent_id !== agent.id) {
    return { isSuccess: false, message: "لا يمكن نقل المنطقة لمندوب آخر — احذفها وأعد إنشاءها", data: flattenRecords(agents) };
  }

  const { governorate, city } = resolveLocation(payload.governorate_id, payload.city_id);
  if (!governorate || !city) {
    return { isSuccess: false, message: "المحافظة أو المدينة غير صالحة", data: flattenRecords(agents) };
  }

  if (hasDuplicateCity(agent, payload.city_id, payload.zone_row_id)) {
    return { isSuccess: false, message: "هذه المدينة مضافة مسبقاً لهذا المندوب", data: flattenRecords(agents) };
  }

  let zones = agent.zones.map((item) =>
    item.id === payload.zone_row_id
      ? {
          ...item,
          governorate_id: governorate.id,
          governorate_name: governorate.name_ar,
          city_id: city.id,
          city_name: city.name_ar,
          is_primary: payload.is_primary,
        }
      : item,
  );

  zones = payload.is_primary === 1 ? applyPrimaryFlag(zones, payload.zone_row_id) : applyPrimaryFlag(zones);

  await saveAgentZones(agent.id, zones);
  const refreshed = await loadAgents();
  return {
    isSuccess: true,
    message: "تم تحديث منطقة المندوب (واجهة تصميمية)",
    data: flattenRecords(refreshed),
  };
}

export async function deleteAgentZone(zoneRowId: number): Promise<ApiResponse<AgentZoneRecord[]>> {
  await delay(400);
  const agents = await loadAgents();
  const match = findAgentByZoneId(agents, zoneRowId);
  if (!match) {
    return { isSuccess: false, message: "المنطقة غير موجودة", data: flattenRecords(agents) };
  }

  let zones = match.agent.zones.filter((zone) => zone.id !== zoneRowId);
  zones = applyPrimaryFlag(zones);

  await saveAgentZones(match.agent.id, zones);
  const refreshed = await loadAgents();
  return {
    isSuccess: true,
    message: "تم حذف منطقة المندوب (واجهة تصميمية)",
    data: flattenRecords(refreshed),
  };
}

export async function deleteAgentZonesBulk(zoneRowIds: number[]): Promise<ApiResponse<AgentZoneRecord[]>> {
  await delay(500);
  let agents = await loadAgents();

  for (const zoneRowId of zoneRowIds) {
    const match = findAgentByZoneId(agents, zoneRowId);
    if (!match) continue;
    let zones = match.agent.zones.filter((zone) => zone.id !== zoneRowId);
    zones = applyPrimaryFlag(zones);
    const response = await saveAgentZones(match.agent.id, zones);
    agents = response.data;
  }

  return {
    isSuccess: true,
    message: `تم حذف ${zoneRowIds.length} منطقة (واجهة تصميمية)`,
    data: flattenRecords(agents),
  };
}

export function computeAgentZoneKpis(items: AgentZoneRecord[]) {
  const agentIds = new Set(items.map((item) => item.delivery_agent_id));
  const governorateIds = new Set(items.map((item) => item.governorate_id).filter(Boolean));
  return {
    total: items.length,
    agents: agentIds.size,
    governorates: governorateIds.size,
    primary: items.filter((item) => item.is_primary === 1).length,
  };
}
