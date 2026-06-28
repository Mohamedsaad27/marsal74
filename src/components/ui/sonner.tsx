import { CircleAlert, CircleCheck, CircleX, Info, Loader2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      dir="rtl"
      position="top-center"
      offset={20}
      gap={12}
      visibleToasts={4}
      closeButton
      duration={2500}
      className="toaster group"
      icons={{
        success: (
          <CircleCheck
            className="size-[18px] text-emerald-600 dark:text-emerald-400"
            strokeWidth={2.25}
            aria-hidden
          />
        ),
        error: (
          <CircleX
            className="size-[18px] text-destructive dark:text-red-400"
            strokeWidth={2.25}
            aria-hidden
          />
        ),
        warning: (
          <CircleAlert
            className="size-[18px] text-amber-600 dark:text-amber-400"
            strokeWidth={2.25}
            aria-hidden
          />
        ),
        info: (
          <Info
            className="size-[18px] text-blue-600 dark:text-blue-400"
            strokeWidth={2.25}
            aria-hidden
          />
        ),
        loading: (
          <Loader2
            className="size-[18px] animate-spin text-muted-foreground"
            strokeWidth={2.25}
            aria-hidden
          />
        ),
      }}
      toastOptions={{
        // 🌟 FIX 2: Inline style injection to guarantee pointer events pass through the main container
        style: { pointerEvents: "auto" },
        classNames: {
          // 🌟 FIX 3: Force the toast item to have pointer-events-auto while ensuring style isolation
          toast:
            "group toast marsal-toast pointer-events-auto group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm group-[.toaster]:transition-all group-[.toaster]:duration-300",
          title:
            "group-[.toast]:text-[14px] group-[.toast]:font-semibold group-[.toast]:leading-none group-[.toast]:tracking-tight group-[.toast]:text-foreground/90",
          description:
            "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed group-[.toast]:mt-1",
          content: "group-[.toast]:gap-0.5 group-[.toast]:min-w-0 group-[.toast]:py-0.5",
          icon: "group-[.toast]:size-8 group-[.toast]:shrink-0 group-[.toast]:rounded-lg group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center group-[.toast]:bg-muted/50",
          closeButton:
            "group-[.toast]:absolute group-[.toast]:top-3 group-[.toast]:end-3 group-[.toast]:start-auto group-[.toast]:size-6 group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-border/40 group-[.toast]:bg-background/50 group-[.toast]:text-muted-foreground/80 group-[.toast]:opacity-0 group-hover:[.toast]:opacity-100 group-[.toast]:transition-all hover:group-[.toast]:bg-muted hover:group-[.toast]:text-foreground group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center",
          actionButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-primary-foreground hover:group-[.toast]:bg-primary/90 transition-colors",
          cancelButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground hover:group-[.toast]:bg-muted/80 transition-colors",
          success:
            "group-[.toaster]:bg-emerald-50/40 dark:group-[.toaster]:bg-emerald-950/20 group-[.toaster]:border-emerald-500/20",
          error:
            "group-[.toaster]:bg-red-50/40 dark:group-[.toaster]:bg-red-950/20 group-[.toaster]:border-red-500/20",
          warning:
            "group-[.toaster]:bg-amber-50/40 dark:group-[.toaster]:bg-amber-950/20 group-[.toaster]:border-amber-500/20",
          info: "group-[.toaster]:bg-blue-50/40 dark:group-[.toaster]:bg-blue-950/20 group-[.toaster]:border-blue-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
