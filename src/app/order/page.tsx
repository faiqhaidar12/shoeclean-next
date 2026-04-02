import Link from "next/link";
import { PublicBottomNav } from "@/components/public-bottom-nav";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8 3-3.8-3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M5 9.5 6.3 5h11.4L19 9.5M6 9.5h12v8.75A1.75 1.75 0 0 1 16.25 20H7.75A1.75 1.75 0 0 1 6 18.25z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 20s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function QrisIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M14 14h2v2h-2zM17 17h2v2h-2zM16 14v5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M4.5 10h11m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function OrderListPage({ searchParams }: OrderListPageProps) {
  const session = await getOptionalAuthSession();
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
    <>
      <PublicTopNav current="order" authenticated={session?.authenticated} />

      <main className="public-main-shell">
        <section className="public-hero-intro tablet-balance-grid motion-enter lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="motion-enter motion-delay-1 max-w-4xl">
            <p className="eyebrow">Pilih outlet</p>
            <h1 className="mt-6 text-[2.5rem] font-semibold tracking-[-0.05em] text-brand sm:text-[4rem] sm:leading-[1.02]">
              Pilih outlet yang paling nyaman untuk <span className="text-accent">menitipkan sepatu Anda</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              Cari outlet terdekat, lihat layanan yang tersedia, lalu lanjutkan pemesanan dengan cepat langsung dari ponsel Anda.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="highlight-chip">Cari cabang lebih cepat</span>
              <span className="highlight-chip">Filter wilayah</span>
              <span className="highlight-chip">Lanjut pesan dalam beberapa langkah</span>
            </div>
          </div>

          <aside className="tablet-balance-card motion-enter motion-delay-2 bg-brand text-white shadow-[0_24px_54px_rgba(0,32,69,0.18)]">
            <p className="section-label-dark">Cara pesan</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Mulai dari memilih outlet, lalu lanjut isi pesanan dalam beberapa langkah singkat.
            </h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                1. Temukan cabang terdekat
              </div>
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                2. Lihat layanan dan biaya
              </div>
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                3. Kirim pesanan ke outlet pilihan
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/track" className="btn-accent">
                Lacak pesanan
              </Link>
              <Link href="/" className="btn-secondary bg-white/12 text-white hover:bg-white/18">
                Kembali
              </Link>
            </div>
          </aside>
        </section>

        <section className="tablet-balance-card motion-enter motion-delay-2 mt-10 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label">Cari outlet</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                Temukan outlet yang paling sesuai untuk Anda.
              </h2>
            </div>
            <span className="status-chip-brand w-fit">Siap pesan</span>
          </div>

          <form action="/order" className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_220px_220px_auto]">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                <SearchIcon />
              </div>
              <input
                type="text"
                name="search"
                defaultValue={data.filters.search}
                placeholder="Cari nama outlet atau alamat"
                className="field-soft pl-12"
              />
            </div>

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

            <button type="submit" className="btn-primary w-full md:col-span-2 xl:col-span-1 xl:w-auto">
              Cari outlet
            </button>
          </form>
        </section>

        <section className="motion-enter motion-delay-3 mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.outlets.map((outlet) => (
            <Link
              key={outlet.id}
              href={`/order/${outlet.slug}?skipBranch=1`}
              className="group motion-enter-fast rounded-[2rem] bg-white p-5 shadow-[0_18px_38px_rgba(25,28,30,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_52px_rgba(25,28,30,0.08)]"
              style={{ animationDelay: `${0.06 * ((data.outlets.indexOf(outlet) % 6) + 1)}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(0,32,69,0.08)] text-brand">
                  <StoreIcon />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                <span className="status-chip-mint">Buka</span>
                  {outlet.has_qris ? <span className="status-chip-brand">QRIS</span> : null}
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-brand">
                {outlet.name}
              </h2>

              <div className="mt-4 flex items-start gap-3 text-sm text-muted">
                <span className="mt-0.5 text-accent">
                  <LocationIcon />
                </span>
                <p className="leading-7">
                  {outlet.address || "Alamat outlet belum tersedia."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  {outlet.services_count} layanan
                </span>
                {outlet.pickup_fee > 0 ? (
                  <span className="rounded-full bg-surface-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Jemput tersedia
                  </span>
                ) : null}
                {outlet.has_qris ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    <QrisIcon />
                    QRIS
                  </span>
                ) : null}
              </div>

              <div className="mt-6 border-t border-surface-muted pt-4">
                <div className="flex items-center justify-between gap-4 text-sm font-semibold">
                  <span className="text-muted">Lihat detail outlet</span>
                  <span className="inline-flex items-center gap-2 text-brand transition group-hover:text-accent">
                    Pesan di sini
                    <ArrowRightIcon />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {data.outlets.length === 0 ? (
          <section className="motion-enter motion-delay-4 mt-8 rounded-[2rem] bg-white p-8 text-center shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-brand">
              Outlet belum ditemukan
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Coba ganti kata kunci pencarian atau pilih wilayah yang berbeda.
            </p>
          </section>
        ) : null}
      </main>

      <PublicBottomNav current="order" />
    </>
  );
}




