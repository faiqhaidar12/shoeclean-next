import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { ApiError, getPublicHome, type HomeResponse } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data: HomeResponse | null = null;
  let message = "";

  try {
    data = await getPublicHome();
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat data halaman publik.";
  }

  if (!data) {
    return <BackendUnavailable message={message} />;
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="mobile-stack items-start justify-between rounded-[1.6rem] border border-line bg-white/72 p-3 shadow-[0_18px_44px_-34px_rgba(31,23,18,0.26)] backdrop-blur-sm sm:items-center">
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                ShoeClean
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                Smart storefront
              </p>
            </div>
            <div className="mobile-stack w-full sm:w-auto">
              <Link href="/login" className="btn-secondary w-full sm:w-auto">
                Login
              </Link>
              <Link href="/register" className="btn-secondary w-full sm:w-auto">
                Register
              </Link>
              <Link href="/track" className="btn-secondary w-full sm:w-auto">
                Lacak pesanan
              </Link>
              <Link href="/pricing" className="btn-secondary w-full sm:w-auto">
                Lihat paket
              </Link>
            </div>
          </header>

          <div className="hero-grid">
            <section className="section-block hero-card p-5 sm:p-7 lg:p-8">
              <span className="eyebrow">{data.hero.badge}</span>
              <h1 className="headline mt-4 max-w-4xl">
                {data.hero.title}
              </h1>
              <p className="subcopy mt-4 max-w-2xl">{data.hero.description}</p>

              <div className="hero-badge-row mt-5">
                <span className="highlight-chip">Responsif di smartphone</span>
                <span className="highlight-chip">Tracking real-time</span>
                <span className="highlight-chip">Order langsung ke outlet</span>
              </div>

              <div className="mobile-stack mt-6">
                <Link href="/order" className="btn-accent w-full sm:w-auto">
                  Pilih outlet
                </Link>
                <Link href="/pricing" className="btn-primary w-full sm:w-auto">
                  {data.hero.secondary_cta.label}
                </Link>
                <a
                  href={`${process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}${data.hero.primary_cta.href}`}
                  className="btn-secondary w-full sm:w-auto"
                >
                  {data.hero.primary_cta.label}
                </a>
              </div>

              <div className="kpi-strip mt-7">
                <article className="kpi-pill">
                  <p className="section-label">
                    Outlet tampil
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {data.outlets.length}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">
                    Layanan unggulan
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {data.services.length}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">
                    Order flow
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    Mobile-ready
                  </p>
                </article>
              </div>
            </section>

            <section className="section-dark hero-card overflow-hidden">
              <div className="relative h-full px-5 py-6 sm:px-7 sm:py-7">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
                <div className="absolute -bottom-10 left-0 h-24 w-24 rounded-full bg-[#ffcfb7]/20 blur-2xl" />
                <div className="relative">
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/78">
                    Quick tracking
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
                    Tracking invoice yang cepat dan jelas untuk customer HP.
                  </h2>
                  <p className="subcopy-dark mt-3">
                    Buka progres order, status pembayaran, dan detail outlet
                    tanpa perlu tanya admin berkali-kali.
                  </p>

                  <div className="hero-badge-row mt-5">
                    <span className="highlight-chip-dark">Invoice sekali input</span>
                    <span className="highlight-chip-dark">Status mudah dibaca</span>
                    <span className="highlight-chip-dark">Aman untuk layar kecil</span>
                  </div>

                  <form action="/track" className="mt-6 space-y-3">
                    <input
                      type="text"
                      name="invoice"
                      placeholder="Contoh: INV/20260326/5/0004"
                      className="field border-white/10 bg-white text-foreground"
                    />
                    <button type="submit" className="btn-primary w-full">
                      Cek progress sekarang
                    </button>
                  </form>

                  <div className="info-list mt-6">
                    {data.features.map((feature) => (
                      <div key={feature.title} className="kpi-pill-dark">
                        <p className="text-sm font-semibold">{feature.title}</p>
                        <p className="mt-1 text-sm leading-6 text-white/70">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="section-block p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Outlet publik
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Cabang aktif yang siap menerima order.
                  </h2>
                </div>
                <Link href="/order" className="btn-secondary hidden sm:inline-flex">
                  Semua outlet
                </Link>
              </div>

              <div className="info-list mt-6">
                {data.outlets.map((outlet) => (
                  <Link
                    key={outlet.id}
                    href={`/order/${outlet.slug}?skipBranch=1`}
                    className="soft-panel touch-card p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-foreground">
                          {outlet.name}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {outlet.address || "Alamat outlet belum tersedia."}
                        </p>
                      </div>
                      <div className="shrink-0 space-y-2 text-right">
                        <span className="block rounded-full bg-[#edf4f1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                          {outlet.services_count} layanan
                        </span>
                        {outlet.has_qris ? (
                          <span className="block rounded-full bg-[#fff0e7] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                            qris
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <p className="section-label">Siap dipilih</p>
                      <span className="text-sm font-semibold text-brand">Masuk outlet</span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href="/order" className="btn-secondary mt-5 w-full sm:hidden">
                Lihat semua outlet
              </Link>
            </section>

            <section className="section-block p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Layanan unggulan
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Harga dan layanan yang mudah dipahami customer.
              </h2>

              <div className="info-list mt-6">
                {data.services.map((service) => (
                  <article key={service.id} className="soft-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {service.name}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {service.outlet?.name ?? "Outlet belum tersedia"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-accent">
                          {formatRupiah(service.price)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                          per {service.unit}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
