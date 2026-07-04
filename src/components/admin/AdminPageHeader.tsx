import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionModule } from "@/lib/auth/permission-keys";

type Props = {
  module: PermissionModule; // NEW
  title: string;
  tableName: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  showAdd?: boolean;
  selectedCount?: number;
  onBulkDelete?: () => void;
  extra?: React.ReactNode;
};

export function AdminPageHeader({
  module,
  title,
  tableName,
  description,
  addLabel,
  onAdd,
  showAdd = true,
  selectedCount = 0,
  onBulkDelete,
  extra,
}: Props) {
  const { canDo } = usePermissions();

  const canAdd = showAdd && canDo(module, "create" as never);
  const canBulkDelete = selectedCount > 0 && onBulkDelete && canDo(module, "delete" as never);

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          جدول <code className="rounded bg-muted px-1 text-[10px]">{tableName}</code> —{" "}
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {canBulkDelete && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-destructive hover:bg-destructive/10"
            onClick={onBulkDelete}
          >
            <Trash2 className="ml-1.5 h-4 w-4" />
            حذف ({selectedCount})
          </Button>
        )}
        {canAdd && (
          <Button className="rounded-xl gradient-brand shadow-glow" onClick={onAdd}>
            <Plus className="ml-1.5 h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
