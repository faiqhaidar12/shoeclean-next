"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember,
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

        setError(firstError ?? payload.message ?? "Login gagal.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke layanan login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="ml-1 block text-xs font-semibold uppercase tracking-widest text-muted">
          Alamat Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <MailIcon />
          </span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@shoeclean.app"
            className="w-full rounded-xl border-none bg-surface-soft py-3 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-muted">
            Kata Sandi
          </label>
          <span className="text-xs font-semibold text-brand">Lupa kata sandi?</span>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <LockIcon />
          </span>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan password"
            className="w-full rounded-xl border-none bg-surface-soft py-3 pl-12 pr-4 text-foreground transition-all duration-300 placeholder:text-muted/55 focus:bg-white focus:ring-2 focus:ring-brand/10"
          />
        </div>
      </div>

      <label className="flex items-center px-1">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-line text-accent focus:ring-accent/20"
        />
        <span className="ml-2 text-sm font-medium text-muted">
          Ingat saya selama 30 hari
        </span>
      </label>

      {error ? <div className="alert-panel">{error}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#002045_0%,#1a365d_100%)] py-4 font-bold text-white shadow-lg shadow-brand/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
      >
        <span>{isSubmitting ? "Memeriksa akun..." : "Masuk"}</span>
        <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
          <ArrowRightIcon />
        </span>
      </button>
    </form>
  );
}
