import logoSrc from "@/assets/mursal-logo.png";
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
          "flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow",
          className,
        )}
        aria-label="مرسال"
      >
        <MIcon className="h-5 w-5" />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow">
          <MIcon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight",
            onDark ? "text-white" : "text-[color:var(--brand-navy)]",
          )}
        >
          مرسال
        </span>
      </div>
    );
  }

  return (
    <img
      src={logoSrc}
      alt="مرسال"
      className={cn("h-12 w-auto select-none", className)}
      draggable={false}
    />
  );
}

function MIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 19V7a1 1 0 0 1 1.6-.8L9 9.5l3-3 3 3 4.4-3.3A1 1 0 0 1 21 7v12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="14.5" y="13" width="6" height="6" rx="1.2" fill="currentColor" opacity="0.95" />
    </svg>
  );
}
