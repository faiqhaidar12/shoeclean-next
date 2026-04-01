import Link from "next/link";

const previews = [
  {
    title: "Landing Page",
    href: "/stitch-reference/landing.html",
    note: "Versi publik utama dari Stitch.",
  },
  {
    title: "Harga Langganan",
    href: "/stitch-reference/pricing.html",
    note: "Pricing statis persis seperti Stitch.",
  },
  {
    title: "Lacak Pesanan",
    href: "/stitch-reference/track.html",
    note: "Tracking screen statis dari Stitch.",
  },
  {
    title: "Masuk Admin",
    href: "/stitch-reference/login.html",
    note: "Portal login admin statis dari Stitch.",
  },
  {
    title: "Pendaftaran Admin",
    href: "/stitch-reference/register.html",
    note: "Screen register admin statis dari Stitch.",
  },
  {
    title: "Ringkasan Dasbor",
    href: "/stitch-reference/dashboard.html",
    note: "Dashboard admin statis dari Stitch.",
  },
  {
    title: "Manajemen Pesanan & Pelanggan",
    href: "/stitch-reference/orders-customers.html",
    note: "Acuan untuk orders dan customers.",
  },
  {
    title: "Buat Pesanan Baru",
    href: "/stitch-reference/new-order.html",
    note: "Acuan untuk create order internal.",
  },
  {
    title: "Manajemen Layanan & Staf",
    href: "/stitch-reference/services-team.html",
    note: "Acuan untuk services dan team.",
  },
  {
    title: "Manajemen Keuangan & Promo",
    href: "/stitch-reference/finance-promos.html",
    note: "Acuan untuk expenses dan promos.",
  },
  {
    title: "Manajemen Cabang",
    href: "/stitch-reference/outlets.html",
    note: "Acuan untuk modul outlets.",
  },
];

export default function StitchPreviewPage() {
  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <header className="section-block p-6 sm:p-8">
            <span className="eyebrow">Stitch Baseline</span>
            <h1 className="headline mt-4">Preview statis langsung dari HTML Stitch.</h1>
            <p className="subcopy mt-4 max-w-3xl">
              Halaman ini menampilkan output HTML Stitch mentah sebagai baseline visual. Jadi kita bisa cocokkan desain dulu sebelum saya translasi ulang satu per satu ke komponen Next yang dinamis.
            </p>
            <div className="mobile-stack mt-6">
              <Link href="/" className="btn-secondary w-full sm:w-auto">
                Kembali ke app
              </Link>
              <a
                href="/stitch-reference/landing.html"
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full sm:w-auto"
              >
                Buka landing Stitch
              </a>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {previews.map((preview) => (
              <article key={preview.href} className="section-block p-5">
                <p className="section-label">Static preview</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-brand">
                  {preview.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">{preview.note}</p>
                <a
                  href={preview.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-accent mt-6 w-full"
                >
                  Buka HTML Stitch
                </a>
              </article>
            ))}
          </section>

          <section className="section-block p-4 sm:p-5">
            <p className="section-label">Live embed</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
              Landing Stitch sebagai acuan visual utama
            </h2>
            <div className="mt-5 overflow-hidden rounded-[1.8rem] bg-white shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
              <iframe
                src="/stitch-reference/landing.html"
                title="Stitch Landing Preview"
                className="h-[900px] w-full bg-white"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
