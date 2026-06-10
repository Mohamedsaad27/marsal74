import {
  Bell,
  Search,
  Moon,
  Sun,
  Languages,
  UserCircle,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, logout } from "@/lib/auth/Auth.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const notifications = [
  {
    title: "شحنة جديدة #SHP-2841",
    desc: "تم استلام شحنة من شركة العالمية",
    time: "الآن",
    color: "bg-info",
  },
  {
    title: "تم تسليم #SHP-2790",
    desc: "المندوب: خالد العتيبي",
    time: "قبل 5د",
    color: "bg-success",
  },
  {
    title: "تأخر شحنة #SHP-2755",
    desc: "تجاوزت المدة المتوقعة",
    time: "قبل 12د",
    color: "bg-warning",
  },
  { title: "تحصيل جديد", desc: "تم استلام 4,250 ر.س", time: "قبل ساعة", color: "bg-primary" },
];

export function Topbar() {
  const [dark, setDark] = useState(false);
  const { user, hydrated } = useCurrentUser();
  const initial = hydrated ? (user?.name?.[0] ?? "") : "";

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث عن شحنة، مندوب، عميل..."
          className="h-10 rounded-xl border-border bg-muted/50 pr-10 text-sm focus-visible:bg-card"
        />
        <kbd className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="mr-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] rounded-2xl p-2 shadow-elevated">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
              <span className="text-base font-bold">الإشعارات</span>
              <Badge variant="secondary" className="rounded-full">
                4 جديدة
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n, i) => (
              <DropdownMenuItem
                key={i}
                className="flex items-start gap-3 rounded-xl p-3 focus:bg-accent"
              >
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center rounded-xl p-0 focus:bg-transparent"
              asChild
            >
              <Link
                to="/notifications"
                className="flex w-full justify-center rounded-xl py-2.5 text-sm font-semibold text-primary hover:bg-accent"
              >
                عرض كل الإشعارات
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-8 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm font-bold text-sidebar-primary-foreground">
                {user?.avatar && (
                  <AvatarImage src={user?.avatar} className="rounded-lg object-cover" />
                )}
                <AvatarFallback className="rounded-2xl gradient-brand text-3xl font-bold text-white">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold leading-tight">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground">{user?.account_type}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-elevated">
            <DropdownMenuLabel className="px-2 py-2 font-normal">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-xl gap-2" asChild>
              <Link to="/profile">
                <UserCircle className="h-4 w-4" />
                الملف الشخصي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer rounded-xl gap-2" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                الإعدادات
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer rounded-xl gap-2 text-destructive focus:text-destructive"
              asChild
            >
              <Link
                to="/login"
                onClick={() => {
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
