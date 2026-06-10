import { BASE_URL } from "@/lib/utils";
import { getAccessToken } from "@/lib/auth/Auth.api";
import type {
  AgentZone,
  ApiDeliveryAgentItem,
  ApiPaginatedResponse,
  ApiResponse,
  ApiSingleResponse,
  CreateDeliveryAgentPayload,
  DeliveryAgent,
  UpdateAgentFinancePayload,
  UpdateAgentHierarchyPayload,
} from "@/lib/admin/delivery-agents-types";
import { normaliseAgent, resolveNames } from "@/lib/admin/delivery-agents-types";

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── List params ──────────────────────────────────────────────────────────────

export interface FetchDeliveryAgentsParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: "" | "0" | "1";
  commission_type?: "" | "1" | "2";
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /admin/delivery-agents
 * Returns the full normalised list (all pages fetched in one call for the
 * client-side filtering the UI currently uses; swap to server-side pagination
 * by removing the per_page=1000 override when the backend supports it).
 */
export async function fetchDeliveryAgents(
  params: FetchDeliveryAgentsParams = {},
): Promise<ApiResponse<DeliveryAgent[]>> {
  const { page = 1, per_page = 100, search = "", is_active = "", commission_type = "" } = params;

  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
    search,
    is_active,
    commission_type,
  });

  const raw = await apiFetch<ApiPaginatedResponse<ApiDeliveryAgentItem>>(
    `/admin/delivery-agents?${qs}`,
  );

  if (!raw.isSuccess) {
    return { isSuccess: false, message: raw.message, data: [] };
  }

  const agents = resolveNames(raw.data.items.map(normaliseAgent));

  return { isSuccess: true, message: raw.message, data: agents };
}

/**
 * POST /admin/delivery-agents
 *
 * Supports three modes driven by the `mode` discriminator (stripped before
 * sending to the server):
 *
 *  • "supervisor" — delivery_agent role, no supervisor_agent_id
 *  • "agent"      — delivery_agent role, requires supervisor_agent_id in profile
 *  • "other"      — arbitrary roles array (e.g. super_admin), optional profile
 */
export async function createDeliveryAgent(
  payload: CreateDeliveryAgentPayload,
): Promise<ApiResponse<DeliveryAgent>> {
  // Strip the UI-only `mode` discriminator before sending
  const { mode, ...body } = payload;

  const raw = await apiFetch<ApiSingleResponse<ApiDeliveryAgentItem>>("/admin/delivery-agents", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!raw.isSuccess) {
    return { isSuccess: false, message: raw.message, data: null as unknown as DeliveryAgent };
  }

  return {
    isSuccess: true,
    message: raw.message,
    data: normaliseAgent(raw.data),
  };
}

/**
 * PUT /admin/delivery-agents/:agentProfileId
 * Updates the agent's core profile fields.
 */
export async function updateDeliveryAgent(
  agent: DeliveryAgent,
): Promise<ApiResponse<DeliveryAgent[]>> {
  const raw = await apiFetch<ApiSingleResponse<ApiDeliveryAgentItem>>(
    `/admin/delivery-agents/${agent.id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        profile: {
          national_id: agent.national_id,
          vehicle_type: agent.vehicle_type,
          vehicle_plate_number: agent.vehicle_plate_number,
        },
      }),
    },
  );

  if (!raw.isSuccess) {
    return { isSuccess: false, message: raw.message, data: [] };
  }

  // Re-fetch the full list so the table reflects any name/hierarchy changes
  const listResponse = await fetchDeliveryAgents();
  return listResponse;
}

/**
 * PATCH /admin/delivery-agents/:agentProfileId/finance
 * Updates commission type and value.
 */
export async function updateAgentFinance(
  agentId: string,
  payload: UpdateAgentFinancePayload,
): Promise<ApiResponse<DeliveryAgent[]>> {
  await apiFetch<ApiSingleResponse<unknown>>(`/admin/delivery-agents/${agentId}/finance`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return fetchDeliveryAgents();
}

/**
 * PATCH /admin/delivery-agents/:agentProfileId/hierarchy
 * Updates the supervisor relationship.
 */
export async function updateAgentHierarchy(
  agentId: string,
  payload: UpdateAgentHierarchyPayload,
): Promise<ApiResponse<DeliveryAgent[]>> {
  if (payload.supervisor_id === agentId) {
    throw new Error("لا يمكن تعيين المندوب كمشرف لنفسه");
  }

  await apiFetch<ApiSingleResponse<unknown>>(`/admin/delivery-agents/${agentId}/hierarchy`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return fetchDeliveryAgents();
}

/**
 * PATCH /admin/delivery-agents/:agentProfileId/toggle-availability
 */
export async function toggleAgentAvailability(
  agentId: string,
): Promise<ApiResponse<DeliveryAgent[]>> {
  await apiFetch<ApiSingleResponse<unknown>>(
    `/admin/delivery-agents/${agentId}/toggle-availability`,
    { method: "PATCH" },
  );

  return fetchDeliveryAgents();
}

/**
 * PUT /admin/delivery-agents/:agentProfileId/zones
 * Replaces the agent's delivery zones.
 */
export async function saveAgentZones(
  agentId: string,
  zones: AgentZone[],
): Promise<ApiResponse<DeliveryAgent[]>> {
  await apiFetch<ApiSingleResponse<unknown>>(`/admin/delivery-agents/${agentId}/zones`, {
    method: "PUT",
    body: JSON.stringify({ zones }),
  });

  return fetchDeliveryAgents();
}

/**
 * DELETE /admin/delivery-agents/:agentProfileId
 */
export async function deleteDeliveryAgent(agentId: string): Promise<ApiResponse<DeliveryAgent[]>> {
  await apiFetch<ApiSingleResponse<unknown>>(`/admin/delivery-agents/${agentId}`, {
    method: "DELETE",
  });

  return fetchDeliveryAgents();
}
