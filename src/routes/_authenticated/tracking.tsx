import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MapPin, Navigation, Truck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tracking")({
  component: TrackingPage,
});

const liveCouriers = [
  { name: "خالد العتيبي", shipment: "SHP-2841", city: "الرياض - حي العليا", eta: "12 د" },
  { name: "محمد الزهراني", shipment: "SHP-2840", city: "جدة - حي الروضة", eta: "8 د" },
  { name: "سعد القحطاني", shipment: "SHP-2839", city: "الدمام - الكورنيش", eta: "23 د" },
  { name: "ناصر الدوسري", shipment: "SHP-2837", city: "الرياض - الملقا", eta: "5 د" },
];

function TrackingPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">التتبع المباشر</h1>
        <p className="mt-1 text-sm text-muted-foreground">موقع المناديب والشحنات في الزمن الفعلي</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:col-span-2">
          {/* Map placeholder */}
          <div className="relative h-[520px] w-full bg-gradient-to-br from-[oklch(0.93_0.03_240)] to-[oklch(0.88_0.04_250)]">
            <svg
              className="absolute inset-0 h-full w-full opacity-50"
              viewBox="0 0 400 400"
              fill="none"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="oklch(0.7 0.05 250)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path
                d="M 50 200 Q 150 100 250 220 T 380 180"
                stroke="oklch(0.55 0.24 265)"
                strokeWidth="3"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M 80 320 Q 180 280 280 340"
                stroke="oklch(0.55 0.24 265)"
                strokeWidth="3"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.6"
              />
            </svg>

            {[
              { top: "30%", left: "25%" },
              { top: "55%", left: "55%" },
              { top: "70%", left: "30%" },
              { top: "40%", left: "75%" },
            ].map((p, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={p}>
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full gradient-brand text-white shadow-glow ring-4 ring-white">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute right-4 top-4 rounded-xl bg-card/90 px-3 py-2 text-xs font-semibold shadow-elevated backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> مباشر — 4 مناديب
                نشطون
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h3 className="text-base font-bold">المناديب النشطون</h3>
          <ul className="mt-4 space-y-3">
            {liveCouriers.map((c) => (
              <li
                key={c.shipment}
                className="rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-accent/40"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-sm font-bold text-white">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="font-mono text-[11px] text-primary">#{c.shipment}</p>
                  </div>
                  <span className="rounded-md bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                    {c.eta}
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {c.city}
                </p>
                <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-semibold hover:bg-muted">
                  <Navigation className="h-3 w-3" /> اتباع
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
