import { Button } from "@/components/ui/button";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Loader2, PencilLine, UserPlus } from "lucide-react";
import type { CrudMode } from "@/components/admin/use-admin-crud";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CrudMode;
  titleCreate: string;
  titleEdit: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => void;
  loading?: boolean;
  size?: "md" | "lg" | "xl";
};

export function AdminEntityDialog({
  open,
  onOpenChange,
  mode,
  titleCreate,
  titleEdit,
  description,
  children,
  onSave,
  loading,
  size = "lg",
}: Props) {
  const isEdit = mode === "edit";

  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? titleEdit : titleCreate}
      description={description}
      icon={isEdit ? PencilLine : UserPlus}
      badge={isEdit ? "تعديل" : "إضافة"}
      size={size}
      footer={
        <>
          <Button
            className="rounded-xl gradient-brand px-6 shadow-glow"
            onClick={onSave}
            disabled={loading}
          >
            {loading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {isEdit ? "حفظ التعديلات" : "إنشاء"}
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-border/80 px-5"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">{children}</div>
    </AdminDialogShell>
  );
}
