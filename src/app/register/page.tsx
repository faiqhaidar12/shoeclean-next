import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="section-block hero-card p-5 sm:p-7">
            <span className="eyebrow">Create Account</span>
            <h1 className="headline mt-4">Buat akun baru untuk outlet Anda.</h1>
            <p className="subcopy mt-4 max-w-2xl">
              Registrasi masih memakai form Laravel existing supaya alur owner,
              verifikasi email, dan setup awal outlet tetap aman sambil migrasi berjalan.
            </p>
            <div className="hero-badge-row mt-5">
              <span className="highlight-chip">Flow existing tetap aman</span>
              <span className="highlight-chip">Setup owner tetap dipakai</span>
              <span className="highlight-chip">Bisa dipindah penuh nanti</span>
            </div>

            <div className="mobile-stack mt-8">
              <a href={`${API_BASE_URL}/register`} className="btn-primary w-full sm:w-auto">
                Buka form register
              </a>
              <Link href="/login" className="btn-secondary w-full sm:w-auto">
                Sudah punya akun
              </Link>
            </div>
          </section>

          <aside className="section-dark hero-card p-5 sm:p-7">
            <p className="section-label-dark">Status migrasi auth</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Login sudah native di Next, register masih dialihkan ke Laravel dulu.
            </h2>
            <div className="info-list mt-5">
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Login</p>
                <p className="mt-1 text-sm text-white/72">
                  Sudah jalan lewat session Laravel yang dipakai ulang.
                </p>
              </div>
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Register</p>
                <p className="mt-1 text-sm text-white/72">
                  Sementara diarahkan ke form lama agar onboarding tetap stabil.
                </p>
              </div>
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Next step</p>
                <p className="mt-1 text-sm text-white/72">
                  Setelah ini kita bisa pecah API register kalau memang ingin full Next.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
