import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  sidebarChevron,
  sidebarIcon,
  sidebarParentBtn,
  sidebarStandaloneBtn,
  sidebarSubBtn,
} from "@/components/layout/sidebar-styles";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type NavItem = { title: string; url: string; icon: LucideIcon };
export type NavSection = { title: string; icon: LucideIcon; items: NavItem[] };

type Props = {
  section: NavSection;
  defaultOpen?: boolean;
};

export function SidebarNavGroup({ section, defaultOpen }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    if (url === "/reports") return pathname === "/reports" || pathname === "/reports/";
    return pathname.startsWith(url);
  };
  const sectionActive = section.items.some((item) => isActive(item.url));
  const open = defaultOpen ?? sectionActive;

  if (collapsed) {
    return (
      <>
        {section.items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.url)}
              tooltip={item.title}
              className={sidebarStandaloneBtn}
            >
              <Link to={item.url}>
                <item.icon className={sidebarIcon} />
                <span className="sr-only">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </>
    );
  }

  return (
    <Collapsible defaultOpen={open} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              sidebarParentBtn,
              "w-full",
              sectionActive && "bg-sidebar-accent/50 font-semibold",
            )}
          >
            <section.icon className={sidebarIcon} />
            <span className="flex-1 text-right">{section.title}</span>
            <ChevronDown className={sidebarChevron} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {section.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActive(item.url)}
                  className={sidebarSubBtn}
                >
                  <Link to={item.url}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
