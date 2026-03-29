"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DashboardSummary } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

type Props = {
  data: DashboardSummary;
  legacyDashboardUrl: string;
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  process: "Diproses",
  ready: "Siap diambil",
  completed: "Selesai",
};

export function DashboardShell({ data, legacyDashboardUrl }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const metrics = [
    {
      label: "Order hari ini",
      value: data.metrics.today_orders.toString(),
      tone: "text-accent",
    },
    {
      label: "Revenue bulan ini",
      value: formatRupiah(data.metrics.month_revenue),
      tone: "text-brand",
    },
    {
      label: "Customer aktif",
      value: data.metrics.total_customers.toString(),
      tone: "text-foreground",
    },
    {
      label: "Order pending",
      value: data.metrics.pending_orders.toString(),
      tone: "text-danger",
    },
  ];

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="hero-grid">
            <section className="section-block hero-card p-5 sm:p-7">
              <span className="eyebrow">Next Dashboard</span>
              <h1 className="headline mt-4">Halo, {data.user.name}.</h1>
              <p className="subcopy mt-4 max-w-2xl">
                Session login sudah terhubung ke Laravel. Ini jadi fondasi
                dashboard baru sebelum modul CRUD kita pindahkan bertahap.
              </p>
              <div className="hero-badge-row mt-5">
                <span className="highlight-chip">Role: {data.user.roles.join(", ")}</span>
                <span className="highlight-chip">Plan: {data.user.current_plan}</span>
                <span className="highlight-chip">{data.scope.active_label}</span>
              </div>
              <div className="mobile-stack mt-6">
                <Link href="/dashboard/orders" className="btn-accent w-full sm:w-auto">
                  Buka order
                </Link>
                <Link href="/logout" className="btn-secondary w-full sm:w-auto">
                  Halaman logout
                </Link>
                <a
                  href={legacyDashboardUrl}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Buka dashboard Laravel
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="btn-primary w-full sm:w-auto"
                >
                  {isLoggingOut ? "Keluar..." : "Logout"}
                </button>
              </div>
            </section>

            <aside className="section-dark hero-card p-5 sm:p-7">
              <p className="section-label-dark">Ringkasan akses</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Dashboard baru sudah bisa baca session dan data utama.
              </h2>
              <div className="info-list mt-5">
                <div className="kpi-pill-dark">
                  <p className="text-sm font-semibold">Outlet terjangkau</p>
                  <p className="mt-1 text-sm text-white/72">
                    {data.scope.outlets.length} outlet dalam scope aktif
                  </p>
                </div>
                <div className="kpi-pill-dark">
                  <p className="text-sm font-semibold">Sisa order</p>
                  <p className="mt-1 text-sm text-white/72">
                    {data.user.remaining_orders === null
                      ? "Unlimited"
                      : `${data.user.remaining_orders} order`}
                  </p>
                </div>
                <div className="kpi-pill-dark">
                  <p className="text-sm font-semibold">Status akun</p>
                  <p className="mt-1 text-sm text-white/72">
                    {data.user.is_superadmin ? "Superadmin" : "Verified session"}
                  </p>
                </div>
              </div>
            </aside>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <article key={item.label} className="section-block p-5">
                <p className="section-label">{item.label}</p>
                <p className={`mt-3 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
              </article>
            ))}
          </section>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="section-block p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-label">Scope outlet</p>
                  <h2 className="mt-2 text-2xl font-semibold">Cabang dalam akses Anda</h2>
                </div>
              </div>
              <div className="info-list mt-5">
                {data.scope.outlets.map((outlet) => (
                  <div key={outlet.id} className="soft-panel p-4">
                    <p className="font-semibold text-foreground">{outlet.name}</p>
                    <p className="mt-1 text-sm text-muted">Slug: {outlet.slug}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="section-block p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-label">Order terbaru</p>
                  <h2 className="mt-2 text-2xl font-semibold">Aktivitas yang baru masuk</h2>
                </div>
              </div>
              <div className="info-list mt-5">
                {data.recent_orders.map((order) => (
                  <article key={order.id} className="soft-panel p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{order.invoice_number}</p>
                        <p className="mt-1 text-sm text-muted">
                          {order.customer?.name ?? "Customer umum"} • {order.outlet?.name ?? "Outlet"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-accent">
                          {formatRupiah(order.total_price)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                          {statusLabels[order.status] ?? order.status}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
                {data.recent_orders.length === 0 ? (
                  <div className="soft-panel p-4 text-sm text-muted">
                    Belum ada order terbaru di scope ini.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
