export type VehicleType = 1 | 2;
export type CommissionType = 1 | 2;

// ─── Raw API shapes (as returned by the server) ───────────────────────────────

export interface ApiVehicle {
  type: { code: VehicleType; label: string };
  plate_number: string;
}

export interface ApiCommission {
  type: { code: CommissionType; label: string };
  value: string; // decimal string e.g. "0.0000"
}

export interface ApiAddress {
  address_id: string;
  city_id: string | null;
  address_line: string;
  landmark: string | null;
  street: string | null;
  building_number: string | null;
  floor_number: string | null;
  apartment_number: string | null;
  is_default: boolean;
}

export interface ApiDeliveryAgentProfile {
  id: string;
  supervisor_agent_id: string | null;
  is_supervisor: boolean;
  national_id: string;
  vehicle: ApiVehicle;
  commission: ApiCommission;
  balance: string; // decimal string e.g. "0.00"
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiRole {
  name: string;
  label: string;
}

/** Raw item shape from GET /admin/delivery-agents */
export interface ApiDeliveryAgentItem {
  id: string; // user id (UUID)
  name: string;
  email: string;
  phone: string;
  gender: string | null;
  avatar: string | null;
  welcome_whatsapp_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role: ApiRole;
  delivery_agent: ApiDeliveryAgentProfile;
  addresses: ApiAddress[];
}

export interface ApiCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface ApiPaginatedResponse<T> {
  isSuccess: boolean;
  message: string;
  data: {
    counts: ApiCounts;
    items: T[];
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

export interface ApiSingleResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// ─── Normalised UI model ──────────────────────────────────────────────────────

export interface AgentZone {
  id: number;
  delivery_agent_id: number;
  governorate_id: number;
  governorate_name: string;
  city_id: number;
  city_name: string;
  is_primary: boolean;
}

export interface AgentSubordinateRef {
  id: string;
  name: string;
}

/** Flat model used throughout the UI */
export interface DeliveryAgent {
  // user-level
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  is_active: boolean;
  welcome_whatsapp_url: string | null;
  // agent-level
  id: string; // delivery_agent.id (profile UUID)
  national_id: string;
  vehicle_type: VehicleType;
  vehicle_plate_number: string;
  commission_type: CommissionType;
  commission_value: number;
  balance: number;
  is_available: boolean;
  is_supervisor: boolean;
  supervisor_agent_id: string | null;
  supervisor_name: string | null; // resolved client-side

  zones: AgentZone[];
  subordinates: AgentSubordinateRef[];
  created_at: string;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export type CreateAgentMode = "supervisor" | "agent" | "other";

export interface CreateAgentAddress {
  city_id: string;
  address_line: string;
  landmark?: string;
  street?: string;
  building_number?: string;
  is_default?: boolean;
}

/** POST /admin/delivery-agents  — supervisor variant */
export interface CreateSupervisorAgentPayload {
  mode: "supervisor";
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "delivery_agent";
  profile: {
    national_id: string;
    vehicle_type: VehicleType;
    vehicle_plate_number: string;
  };
  address: CreateAgentAddress;
}

/** POST /admin/delivery-agents  — regular agent variant */
export interface CreateRegularAgentPayload {
  mode: "agent";
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "delivery_agent";
  profile: {
    supervisor_agent_id: string;
    national_id: string;
    vehicle_type: VehicleType;
    vehicle_plate_number: string;
  };
  address: CreateAgentAddress;
}

/** POST /admin/delivery-agents  — other role variant */
export interface CreateOtherRolePayload {
  mode: "other";
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string[];
  profile: {
    supervisor_agent_id?: string;
    [key: string]: unknown;
  };
  address: CreateAgentAddress;
}

export type CreateDeliveryAgentPayload =
  | CreateSupervisorAgentPayload
  | CreateRegularAgentPayload
  | CreateOtherRolePayload;

export interface UpdateAgentFinancePayload {
  commission_type: CommissionType;
  commission_value: number;
}

export interface UpdateAgentHierarchyPayload {
  supervisor_id: string | null;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// ─── Labels & formatters ──────────────────────────────────────────────────────

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  1: "دراجة نارية",
  2: "سيارة",
};

export const COMMISSION_TYPE_LABELS: Record<CommissionType, string> = {
  1: "نسبة مئوية",
  2: "مبلغ ثابت",
};

export function formatCommission(type: CommissionType, value: number): string {
  return type === 1 ? `${value}%` : `${value.toFixed(2)} ج.م`;
}

// export function getPrimaryZoneLabel(agent: DeliveryAgent): string {
//   const primary = agent.zones.find((z) => z.is_primary === 1) ?? agent.zones[0];
//   if (!primary) return "—";
//   return `${primary.governorate_name} / ${primary.city_name}`;
// }

// ─── Normaliser ───────────────────────────────────────────────────────────────

/**
 * Converts the raw API item into the flat DeliveryAgent UI model.
 * supervisor_name is resolved later (after all items are loaded) via
 * `resolveNames()`.
 */
export function normaliseAgent(raw: ApiDeliveryAgentItem): DeliveryAgent {
  const da = raw.delivery_agent;
  return {
    userId: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    avatar: raw.avatar,
    is_active: raw.is_active,
    welcome_whatsapp_url: raw.welcome_whatsapp_url,
    id: da.id,
    national_id: da.national_id,
    vehicle_type: da.vehicle?.type?.code ?? 1, // ← guard against null
    vehicle_plate_number: da.vehicle?.plate_number ?? "", // ← already might be null
    commission_type: da.commission?.type?.code ?? 1, // ← guard this too
    commission_value: parseFloat(da.commission?.value ?? "0"),
    balance: parseFloat(da.balance),
    is_available: da.is_available,
    is_supervisor: da.is_supervisor,
    supervisor_agent_id: da.supervisor_agent_id,
    supervisor_name: null, // resolved after full list loads

    zones: [], // loaded separately if the endpoint exposes them
    subordinates: [], // resolved client-side from the full list
    created_at: raw.created_at,
  };
}

/** Fills in supervisor_name and subordinates from the full normalised list. */
export function resolveNames(agents: DeliveryAgent[]): DeliveryAgent[] {
  const byAgentId = new Map(agents.map((a) => [a.id, a]));
  return agents.map((agent) => {
    const supervisor = agent.supervisor_agent_id
      ? (byAgentId.get(agent.supervisor_agent_id) ?? null)
      : null;
    const subordinates: AgentSubordinateRef[] = agents
      .filter((a) => a.supervisor_agent_id === agent.id)
      .map((a) => ({ id: a.id, name: a.name }));
    return { ...agent, supervisor_name: supervisor?.name ?? null, subordinates };
  });
}
