import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  Undo2,
  Wallet,
  Scale,
  MapPin,
  MessageSquare,
  Truck,
  Building2,
  Users,
  Shield,
  KeyRound,
  Map,
  MapPinned,
  Home,
  UserCog,
  Settings,
  Bell,
  UserCircle,
  FileBarChart,
  Activity,
} from "lucide-react";
import type { NavItem, NavSection } from "@/components/layout/SidebarNavGroup";

export type NavCategory = {
  label: string;
  sections: NavSection[];
};

export const navDashboard: NavItem = {
  title: "لوحة التحكم",
  url: "/",
  icon: LayoutDashboard,
};

/** العمليات — divided into smaller categories */
export const navOperationsCategories: NavCategory[] = [
  {
    label: "الشحنات",
    sections: [
      {
        title: "الطلبات والتسليم",
        icon: Package,
        items: [
          { title: "الطلبات", url: "/shipments", icon: Package },
          { title: "طلبات الموافقة", url: "/approvals", icon: ShieldCheck },
          { title: "المرتجعات", url: "/returns", icon: Undo2 },
        ],
      },
    ],
  },
  // {
  //   label: "المالية",
  //   sections: [
  //     {
  //       title: "التحصيل والتسوية",
  //       icon: Wallet,
  //       items: [
  //         { title: "التحصيلات", url: "/collections", icon: Wallet },
  //         { title: "التسويات", url: "/settlements", icon: Scale },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   label: "المتابعة",
  //   sections: [
  //     {
  //       title: "التتبع والتواصل",
  //       icon: MapPin,
  //       items: [
  //         { title: "التتبع المباشر", url: "/tracking", icon: MapPin },
  //         { title: "المحادثات", url: "/chat", icon: MessageSquare },
  //       ],
  //     },
  //   ],
  // },
];

export const navLogistics: NavSection = {
  title: "الكيانات اللوجستية",
  icon: Truck,
  items: [
    { title: "شركات الشحن", url: "/companies", icon: Building2 },
    { title: "الأقسام", url: "/departments", icon: Building2 },
    { title: "مناديب التوصيل", url: "/couriers", icon: Truck },
    { title: "أعضاء الفريق", url: "/staff-members", icon: UserCog },
  ],
};

export const navAccess: NavSection = {
  title: "المستخدمون والأدوار",
  icon: Users,
  items: [
    { title: "المستخدمون", url: "/users", icon: Users },
    { title: "الأدوار", url: "/roles", icon: Shield },
  ],
};

export const navLocations: NavSection = {
  title: "المناطق الجغرافية",
  icon: Map,
  items: [
    { title: "المحافظات", url: "/governorates", icon: Map },
    { title: "المدن", url: "/cities", icon: MapPinned },
  ],
};

// export const navReports: NavSection = {
//   title: "التقارير",
//   icon: FileBarChart,
//   items: [
//     { title: "نظرة عامة", url: "/reports", icon: FileBarChart },
//     { title: "تقرير الطلبات", url: "/reports/shipments", icon: Package },
//     { title: "تقرير التحصيلات", url: "/reports/collections", icon: Wallet },
//     { title: "تقرير التسويات", url: "/reports/settlements", icon: Scale },
//     { title: "تقرير المناديب", url: "/reports/couriers", icon: Truck },
//     { title: "تقرير شركات الشحن", url: "/reports/companies", icon: Building2 },
//   ],
// };

export const navSystem: NavItem[] = [
  { title: "الإشعارات", url: "/notifications", icon: Bell },
  { title: "سجل النشاط", url: "/audit-log", icon: Activity },
  { title: "الملف الشخصي", url: "/profile", icon: UserCircle },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export const navSections: NavSection[] = [navLogistics, navAccess, navLocations];
