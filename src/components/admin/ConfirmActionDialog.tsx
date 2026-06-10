import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, HelpCircle } from "lucide-react";
import type { ConfirmAction } from "@/components/admin/use-admin-crud";

type Props = {
  action: ConfirmAction;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmActionDialog({ action, onOpenChange }: Props) {
  const destructive = action?.variant === "destructive";
  const Icon = destructive ? AlertTriangle : HelpCircle;

  return (
    <AlertDialog open={!!action} onOpenChange={(open) => !open && onOpenChange(false)}>
      <AlertDialogContent className="confirm-dialog gap-0 overflow-hidden p-0 text-start sm:max-w-md" dir="rtl">
        <div
          className={cn(
            "relative border-b border-border/50 pb-5 pt-6 ps-6 pe-6",
            destructive
              ? "bg-gradient-to-bl from-destructive/12 via-background to-background"
              : "bg-gradient-to-bl from-primary/10 via-background to-background",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft",
                destructive ? "bg-destructive text-destructive-foreground" : "gradient-brand text-white shadow-glow",
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <span
                className={cn(
                  "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                  destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                )}
              >
                {destructive ? "إجراء حساس" : "تأكيد"}
              </span>
              <AlertDialogTitle className="text-start text-xl font-extrabold leading-tight">
                {action?.title ?? "تأكيد"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-start text-sm leading-relaxed">
                {action?.description}
              </AlertDialogDescription>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 border-t border-border/60 bg-card/90 px-6 py-4 backdrop-blur-sm">
          <Button
            className={cn(
              "rounded-xl px-6",
              destructive
                ? "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90"
                : "gradient-brand shadow-glow",
            )}
            onClick={() => action?.onConfirm()}
          >
            {action?.confirmLabel ?? "تأكيد"}
          </Button>
          <AlertDialogCancel className="mt-0 rounded-xl border-border/80 px-5">إلغاء</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
