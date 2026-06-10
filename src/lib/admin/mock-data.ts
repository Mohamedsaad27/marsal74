// /** Design-only mock data for admin CRUD pages */

// import { GOVERNORATES, CITIES } from "@/lib/admin/locations-data";

// export type ActiveFlag = 0 | 1;

// export const MOCK_USERS = [
//   {
//     id: 1,
//     name: "عبدالله الراشد",
//     email: "abdullah@marsal.io",
//     phone: "01001234567",
//     avatar: "",
//     gender: "male" as const,
//     is_active: 1 as ActiveFlag,
//     roles: ["super_admin"],
//     direct_permissions: ["users.view", "users.create"],
//     profile_type: null as null | "shipping_company" | "delivery_agent" | "staff_member",
//     profile_label: null as string | null,
//     addresses_count: 2,
//   },
//   {
//     id: 2,
//     name: "سارة محمود",
//     email: "sara@marsal.io",
//     phone: "01119876543",
//     avatar: "",
//     gender: "female" as const,
//     is_active: 1 as ActiveFlag,
//     roles: ["operations_manager"],
//     direct_permissions: [],
//     profile_type: "staff_member" as const,
//     profile_label: "عضو فريق — العمليات",
//     addresses_count: 1,
//   },
//   {
//     id: 3,
//     name: "خالد العتيبي",
//     email: "khaled.agent@marsal.io",
//     phone: "01005551024",
//     avatar: "",
//     gender: "male" as const,
//     is_active: 1 as ActiveFlag,
//     roles: ["delivery_agent"],
//     direct_permissions: ["orders.view"],
//     profile_type: "delivery_agent" as const,
//     profile_label: "مندوب توصيل",
//     addresses_count: 3,
//   },
//   {
//     id: 4,
//     name: "أحمد شريف",
//     email: "ahmed@aramex-partner.com",
//     phone: "01233445566",
//     avatar: "",
//     gender: "male" as const,
//     is_active: 0 as ActiveFlag,
//     roles: ["company_admin"],
//     direct_permissions: [],
//     profile_type: "shipping_company" as const,
//     profile_label: "أرامكس مصر",
//     addresses_count: 0,
//   },
// ];

// export const MOCK_ROLES = [
//   {
//     id: 1,
//     name: "super_admin",
//     guard_name: "web",
//     permissions: ["users.*", "roles.*", "permissions.*", "governorates.*", "cities.*"],
//   },
//   {
//     id: 2,
//     name: "operations_manager",
//     guard_name: "web",
//     permissions: ["orders.view", "orders.update", "collections.view"],
//   },
//   {
//     id: 3,
//     name: "delivery_agent",
//     guard_name: "web",
//     permissions: ["orders.view", "agent_zones.view"],
//   },
//   {
//     id: 4,
//     name: "company_admin",
//     guard_name: "web",
//     permissions: ["shipping_companies.view", "orders.view"],
//   },
// ];

// export const PERMISSION_MODULES = [
//   "users",
//   "roles",
//   "permissions",
//   "governorates",
//   "cities",
//   "addresses",
//   "shipping_companies",
//   "delivery_agents",
//   "staff_members",
// ] as const;

// export const MOCK_PERMISSIONS = [
//   { id: 1, name: "users.view", guard_name: "web", module: "users" },
//   { id: 2, name: "users.create", guard_name: "web", module: "users" },
//   { id: 3, name: "users.update", guard_name: "web", module: "users" },
//   { id: 4, name: "users.delete", guard_name: "web", module: "users" },
//   { id: 5, name: "roles.view", guard_name: "web", module: "roles" },
//   { id: 6, name: "roles.create", guard_name: "web", module: "roles" },
//   { id: 7, name: "governorates.view", guard_name: "web", module: "governorates" },
//   { id: 8, name: "cities.view", guard_name: "web", module: "cities" },
//   { id: 9, name: "addresses.view", guard_name: "web", module: "addresses" },
//   { id: 10, name: "shipping_companies.view", guard_name: "web", module: "shipping_companies" },
//   { id: 11, name: "delivery_agents.view", guard_name: "web", module: "delivery_agents" },
//   { id: 12, name: "staff_members.view", guard_name: "web", module: "staff_members" },
// ];

// export const MOCK_GOVERNORATES = GOVERNORATES;
// export const MOCK_CITIES = CITIES;

// export const MOCK_ADDRESSES = [
//   {
//     id: 1,
//     user_id: 1,
//     user_name: "عبدالله الراشد",
//     city_id: 1,
//     city_name: "مدينة نصر",
//     address_line: "شارع مصطفى النحاس",
//     landmark: "بجوار مول سيتي ستارز",
//     street: "مصطفى النحاس",
//     building_number: "14",
//     floor_number: "3",
//     apartment_number: "12",
//     is_default: 1 as ActiveFlag,
//   },
//   {
//     id: 2,
//     user_id: 3,
//     user_name: "خالد العتيبي",
//     city_id: 2,
//     city_name: "المعادي",
//     address_line: "كورنيش المعادي",
//     landmark: "أمام محطة مترو",
//     street: "كورنيش المعادي",
//     building_number: "8",
//     floor_number: "1",
//     apartment_number: "4",
//     is_default: 0 as ActiveFlag,
//   },
// ];

// export const MOCK_AGENT_ZONES = [
//   {
//     id: 1,
//     delivery_agent_id: 3,
//     delivery_agent_name: "خالد العتيبي",
//     governorate_id: 1,
//     governorate_name: "القاهرة",
//     city_id: 1,
//     city_name: "مدينة نصر",
//     is_primary: 1 as ActiveFlag,
//   },
//   {
//     id: 2,
//     delivery_agent_id: 3,
//     delivery_agent_name: "خالد العتيبي",
//     governorate_id: 1,
//     governorate_name: "القاهرة",
//     city_id: 2,
//     city_name: "المعادي",
//     is_primary: 0 as ActiveFlag,
//   },
// ];

// export const MOCK_STAFF = [
//   {
//     id: 1,
//     name: "سارة محمود",
//     department: "العمليات",
//     job_title: "مشرفة مناطق",
//     notes: "",
//     phone: "01119876543",
//     is_active: 1 as ActiveFlag,
//   },
//   {
//     id: 2,
//     name: "يوسف الغامدي",
//     department: "خدمة العملاء",
//     job_title: "أخصائي دعم",
//     notes: "",
//     phone: "01566346610",
//     is_active: 1 as ActiveFlag,
//   },
//   {
//     id: 3,
//     name: "ناصر الدوسري",
//     department: "المالية",
//     job_title: "محاسب تحصيل",
//     notes: "",
//     phone: "01099120033",
//     is_active: 0 as ActiveFlag,
//   },
// ];

// export const MOCK_ROLE_OPTIONS = MOCK_ROLES.map((r) => ({ value: String(r.id), label: r.name }));
// export const MOCK_PERMISSION_OPTIONS = MOCK_PERMISSIONS.map((p) => ({
//   value: p.name,
//   label: p.name,
// }));
// export const MOCK_USER_OPTIONS = MOCK_USERS.map((u) => ({ value: String(u.id), label: u.name }));
// export const MOCK_GOVERNORATE_OPTIONS = MOCK_GOVERNORATES.map((g) => ({
//   value: String(g.id),
//   label: g.name_ar,
// }));
// export const MOCK_CITY_OPTIONS = MOCK_CITIES.map((c) => ({
//   value: String(c.id),
//   label: c.name_ar,
// }));
// export const MOCK_AGENT_OPTIONS = MOCK_USERS.filter((u) => u.profile_type === "delivery_agent").map(
//   (u) => ({
//     value: String(u.id),
//     label: u.name,
//   }),
// );
