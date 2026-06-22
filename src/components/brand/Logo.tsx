import logoSrc from "@/assets/6-removebg-preview.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "wordmark";
  className?: string;
  onDark?: boolean;
}

export function Logo({ variant = "full", className, onDark = false }: LogoProps) {
  if (variant === "icon") {
    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl  text-white shadow-glow",
          className,
        )}
        aria-label="Express Pro"
      >
        <MIcon className="h-5 w-5" />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div dir="ltr" className={cn("flex items-center gap-2", className)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl  text-white shadow-glow">
          <MIcon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight",
            onDark ? "text-white" : "text-[color:var(--brand-navy)]",
          )}
        >
          Express Pro{" "}
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="Express Pro"
      className={cn("h-12 w-auto select-none", className)}
      draggable={false}
    />
  );
}

function MIcon({ className }: { className?: string }) {
  return <img src={logoSrc} alt="Express Pro" draggable={false} />;
}
