"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutConfirmation } from "@/components/logout-confirmation";

type Props = {
  current?: "home" | "pricing" | "track" | "order";
  authenticated?: boolean;
  dashboardHref?: string;
};

const navItems = [
  { key: "home", href: "/", label: "Beranda" },
  { key: "pricing", href: "/pricing", label: "Harga" },
  { key: "track", href: "/track", label: "Lacak" },
  { key: "order", href: "/order", label: "Pesan" },
] as const;

function navClass(active: boolean) {
  return active
    ? "rounded-full bg-[rgba(0,32,69,0.08)] px-4 py-2 text-sm font-bold text-brand"
    : "rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-[rgba(0,32,69,0.06)] hover:text-brand";
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PublicTopNav({
  current = "home",
  authenticated = false,
  dashboardHref = "/dashboard",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="motion-fade fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/82 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <Link
              href="/"
              className="font-[var(--font-display-sans)] text-[1.45rem] font-extrabold tracking-[-0.05em] text-brand"
            >
              ShoeClean
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
              Order dan dashboard outlet
            </p>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className={navClass(current === item.key)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {authenticated ? (
              <>
                <Link href={dashboardHref} className="btn-secondary px-4 py-2.5 text-sm">
                  Dasbor
                </Link>
                <LogoutConfirmation label="Keluar" className="btn-primary px-5 py-2.5 text-sm" />
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary px-4 py-2.5 text-sm">
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary px-5 py-2.5 text-sm">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-[0_10px_24px_rgba(0,32,69,0.08)]"
              aria-label="Buka menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="public-drawer-overlay absolute inset-0 bg-[rgba(0,32,69,0.36)]"
            aria-label="Tutup menu"
          />

          <aside className="public-drawer-panel absolute right-0 top-0 flex h-full w-[86vw] max-w-[340px] flex-col bg-white px-5 pb-6 pt-5 shadow-[0_28px_60px_rgba(0,32,69,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-[var(--font-display-sans)] text-2xl font-extrabold tracking-[-0.05em] text-brand">
                  ShoeClean
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Order dan dashboard outlet
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-brand"
                aria-label="Tutup menu"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="mt-8 grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${navClass(current === item.key)} text-base`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 grid gap-3">
              {authenticated ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full justify-center"
                  >
                    Dasbor
                  </Link>
                  <LogoutConfirmation
                    label="Keluar"
                    className="btn-secondary w-full justify-center"
                    fullWidth
                  />
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full justify-center"
                  >
                    Daftar
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary w-full justify-center"
                  >
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
