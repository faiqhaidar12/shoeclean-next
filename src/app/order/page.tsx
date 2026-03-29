import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { ApiError, getPublicOutlets, type StorefrontListResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

type OrderListPageProps = {
  searchParams?: Promise<{
    search?: string;
    province_id?: string;
    city_id?: string;
  }>;
};

export default async function OrderListPage({
  searchParams,
}: OrderListPageProps) {
  let data: StorefrontListResponse | null = null;
  let message = "";

  try {
    const params = (await searchParams) ?? {};
    data = await getPublicOutlets(params);
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat daftar outlet.";
  }

  if (!data) {
    return (
      <BackendUnavailable
        title="Daftar outlet belum bisa dimuat"
        message={message}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="section-block p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="eyebrow">Official Storefront</span>
                <h1 className="headline mt-4">
                  Pilih outlet yang paling nyaman untuk customer mobile.
                </h1>
                <p className="subcopy mt-4">
                  Flow ini dirancang agar customer bisa cari cabang, pilih layanan,
                  lalu order langsung dari smartphone dengan langkah yang sederhana.
                </p>
                <div className="hero-badge-row mt-5">
                  <span className="highlight-chip">Cari cabang lebih cepat</span>
                  <span className="highlight-chip">Filter wilayah</span>
                  <span className="highlight-chip">Checkout ringkas</span>
                </div>
              </div>
              <div className="mobile-stack lg:self-start">
                <Link href="/" className="btn-secondary w-full sm:w-auto">
                  Beranda
                </Link>
                <Link href="/track" className="btn-accent w-full sm:w-auto">
                  Lacak invoice
                </Link>
              </div>
            </div>
          </header>

          <form className="section-block hero-card p-4 sm:p-5" action="/order">
            <div className="grid gap-3 lg:grid-cols-[1fr_210px_210px_auto]">
              <input
                type="text"
                name="search"
                defaultValue={data.filters.search}
                placeholder="Cari nama outlet atau alamat"
                className="field-soft"
              />
              <select
                name="province_id"
                defaultValue={data.filters.province_id ?? ""}
                className="field-soft"
              >
                <option value="">Semua provinsi</option>
                {data.provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                name="city_id"
                defaultValue={data.filters.city_id ?? ""}
                className="field-soft"
              >
                <option value="">Semua kota</option>
                {data.cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary w-full lg:w-auto">
                Cari outlet
              </button>
            </div>
          </form>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.outlets.map((outlet) => (
              <Link
                key={outlet.id}
                href={`/order/${outlet.slug}?skipBranch=1`}
                className="section-block hero-card touch-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-white">
                    {outlet.name.charAt(0)}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className="rounded-full bg-[#edf4f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      aktif
                    </span>
                    {outlet.has_qris ? (
                      <span className="rounded-full bg-[#fff0e7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                        qris
                      </span>
                    ) : null}
                  </div>
                </div>

                <h2 className="mt-5 text-2xl font-semibold">{outlet.name}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {outlet.address || "Alamat outlet belum tersedia."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {outlet.services_count} layanan
                  </span>
                  {outlet.pickup_fee > 0 ? (
                    <span className="rounded-full bg-surface px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      pickup
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <p className="section-label">
                    Mulai order
                  </p>
                  <span className="text-sm font-semibold text-brand">
                    Buka outlet
                  </span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
