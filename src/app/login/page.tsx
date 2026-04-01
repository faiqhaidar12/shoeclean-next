import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute left-[-5%] top-[-10%] h-[40%] w-[40%] rounded-full bg-accent-soft/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[40%] w-[40%] rounded-full bg-[rgba(214,227,255,0.75)] blur-[120px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-[var(--font-display-sans)] text-3xl font-extrabold tracking-[-0.04em] text-brand">
              ShoeClean
            </h1>
            <p className="mt-2 font-medium tracking-tight text-muted">
              Manajemen operasional bisnis cuci sepatu profesional
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] md:p-10">
            <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-accent" />

            <header className="mb-8">
              <h2 className="font-[var(--font-display-sans)] text-2xl font-bold text-brand">
                Portal Admin
              </h2>
              <p className="mt-1 text-sm text-muted">
                Silakan masuk untuk mengakses dashboard operasional Anda.
              </p>
            </header>

            <LoginForm />

            <footer className="mt-10 border-t border-line/40 pt-8 text-center">
              <p className="text-sm text-muted">
                Baru di ShoeClean?
                <Link
                  href="/register"
                  className="ml-1 font-bold text-brand underline-offset-4 transition-all hover:underline"
                >
                  Buat akun
                </Link>
              </p>
            </footer>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-4 rounded-full bg-surface-soft/80 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-[10px] font-bold uppercase tracking-tight text-muted">
                  Sistem aman
                </span>
              </div>
              <div className="h-3 w-px bg-line" />
              <span className="text-[10px] font-bold uppercase tracking-tight text-muted">
                Session Laravel
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
          <div className="text-center text-sm text-slate-500 md:text-left">
            © 2026 ShoeClean. Dibuat untuk operasional yang lebih rapi.
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/pricing" className="text-sm text-slate-500 transition-colors hover:text-brand">
              Ketentuan Layanan
            </Link>
            <Link href="/pricing" className="text-sm text-slate-500 transition-colors hover:text-brand">
              Kebijakan Privasi
            </Link>
            <Link href="/" className="text-sm text-slate-500 transition-colors hover:text-brand">
              Beranda
            </Link>
            <Link href="/track" className="text-sm text-slate-500 transition-colors hover:text-brand">
              Tracking
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
