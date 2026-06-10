import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  Loader2,
} from "lucide-react";
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
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-[18px]" strokeWidth={2.25} aria-hidden />,
        error: <CircleX className="size-[18px]" strokeWidth={2.25} aria-hidden />,
        warning: <CircleAlert className="size-[18px]" strokeWidth={2.25} aria-hidden />,
        info: <Info className="size-[18px]" strokeWidth={2.25} aria-hidden />,
        loading: <Loader2 className="size-[18px] animate-spin" strokeWidth={2.25} aria-hidden />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast marsal-toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-elevated group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-snug group-[.toast]:tracking-tight",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:leading-relaxed",
          content: "group-[.toast]:gap-1 group-[.toast]:min-w-0",
          icon: "group-[.toast]:size-9 group-[.toast]:shrink-0 group-[.toast]:rounded-full group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center",
          closeButton:
            "group-[.toast]:absolute group-[.toast]:top-3 group-[.toast]:end-3 group-[.toast]:start-auto group-[.toast]:size-7 group-[.toast]:rounded-lg group-[.toast]:border group-[.toast]:border-border/70 group-[.toast]:bg-background/80 group-[.toast]:text-muted-foreground group-[.toast]:opacity-100 group-[.toast]:transition-colors hover:group-[.toast]:bg-muted hover:group-[.toast]:text-foreground",
          actionButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
