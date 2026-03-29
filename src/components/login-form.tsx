"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="section-label block">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@outlet.com"
          className="field-soft"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="section-label block">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Masukkan password"
          className="field-soft"
        />
      </div>

      <label className="flex items-center gap-3 rounded-[1rem] border border-line bg-white/70 px-4 py-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          className="h-4 w-4 accent-[var(--brand)]"
        />
        Tetap login di perangkat ini
      </label>

      {error ? (
        <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Memeriksa akun..." : "Masuk ke dashboard"}
      </button>
    </form>
  );
}
