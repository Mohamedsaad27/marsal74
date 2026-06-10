import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div dir="rtl" className="flex h-svh min-h-0 w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
