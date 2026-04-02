"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
      {children}
    </span>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!agreed) {
      setError("Setujui syarat layanan terlebih dulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          business_name: businessName,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;

        setError(firstError ?? payload.message ?? "Pendaftaran gagal.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke layanan pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted" htmlFor="full-name">
          Nama Lengkap
        </label>
        <div className="relative">
          <FieldIcon>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </FieldIcon>
          <input
            id="full-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Nama pemilik atau admin"
            className="w-full rounded-xl border-none bg-surface-soft py-4 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted" htmlFor="business-name">
          Nama Bisnis / Outlet
        </label>
        <div className="relative">
          <FieldIcon>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M5 9.5 6.3 5h11.4L19 9.5M6 9.5h12v8.75A1.75 1.75 0 0 1 16.25 20H7.75A1.75 1.75 0 0 1 6 18.25z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </FieldIcon>
          <input
            id="business-name"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            required
            placeholder="Nama outlet atau bisnis Anda"
            className="w-full rounded-xl border-none bg-surface-soft py-4 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted" htmlFor="email">
          Email Kerja
        </label>
        <div className="relative">
          <FieldIcon>
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </FieldIcon>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="admin@bisnisanda.com"
            className="w-full rounded-xl border-none bg-surface-soft py-4 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted" htmlFor="password">
            Kata Sandi
          </label>
          <div className="relative">
            <FieldIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </FieldIcon>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Masukkan kata sandi"
              className="w-full rounded-xl border-none bg-surface-soft py-4 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted" htmlFor="confirm-password">
            Konfirmasi
          </label>
          <div className="relative">
            <FieldIcon>
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M7 12.5 10 15l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
            </FieldIcon>
            <input
              id="confirm-password"
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              autoComplete="new-password"
              required
              placeholder="Ulangi kata sandi"
              className="w-full rounded-xl border-none bg-surface-soft py-4 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
            />
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          className="h-5 w-5 rounded border-line bg-surface-soft text-accent"
        />
        <span className="text-sm font-medium text-muted">
          Saya setuju dengan <span className="font-bold text-accent">syarat penggunaan</span>
        </span>
      </label>

      {error ? <div className="alert-panel">{error}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#002045_0%,#1a365d_100%)] py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-brand/20 hover:scale-[1.01] active:scale-[0.98]"
      >
        <span>{isSubmitting ? "Sedang menyiapkan akun..." : "Buat akun sekarang"}</span>
        <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
          <ArrowRightIcon />
        </span>
      </button>
    </form>
  );
}
