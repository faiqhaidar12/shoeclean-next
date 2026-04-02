import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getOrders } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

const paymentTone: Record<string, string> = {
  paid: "bg-[rgba(129,242,235,0.24)] text-accent-ink",
  pending: "bg-[#fff6dd] text-[#956d00]",
  failed: "bg-[#ffe7e3] text-[#a52b17]",
  unpaid: "bg-surface-muted text-muted",
  waiting_confirmation: "bg-[#fff6dd] text-[#956d00]",
};

const statusTone: Record<string, string> = {
  pending: "bg-surface-muted text-muted",
  processing: "bg-[rgba(129,242,235,0.24)] text-accent-ink",
  ready: "bg-[rgba(0,32,69,0.1)] text-brand",
  picked_up: "bg-[rgba(0,32,69,0.1)] text-brand",
  completed: "bg-[rgba(129,242,235,0.24)] text-accent-ink",
  cancelled: "bg-[#ffe7e3] text-[#a52b17]",
};

export default async function DashboardOrdersPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getOrders>>;

  try {
    data = await getOrders(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Daftar pesanan belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  const totalRevenue = data.data.reduce((sum, order) => sum + order.total_price, 0);
  const readyCount = data.data.filter((order) => order.status === "ready").length;
  const processingCount = data.data.filter((order) => order.status === "processing").length;

  return (
    <DashboardFrame
      current="orders"
      eyebrow="Pusat Pesanan"
      title="Pesanan dan pelanggan dalam satu alur kerja"
      description="Pantau antrean pesanan, pelanggan, dan pembayaran dari satu halaman yang rapi dan mudah dipakai tim."
    >
      <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            Konsol pesanan
          </h2>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Pantau antrean pesanan, pelanggan, dan pembayaran dari satu panel yang mudah dipakai setiap hari.
          </p>
        </div>

        <div className="inline-flex w-full flex-wrap rounded-[1rem] bg-surface-muted p-1 sm:w-auto">
          <button className="rounded-[0.8rem] bg-white px-5 py-2 text-sm font-bold text-brand shadow-sm">
            Antrean pesanan
          </button>
          <Link
            href="/dashboard/customers"
            className="rounded-[0.8rem] px-5 py-2 text-sm font-medium text-muted transition hover:text-brand"
          >
            Data pelanggan
          </Link>
        </div>
      </section>

      <section className="mb-8 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
        <form action="/dashboard/orders" className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari invoice, customer, atau nomor HP"
            className="field-soft w-full min-w-0 xl:min-w-[260px] xl:flex-1"
          />

          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="field-soft w-full min-w-0 xl:min-w-[180px]"
          >
            <option value="">Semua aktif</option>
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="ready">Siap</option>
            <option value="picked_up">Diambil</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <button type="submit" className="btn-secondary w-full sm:w-auto">
            Terapkan
          </button>

          <Link href="/dashboard/orders" className="btn-secondary w-full sm:w-auto">
            Hapus filter
          </Link>
        </form>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/dashboard/reports" className="btn-secondary px-4 py-3">
            Laporan
          </Link>
          <Link href="/dashboard/orders/create" className="btn-accent px-4 py-3">
            Pesanan baru
          </Link>
        </div>
      </section>

      <section className="grid gap-8">
        <div>
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_16px_34px_rgba(25,28,30,0.05)] sm:p-8">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="h-8 w-2 rounded-full bg-accent" />
                <div>
                  <h3 className="font-[var(--font-display-sans)] text-xl font-bold text-brand">
                    Alur pesanan langsung
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    {data.total} pesanan ditemukan
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    Nilai halaman ini
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                    {formatRupiah(totalRevenue)}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    Sedang diproses
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                    {processingCount}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    Siap / selesai
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                    {readyCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {data.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="rounded-[1.5rem] border border-surface-muted bg-surface-soft p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-sm font-bold text-brand">
                        {order.invoice_number}
                      </p>
                      <p className="mt-1 text-xs text-muted">Pesanan #{order.id}</p>
                    </div>
                    <span className="inline-flex rounded-[0.9rem] bg-white px-3 py-2 text-xs font-semibold text-brand shadow-sm transition">
                      Detail
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Pelanggan
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {order.customer?.name ?? "Pelanggan umum"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {order.customer?.phone ?? "Tanpa nomor"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Outlet
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {order.outlet?.name ?? "Cabang"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Status
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] ${
                          statusTone[order.status] ?? "bg-surface-muted text-muted"
                        }`}
                      >
                        {order.status_label}
                      </span>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Pembayaran
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] ${
                            paymentTone[order.payment_state] ?? paymentTone.unpaid
                          }`}
                        >
                          {order.payment_status_label}
                        </span>
                        {order.has_payment_proof ? (
                          <span className="inline-flex rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1d5fa8]">
                            Bukti bayar
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4 border-t border-surface-muted pt-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        Total
                      </p>
                      <p className="mt-2 text-lg font-bold text-brand">
                        {formatRupiah(order.total_price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="overflow-x-auto">
              <div className="min-w-[1160px]">
              <div className="grid grid-cols-[220px_220px_180px_170px_190px_150px_120px] gap-4 px-5 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                <span>Invoice</span>
                <span>Pelanggan</span>
                <span>Outlet</span>
                <span>Status</span>
                <span>Pembayaran</span>
                <span>Jumlah</span>
                <span className="text-right">Aksi</span>
              </div>

              <div className="space-y-4">
                {data.data.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="group grid grid-cols-[220px_220px_180px_170px_190px_150px_120px] items-center gap-4 rounded-[1.55rem] border border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fb_100%)] px-5 py-5 shadow-[0_10px_24px_rgba(25,28,30,0.04)] transition-all hover:-translate-y-[1px] hover:border-[rgba(0,32,69,0.08)] hover:shadow-[0_18px_38px_rgba(25,28,30,0.08)]"
                  >
                    <div>
                      <p className="font-mono text-sm font-bold text-brand">
                        {order.invoice_number}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Pesanan #{order.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                      {order.customer?.name ?? "Pelanggan umum"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {order.customer?.phone ?? "Tanpa nomor"}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {order.outlet?.name ?? "Cabang"}
                    </p>

                    <div className="flex items-start">
                      <span
                        className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-bold uppercase tracking-[0.15em] ${
                          statusTone[order.status] ?? "bg-surface-muted text-muted"
                        }`}
                      >
                        {order.status_label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span
                        className={`inline-flex min-h-8 w-fit items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-bold uppercase tracking-[0.15em] ${
                          paymentTone[order.payment_state] ?? paymentTone.unpaid
                        }`}
                      >
                        {order.payment_status_label}
                      </span>
                      {order.has_payment_proof ? (
                        <span className="inline-flex min-h-8 w-fit items-center whitespace-nowrap rounded-full bg-[#eef6ff] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1d5fa8]">
                          Bukti bayar
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm font-bold text-brand">
                      {formatRupiah(order.total_price)}
                    </p>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm transition group-hover:bg-brand group-hover:text-white">
                        Buka
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                          <path d="M4.5 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
              </div>
            </div>

            {data.data.length === 0 ? (
              <div className="mt-6 rounded-[1.4rem] bg-surface-soft p-5 text-sm text-muted">
                Belum ada pesanan yang cocok dengan filter ini.
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-4 border-t border-surface-muted pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Menampilkan halaman {data.current_page} dari {data.last_page}
              </p>

              <div className="flex gap-2">
                {data.current_page > 1 ? (
                  <Link
                    href={`/dashboard/orders?${new URLSearchParams({
                      ...(params.search ? { search: params.search } : {}),
                      ...(params.status ? { status: params.status } : {}),
                      page: String(data.current_page - 1),
                    }).toString()}`}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-[0.9rem] bg-surface-soft px-4 text-sm font-semibold text-brand transition hover:bg-surface-muted"
                  >
                    Sebelumnya
                  </Link>
                ) : null}

                {data.current_page < data.last_page ? (
                  <Link
                    href={`/dashboard/orders?${new URLSearchParams({
                      ...(params.search ? { search: params.search } : {}),
                      ...(params.status ? { status: params.status } : {}),
                      page: String(data.current_page + 1),
                    }).toString()}`}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-[0.9rem] bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-strong"
                  >
                    Berikutnya
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] bg-surface-soft p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-[var(--font-display-sans)] text-xl font-bold text-brand">
                Denyut pendapatan
              </h3>
              <p className="mt-1 text-sm text-muted">
                Ringkasan singkat berdasarkan data order pada halaman ini.
              </p>
            </div>
            <span className="inline-flex rounded-full bg-[rgba(129,242,235,0.24)] px-3 py-1 text-xs font-bold text-accent-ink">
              Aktivitas live
            </span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Total pesanan
              </p>
              <p className="mt-2 text-3xl font-black text-brand">{data.total}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Rata-rata order
              </p>
              <p className="mt-2 text-3xl font-black text-brand">
                {data.data.length ? formatRupiah(Math.round(totalRevenue / data.data.length)) : formatRupiah(0)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Tingkat penyelesaian
              </p>
              <p className="mt-2 text-3xl font-black text-brand">
                {data.data.length ? Math.round(((readyCount + data.data.filter((order) => order.status === "completed").length) / data.data.length) * 100) : 0}
                %
              </p>
            </div>
          </div>
        </section>
      </section>
    </DashboardFrame>
  );
}

