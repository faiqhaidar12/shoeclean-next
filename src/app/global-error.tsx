"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_28px_64px_rgba(0,32,69,0.12)] sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand/38">
              Terjadi error
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-brand">
              Ada masalah saat memuat halaman ini.
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              Error sudah dikirim ke monitoring production jika Sentry aktif. Anda bisa coba muat ulang halaman ini sekali lagi.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={reset} className="btn-primary w-full sm:w-auto">
                Coba lagi
              </button>
              <Link href="/" className="btn-secondary w-full sm:w-auto">
                Ke beranda
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
