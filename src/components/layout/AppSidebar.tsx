import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SidebarNavGroup } from "@/components/layout/SidebarNavGroup";

import {
  navDashboard,
  navOperationsCategories,
  navSections,
  navSystem,
} from "@/components/layout/nav-config";
import { sidebarIcon, sidebarStandaloneBtn } from "@/components/layout/sidebar-styles";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/auth/Auth.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSettings } from "@/hooks/useSettings";

export function AppSidebar() {
  const { user, hydrated } = useCurrentUser();
  const initial = hydrated ? (user?.name?.[0] ?? "") : "";
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));
  const { settings, hydratedset } = useSettings();

  return (
    <Sidebar collapsible="icon" side="right" className="border-l-0">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4">
        <Link
          to="/"
          className="flex items-center justify-end gap-3 transition-opacity hover:opacity-90"
        >
          <h1 className="max-w-[180px] truncate text-lg font-bold tracking-tight text-sidebar-foreground">
            {settings?.identity.platform_name}
          </h1>

          <img
            src={settings?.identity.logo_url}
            alt={settings?.identity.platform_name}
            className="h-12 w-12 rounded-lg object-contain"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar gap-0 overflow-x-hidden px-2 py-3">
        <SidebarGroup className="p-0">
          {!collapsed && <SidebarGroupLabel className="px-2">الرئيسية</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(navDashboard.url)}
                  tooltip={navDashboard.title}
                  className={sidebarStandaloneBtn}
                >
                  <Link to={navDashboard.url}>
                    <navDashboard.icon className={sidebarIcon} />
                    <span>{navDashboard.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-5 p-0">
          <SidebarGroupContent className="space-y-4">
            {navOperationsCategories.map((category) => (
              <div key={category.label}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {category.label}
                  </p>
                )}
                <SidebarMenu className="gap-0.5">
                  {category.sections.map((section) => (
                    <SidebarNavGroup key={`${category.label}-${section.title}`} section={section} />
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        {navSections.map((section) => (
          <SidebarGroup key={section.title} className="mt-6 p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarNavGroup section={section} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-8 p-0">
          {!collapsed && <SidebarGroupLabel className="px-2">النظام</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navSystem.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={sidebarStandaloneBtn}
                  >
                    <Link to={item.url}>
                      <item.icon className={sidebarIcon} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        {collapsed ? (
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent/70"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/40 p-2.5">
            <Avatar className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm font-bold text-sidebar-primary-foreground">
              {user?.avatar && (
                <AvatarImage src={user?.avatar} className="rounded-lg object-cover" />
              )}
              <AvatarFallback className="rounded-2xl gradient-brand text-3xl font-bold text-white">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {user?.name ?? ""}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.account_type}</p>
            </div>
            <Link
              to="/login"
              className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
