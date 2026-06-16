import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminEntityDialog } from "@/components/admin/AdminEntityDialog";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { AgentCreateDialog } from "@/components/admin/AgentCreateDialog";
import { AgentFinanceDialog } from "@/components/admin/AgentFinanceDialog";
import { AgentHierarchyDialog } from "@/components/admin/AgentHierarchyDialog";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { RowActions } from "@/components/admin/RowActions";
import { FormInput, FormSelect, FormSwitch } from "@/components/admin/AdminFormFields";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  createDeliveryAgent,
  updateAgentFinance,
  updateAgentHierarchy,
} from "@/lib/admin/delivery-agents-api";
import {
  formatCommission,
  normaliseAgent,
  resolveNames,
  VEHICLE_TYPE_LABELS,
} from "@/lib/admin/delivery-agents-types";
import type {
  ApiDeliveryAgentItem,
  ApiPaginatedResponse,
  CreateDeliveryAgentPayload,
  DeliveryAgent,
} from "@/lib/admin/delivery-agents-types";
import { BASE_URL } from "@/lib/utils";
import { getAccessToken } from "@/lib/auth/Auth.api";
import type { ConfirmAction } from "@/components/admin/use-admin-crud";
import { Loader2, MapPin, Power, Truck, UserCheck, Users, Wallet } from "lucide-react";
import type { City } from "@/lib/admin/locations-types";
import { fetchCities } from "@/lib/admin/locations-api";
import { usersApi } from "@/lib/admin/users.api";
import type { UpdateUserPayload } from "@/lib/admin/users.api";
import { FaWhatsapp } from "react-icons/fa";
export const Route = createFileRoute("/_authenticated/couriers")({
  component: CouriersPage,
});

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * The normalised DeliveryAgent keeps addresses in the raw `ApiAddress[]`
 * shape that came off the wire (they are not flattened by normaliseAgent).
 * We grab city_id from the default address, falling back to the first.
 */
function getAgentCityId(agent: DeliveryAgent): string | null {
  const addr =
    (agent as unknown as { addresses?: ApiDeliveryAgentItem["addresses"] }).addresses?.find(
      (a) => a.is_default === true,
    ) ?? (agent as unknown as { addresses?: ApiDeliveryAgentItem["addresses"] }).addresses?.[0];
  return addr?.city_id ?? null;
}

function getAgentCityLabel(agent: DeliveryAgent, cityMap: Map<string, string>): string {
  const id = getAgentCityId(agent);
  if (!id) return "—";
  return cityMap.get(id) ?? id;
}

// ─── edit form state shape ───────────────────────────────────────────────────

interface EditForm {
  // user fields
  name: string;
  phone: string;
  email: string;
  // agent profile fields
  national_id: string;
  vehicle_type: number;
  vehicle_plate_number: string;
  // default address fields
  city_id: string;
  address_line: string;
  street: string;
  building_number: string;
  landmark: string;
  is_default: boolean;
}

function agentToEditForm(agent: DeliveryAgent): EditForm {
  const rawAddresses = (agent as unknown as { addresses?: ApiDeliveryAgentItem["addresses"] })
    .addresses;
  const addr = rawAddresses?.find((a) => a.is_default === true) ?? rawAddresses?.[0];

  return {
    name: agent.name,
    phone: agent.phone,
    email: agent.email,
    national_id: agent.national_id,
    vehicle_type: agent.vehicle_type,
    vehicle_plate_number: agent.vehicle_plate_number,
    city_id: addr?.city_id ?? "",
    address_line: addr?.address_line ?? "",
    street: addr?.street ?? "",
    building_number: addr?.building_number ?? "",
    landmark: addr?.landmark ?? "",
    is_default: addr?.is_default ?? true,
  };
}

// ─── component ──────────────────────────────────────────────────────────────

function CouriersPage() {
  // raw normalised agents list
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  // parallel raw addresses map: userId → ApiAddress[]
  const [addressMap, setAddressMap] = useState<Map<string, ApiDeliveryAgentItem["addresses"]>>(
    new Map(),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [cities, setCities] = useState<City[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState<DeliveryAgent | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const pageSize = 10;

  // ── data loading ──────────────────────────────────────────────────────────

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch the raw paginated response directly so we have access to the
      // original ApiDeliveryAgentItem[] (needed for addressMap). We cannot
      // use fetchDeliveryAgents() here because it pre-normalises and drops
      // the raw addresses before returning.
      const token = getAccessToken();
      const res = await fetch(`${BASE_URL}/admin/delivery-agents?per_page=100`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const raw: ApiPaginatedResponse<ApiDeliveryAgentItem> = await res.json();
      if (!raw.isSuccess) throw new Error(raw.message);

      const items = raw.data.items;

      // Normalise → flat DeliveryAgent models, then resolve supervisor names
      const normalised = resolveNames(items.map(normaliseAgent));
      setAgents(normalised);

      // Keep raw addresses keyed by userId for the city filter / edit form
      const addrMap = new Map(items.map((item) => [item.id, item.addresses]));
      setAddressMap(addrMap);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل تحميل المناديب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetchCities(undefined, 1, 1000, "");
        if (res.isSuccess) setCities(res.data.items);
      } catch (err) {
        console.error(err);
      }
    };
    void loadCities();
  }, []);

  // ── derived ───────────────────────────────────────────────────────────────

  /** city_id → city name_ar */
  const cityMap = useMemo(
    () => new Map(cities.map((c) => [String(c.city_id), c.name_ar])),
    [cities],
  );

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.city_id), label: c.name_ar })),
    [cities],
  );

  const cityFilterOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const [, addrs] of addressMap) {
      for (const addr of addrs) {
        if (!addr.city_id) continue;
        seen.set(addr.city_id, cityMap.get(addr.city_id) ?? addr.city_id);
      }
    }
    return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
  }, [addressMap, cityMap]);

  const filtered = useMemo(() => {
    return agents.filter((agent) => {
      // availability filter
      if (statusFilter === "available" && !agent.is_available) return false;
      if (statusFilter === "unavailable" && agent.is_available) return false;

      // city filter: check addresses for this agent
      if (cityFilter !== "all") {
        const addrs = addressMap.get(agent.userId) ?? [];
        if (!addrs.some((a) => a.city_id === cityFilter)) return false;
      }

      // text search
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        (agent.national_id ?? "").includes(q) ||
        agent.phone.includes(q) ||
        (agent.vehicle_plate_number ?? "").toLowerCase().includes(q) ||
        (agent.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [agents, addressMap, search, statusFilter, cityFilter]);

  const paginatedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const kpis = useMemo(() => {
    const available = agents.filter((a) => a.is_available).length;
    const totalBalance = agents.reduce((sum, a) => sum + a.balance, 0);
    const supervisors = agents.filter((a) => a.is_supervisor).length;
    return { total: agents.length, available, totalBalance, supervisors };
  }, [agents]);

  // ── agent selection ───────────────────────────────────────────────────────

  const selectAgent = useCallback(
    (agent: DeliveryAgent) => {
      const fresh = agents.find((a) => a.userId === agent.userId) ?? agent;
      // attach addresses back onto the agent object for getAgentCityLabel
      const withAddrs = Object.assign(Object.create(null), fresh, {
        addresses: addressMap.get(fresh.userId) ?? [],
      }) as DeliveryAgent;
      setActiveAgent(withAddrs);
      setEditForm(agentToEditForm(withAddrs));
    },
    [agents, addressMap],
  );

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleCreate = async (payload: CreateDeliveryAgentPayload) => {
    setSaving(true);
    try {
      const res = await createDeliveryAgent(payload);
      if (!res.isSuccess) throw new Error(res.message);
      await loadAgents();
      setCreateOpen(false);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء المندوب");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!activeAgent || !editForm) return;
    setSaving(true);
    try {
      const payload: UpdateUserPayload = {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        roles: ["delivery_agent"],
        profile: {
          national_id: editForm.national_id,
          vehicle_type: editForm.vehicle_type,
          vehicle_plate_number: editForm.vehicle_plate_number,
        },
        address: {
          city_id: editForm.city_id || "",
          address_line: editForm.address_line,
          street: editForm.street || "",
          building_number: editForm.building_number || "",
          floor_number: "", // not supported in edit form
          apartment_number: "", // not supported in edit form
          landmark: editForm.landmark || "",
          is_default: editForm.is_default,
        },
      };

      const res = await usersApi.update(activeAgent.userId, payload);
      if (!res.isSuccess) throw new Error(res.message);
      await loadAgents();
      setEditOpen(false);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل تحديث المندوب");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = (agent: DeliveryAgent) => {
    setConfirmAction({
      title: agent.is_available ? "تعيين غير متاح" : "تعيين متاح",
      description: `تأكيد ${agent.is_available ? "إيقاف" : "تفعيل"} توفر «${agent.name}»`,
      confirmLabel: agent.is_available ? "غير متاح" : "متاح",
      variant: agent.is_available ? "destructive" : "default",
      onConfirm: async () => {
        try {
          const res = await usersApi.toggleStatus(agent.userId);
          if (!res.isSuccess) throw new Error(res.message);
          await loadAgents();
          toast.success(agent.is_available ? "تم تعيين المندوب غير متاح" : "تم تعيين المندوب متاح");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "فشل تحديث التوفر");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  const handleDelete = (agent: DeliveryAgent) => {
    setConfirmAction({
      title: "حذف المندوب",
      description: `هل أنت متأكد من حذف «${agent.name}»؟`,
      confirmLabel: "حذف",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const res = await usersApi.delete(agent.userId);
          if (!res.isSuccess) throw new Error(res.message);
          await loadAgents();
          toast.success(res.message);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "فشل حذف المندوب");
        } finally {
          setConfirmAction(null);
        }
      },
    });
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <AdminPageHeader
        title="مناديب التوصيل"
        tableName="مناديب التوصيل"
        description="إدارة المناديب وحساباتهم ومناطقهم وإعدادات العمولة والتسلسل الإشرافي"
        addLabel="إضافة مندوب"
        onAdd={() => setCreateOpen(true)}
        selectedCount={selectedIds.size}
        onBulkDelete={() => {}}
      />

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="إجمالي المناديب" value={String(kpis.total)} icon={Truck} tone="primary" />
        <KpiCard
          label="متاحون الآن"
          value={String(kpis.available)}
          icon={UserCheck}
          tone="success"
        />
        <KpiCard
          label="إجمالي الأرصدة"
          value={`EG ${kpis.totalBalance.toLocaleString()} `}
          icon={Wallet}
          tone="warning"
        />
        <KpiCard label="مشرفون" value={String(kpis.supervisors)} icon={Users} tone="info" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card shadow-soft">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AdminDataTable
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="بحث بالاسم، الرقم القومي، الهاتف، أو اللوحة..."
          filters={[
            {
              id: "city",
              label: "المدينة",
              icon: MapPin,
              value: cityFilter,
              onChange: (v) => {
                setCityFilter(v);
                setPage(1);
              },
              options: cityFilterOptions,
            },
            {
              id: "status",
              label: "التوفر",
              icon: Power,
              value: statusFilter,
              onChange: (v) => {
                setStatusFilter(v);
                setPage(1);
              },
              options: [
                { value: "available", label: "متاح" },
                { value: "unavailable", label: "غير متاح" },
              ],
            },
          ]}
          columns={[
            { key: "agent", label: "المندوب" },
            { key: "whatsapp", label: "واتساب" },
            { key: "vehicle", label: "المركبة" },
            { key: "commission", label: "العمولة" },
            { key: "city", label: "المدينة" },
            { key: "hierarchy", label: "الإشراف" },
            { key: "balance", label: "الرصيد" },
            { key: "avail", label: "التوفر" },
            { key: "actions", label: "" },
          ]}
          rows={paginatedRows.map((agent) => {
            // re-attach addresses for city label resolution
            const agentWithAddrs = Object.assign(Object.create(null), agent, {
              addresses: addressMap.get(agent.userId) ?? [],
            }) as DeliveryAgent;
            const cityLabel = getAgentCityLabel(agentWithAddrs, cityMap);

            return {
              id: agent.userId,
              cells: [
                /* agent */
                <div key="agent">
                  <p className="font-bold">{agent.name}</p>
                  <p className="text-[11px] tabular-nums text-muted-foreground" dir="ltr">
                    {agent.national_id}
                  </p>
                  <p className="text-[11px] tabular-nums text-muted-foreground" dir="ltr">
                    {agent.phone}
                  </p>
                </div>,
                <div key="whatsapp" className="flex justify-center">
                  {agent.welcome_whatsapp_url ? (
                    <a
                      href={agent.welcome_whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg p-2 text-green-600 hover:bg-green-50"
                      title="فتح رسالة الواتساب"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>,

                /* vehicle */
                <div key="vehicle">
                  <Badge variant="secondary" className="rounded-md text-[10px]">
                    {VEHICLE_TYPE_LABELS[agent.vehicle_type] ?? "—"}
                  </Badge>
                  <p className="mt-1 text-sm font-medium">{agent.vehicle_plate_number || "—"}</p>
                </div>,

                /* commission */
                <button
                  key="commission"
                  type="button"
                  className="text-start text-sm transition-colors hover:text-primary"
                  onClick={() => {
                    selectAgent(agent);
                    setFinanceOpen(true);
                  }}
                >
                  <Badge variant="outline" className="rounded-md text-[10px]">
                    {agent.commission_type === 1 ? "نسبة" : "ثابت"}
                  </Badge>
                  <p className="mt-1 font-semibold">
                    {formatCommission(agent.commission_type, agent.commission_value)}
                  </p>
                </button>,

                /* city — resolved from raw addresses via cityMap */
                <div key="city" className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{cityLabel}</span>
                </div>,

                /* hierarchy */
                <button
                  key="hierarchy"
                  type="button"
                  className="text-start text-sm transition-colors hover:text-primary"
                  onClick={() => {
                    selectAgent(agent);
                    setHierarchyOpen(true);
                  }}
                >
                  {agent.supervisor_name ? (
                    <p className="text-xs text-muted-foreground">
                      تحت:{" "}
                      <span className="font-medium text-foreground">{agent.supervisor_name}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">بدون مشرف</p>
                  )}
                  {agent.subordinates.length > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {agent.subordinates.length} مرؤوس
                    </p>
                  )}
                </button>,

                /* balance */
                <button
                  key="balance"
                  type="button"
                  className={`text-start font-bold tabular-nums transition-colors hover:text-primary ${agent.balance > 0 ? "text-warning" : ""}`}
                  onClick={() => {
                    selectAgent(agent);
                    setFinanceOpen(true);
                  }}
                >
                  {agent.balance.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">EG</span>
                </button>,

                /* availability */
                <AdminStatusBadge
                  key="avail"
                  variant={agent.is_active ? "available" : "unavailable"}
                />,

                /* actions */
                <RowActions
                  key="actions"
                  isActive={agent.is_available}
                  activeLabel="تعيين غير متاح"
                  inactiveLabel="تعيين متاح"
                  onEdit={() => {
                    selectAgent(agent);
                    setEditOpen(true);
                  }}
                  onDelete={() => handleDelete(agent)}
                  onToggleActive={() => handleToggleAvailability(agent)}
                  extra={[]}
                />,
              ],
            };
          })}
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) {
                next.delete(id);
              } else {
                next.add(id);
              }
              return next;
            })
          }
          onToggleSelectAll={(ids) =>
            setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)))
          }
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={filtered.length}
        />
      )}

      {/* ── dialogs ──────────────────────────────────────────────────────── */}

      <AgentCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        supervisors={agents}
        onSave={handleCreate}
        loading={saving}
      />

      {/* Edit dialog — driven by a separate EditForm state, never mutates agents[] */}
      <AdminEntityDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        titleCreate="تعديل المندوب"
        titleEdit="تعديل المندوب"
        onSave={handleEditSave}
        loading={saving}
        size="xl"
      >
        {editForm && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* user fields */}
            <FormInput
              label="الاسم"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <FormInput
              label="الرقم القومي"
              required
              dir="ltr"
              className="tabular-nums"
              value={editForm.national_id}
              onChange={(e) => setEditForm({ ...editForm, national_id: e.target.value })}
            />
            <FormInput
              label="الهاتف"
              required
              dir="ltr"
              className="tabular-nums"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <FormSelect
              label="نوع المركبة"
              value={String(editForm.vehicle_type)}
              onValueChange={(v) => setEditForm({ ...editForm, vehicle_type: Number(v) })}
              options={Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <FormInput
              label="لوحة المركبة"
              value={editForm.vehicle_plate_number}
              onChange={(e) => setEditForm({ ...editForm, vehicle_plate_number: e.target.value })}
            />
            <FormInput
              label="البريد الإلكتروني"
              dir="ltr"
              className="sm:col-span-2"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />

            {/* address fields */}
            <FormSelect
              label="المدينة"
              required
              value={editForm.city_id}
              onValueChange={(v) => setEditForm({ ...editForm, city_id: v })}
              options={cityOptions}
            />
            <FormInput
              label="العنوان"
              required
              value={editForm.address_line}
              onChange={(e) => setEditForm({ ...editForm, address_line: e.target.value })}
            />
            <FormInput
              label="الشارع"
              value={editForm.street}
              onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
            />
            <FormInput
              label="رقم المبنى"
              value={editForm.building_number}
              onChange={(e) => setEditForm({ ...editForm, building_number: e.target.value })}
            />
            <FormInput
              label="علامة مميزة"
              value={editForm.landmark}
              onChange={(e) => setEditForm({ ...editForm, landmark: e.target.value })}
            />
            <FormSwitch
              label="العنوان الافتراضي"
              checked={editForm.is_default === true}
              onCheckedChange={(checked) =>
                setEditForm({ ...editForm, is_default: checked ? true : false })
              }
            />
          </div>
        )}
      </AdminEntityDialog>

      <ConfirmActionDialog action={confirmAction} onOpenChange={() => setConfirmAction(null)} />
    </AppShell>
  );
}
