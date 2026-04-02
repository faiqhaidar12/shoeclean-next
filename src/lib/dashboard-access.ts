export type DashboardUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  primary_role: string | null;
  current_plan: string;
  remaining_orders: number | null;
  is_owner: boolean;
  is_admin: boolean;
  is_staff: boolean;
  is_superadmin: boolean;
  features: {
    team_management: boolean;
    promos: boolean;
    exports: boolean;
    multi_outlet_reports: boolean;
  };
  outlet: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type DashboardModuleKey =
  | "dashboard"
  | "outlets"
  | "services"
  | "team"
  | "expenses"
  | "promos"
  | "customers"
  | "orders"
  | "reports"
  | "subscription"
  | "surveys";

export type DashboardNavItem = {
  key: DashboardModuleKey;
  href: string;
  label: string;
  visible: boolean;
  enabled: boolean;
  minPlanBadge?: "Pro" | "Bisnis";
  lockedTitle?: string;
  lockedDescription?: string;
};

export function canAccessDashboardModule(
  user: DashboardUser,
  module: DashboardModuleKey,
  options?: { outletId?: number | null },
) {
  switch (module) {
    case "dashboard":
    case "customers":
    case "orders":
      return true;
    case "outlets":
      if (user.is_owner) return true;
      if (user.is_admin && options?.outletId && user.outlet?.id === options.outletId) return true;
      return false;
    case "services":
    case "expenses":
      return user.is_owner || user.is_admin;
    case "team":
      return (user.is_owner || user.is_admin) && user.features.team_management;
    case "promos":
      return (user.is_owner || user.is_admin) && user.features.promos;
    case "reports":
      return (user.is_owner || user.is_admin) && user.features.exports;
    case "subscription":
    case "surveys":
      return user.is_owner;
    default:
      return false;
  }
}

export function getDashboardNavItems(user: DashboardUser): DashboardNavItem[] {
  const items: DashboardNavItem[] = [
    {
      key: "dashboard",
      href: "/dashboard",
      label: "Dasbor",
      visible: true,
      enabled: true,
    },
    {
      key: "outlets",
      href: user.is_owner ? "/dashboard/outlets" : user.outlet ? `/dashboard/outlets/${user.outlet.id}` : "/dashboard",
      label: "Cabang",
      visible: user.is_owner || user.is_admin,
      enabled: user.is_owner || !!user.outlet,
    },
    {
      key: "services",
      href: "/dashboard/services",
      label: "Layanan",
      visible: user.is_owner || user.is_admin,
      enabled: user.is_owner || user.is_admin,
    },
    {
      key: "team",
      href: "/dashboard/team",
      label: "Staf",
      visible: user.is_owner || user.is_admin,
      enabled: user.features.team_management,
      minPlanBadge: "Pro",
      lockedTitle: "Kelola tim tersedia mulai paket Pro",
      lockedDescription:
        "Tambah admin dan staf outlet akan terbuka setelah bisnis di-upgrade ke paket Pro atau Bisnis.",
    },
    {
      key: "expenses",
      href: "/dashboard/expenses",
      label: "Keuangan",
      visible: user.is_owner || user.is_admin,
      enabled: user.is_owner || user.is_admin,
    },
    {
      key: "promos",
      href: "/dashboard/promos",
      label: "Promo",
      visible: user.is_owner || user.is_admin,
      enabled: user.features.promos,
      minPlanBadge: "Pro",
      lockedTitle: "Fitur promo tersedia mulai paket Pro",
      lockedDescription:
        "Buat dan kelola promo outlet setelah paket bisnis di-upgrade ke Pro atau Bisnis.",
    },
    {
      key: "customers",
      href: "/dashboard/customers",
      label: "Pelanggan",
      visible: true,
      enabled: true,
    },
    {
      key: "orders",
      href: "/dashboard/orders",
      label: "Pesanan",
      visible: true,
      enabled: true,
    },
    {
      key: "reports",
      href: "/dashboard/reports",
      label: "Laporan",
      visible: user.is_owner || user.is_admin,
      enabled: user.features.exports,
      minPlanBadge: "Pro",
      lockedTitle: "Laporan ekspor tersedia mulai paket Pro",
      lockedDescription:
        "Unduh laporan bisnis dan ringkasan performa setelah paket di-upgrade ke Pro atau Bisnis.",
    },
    {
      key: "subscription",
      href: "/dashboard/subscription",
      label: "Langganan",
      visible: user.is_owner,
      enabled: user.is_owner,
    },
    {
      key: "surveys",
      href: "/dashboard/surveys",
      label: "Survei",
      visible: user.is_owner,
      enabled: user.is_owner,
    },
  ];

  return items.filter((item) => item.visible);
}
