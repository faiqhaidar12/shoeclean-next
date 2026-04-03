import { SuperAdminFrame } from "@/components/superadmin-frame";
import {
  formatSuperAdminCurrency,
  formatSuperAdminDate,
  SuperAdminPagination,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminOrders, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function paramOf(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminOrdersPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminOrders({
      search: paramOf(params.search),
      outlet_id: paramOf(params.outlet_id),
      owner_id: paramOf(params.owner_id),
      status: paramOf(params.status),
      payment_status: paramOf(params.payment_status),
      page: paramOf(params.page),
    }),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="orders"
      eyebrow="Order Platform"
      title="Audit semua pesanan"
      description="Lihat pesanan lintas cabang, owner, status pengerjaan, dan status pembayaran dari satu halaman."
    >
      <section className="section-block p-5 sm:p-6">
        <form className="grid gap-4 lg:grid-cols-5">
          <input name="search" defaultValue={data.filters.search} placeholder="Cari invoice atau pelanggan" className="field-soft lg:col-span-2" />
          <select name="outlet_id" defaultValue={data.filters.outlet_id ?? ""} className="field-soft">
            <option value="">Semua cabang</option>
            {data.outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
          <select name="owner_id" defaultValue={data.filters.owner_id ?? ""} className="field-soft">
            <option value="">Semua owner</option>
            {data.owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={data.filters.status} className="field-soft">
            <option value="">Semua status pesanan</option>
            {data.statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select name="payment_status" defaultValue={data.filters.payment_status} className="field-soft lg:col-span-2">
            <option value="">Semua status pembayaran</option>
            {data.payment_statuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary lg:col-span-3">
            Terapkan filter
          </button>
        </form>
      </section>

      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[200px_160px_180px_180px_180px_120px_140px_120px_120px] gap-4 border-b border-black/5 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
              <div>Invoice</div>
              <div>Tanggal</div>
              <div>Pelanggan</div>
              <div>Cabang</div>
              <div>Owner</div>
              <div>Status</div>
              <div>Pembayaran</div>
              <div>Metode</div>
              <div className="text-right">Total</div>
            </div>
            {data.orders.data.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm font-semibold text-brand/45">
                Belum ada pesanan yang cocok dengan filter saat ini.
              </div>
            ) : (
              data.orders.data.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[200px_160px_180px_180px_180px_120px_140px_120px_120px] gap-4 border-b border-black/5 px-6 py-5"
                >
                  <div className="break-all text-sm font-bold text-brand">{order.invoice_number}</div>
                  <div className="text-sm font-semibold text-brand/60">{formatSuperAdminDate(order.created_at)}</div>
                  <div className="truncate text-sm font-semibold text-brand">{order.customer?.name ?? "-"}</div>
                  <div className="truncate text-sm font-semibold text-brand">{order.outlet?.name ?? "-"}</div>
                  <div className="truncate text-sm font-semibold text-brand">{order.owner?.name ?? "-"}</div>
                  <div>
                    <SuperAdminStatusBadge
                      label={order.status_label}
                      tone={order.status === "completed" || order.status === "picked_up" ? "emerald" : order.status === "cancelled" ? "rose" : "amber"}
                    />
                  </div>
                  <div>
                    <SuperAdminStatusBadge
                      label={order.payment_status_label}
                      tone={order.payment_status === "paid" ? "emerald" : order.payment_status === "waiting_confirmation" ? "amber" : "slate"}
                    />
                  </div>
                  <div className="truncate text-sm font-semibold uppercase text-brand/70">{order.payment_method}</div>
                  <div className="text-right font-[var(--font-display-sans)] text-base font-black tracking-[-0.06em] text-brand">
                    {formatSuperAdminCurrency(order.total_price)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <SuperAdminPagination
        basePath="/superadmin/orders"
        page={data.orders.current_page}
        lastPage={data.orders.last_page}
        searchParams={{
          search: data.filters.search,
          outlet_id: data.filters.outlet_id ? String(data.filters.outlet_id) : "",
          owner_id: data.filters.owner_id ? String(data.filters.owner_id) : "",
          status: data.filters.status,
          payment_status: data.filters.payment_status,
        }}
      />
    </SuperAdminFrame>
  );
}
