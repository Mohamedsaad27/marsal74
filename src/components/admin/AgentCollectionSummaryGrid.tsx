import { Banknote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentCollectionSummary } from "@/lib/admin/collections-types";
import { formatAmount } from "@/lib/admin/collections-types";

type Props = {
  summaries: AgentCollectionSummary[];
  onReceiveCash: (agent: AgentCollectionSummary) => void;
};

export function AgentCollectionSummaryGrid({ summaries, onReceiveCash }: Props) {
  if (summaries.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">ملخص التحصيلات حسب المندوب</h2>
          <p className="text-xs text-muted-foreground">agent collections summary — إجمالي المحصّل والمبالغ بانتظار التسليم</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {summaries.map((agent) => (
          <div
            key={agent.delivery_agent_id}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-elevated"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold">{agent.agent_name}</p>
                  <p className="text-xs text-muted-foreground">{agent.collections_count} عملية تحصيل</p>
                </div>
              </div>
              {agent.pending_handoff > 0 && (
                <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold text-warning">
                  {agent.pending_handoff} معلّق
                </span>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">إجمالي المحصّل</dt>
                <dd className="font-semibold tabular-nums">{formatAmount(agent.total_collected)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">العمولة</dt>
                <dd className="tabular-nums text-muted-foreground">−{formatAmount(agent.total_commission)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">صافي الشركات</dt>
                <dd className="font-semibold tabular-nums">{formatAmount(agent.total_net_due)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">بانتظار التسليم</dt>
                <dd className="font-bold tabular-nums text-warning">{formatAmount(agent.pending_handoff_amount)}</dd>
              </div>
            </dl>

            {agent.pending_handoff > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full rounded-xl border-warning/30 text-warning hover:bg-warning/10"
                onClick={() => onReceiveCash(agent)}
              >
                <Banknote className="ms-2 h-4 w-4" />
                استلام نقد من المندوب
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
