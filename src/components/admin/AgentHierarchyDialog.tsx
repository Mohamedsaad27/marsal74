import { useEffect, useMemo, useState } from "react";
import { GitBranch, Loader2, Users } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormSelect } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DeliveryAgent, UpdateAgentHierarchyPayload } from "@/lib/admin/delivery-agents-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: DeliveryAgent | null;
  allAgents: DeliveryAgent[];
  onSave: (payload: UpdateAgentHierarchyPayload) => Promise<void>;
  loading?: boolean;
};

export function AgentHierarchyDialog({ open, onOpenChange, agent, allAgents, onSave, loading = false }: Props) {
  const [supervisorId, setSupervisorId] = useState("none");

  useEffect(() => {
    if (!open || !agent) return;
    setSupervisorId(agent.supervisor_id ? String(agent.supervisor_id) : "none");
  }, [open, agent]);

  const supervisorOptions = useMemo(() => {
    const candidates = allAgents.filter((item) => item.id !== agent?.id);
    return [
      { value: "none", label: "بدون مشرف (مستوى أعلى)" },
      ...candidates.map((item) => ({ value: String(item.id), label: item.name })),
    ];
  }, [allAgents, agent?.id]);

  const handleSave = async () => {
    await onSave({
      supervisor_id: supervisorId === "none" ? null : Number(supervisorId),
    });
  };

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={agent ? `التسلسل الإشرافي — ${agent.name}` : "التسلسل الإشرافي"}
      description="تعيين المشرف المباشر وعرض المرؤوسين"
      icon={GitBranch}
      badge="Hierarchy"
      size="lg"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading || !agent}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ التسلسل
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      {agent && (
        <div className="space-y-5">
          <FormSelect
            label="المشرف المباشر"
            value={supervisorId}
            onValueChange={setSupervisorId}
            options={supervisorOptions}
          />

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-bold">المرؤوسون المباشرون</h3>
              <Badge variant="secondary" className="rounded-md text-[10px]">
                {agent.subordinates.length}
              </Badge>
            </div>
            {agent.subordinates.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا يوجد مناديب تحت إشراف هذا المندوب</p>
            ) : (
              <ul className="space-y-2">
                {agent.subordinates.map((subordinate) => (
                  <li
                    key={subordinate.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{subordinate.name}</span>
                    <span className="text-xs text-muted-foreground">#{subordinate.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {agent.supervisor_name && (
            <p className="rounded-xl bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
              المشرف الحالي: <span className="font-semibold text-foreground">{agent.supervisor_name}</span>
            </p>
          )}
        </div>
      )}
    </AdminDialogShell>
  );
}
