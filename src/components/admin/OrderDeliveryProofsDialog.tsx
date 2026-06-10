import { Camera, FileSignature, KeyRound, ImageIcon } from "lucide-react";
import { AdminDialogShell } from "@/components/admin/AdminDialogShell";
import { Button } from "@/components/ui/button";
import type { OrderDeliveryProof } from "@/lib/admin/orders-types";
import { formatDateTime } from "@/lib/admin/orders-types";

const proofIcons = {
  photo: Camera,
  signature: FileSignature,
  otp: KeyRound,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  internalCode: string;
  proofs: OrderDeliveryProof[];
};

export function OrderDeliveryProofsDialog({ open, onOpenChange, internalCode, proofs }: Props) {
  return (
    <AdminDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="إثباتات التسليم"
      description={`عرض delivery proofs — الطلب ${internalCode}`}
      icon={Camera}
      badge={`${proofs.length} إثبات`}
      size="lg"
      footer={
        <Button variant="outline" className="rounded-xl px-5" onClick={() => onOpenChange(false)}>
          إغلاق
        </Button>
      }
    >
      {proofs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-muted-foreground">لا توجد إثباتات تسليم بعد</p>
          <p className="mt-1 text-xs text-muted-foreground">تُرفع من تطبيق المندوب عند التسليم</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {proofs.map((proof) => {
            const Icon = proofIcons[proof.proof_type];
            return (
              <div key={proof.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex aspect-video items-center justify-center bg-muted/40">
                  <Icon className="h-10 w-10 text-muted-foreground/60" />
                </div>
                <div className="space-y-1 p-3 text-sm">
                  <p className="font-semibold">{proof.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {proof.proof_type} — {formatDateTime(proof.captured_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">بواسطة: {proof.captured_by}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminDialogShell>
  );
}
