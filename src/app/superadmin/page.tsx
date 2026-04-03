import Link from "next/link";
import { SuperAdminFrame } from "@/components/superadmin-frame";
import {
  formatSuperAdminCurrency,
  formatSuperAdminDate,
  SuperAdminMetricCard,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminDashboard, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminDashboardPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminDashboard({
      month: pickParam(params.month),
      year: pickParam(params.year),
    }),
  ]);

  const maxRevenue = Math.max(...data.charts.revenue.data, 1);
  const maxGrowth = Math.max(...data.charts.growth.data, 1);

  return (
    <SuperAdminFrame
      session={session}
      current="dashboard"
      eyebrow="Superadmin Platform"
      title="Command Center"
      description="Pantau pertumbuhan outlet, pendapatan platform, pesanan terbaru, dan performa cabang dalam satu layar."
      actions={
        <>
          <a href="/api/superadmin/marketing-kit" className="btn-secondary">
            Unduh Marketing Kit
          </a>
          <Link href="/superadmin/payments" className="btn-primary">
            Lihat log transaksi
          </Link>
        </>
      }
    >
      <section className="section-block p-5 sm:p-6">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              Filter periode
            </p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
              Ringkasan platform
            </h2>
          </div>
          <select name="month" defaultValue={data.filters.month} className="field-soft">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2024, month - 1, 1).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>
          <select name="year" defaultValue={data.filters.year} className="field-soft">
            {data.filters.available_years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            Terapkan
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetricCard
          label="Total cabang"
          value={data.metrics.total_outlets}
          hint={`${data.metrics.active_outlets} aktif | ${data.metrics.inactive_outlets} nonaktif`}
        />
        <SuperAdminMetricCard
          label="Total owner"
          value={data.metrics.total_owners}
          hint={`${data.metrics.total_users} total akun`}
          tone="purple"
        />
        <SuperAdminMetricCard
          label="Total pelanggan"
          value={data.metrics.total_customers}
          hint={`${data.metrics.total_services} layanan aktif`}
          tone="light"
        />
        <SuperAdminMetricCard
          label="Total pesanan"
          value={data.metrics.total_orders.toLocaleString("id-ID")}
          hint="Sepanjang waktu"
          tone="indigo"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SuperAdminMetricCard
          label="Pendapatan hari ini"
          value={formatSuperAdminCurrency(data.metrics.today_revenue)}
          hint={`${data.metrics.today_orders} pesanan hari ini`}
          tone="emerald"
        />
        <SuperAdminMetricCard
          label="Pendapatan bulan ini"
          value={formatSuperAdminCurrency(data.metrics.month_revenue)}
          hint={`${data.metrics.month_orders} pesanan bulan ini`}
          tone="indigo"
        />
        <SuperAdminMetricCard
          label="Total revenue"
          value={formatSuperAdminCurrency(data.metrics.total_revenue)}
          hint="Sepanjang waktu"
          tone="light"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="section-block p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            6 bulan terakhir
          </p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
            Tren revenue platform
          </h2>
          <div className="mt-8 flex h-[280px] items-end gap-3">
            {data.charts.revenue.data.map((value, index) => (
              <div key={`${data.charts.revenue.labels[index]}-${index}`} className="flex flex-1 flex-col justify-end">
                <div
                  className="rounded-t-[1.4rem] bg-gradient-to-t from-[#312e81] to-[#8b5cf6]"
                  style={{ height: `${Math.max(14, (value / maxRevenue) * 100)}%` }}
                />
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-brand/40">
                  {data.charts.revenue.labels[index]}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="section-block p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            Cabang baru
          </p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
            Pertumbuhan outlet
          </h2>
          <div className="mt-8 flex h-[280px] items-end gap-3">
            {data.charts.growth.data.map((value, index) => (
              <div key={`${data.charts.growth.labels[index]}-${index}`} className="flex flex-1 flex-col justify-end">
                <div
                  className="rounded-t-[1.4rem] bg-gradient-to-t from-[#0f766e] to-[#14b8a6]"
                  style={{ height: `${Math.max(14, (value / maxGrowth) * 100)}%` }}
                />
                <p className="mt-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-brand/40">
                  {data.charts.growth.labels[index]}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section-block p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              Ranking revenue
            </p>
            <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
              Performa cabang
            </h2>
          </div>
          <span className="highlight-chip">
            {new Date(data.filters.year, data.filters.month - 1, 1).toLocaleString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[80px_minmax(220px,1fr)_180px_120px_120px_140px_140px] gap-4 border-b border-black/5 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
              <div>#</div>
              <div>Cabang</div>
              <div>Owner</div>
              <div>Status</div>
              <div className="text-right">Order bulan ini</div>
              <div className="text-right">Revenue bulan ini</div>
              <div className="text-right">Total revenue</div>
            </div>
            {data.outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="grid grid-cols-[80px_minmax(220px,1fr)_180px_120px_120px_140px_140px] gap-4 border-b border-black/5 px-6 py-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-brand">
                  {outlet.rank}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand">{outlet.name}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-brand/45">
                    {outlet.city_name || outlet.address || "-"}
                  </p>
                </div>
                <div className="text-sm font-semibold text-brand/70">{outlet.owner_name ?? "-"}</div>
                <div>
                  <SuperAdminStatusBadge
                    label={outlet.status === "active" ? "Aktif" : "Nonaktif"}
                    tone={outlet.status === "active" ? "emerald" : "rose"}
                  />
                </div>
                <div className="text-right font-bold text-brand">{outlet.month_orders}</div>
                <div className="text-right font-bold text-brand">
                  {formatSuperAdminCurrency(outlet.month_revenue)}
                </div>
                <div className="text-right font-bold text-brand">
                  {formatSuperAdminCurrency(outlet.total_revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              Seluruh platform
            </p>
            <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
              Pesanan terbaru
            </h2>
          </div>
          <Link href="/superadmin/orders" className="btn-secondary">
            Buka order platform
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {data.recent_orders.length === 0 ? (
            <div className="soft-panel p-5 text-sm font-semibold text-brand/50">
              Belum ada pesanan di platform.
            </div>
          ) : (
            data.recent_orders.map((order) => (
              <div key={order.id} className="soft-panel flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand">
                    {order.customer?.name ?? "Pelanggan"}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">
                    {order.invoice_number} | {order.outlet?.name ?? "-"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-[var(--font-display-sans)] text-lg font-black tracking-[-0.06em] text-brand">
                    {formatSuperAdminCurrency(order.total_price)}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                    {formatSuperAdminDate(order.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </SuperAdminFrame>
  );
}
