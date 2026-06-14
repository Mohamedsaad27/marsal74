import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormInput, FormSelect } from "@/components/admin/AdminFormFields";
import { Loader2 } from "lucide-react";
import type {
  CreateDeliveryAgentPayload,
  CreateAgentMode,
  DeliveryAgent,
} from "@/lib/admin/delivery-agents-types";
import { VEHICLE_TYPE_LABELS } from "@/lib/admin/delivery-agents-types";
import { City } from "@/lib/admin/locations-types";
import { fetchCities } from "@/lib/admin/locations-api";
import { BASE_URL } from "@/lib/utils";
import { fetchRoles } from "@/lib/admin/rbac-api";
import { Role } from "@/lib/admin/rbac-types";
import { formatRoleName } from "@/lib/admin/rbac-utils";
import { getAccessToken } from "../../lib/auth/Auth.api";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { UserPlus } from "lucide-react";
// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisors: DeliveryAgent[];
  onSave: (payload: CreateDeliveryAgentPayload) => Promise<void>;
  loading: boolean;
}

// ─── Blank state helpers ───────────────────────────────────────────────────────

const blankAddress = () => ({
  city_id: "",
  address_line: "",
  landmark: "",
  street: "",
  building_number: "",
  is_default: true,
});

const blankUser = () => ({
  name: "",
  email: "",
  phone: "",
  password: "",
});

// ─── Component ─────────────────────────────────────────────────────────────────

export function AgentCreateDialog({ open, onOpenChange, onSave, loading }: Props) {
  const [mode, setMode] = useState<CreateAgentMode>("supervisor");

  // shared fields
  const [user, setUser] = useState(blankUser());
  const [address, setAddress] = useState(blankAddress());

  // delivery-agent profile fields
  const [nationalId, setNationalId] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("1");
  const [plateNumber, setPlateNumber] = useState("");

  // agent-only: supervisor
  const [supervisorAgentId, setSupervisorAgentId] = useState("");

  // other-role fields
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [supervisors, setSupervisors] = useState<DeliveryAgent[]>([]);
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetchRoles();

        if (response.isSuccess) {
          setRoles(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadRoles();
  }, []);
  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.name,
        label: formatRoleName(role.name),
      })),
    [roles],
  );
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetchCities(undefined, 1, 1000, "");

        if (response.isSuccess) {
          setCities(response.data.items);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadCities();
  }, []);
  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: String(city.city_id),
        label: `${city.name_ar}`,
      })),
    [cities],
  );
  // reset on open
  useEffect(() => {
    if (open) {
      setMode("supervisor");
      setUser(blankUser());
      setAddress(blankAddress());
      setNationalId("");
      setVehicleType("1");
      setPlateNumber("");
      setSupervisorAgentId("");
      setSelectedRole("");
    }
  }, [open]);

  const handleSave = async () => {
    const base = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      address: {
        city_id: address.city_id,
        address_line: address.address_line,
        landmark: address.landmark || undefined,
        street: address.street || undefined,
        building_number: address.building_number || undefined,
        is_default: true,
      },
    };

    let payload: CreateDeliveryAgentPayload;

    if (mode === "supervisor") {
      payload = {
        ...base,
        mode: "supervisor",
        role: "delivery_agent",
        profile: {
          national_id: nationalId,
          vehicle_type: Number(vehicleType) as 1 | 2 | 3 | 4 | 5,
          vehicle_plate_number: plateNumber,
        },
      };
    } else if (mode === "agent") {
      payload = {
        ...base,
        mode: "agent",
        role: "delivery_agent",
        profile: {
          supervisor_agent_id: supervisorAgentId,
          national_id: nationalId,
          vehicle_type: Number(vehicleType) as 1 | 2 | 3 | 4 | 5,
          vehicle_plate_number: plateNumber,
        },
      };
    } else {
      payload = {
        ...base,
        mode: "other",
        role: selectedRole ? [selectedRole] : [],
        profile: {
          ...(supervisorAgentId ? { supervisor_agent_id: supervisorAgentId } : {}),
        },
      };
    }

    await onSave(payload);
  };
  const token = getAccessToken();

  // ── supervisor list for the selector ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${BASE_URL}/admin/delivery-agents/supervisors?search=&is_active=`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      setSupervisors(json.data);
    };

    load();
  }, []);
  const supervisorOptions = useMemo(
    () =>
      supervisors.map((supervisor) => ({
        value: String(supervisor.supervisor_agent_id),
        label: `${supervisor.name} (${supervisor.email})`,
      })),
    [supervisors],
  );

  // ── shared user fields ───────────────────────────────────────────────────────
  const UserFields = (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormInput
        label="الاسم الكامل"
        required
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
      />
      <FormInput
        label="البريد الإلكتروني"
        required
        type="email"
        dir="ltr"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <FormInput
        label="الهاتف"
        required
        dir="ltr"
        className="tabular-nums"
        value={user.phone}
        onChange={(e) => setUser({ ...user, phone: e.target.value })}
      />
      <FormInput
        label="كلمة المرور"
        required
        type="password"
        dir="ltr"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
    </div>
  );

  // ── vehicle / national-id fields ─────────────────────────────────────────────
  const AgentProfileFields = (
    <div className="grid gap-4 sm:grid-cols-2 " dir="rtl">
      <FormInput
        label="الرقم القومي"
        required
        dir="ltr"
        className="tabular-nums"
        value={nationalId}
        onChange={(e) => setNationalId(e.target.value)}
      />
      <FormSelect
        label="نوع المركبة"
        value={vehicleType}
        onValueChange={setVehicleType}
        options={Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <FormInput
        label="لوحة المركبة"
        required
        dir="ltr"
        value={plateNumber}
        onChange={(e) => setPlateNumber(e.target.value)}
      />
    </div>
  );

  // ── address fields ────────────────────────────────────────────────────────────
  const AddressFields = (
    <div className="grid gap-4 sm:grid-cols-2" dir="rtl">
      <FormSelect
        label="المدينة"
        required
        value={address.city_id}
        onValueChange={(value) =>
          setAddress({
            ...address,
            city_id: value,
          })
        }
        options={cityOptions}
      />
      <FormInput
        label="العنوان"
        required
        value={address.address_line}
        onChange={(e) => setAddress({ ...address, address_line: e.target.value })}
      />
      <FormInput
        label="علامة مميزة"
        value={address.landmark}
        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
      />
      <FormInput
        label="الشارع"
        value={address.street}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
      />
      <FormInput
        label="رقم المبنى"
        dir="ltr"
        value={address.building_number}
        onChange={(e) => setAddress({ ...address, building_number: e.target.value })}
      />
    </div>
  );

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="إضافة مندوب جديد"
      description="إضافة مشرف أو مندوب جديد إلى النظام"
      icon={UserPlus}
      tone="default"
      badge="Delivery Agent"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            إلغاء
          </Button>

          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
        </>
      }
    >
      <Tabs value={mode} onValueChange={(v) => setMode(v as CreateAgentMode)}>
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="supervisor" className="flex-1">
            مشرف (سوبرفايزر)
          </TabsTrigger>
          <TabsTrigger value="agent" className="flex-1">
            مندوب عادي
          </TabsTrigger>
          {/* <TabsTrigger value="other" className="flex-1">
              دور آخر
            </TabsTrigger> */}
        </TabsList>

        {/* ── Supervisor tab ─────────────────────────────────────────── */}
        <TabsContent value="supervisor" className="space-y-6 text-right">
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">بيانات الحساب</h4>
            {UserFields}
          </section>
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">بيانات المركبة</h4>
            {AgentProfileFields}
          </section>
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">العنوان</h4>
            {AddressFields}
          </section>
        </TabsContent>

        {/* ── Regular agent tab ──────────────────────────────────────── */}
        <TabsContent value="agent" className="space-y-6 text-right">
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">بيانات الحساب</h4>
            {UserFields}
          </section>
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">المشرف والمركبة</h4>
            <div className="mb-4 text-right">
              <FormSelect
                label="المشرف المسؤول"
                required
                value={supervisorAgentId}
                onValueChange={setSupervisorAgentId}
                options={supervisorOptions}
                placeholder="اختر المشرف..."
              />
            </div>
            {AgentProfileFields}
          </section>
          <section>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">العنوان</h4>
            {AddressFields}
          </section>
        </TabsContent>

        {/* ── Other role tab ─────────────────────────────────────────── */}
        <TabsContent value="other" className="space-y-6">
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">بيانات الحساب</h4>
            {UserFields}
          </section>
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">الأدوار والإشراف</h4>
            <div className="grid gap-4 sm:grid-cols-2 text-right">
              <FormSelect
                label="الدور"
                required
                value={selectedRole}
                onValueChange={setSelectedRole}
                options={roleOptions}
                placeholder="اختر الدور"
              />
              <FormSelect
                label="المشرف (اختياري)"
                value={supervisorAgentId}
                onValueChange={setSupervisorAgentId}
                options={supervisorOptions}
                placeholder="بدون مشرف"
              />
            </div>
          </section>
          <section className="text-right">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">العنوان</h4>
            {AddressFields}
          </section>
        </TabsContent>
      </Tabs>
    </AdminDialogShell>
  );
}
