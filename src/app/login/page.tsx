import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { getAuthSession } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  try {
    await getAuthSession();
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Layanan login belum terhubung"
          message={error.message}
        />
      );
    }
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="section-block hero-card p-5 sm:p-7">
            <span className="eyebrow">Staff Access</span>
            <h1 className="headline mt-4">Masuk ke dashboard operasional.</h1>
            <p className="subcopy mt-4 max-w-2xl">
              Login ini memakai session Laravel yang sama dengan aplikasi lama,
              jadi migrasi bisa berjalan bertahap tanpa memutus operasional.
            </p>
            <div className="hero-badge-row mt-5">
              <span className="highlight-chip">Session Laravel</span>
              <span className="highlight-chip">Role-aware</span>
              <span className="highlight-chip">Fondasi dashboard baru</span>
            </div>

            <div className="mt-8 max-w-xl">
              <LoginForm />
            </div>
          </section>

          <aside className="section-dark hero-card p-5 sm:p-7">
            <p className="section-label-dark">Tahap migrasi</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Auth sudah dipindah ke storefront baru, tapi backend tetap Laravel.
            </h2>
            <div className="info-list mt-5">
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Login</p>
                <p className="mt-1 text-sm text-white/72">
                  Form Next mengirim kredensial ke backend Laravel.
                </p>
              </div>
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Session</p>
                <p className="mt-1 text-sm text-white/72">
                  Cookie session Laravel dipakai ulang untuk route protected.
                </p>
              </div>
              <div className="kpi-pill-dark">
                <p className="text-sm font-semibold">Dashboard</p>
                <p className="mt-1 text-sm text-white/72">
                  Next sudah bisa menampilkan data ringkas operasional.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
