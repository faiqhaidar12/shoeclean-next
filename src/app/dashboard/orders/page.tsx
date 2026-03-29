import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { getOrders } from "@/lib/auth";
import { API_BASE_URL, ApiError } from "@/lib/api";
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
  paid: "text-emerald-700 bg-emerald-50",
  pending: "text-amber-700 bg-amber-50",
  failed: "text-red-700 bg-red-50",
  unpaid: "text-foreground bg-surface",
  waiting_confirmation: "text-amber-700 bg-amber-50",
};

export default async function DashboardOrdersPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data;

  try {
    data = await getOrders(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Daftar order belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="section-block hero-card p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="eyebrow">Orders Module</span>
                <h1 className="headline mt-4">Daftar order operasional.</h1>
                <p className="subcopy mt-4">
                  Halaman ini jadi pintu kerja utama untuk tim outlet: cari invoice,
                  cek customer, dan masuk ke detail order tanpa buka Livewire dulu.
                </p>
              </div>
              <div className="mobile-stack lg:self-start">
                <Link href="/dashboard" className="btn-secondary w-full sm:w-auto">
                  Dashboard
                </Link>
                <a
                  href={`${API_BASE_URL}/orders/create`}
                  className="btn-primary w-full sm:w-auto"
                >
                  Buat order lama
                </a>
              </div>
            </div>
          </header>

          <form action="/dashboard/orders" className="section-block p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <input
                type="text"
                name="search"
                defaultValue={params.search ?? ""}
                placeholder="Cari invoice, nama customer, atau nomor HP"
                className="field-soft"
              />
              <select
                name="status"
                defaultValue={params.status ?? ""}
                className="field-soft"
              >
                <option value="">Semua status</option>
                <option value="pending">Menunggu</option>
                <option value="processing">Diproses</option>
                <option value="ready">Selesai cuci</option>
                <option value="picked_up">Diambil</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <button type="submit" className="btn-accent w-full lg:w-auto">
                Terapkan
              </button>
            </div>
          </form>

          <section className="section-block p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Hasil pencarian</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {data.total} order ditemukan
                </h2>
              </div>
              <span className="highlight-chip">
                Halaman {data.current_page} dari {data.last_page}
              </span>
            </div>

            <div className="info-list mt-5">
              {data.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="soft-panel touch-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{order.invoice_number}</p>
                      <p className="mt-1 text-sm text-muted">
                        {order.customer?.name ?? "Customer umum"} •{" "}
                        {order.customer?.phone ?? "Tanpa nomor"}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {order.outlet?.name ?? "Outlet"} • {order.status_label}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-accent">
                        {formatRupiah(order.total_price)}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          paymentTone[order.payment_state] ?? paymentTone.unpaid
                        }`}
                      >
                        {order.payment_status_label}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {data.data.length === 0 ? (
                <div className="soft-panel p-4 text-sm text-muted">
                  Belum ada order yang cocok dengan filter ini.
                </div>
              ) : null}
            </div>

            <div className="mobile-stack mt-5">
              {data.current_page > 1 ? (
                <Link
                  href={`/dashboard/orders?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(data.current_page - 1),
                  }).toString()}`}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Halaman sebelumnya
                </Link>
              ) : null}
              {data.current_page < data.last_page ? (
                <Link
                  href={`/dashboard/orders?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(data.current_page + 1),
                  }).toString()}`}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Halaman berikutnya
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
