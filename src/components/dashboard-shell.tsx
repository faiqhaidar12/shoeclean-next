"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DashboardFrame } from "@/components/dashboard-frame";
import type { DashboardSummary } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

type Props = {
  data: DashboardSummary;
};

const monthLabels = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const statusLabels: Record<string, string> = {
  pending: "Pending",
  process: "Diproses",
  ready: "Siap diambil",
  completed: "Selesai",
};

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M6 7.75A2.75 2.75 0 0 1 8.75 5h6.5A2.75 2.75 0 0 1 18 7.75v8.5A2.75 2.75 0 0 1 15.25 19h-6.5A2.75 2.75 0 0 1 6 16.25z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M9 10h6M9 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7.75A2.75 2.75 0 0 1 6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v8.5A2.75 2.75 0 0 1 17.25 19H6.75A2.75 2.75 0 0 1 4 16.25z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4 9.5h16M8.5 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function buildChartPoints(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const width = 760;
  const height = 220;
  const paddingX = 12;
  const paddingY = 18;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = paddingX + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = height - paddingY - (value / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[]) {
  if (values.length === 0) {
    return "";
  }

  const points = buildChartPoints(values);
  const width = 760;
  const height = 220;
  const paddingX = 12;

  return `M ${paddingX},${height - 18} L ${points.replaceAll(" ", " L ")} L ${width - paddingX},${height - 18} Z`;
}

export function DashboardShell({ data }: Props) {
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
      label: "Pesanan hari ini",
      value: data.metrics.today_orders.toString(),
      stat: "aktif",
      icon: <OrdersIcon />,
      accentClass: "bg-brand/5 text-brand",
    },
    {
      label: "Pendapatan hari ini",
      value: formatRupiah(data.metrics.today_revenue),
      stat: "tunai masuk",
      icon: <RevenueIcon />,
      accentClass: "bg-accent-soft/35 text-accent-ink",
    },
    {
      label: "Pelanggan terkelola",
      value: data.metrics.total_customers.toString(),
      stat: "database aktif",
      icon: <CustomerIcon />,
      accentClass: "bg-[rgba(207,232,227,0.5)] text-brand",
    },
    {
      label: "Order pending",
      value: data.metrics.pending_orders.toString(),
      stat: "butuh aksi",
      icon: <PendingIcon />,
      accentClass: "bg-[rgba(255,218,214,0.9)] text-[#a52b17]",
    },
  ];

  const chartLinePoints = useMemo(
    () => buildChartPoints(data.charts.revenue.data),
    [data.charts.revenue.data],
  );
  const chartAreaPath = useMemo(
    () => buildAreaPath(data.charts.revenue.data),
    [data.charts.revenue.data],
  );
  const chartMax = Math.max(...data.charts.revenue.data, 1);
  const chartTicks = [chartMax, Math.round(chartMax * 0.66), Math.round(chartMax * 0.33), 0];
  const completedOrders = data.recent_orders.filter((order) => order.status === "completed").length;

  return (
    <DashboardFrame
      current="dashboard"
      eyebrow="Ringkasan outlet"
      title={`Selamat datang, ${data.user.name}`}
      description={`Anda sedang melihat ringkasan untuk ${data.scope.active_label}.`}
      actions={
        <>
          <Link href="/dashboard/reports" className="btn-accent w-full sm:w-auto">
            Ekspor laporan
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-primary w-full sm:w-auto"
          >
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </button>
        </>
      }
    >
      {data.multi_outlet.is_combined_scope ? (
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#002045,#0f2e27,#006a66)] p-6 text-white shadow-[0_24px_54px_rgba(0,32,69,0.18)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/80">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                Multi outlet
              </div>
              <h2 className="font-[var(--font-display-sans)] text-2xl font-extrabold">
                Monitor performa outlet dari satu dashboard
              </h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">
                Scope aktif: {data.scope.active_label}. Anda sedang melihat ringkasan gabungan beberapa cabang dalam satu dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[440px]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                  Cabang dalam cakupan
                </p>
                <p className="mt-2 text-3xl font-[var(--font-display-sans)] font-extrabold">
                  {data.scope.outlets.length}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                  Total cabang
                </p>
                <p className="mt-2 text-3xl font-[var(--font-display-sans)] font-extrabold">
                  {data.multi_outlet.owned_outlet_count}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                  Mode tampilan
                </p>
                <p className="mt-2 text-sm font-[var(--font-display-sans)] font-extrabold uppercase tracking-[0.18em] text-white">
                  Gabungan
                </p>
              </div>
            </div>
          </div>

          {data.multi_outlet.top_performing_outlet ? (
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-200">
                  Cabang Paling Produktif Bulan Ini
                </p>
                <h3 className="mt-2 text-xl font-[var(--font-display-sans)] font-extrabold">
                  {data.multi_outlet.top_performing_outlet.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-white/70">
                  Pendapatan tertinggi dalam periode {data.charts.revenue.period_label}.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                    Pendapatan
                  </p>
                  <p className="mt-2 text-xl font-[var(--font-display-sans)] font-extrabold">
                    {formatRupiah(data.multi_outlet.top_performing_outlet.revenue_total)}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-white/8 px-5 py-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                    Total pesanan
                  </p>
                  <p className="mt-2 text-xl font-[var(--font-display-sans)] font-extrabold">
                    {data.multi_outlet.top_performing_outlet.orders_total}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {data.multi_outlet.show_business_upsell ? (
        <section className="mb-8 rounded-[2rem] border border-purple-200 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-200">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h5l2 3h11M5 7v10a2 2 0 002 2h10a2 2 0 002-2v-7M8 17h8" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-600">
                  Fitur bisnis
                </p>
                <h3 className="mt-2 font-[var(--font-display-sans)] text-xl font-extrabold text-brand">
                  Laporan gabungan semua cabang tersedia di Business
                </h3>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-brand/65">
                  Paket Pro saat ini fokus pada cabang aktif. Upgrade ke Bisnis untuk melihat ringkasan gabungan semua cabang sekaligus.
                </p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-accent">
              Lihat paket Bisnis
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mb-8 rounded-[2rem] bg-surface-soft p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-[var(--font-display-sans)] font-bold text-brand">Filter cabang dan periode</h3>
              <p className="text-xs font-black uppercase tracking-widest text-brand/40">
                Scope: {data.scope.active_label}
              </p>
            </div>
          </div>

          <form action="/dashboard" className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              Cakupan aktif
            </div>
            <select name="month" defaultValue={String(data.filters.month)} className="field-soft !w-40">
              {monthLabels.map((label, index) => (
                <option key={label} value={String(index + 1)}>
                  {label}
                </option>
              ))}
            </select>
            <select name="year" defaultValue={String(data.filters.year)} className="field-soft !w-32">
              {data.filters.available_years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-secondary">
              Terapkan
            </button>
            <Link href="/dashboard" className="btn-primary">
              Segarkan
            </Link>
          </form>
        </div>
      </section>

      {data.multi_outlet.is_combined_scope && data.scope.outlets.length > 0 ? (
        <section className="mb-8 rounded-[2rem] border border-brand/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">
                Cabang Dalam Ringkasan
              </p>
              <h3 className="mt-2 font-[var(--font-display-sans)] text-xl font-extrabold text-brand">
                Dashboard ini sedang merangkum {data.scope.outlets.length} outlet sekaligus
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.scope.outlets.map((outlet) => (
                <span key={outlet.id} className="rounded-full bg-surface-soft px-4 py-2 text-xs font-bold text-brand/70">
                  {outlet.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article
            key={item.label}
            className="rounded-[1.7rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)] transition-all hover:shadow-[0_18px_38px_rgba(25,28,30,0.08)]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-[1rem] p-3 ${item.accentClass}`}>{item.icon}</div>
              <span className="text-xs font-bold text-accent">{item.stat}</span>
            </div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {item.label}
            </p>
            <h3 className="font-[var(--font-display-sans)] text-2xl font-bold tracking-[-0.03em] text-brand">
              {item.value}
            </h3>
          </article>
        ))}
      </section>

      <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="rounded-[1.8rem] bg-brand p-6 text-white shadow-[0_18px_40px_rgba(0,32,69,0.15)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
            Pesanan Bulanan
          </p>
          <p className="mt-3 text-5xl font-[var(--font-display-sans)] font-extrabold">
            {data.metrics.month_orders}
          </p>
          <p className="mt-2 text-sm text-white/70">{data.charts.revenue.period_label}</p>
        </article>
        <article className="rounded-[1.8rem] bg-accent p-6 text-white shadow-[0_18px_40px_rgba(0,106,102,0.16)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
            Pendapatan Bulanan
          </p>
          <p className="mt-3 text-4xl font-[var(--font-display-sans)] font-extrabold">
            {formatRupiah(data.metrics.month_revenue)}
          </p>
          <p className="mt-2 text-sm text-white/70">Pembayaran sukses periode aktif</p>
        </article>
        <article className="rounded-[1.8rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">
            Siap Diambil
          </p>
          <p className="mt-3 text-5xl font-[var(--font-display-sans)] font-extrabold text-brand">
            {data.metrics.ready_orders}
          </p>
          <p className="mt-2 text-sm text-muted">Pesanan yang sudah siap ditindaklanjuti outlet</p>
        </article>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-line/35 bg-white p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-[var(--font-display-sans)] text-xl font-bold text-brand">
                Performa pendapatan
              </h2>
              <p className="text-xs text-muted">
                Tren pendapatan harian selama {data.charts.revenue.period_label}
              </p>
            </div>
            <div className="rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand/60">
              {data.charts.revenue.period_label}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[72px_1fr]">
            <div className="hidden justify-between py-3 text-[10px] font-semibold text-slate-400 lg:flex lg:flex-col">
              {chartTicks.map((tick, index) => (
                <span key={`tick-${index}-${tick}`}>{formatRupiah(tick)}</span>
              ))}
            </div>
            <div className="relative h-[260px] w-full overflow-hidden rounded-[1.5rem] bg-surface-soft p-4">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 760 220">
                <line stroke="#dfe4e8" strokeWidth="1" x1="0" x2="760" y1="40" y2="40" />
                <line stroke="#dfe4e8" strokeWidth="1" x1="0" x2="760" y1="95" y2="95" />
                <line stroke="#dfe4e8" strokeWidth="1" x1="0" x2="760" y1="150" y2="150" />
                <line stroke="#dfe4e8" strokeWidth="1" x1="0" x2="760" y1="205" y2="205" />
                <defs>
                  <linearGradient id="dashboardAreaGradientLive" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#002045" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#002045" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {chartAreaPath ? <path d={chartAreaPath} fill="url(#dashboardAreaGradientLive)" /> : null}
                {chartLinePoints ? (
                  <polyline
                    points={chartLinePoints}
                    fill="none"
                    stroke="#002045"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                ) : null}
                {data.charts.revenue.data.map((value, index) => {
                  if (value <= 0 || data.charts.revenue.data.length < 4) return null;
                  const x = 12 + (index / Math.max(data.charts.revenue.data.length - 1, 1)) * (760 - 24);
                  const y = 220 - 18 - (value / Math.max(chartMax, 1)) * (220 - 36);
                  const shouldShow =
                    index === 0 ||
                    index === data.charts.revenue.data.length - 1 ||
                    index === Math.floor(data.charts.revenue.data.length / 2);

                  return shouldShow ? (
                    <circle key={`${index}-${value}`} cx={x} cy={y} r="4" fill="#84f5ee" stroke="#002045" strokeWidth="2" />
                  ) : null;
                })}
              </svg>

              <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto text-[10px] font-semibold text-slate-400">
                {data.charts.revenue.labels.map((label, index) => {
                  const shouldShow =
                    index === 0 ||
                    index === data.charts.revenue.labels.length - 1 ||
                    index % Math.max(1, Math.round(data.charts.revenue.labels.length / 6)) === 0;

                  return shouldShow ? (
                    <span key={label} className="min-w-6 text-center">
                      {label}
                    </span>
                  ) : (
                    <span key={label} className="min-w-6 opacity-0">
                      .
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[2rem] border border-line/35 bg-white p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-[var(--font-display-sans)] text-xl font-bold text-brand">
              Aktivitas outlet
            </h2>
            <Link href="/dashboard/orders" className="text-xs font-bold text-brand hover:underline">
              Lihat semua pesanan
            </Link>
          </div>

          <div className="space-y-4">
            {data.recent_orders.length > 0 ? (
              data.recent_orders.slice(0, 6).map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-[1.35rem] bg-surface-soft p-4 transition hover:bg-[rgba(129,242,235,0.16)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand">
                      {order.customer?.name ?? "Pelanggan umum"}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                      {order.invoice_number} · {order.outlet?.name ?? "Outlet"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-extrabold text-brand">{formatRupiah(order.total_price)}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                      {statusLabels[order.status] ?? order.status}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-surface-soft p-4 text-sm text-muted">
                Belum ada aktivitas pada periode ini.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <article className="rounded-[2rem] border border-line/35 bg-white p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-[var(--font-display-sans)] text-xl font-bold text-brand">
              Performa cabang
            </h2>
            <Link href="/dashboard/outlets" className="text-xs font-bold text-brand hover:underline">
              Kelola cabang
            </Link>
          </div>
          <div className="space-y-4">
            {data.multi_outlet.outlet_performance.length > 0 ? (
              data.multi_outlet.outlet_performance.map((outlet) => (
                <div key={outlet.id} className="rounded-[1.4rem] bg-surface-soft p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-brand">{outlet.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {outlet.orders_total} order · {outlet.ready_total} siap diambil · {outlet.pending_total} pending
                      </p>
                    </div>
                    <span className="status-chip-brand shrink-0">Scope aktif</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted">Revenue periode aktif</span>
                    <span className="font-bold text-accent">{formatRupiah(outlet.revenue_total)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-surface-soft p-4 text-sm text-muted">
                Belum ada outlet dalam scope user ini.
              </div>
            )}
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-[2rem] bg-brand p-8 text-white">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                Monitor outlet
              </p>
              <h2 className="mb-4 mt-3 font-[var(--font-display-sans)] text-2xl font-extrabold leading-tight tracking-tight">
                Kuasai operasional bisnis cuci sepatu Anda.
              </h2>
              <p className="max-w-[320px] text-sm leading-relaxed text-[#adc7f7]">
                Pantau performa cabang, tren pendapatan, dan aktivitas pesanan dari satu tempat yang mudah dipantau setiap hari.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/orders"
                className="w-fit rounded-full bg-white px-6 py-3 text-sm font-bold text-brand shadow-xl shadow-black/20 transition-transform group-hover:scale-105"
              >
                Buka pesanan
              </Link>
              <Link
                href="/dashboard/reports"
                className="w-fit rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/16"
              >
                Buka Laporan
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-brand-strong/30 blur-3xl transition-colors group-hover:bg-brand-strong/50" />
        </article>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.8rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
          <p className="section-label">Progress periode ini</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand">
            {completedOrders}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Order yang sudah mencapai status selesai dari aktivitas periode terpilih.
          </p>
        </article>

        <article className="rounded-[1.8rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
          <p className="section-label">Cabang dalam ringkasan</p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-brand">
            {data.scope.outlets.length} cabang aktif
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Ringkasan ini mengikuti cabang yang sedang bisa Anda akses saat ini.
          </p>
        </article>

        <article className="rounded-[1.8rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
          <p className="section-label">Performa pendapatan</p>
          <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-brand">
            {formatRupiah(chartMax)}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Puncak pendapatan harian yang tercatat pada periode {data.charts.revenue.period_label}.
          </p>
        </article>
      </section>
    </DashboardFrame>
  );
}
