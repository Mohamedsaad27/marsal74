import {
  Bell,
  Search,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
  CheckCheck,
  Loader2,
  BellOff,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { logout } from "@/lib/auth/Auth.api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/admin/notifications-api";
import type { NotificationRecord } from "@/lib/admin/notifications-types";
import { formatRelativeTime } from "@/lib/admin/notifications-types";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
// Color dot per type group
const typeDotColor: Record<number, string> = {
  1: "bg-info", // new order
  2: "bg-primary", // status update
  3: "bg-success", // price approval
  4: "bg-warning", // timer start
  5: "bg-warning", // timer expired
  6: "bg-destructive", // new message
  7: "bg-muted-foreground", // phone updated
  8: "bg-orange-500", // postpone reminder
};

export function Topbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const fetchedOnce = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const goToOrder = (orderId: string) => {
    void navigate({
      to: "/shipments/$orderId",
      params: { orderId },
    });
  };
  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  // Poll unread count every 60s (lightweight)
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnread(count);
    } catch {
      // silently fail — don't toast on background poll
    }
  }, []);

  useEffect(() => {
    void refreshUnreadCount();
    pollRef.current = setInterval(refreshUnreadCount, 60_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshUnreadCount]);

  // Fetch first page of notifications when dropdown opens (once per open)
  const loadNotifications = useCallback(async () => {
    if (fetchedOnce.current) return;
    setLoading(true);
    try {
      const res = await fetchNotifications(1, 10);
      if (res.isSuccess) {
        setItems(res.data.items);
        setUnread(res.data.kpis.unread);
        fetchedOnce.current = true;
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void loadNotifications();
    else fetchedOnce.current = false; // re-fetch on next open
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="ابحث عن شحنة، مندوب، عميل..."
          className="h-10 rounded-xl border-border bg-muted/50 pr-10 text-sm focus-visible:bg-card"
        />
        <kbd className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div> */}

      <div className="mr-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          className="rounded-xl text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        {/* ── Notifications dropdown ── */}
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
                  {unread > 99 ? "99" : unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[360px] rounded-2xl p-2 shadow-elevated">
            {/* Header */}
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">الإشعارات</span>
                {unread > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {unread} جديدة
                  </Badge>
                )}
              </div>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                >
                  {markingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  تعليم الكل
                </Button>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Body */}
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <BellOff className="h-8 w-8 opacity-40" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              items.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-3 focus:bg-accent",
                    !n.is_read && "bg-primary/5",
                  )}
                  onSelect={(e) => e.preventDefault()} // keep open on click
                  onClick={() => {
                    if (n.data?.order_id) {
                      goToOrder(n.data.order_id);
                      setOpen(false); // close dropdown
                    }
                  }}
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      !n.is_read
                        ? (typeDotColor[n.type.code] ?? "bg-primary")
                        : "bg-muted-foreground/30",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm",
                        !n.is_read ? "font-semibold" : "font-normal text-muted-foreground",
                      )}
                    >
                      {n.title_ar}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body_ar}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <button
                          className="text-[11px] text-primary hover:underline"
                          onClick={(e) => handleMarkRead(n.id, e)}
                        >
                          تعليم كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />

            {/* Footer */}
            <DropdownMenuItem
              className="justify-center rounded-xl p-0 focus:bg-transparent"
              asChild
            >
              <Link
                to="/notifications"
                className="flex w-full justify-center rounded-xl py-2.5 text-sm font-semibold text-primary hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                عرض كل الإشعارات
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-8 w-px bg-border" />

        {/* User menu — unchanged */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm font-bold text-sidebar-primary-foreground">
                {user?.avatar && (
                  <AvatarImage src={user.avatar} className="rounded-lg object-cover" />
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
            <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl" asChild>
              <Link to="/profile">
                <UserCircle className="h-4 w-4" />
                الملف الشخصي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                الإعدادات
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-xl text-destructive focus:text-destructive"
              asChild
            >
              <Link to="/login" onClick={logout}>
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
