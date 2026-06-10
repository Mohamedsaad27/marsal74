import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type AdminDialogTone = "default" | "destructive" | "success" | "import";

const toneStyles: Record<AdminDialogTone, { icon: string; accent: string; badge: string }> = {
  default: {
    icon: "gradient-brand text-white shadow-glow",
    accent: "from-primary/12 via-transparent to-transparent",
    badge: "bg-primary/10 text-primary",
  },
  destructive: {
    icon: "bg-destructive text-destructive-foreground shadow-soft",
    accent: "from-destructive/15 via-transparent to-transparent",
    badge: "bg-destructive/10 text-destructive",
  },
  success: {
    icon: "bg-success text-success-foreground shadow-soft",
    accent: "from-success/15 via-transparent to-transparent",
    badge: "bg-success/10 text-success",
  },
  import: {
    icon: "bg-info/90 text-info-foreground shadow-soft",
    accent: "from-info/15 via-transparent to-transparent",
    badge: "bg-info/10 text-info",
  },
};

const sizeMap = {
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  "2xl": "sm:max-w-5xl",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  tone?: AdminDialogTone;
  badge?: string;
  size?: keyof typeof sizeMap;
  footer: React.ReactNode;
  children: React.ReactNode;
  scrollBody?: boolean;
};

export function AdminDialogShell({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  tone = "default",
  badge,
  size = "lg",
  footer,
  children,
  scrollBody = true,
}: Props) {
  const t = toneStyles[tone];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "admin-dialog !flex max-h-[min(92vh,920px)] w-full !flex-col gap-0 overflow-hidden p-0 text-start sm:rounded-2xl",
          sizeMap[size],
        )}
        dir="rtl"
      >
        <div
          className={cn(
            "relative shrink-0 border-b border-border/50 bg-gradient-to-bl pb-5 pt-6 ps-6 pe-14",
            t.accent,
          )}
        >
          <div className="pointer-events-none absolute -start-6 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            {Icon && (
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  t.icon,
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {badge && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      t.badge,
                    )}
                  >
                    {badge}
                  </span>
                )}
                <DialogTitle className="text-start text-xl font-extrabold leading-tight tracking-tight text-foreground">
                  {title}
                </DialogTitle>
              </div>
              {description && (
                <DialogDescription className="text-start text-sm leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "modal-scroll min-h-0 flex-1 bg-gradient-to-b from-muted/25 to-background px-6 py-5 text-start",
            scrollBody ? "overflow-y-auto overscroll-contain" : "overflow-visible",
          )}
        >
          {children}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 border-t border-border/60 bg-card/90 px-6 py-4 backdrop-blur-sm">
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
