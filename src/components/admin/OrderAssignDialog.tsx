import { useEffect, useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { fetchAgentOptions } from "@/lib/admin/orders-api";
import type { OrderListItem } from "@/lib/admin/orders-types";
import { formatDateTime } from "@/lib/admin/orders-types";
import type { AgentOption } from "@/lib/admin/orders-api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderListItem | null;
  onSave: (agentId: string) => Promise<void>;
  loading?: boolean;
};

export function OrderAssignDialog({ open, onOpenChange, order, onSave, loading = false }: Props) {
  const [agentId, setAgentId] = useState("");
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  useEffect(() => {
    async function loadOptions() {
      try {
        const [agents] = await Promise.all([fetchAgentOptions()]);
        if (agents.isSuccess) setAgentOptions(agents.data);
      } catch {
        // non-fatal — filters just show no options
      }
    }
    void loadOptions();
  }, []);
  useEffect(() => {
    if (open && order?.order.delivery_agent_id) {
      setAgentId(order.order.delivery_agent_id);
    } else if (!open) {
      setAgentId("");
    }
  }, [open, order]);

  const handleSave = async () => {
    if (!agentId) {
      toast.error("يرجى اختيار المندوب");
      return;
    }
    await onSave(agentId);
  };

  if (!order) return null;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={order.order.delivery_agent_id ? "إعادة تعيين المندوب" : "تعيين مندوب"}
      description={`orders.delivery_agent_id — الطلب ${order.order.internal_code}`}
      icon={UserCheck}
      badge="assign / reassign"
      size="md"
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={handleSave}
            disabled={loading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {order.order.delivery_agent_id ? "إعادة التعيين" : "تعيين المندوب"}
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border/70 bg-muted/30 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">المندوب الحالي:</span>{" "}
            <span className="font-semibold">{order.agent_name ?? "غير معيّن"}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">assigned_at:</span>{" "}
            <span className="font-mono text-xs">{formatDateTime(order.order.assigned_at)}</span>
          </p>
        </div>
        <FormSelect
          label="delivery_agent_id"
          required
          value={agentId}
          onValueChange={setAgentId}
          options={agentOptions}
          placeholder="اختر المندوب"
        />
      </div>
    </AdminDialogShell>
  );
}
