import Link from "next/link";
import { LogoutPanel } from "@/components/logout-panel";

export const dynamic = "force-dynamic";

export default function LogoutPage() {
  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="section-block hero-card p-5 sm:p-7">
            <span className="eyebrow">Logout</span>
            <h1 className="headline mt-4">Keluar dari dashboard dengan aman.</h1>
            <p className="subcopy mt-4 max-w-2xl">
              Halaman ini menutup session Laravel yang sedang aktif, lalu membawa Anda
              kembali ke halaman login.
            </p>
            <div className="hero-badge-row mt-5">
              <span className="highlight-chip">Session clear</span>
              <span className="highlight-chip">Redirect ke login</span>
              <span className="highlight-chip">Aman untuk shared device</span>
            </div>

            <div className="mt-8">
              <LogoutPanel />
            </div>
          </section>

          <aside className="section-dark hero-card p-5 sm:p-7">
            <p className="section-label-dark">Quick links</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Setelah logout Anda bisa login kembali atau kembali ke storefront publik.
            </h2>
            <div className="info-list mt-5">
              <Link href="/login" className="kpi-pill-dark block">
                <p className="text-sm font-semibold">Ke halaman login</p>
                <p className="mt-1 text-sm text-white/72">
                  Masuk lagi ke dashboard operasional.
                </p>
              </Link>
              <Link href="/register" className="kpi-pill-dark block">
                <p className="text-sm font-semibold">Ke halaman register</p>
                <p className="mt-1 text-sm text-white/72">
                  Buka alur pendaftaran outlet baru.
                </p>
              </Link>
              <Link href="/" className="kpi-pill-dark block">
                <p className="text-sm font-semibold">Ke beranda</p>
                <p className="mt-1 text-sm text-white/72">
                  Kembali ke storefront publik customer-facing.
                </p>
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
