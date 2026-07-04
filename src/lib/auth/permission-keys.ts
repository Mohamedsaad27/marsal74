// src/lib/auth/permission-keys.ts

export const PERMISSIONS = {
  dashboard: {
    view: "dashboard.view",
    manage: "dashboard.manage",
  },
  orders: {
    view: "orders.view",
    create: "orders.create",
    update: "orders.update",
    delete: "orders.delete",
    assign: "orders.assign",
    export: "orders.export",
    import: "orders.import",
    viewFinancials: "orders.view_financials",
    manage: "orders.manage",
  },
  shippingCompanies: {
    view: "shipping_companies.view",
    create: "shipping_companies.create",
    update: "shipping_companies.update",
    delete: "shipping_companies.delete",
    toggle: "shipping_companies.toggle",
    manage: "shipping_companies.manage",
  },
  deliveryAgents: {
    view: "delivery_agents.view",
    create: "delivery_agents.create",
    update: "delivery_agents.update",
    delete: "delivery_agents.delete",
    toggle: "delivery_agents.toggle",
    viewBalance: "delivery_agents.view_balance",
    manage: "delivery_agents.manage",
  },
  collections: {
    view: "collections.view",
    create: "collections.create",
    export: "collections.export",
    manage: "collections.manage",
  },
  returns: {
    view: "returns.view",
    receive: "returns.receive",
    sendToCompany: "returns.send_to_company",
    manage: "returns.manage",
  },
  settlements: {
    view: "settlements.view",
    create: "settlements.create",
    approve: "settlements.approve",
    markPaid: "settlements.mark_paid",
    manage: "settlements.manage",
  },
  approvalRequests: {
    view: "approval_requests.view",
    approve: "approval_requests.approve",
    reject: "approval_requests.reject",
    manage: "approval_requests.manage",
  },
  users: {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    toggle: "users.toggle",
    changePassword: "users.change_password",
    import: "users.import",
    manage: "users.manage",
  },
  roles: {
    view: "roles.view",
    manage: "roles.manage",
  },
  notifications: {
    view: "notifications.view",
    send: "notifications.send",
    manage: "notifications.manage",
  },
  settings: {
    view: "settings.view",
    update: "settings.update",
    manage: "settings.manage",
  },
  reports: {
    view: "reports.view",
    export: "reports.export",
    manage: "reports.manage",
  },
  chat: {
    view: "chat.view",
    send: "chat.send",
    manage: "chat.manage",
  },
  governorates: {
    view: "governorates.view",
    manage: "governorates.manage",
  },
  departments: {
    view: "departments.view",
    manage: "departments.manage",
  },
  auditLogs: {
    view: "audit_logs.view",
    manage: "audit_logs.manage",
  },
  staffMembers: {
    view: "staff_members.view",
    create: "staff_members.create",
    update: "staff_members.update",
    delete: "staff_members.delete",
    manage: "staff_members.manage",
  },
} as const;

/** Union of every permission module key, e.g. "orders" | "users" | "settlements" | ... */
export type PermissionModule = keyof typeof PERMISSIONS;

/** Union of every action name that appears across modules, e.g. "view" | "create" | "delete" | ... */
export type PermissionAction = keyof (typeof PERMISSIONS)[PermissionModule];
export function permissionFor(
  module: PermissionModule,
  action: PermissionAction,
): string | undefined {
  const group = PERMISSIONS[module] as Record<string, string>;
  return group[action];
}
