import type { Permission, Role } from "@/lib/admin/rbac-types";

export const RBAC_PERMISSIONS: Permission[] = [
  { id: 1, name: "roles.view", label_ar: "عرض الأدوار", label_en: "View Roles", group: "roles", group_label_ar: "الأدوار والصلاحيات", guard_name: "api" },
  { id: 2, name: "roles.create", label_ar: "roles.create", label_en: "roles.create", group: "roles", group_label_ar: null, guard_name: "api" },
  { id: 3, name: "roles.update", label_ar: "roles.update", label_en: "roles.update", group: "roles", group_label_ar: null, guard_name: "api" },
  { id: 4, name: "roles.delete", label_ar: "roles.delete", label_en: "roles.delete", group: "roles", group_label_ar: null, guard_name: "api" },
  { id: 5, name: "permissions.view", label_ar: "permissions.view", label_en: "permissions.view", group: "permissions", group_label_ar: null, guard_name: "api" },
  { id: 6, name: "permissions.create", label_ar: "permissions.create", label_en: "permissions.create", group: "permissions", group_label_ar: null, guard_name: "api" },
  { id: 7, name: "permissions.update", label_ar: "permissions.update", label_en: "permissions.update", group: "permissions", group_label_ar: null, guard_name: "api" },
  { id: 8, name: "permissions.delete", label_ar: "permissions.delete", label_en: "permissions.delete", group: "permissions", group_label_ar: null, guard_name: "api" },
  { id: 9, name: "users.view", label_ar: "عرض المستخدمين", label_en: "View Users", group: "users", group_label_ar: "المستخدمون", guard_name: "api" },
  { id: 10, name: "users.create", label_ar: "إضافة مستخدم", label_en: "Add User", group: "users", group_label_ar: "المستخدمون", guard_name: "api" },
  { id: 11, name: "users.update", label_ar: "تعديل مستخدم", label_en: "Edit User", group: "users", group_label_ar: "المستخدمون", guard_name: "api" },
  { id: 12, name: "users.delete", label_ar: "حذف مستخدم", label_en: "Delete User", group: "users", group_label_ar: "المستخدمون", guard_name: "api" },
  { id: 13, name: "shipping_companies.view", label_ar: "عرض شركات الشحن", label_en: "View Shipping Companies", group: "shipping_companies", group_label_ar: "شركات الشحن", guard_name: "api" },
  { id: 14, name: "shipping_companies.create", label_ar: "إضافة شركة شحن", label_en: "Add Shipping Company", group: "shipping_companies", group_label_ar: "شركات الشحن", guard_name: "api" },
  { id: 15, name: "shipping_companies.update", label_ar: "تعديل شركة شحن", label_en: "Edit Shipping Company", group: "shipping_companies", group_label_ar: "شركات الشحن", guard_name: "api" },
  { id: 16, name: "shipping_companies.delete", label_ar: "حذف شركة شحن", label_en: "Delete Shipping Company", group: "shipping_companies", group_label_ar: "شركات الشحن", guard_name: "api" },
  { id: 17, name: "delivery_agents.view", label_ar: "عرض المناديب", label_en: "View Delivery Agents", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 18, name: "delivery_agents.create", label_ar: "إضافة مندوب", label_en: "Add Delivery Agent", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 19, name: "delivery_agents.update", label_ar: "تعديل مندوب", label_en: "Edit Delivery Agent", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 20, name: "delivery_agents.delete", label_ar: "حذف مندوب", label_en: "Delete Delivery Agent", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 21, name: "staff_members.view", label_ar: "staff_members.view", label_en: "staff_members.view", group: "staff_members", group_label_ar: null, guard_name: "api" },
  { id: 22, name: "staff_members.create", label_ar: "staff_members.create", label_en: "staff_members.create", group: "staff_members", group_label_ar: null, guard_name: "api" },
  { id: 23, name: "staff_members.update", label_ar: "staff_members.update", label_en: "staff_members.update", group: "staff_members", group_label_ar: null, guard_name: "api" },
  { id: 24, name: "staff_members.delete", label_ar: "staff_members.delete", label_en: "staff_members.delete", group: "staff_members", group_label_ar: null, guard_name: "api" },
  { id: 25, name: "orders.view", label_ar: "عرض الطلبات", label_en: "View Orders", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 26, name: "orders.create", label_ar: "إنشاء طلب", label_en: "Create Order", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 27, name: "orders.update", label_ar: "تعديل طلب", label_en: "Edit Order", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 28, name: "orders.assign", label_ar: "تعيين طلب لمندوب", label_en: "Assign Order to Agent", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 29, name: "finance.reports.view", label_ar: "finance.reports.view", label_en: "finance.reports.view", group: "finance", group_label_ar: null, guard_name: "api" },
  { id: 30, name: "orders.delete", label_ar: "حذف طلب", label_en: "Delete Order", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 31, name: "orders.export", label_ar: "تصدير الطلبات", label_en: "Export Orders", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 32, name: "orders.import", label_ar: "استيراد الطلبات", label_en: "Import Orders", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 33, name: "orders.view_financials", label_ar: "عرض البيانات المالية للطلب", label_en: "View Order Financials", group: "orders", group_label_ar: "الطلبات", guard_name: "api" },
  { id: 34, name: "shipping_companies.toggle", label_ar: "تفعيل / تعطيل شركة شحن", label_en: "Activate / Deactivate Company", group: "shipping_companies", group_label_ar: "شركات الشحن", guard_name: "api" },
  { id: 35, name: "delivery_agents.toggle", label_ar: "تفعيل / تعطيل مندوب", label_en: "Activate / Deactivate Agent", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 36, name: "delivery_agents.view_balance", label_ar: "عرض رصيد المندوب", label_en: "View Agent Balance", group: "delivery_agents", group_label_ar: "المناديب", guard_name: "api" },
  { id: 37, name: "collections.view", label_ar: "عرض التحصيلات", label_en: "View Collections", group: "collections", group_label_ar: "التحصيلات", guard_name: "api" },
  { id: 38, name: "collections.create", label_ar: "تسجيل تحصيل", label_en: "Record Collection", group: "collections", group_label_ar: "التحصيلات", guard_name: "api" },
  { id: 39, name: "collections.export", label_ar: "تصدير التحصيلات", label_en: "Export Collections", group: "collections", group_label_ar: "التحصيلات", guard_name: "api" },
  { id: 40, name: "returns.view", label_ar: "عرض المرتجعات", label_en: "View Returns", group: "returns", group_label_ar: "المرتجعات", guard_name: "api" },
  { id: 41, name: "returns.receive", label_ar: "استلام مرتجع", label_en: "Receive Return", group: "returns", group_label_ar: "المرتجعات", guard_name: "api" },
  { id: 42, name: "returns.send_to_company", label_ar: "إرسال مرتجع لشركة الشحن", label_en: "Send Return to Company", group: "returns", group_label_ar: "المرتجعات", guard_name: "api" },
  { id: 43, name: "settlements.view", label_ar: "عرض التسويات", label_en: "View Settlements", group: "settlements", group_label_ar: "التسويات المالية", guard_name: "api" },
  { id: 44, name: "settlements.create", label_ar: "إنشاء تسوية", label_en: "Create Settlement", group: "settlements", group_label_ar: "التسويات المالية", guard_name: "api" },
  { id: 45, name: "settlements.approve", label_ar: "اعتماد تسوية", label_en: "Approve Settlement", group: "settlements", group_label_ar: "التسويات المالية", guard_name: "api" },
  { id: 46, name: "settlements.mark_paid", label_ar: "تحديد التسوية كمدفوعة", label_en: "Mark Settlement as Paid", group: "settlements", group_label_ar: "التسويات المالية", guard_name: "api" },
  { id: 47, name: "approval_requests.view", label_ar: "عرض طلبات الموافقة", label_en: "View Approval Requests", group: "approval_requests", group_label_ar: "طلبات الموافقة", guard_name: "api" },
  { id: 48, name: "approval_requests.approve", label_ar: "الموافقة على تغيير السعر", label_en: "Approve Price Change", group: "approval_requests", group_label_ar: "طلبات الموافقة", guard_name: "api" },
  { id: 49, name: "approval_requests.reject", label_ar: "رفض تغيير السعر", label_en: "Reject Price Change", group: "approval_requests", group_label_ar: "طلبات الموافقة", guard_name: "api" },
  { id: 50, name: "users.toggle", label_ar: "تفعيل / تعطيل مستخدم", label_en: "Activate / Deactivate User", group: "users", group_label_ar: "المستخدمون", guard_name: "api" },
  { id: 51, name: "roles.manage", label_ar: "إدارة الأدوار والصلاحيات", label_en: "Manage Roles and Permissions", group: "roles", group_label_ar: "الأدوار والصلاحيات", guard_name: "api" },
  { id: 52, name: "notifications.view", label_ar: "عرض الإشعارات", label_en: "View Notifications", group: "notifications", group_label_ar: "الإشعارات", guard_name: "api" },
  { id: 53, name: "notifications.send", label_ar: "إرسال إشعار يدوي", label_en: "Send Manual Notification", group: "notifications", group_label_ar: "الإشعارات", guard_name: "api" },
  { id: 54, name: "settings.view", label_ar: "عرض إعدادات النظام", label_en: "View System Settings", group: "settings", group_label_ar: "الإعدادات", guard_name: "api" },
  { id: 55, name: "settings.update", label_ar: "تعديل إعدادات النظام", label_en: "Edit System Settings", group: "settings", group_label_ar: "الإعدادات", guard_name: "api" },
  { id: 56, name: "reports.view", label_ar: "عرض التقارير", label_en: "View Reports", group: "reports", group_label_ar: "التقارير", guard_name: "api" },
  { id: 57, name: "reports.export", label_ar: "تصدير التقارير", label_en: "Export Reports", group: "reports", group_label_ar: "التقارير", guard_name: "api" },
  { id: 58, name: "chat.view", label_ar: "عرض المحادثات", label_en: "View Conversations", group: "chat", group_label_ar: "الدردشة", guard_name: "api" },
  { id: 59, name: "chat.send", label_ar: "إرسال رسائل", label_en: "Send Messages", group: "chat", group_label_ar: "الدردشة", guard_name: "api" },
  { id: 60, name: "governorates.view", label_ar: "عرض المحافظات", label_en: "View Governorates", group: "governorates", group_label_ar: "المناطق الجغرافية", guard_name: "api" },
  { id: 61, name: "governorates.manage", label_ar: "إدارة المحافظات والمدن", label_en: "Manage Governorates and Cities", group: "governorates", group_label_ar: "المناطق الجغرافية", guard_name: "api" },
];

const permissionById = new Map(RBAC_PERMISSIONS.map((permission) => [permission.id, permission]));

function pickPermissions(ids: number[]): Permission[] {
  return ids.map((id) => permissionById.get(id)).filter((permission): permission is Permission => !!permission);
}

export const RBAC_ROLES: Role[] = [
  {
    id: 1,
    name: "super_admin",
    guard_name: "api",
    created_at: "2026-05-22T20:40:08+00:00",
    permissions: pickPermissions([
      1, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36,
      37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
    ]),
  },
  {
    id: 2,
    name: "shipping_company",
    guard_name: "api",
    created_at: "2026-05-22T20:40:08+00:00",
    permissions: pickPermissions([25, 26, 33, 40, 43, 47, 48, 49, 52, 58, 59]),
  },
  {
    id: 3,
    name: "delivery_agent",
    guard_name: "api",
    created_at: "2026-05-22T20:40:08+00:00",
    permissions: pickPermissions([25, 38, 40, 52, 58, 59]),
  },
  {
    id: 4,
    name: "staff_member",
    guard_name: "api",
    created_at: "2026-05-22T20:40:08+00:00",
    permissions: pickPermissions([9, 13, 17, 21, 25, 26, 27, 28]),
  },
];

export function permissionsForRole(role: Role, allPermissions: Permission[]): Role {
  return {
    ...role,
    permissions: role.permissions.map((permission) => permissionById.get(permission.id) ?? permission),
  };
}

export function resolveRolePermissions(role: Role): Role {
  return permissionsForRole(role, RBAC_PERMISSIONS);
}
