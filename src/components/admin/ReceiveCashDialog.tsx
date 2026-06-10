import { useEffect, useMemo, useState } from "react";
import { Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { FormTextarea } from "@/components/admin/AdminFormFields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AgentCollectionSummary, CollectionRecord } from "@/lib/admin/collections-types";
import { formatAmount } from "@/lib/admin/collections-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentCollectionSummary | null;
  pendingItems: CollectionRecord[];
  onSave: (collectionIds: string[], note: string) => Promise<void>;
  loading?: boolean;
};

export function ReceiveCashDialog({ open, onOpenChange, agent, pendingItems, onSave, loading = false }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(new Set(pendingItems.map((item) => item.collection_id)));
      setNote("");
    }
  }, [open, pendingItems]);

  const selectedTotal = useMemo(() => {
    return pendingItems
      .filter((item) => selected.has(item.collection_id))
      .reduce((sum, item) => sum + item.collected_amount, 0);
  }, [pendingItems, selected]);

  const handleSave = async () => {
    if (selected.size === 0) {
      toast.error("يرجى اختيار تحصيل واحد على الأقل");
      return;
    }
    await onSave(Array.from(selected), note.trim());
  };

  if (!agent) return null;

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="استلام نقد من المندوب"
      description="تسجيل تسليم المندوب للمبالغ المحصّلة — cash handoff"
      icon={Banknote}
      badge={agent.agent_name}
      size="lg"
      footer={
        <>
          <Button className="rounded-xl gradient-brand px-6 shadow-glow" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            تأكيد الاستلام
          </Button>
          <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">المندوب:</span>{" "}
            <span className="font-semibold">{agent.agent_name}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">إجمالي بانتظار التسليم:</span>{" "}
            <span className="font-bold tabular-nums text-warning">{formatAmount(agent.pending_handoff_amount)} ج.م</span>
            <span className="text-muted-foreground"> ({agent.pending_handoff} عملية)</span>
          </p>
        </div>

        <div className="max-h-56 space-y-2 overflow-y-auto modal-scroll rounded-xl border border-border p-3">
          {pendingItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">لا توجد تحصيلات معلّقة لهذا المندوب</p>
          ) : (
            pendingItems.map((item) => (
              <label
                key={item.collection_id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/30"
              >
                <Checkbox
                  checked={selected.has(item.collection_id)}
                  onCheckedChange={(checked) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(item.collection_id);
                      else next.delete(item.collection_id);
                      return next;
                    });
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold">{item.internal_code}</p>
                  <p className="text-xs text-muted-foreground">{item.company_name}</p>
                </div>
                <p className="font-bold tabular-nums">{formatAmount(item.collected_amount)} ج.م</p>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="text-sm font-medium">المبلغ المحدد للاستلام</span>
          <span className="text-lg font-extrabold tabular-nums text-primary">{formatAmount(selectedTotal)} ج.م</span>
        </div>

        <FormTextarea
          label="ملاحظة التسليم (اختياري)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="رقم الإيصال، وقت التسليم..."
        />
      </div>
    </AdminDialogShell>
  );
}
