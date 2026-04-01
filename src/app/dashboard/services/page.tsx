import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getServices } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    outlet_id?: string;
    page?: string;
  }>;
};

export default async function DashboardServicesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getServices>>;

  try {
    data = await getServices(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Daftar layanan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const activeServices = data.services.data.filter((service) => service.status === "active").length;
  const highestPrice =
    data.services.data.length > 0 ? Math.max(...data.services.data.map((service) => service.price)) : 0;

  return (
    <DashboardFrame
      current="services"
      eyebrow="Katalog Layanan"
      title="Susun layanan unggulan outlet."
      description="Rapikan struktur layanan, harga, dan status aktif agar tim kasir dan storefront memakai katalog yang selalu sinkron."
      actions={
        <Link href="/dashboard/services/create" className="btn-primary w-full sm:w-auto">
          Tambah layanan
        </Link>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Jumlah layanan</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {data.services.total}
          </p>
          <p className="mt-2 text-sm text-muted">Layanan aktif dan cadangan yang tersedia di seluruh outlet terpilih.</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Layanan aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {activeServices}
          </p>
          <p className="mt-2 text-sm text-muted">Unit layanan yang sekarang bisa langsung dipakai saat order dibuat.</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Harga tertinggi</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
            {formatRupiah(highestPrice)}
          </p>
          <p className="mt-2 text-sm text-white/72">
            Membantu owner melihat positioning premium di katalog layanan saat ini.
          </p>
        </article>
      </section>

      <form action="/dashboard/services" className="section-block p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter katalog</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
              Temukan layanan yang ingin dirapikan
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Cari nama layanan, saring per outlet, lalu buka detail layanan untuk update harga, unit, atau status.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari nama layanan"
            className="field-soft"
          />
          <select name="status" defaultValue={params.status ?? data.filters.status ?? ""} className="field-soft">
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select
            name="outlet_id"
            defaultValue={params.outlet_id ?? String(data.filters.outlet_id ?? "")}
            className="field-soft"
          >
            <option value="">Semua outlet</option>
            {data.outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-accent w-full lg:w-auto">
            Terapkan
          </button>
        </div>
      </form>

      <section className="section-block p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori layanan</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
              {data.services.total} layanan siap dipakai
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Buka salah satu layanan untuk mengubah harga atau menonaktifkannya tanpa perlu kembali ke dashboard Laravel lama.
            </p>
          </div>
          <span className="highlight-chip">
            Halaman {data.services.current_page} dari {data.services.last_page}
          </span>
        </div>

        <div className="dashboard-panel-stack mt-6 lg:hidden">
          {data.services.data.map((service) => (
            <Link
              key={service.id}
              href={`/dashboard/services/${service.id}`}
              className="soft-panel block p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{service.name}</p>
                  <p className="mt-1 text-sm text-muted">{service.outlet?.name ?? "Outlet utama"}</p>
                </div>
                <span
                  className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                    service.status === "active" ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                  }`}
                >
                  {service.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/30">Harga</p>
                  <p className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
                    {formatRupiah(service.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/30">Unit</p>
                  <p className="mt-2 font-semibold text-foreground">{service.unit}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 hidden lg:block">
          <div className="overflow-x-auto rounded-[1.75rem] border border-line/40">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[minmax(260px,1.5fr)_minmax(220px,1fr)_180px_140px_140px] gap-4 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                <span>Layanan</span>
                <span>Outlet</span>
                <span>Harga</span>
                <span>Unit</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-line/35">
                {data.services.data.map((service) => (
                  <Link
                    key={service.id}
                    href={`/dashboard/services/${service.id}`}
                    className="grid grid-cols-[minmax(260px,1.5fr)_minmax(220px,1fr)_180px_140px_140px] gap-4 px-6 py-5 transition hover:bg-slate-50/90"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{service.name}</p>
                      <p className="mt-1 truncate text-sm text-muted">Klik untuk mengubah harga atau status layanan</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{service.outlet?.name ?? "Outlet utama"}</p>
                      <p className="mt-1 truncate text-sm text-muted">Katalog cabang</p>
                    </div>
                    <div className="font-semibold text-brand">{formatRupiah(service.price)}</div>
                    <div className="font-semibold text-foreground">{service.unit}</div>
                    <div className="flex items-start">
                      <span
                        className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                          service.status === "active" ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                        }`}
                      >
                        {service.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {data.services.data.length === 0 ? (
          <div className="soft-panel mt-6 p-5 text-sm text-muted">Belum ada layanan yang cocok dengan filter ini.</div>
        ) : null}

        <div className="mobile-stack mt-6">
          {data.services.current_page > 1 ? (
            <Link
              href={`/dashboard/services?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                ...(params.status ? { status: params.status } : {}),
                ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                page: String(data.services.current_page - 1),
              }).toString()}`}
              className="btn-secondary w-full sm:w-auto"
            >
              Halaman sebelumnya
            </Link>
          ) : null}
          {data.services.current_page < data.services.last_page ? (
            <Link
              href={`/dashboard/services?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                ...(params.status ? { status: params.status } : {}),
                ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                page: String(data.services.current_page + 1),
              }).toString()}`}
              className="btn-secondary w-full sm:w-auto"
            >
              Halaman berikutnya
            </Link>
          ) : null}
        </div>
      </section>
    </DashboardFrame>
  );
}
