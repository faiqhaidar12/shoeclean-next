import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { RegisterForm } from "@/components/register-form";
import { getAuthSession } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

const brandImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1iMZLHlWTCzTUoGjE0XhdD1SG19QaOXOOCkPSTA5mLeiJELMalbN4GMNk0yYer0o5TFPGM5S5hDoxgj_JXZXvCZ8LPsUNE6xbn34_TFAWPXirsKWYF4mRNxexPbFtBL0CHld1cdjRuXM6yieeZRNzOnkyivQFE-rpCivIDkhKEGmIFnNvxMS1xNvAKncFRByaofgmsMYzy068JTCC3ws3p7lVyTHr9u_MRyEnHa6sGBMWKdotAIy48dq9gq9PUw43HL1dxgiOdFkO";

export default async function RegisterPage() {
  try {
    await getAuthSession();
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Layanan pendaftaran belum terhubung"
          message={error.message}
        />
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 motion-fade bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-[var(--font-display-sans)] text-2xl font-extrabold tracking-[-0.04em] text-brand">
            ShoeClean
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand">
              Harga
            </Link>
            <Link href="/track" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand">
              Lacak
            </Link>
            <Link href="/login" className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <section className="flex flex-1 flex-col pt-20 md:flex-row">
        <aside className="relative hidden overflow-hidden bg-brand-strong p-16 md:flex md:w-1/2 md:flex-col md:justify-end">
          <div className="absolute inset-0 z-0">
            <Image
              src={brandImage}
              alt="Close up sneaker cleaning"
              fill
              sizes="50vw"
              priority
              className="object-cover opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brand via-brand/80 to-transparent" />
          </div>

          <div className="relative z-10 space-y-6">
            <span className="motion-enter-fast inline-block rounded-full bg-accent-soft px-4 py-1 text-xs font-bold uppercase tracking-widest text-accent-ink">
              Mulai lebih rapi
            </span>
            <h1 className="motion-enter-fast font-[var(--font-display-sans)] text-5xl font-extrabold leading-tight tracking-[-0.05em] text-white" style={{ animationDelay: "0.08s" }}>
              Buat outlet Anda lebih siap menerima pesanan online.
            </h1>
            <p className="motion-enter-fast max-w-md text-lg font-light leading-relaxed text-[#adc7f7]" style={{ animationDelay: "0.16s" }}>
              Daftarkan bisnis Anda ke ShoeClean untuk memudahkan pelanggan memesan, melacak pesanan, dan membantu tim Anda bekerja lebih teratur.
            </p>
          </div>

          <div className="absolute right-[-5%] top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </aside>

        <section className="flex w-full items-center justify-center bg-surface p-8 md:w-1/2 md:p-16">
          <div className="motion-enter relative z-10 w-full max-w-md space-y-10">
            <div className="space-y-2">
              <h2 className="font-[var(--font-display-sans)] text-3xl font-bold tracking-tight text-foreground">
                Buat akun baru
              </h2>
              <p className="font-medium text-muted">
                Mulai dengan satu akun dan outlet pertama Anda.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] md:p-10">
              <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-accent" />
              <RegisterForm />

              <div className="pt-6 text-center">
                <p className="text-sm font-medium text-muted">
                  Sudah punya akun?
                  <Link href="/login" className="ml-1 font-bold text-brand hover:underline">
                    Masuk
                  </Link>
                </p>
              </div>
            </div>

            <div className="motion-enter-fast flex items-start gap-4 rounded-xl border-l-4 border-accent bg-surface-soft p-6" style={{ animationDelay: "0.12s" }}>
              <span className="mt-0.5 text-accent" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
                </svg>
              </span>
              <p className="text-sm leading-relaxed text-muted">
                Setelah akun dibuat, outlet pertama Anda akan disiapkan otomatis agar Anda bisa langsung mulai menggunakan dashboard.
              </p>
            </div>
          </div>
        </section>
      </section>

      <footer className="w-full border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © 2026 ShoeClean. Dibuat untuk membantu bisnis Anda tumbuh lebih rapi.
          </p>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-sm text-slate-500 transition-all duration-200 hover:text-brand">
              Harga
            </Link>
            <Link href="/pricing" className="text-sm text-slate-500 transition-all duration-200 hover:text-brand">
              Paket
            </Link>
            <Link href="/login" className="text-sm text-slate-500 transition-all duration-200 hover:text-brand">
              Masuk
            </Link>
            <Link href="/" className="text-sm text-slate-500 transition-all duration-200 hover:text-brand">
              Beranda
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
