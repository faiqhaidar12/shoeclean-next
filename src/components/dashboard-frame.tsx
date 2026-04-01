"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DashboardFlashToast } from "@/components/dashboard-flash-toast";
import { LogoutConfirmation } from "@/components/logout-confirmation";
import { takeDashboardFlash, type DashboardFlash } from "@/lib/dashboard-flash";

type Props = {
  current:
    | "dashboard"
    | "outlets"
    | "orders"
    | "reports"
    | "subscription"
    | "surveys"
    | "customers"
    | "services"
    | "expenses"
    | "promos"
    | "team";
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

const navItems = [
  { key: "dashboard", href: "/dashboard", label: "Dasbor" },
  { key: "outlets", href: "/dashboard/outlets", label: "Cabang" },
  { key: "services", href: "/dashboard/services", label: "Layanan" },
  { key: "team", href: "/dashboard/team", label: "Staf" },
  { key: "expenses", href: "/dashboard/expenses", label: "Keuangan" },
  { key: "promos", href: "/dashboard/promos", label: "Promo" },
  { key: "customers", href: "/dashboard/customers", label: "Pelanggan" },
  { key: "orders", href: "/dashboard/orders", label: "Pesanan" },
  { key: "reports", href: "/dashboard/reports", label: "Laporan" },
  { key: "subscription", href: "/dashboard/subscription", label: "Subscription" },
  { key: "surveys", href: "/dashboard/surveys", label: "Surveys" },
] as const;

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardFrame({
  current,
  eyebrow,
  title,
  description,
  actions,
  children,
}: Props) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [flash, setFlash] = useState<DashboardFlash | null>(() => takeDashboardFlash());
  const [flashVisible, setFlashVisible] = useState(false);

  useEffect(() => {
    if (!flash) {
      return;
    }

    const enterTimer = window.setTimeout(() => {
      setFlashVisible(true);
    }, 20);

    const exitTimer = window.setTimeout(() => {
      setFlashVisible(false);
    }, 4200);

    const cleanupTimer = window.setTimeout(() => {
      setFlash(null);
    }, 4500);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [flash]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileNavOpen]);

  function dismissFlash() {
    setFlashVisible(false);
    window.setTimeout(() => setFlash(null), 220);
  }

  return (
    <main className="min-h-screen bg-surface font-sans text-foreground">
      <DashboardFlashToast flash={flash} visible={flashVisible} onClose={dismissFlash} />
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-slate-50 py-6 xl:flex">
        <div className="mb-8 px-6">
          <div className="mb-6 text-lg font-black text-brand">Portal Admin</div>
          <div className="flex items-center space-x-3 rounded-xl bg-white p-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-strong text-sm font-bold text-white">
              A
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-brand">Profil Admin</p>
              <p className="text-[11px] text-muted">Workspace ShoeClean</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`mx-2 my-1 flex items-center rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                current === item.key
                  ? "scale-95 bg-white text-brand shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="px-6 py-4">
          <Link
            href="/dashboard/orders/create"
            className="block w-full rounded-full bg-brand px-4 py-3 text-center text-[13px] font-bold text-white shadow-lg shadow-brand/10 transition-transform active:scale-95"
          >
            Pesanan Baru
          </Link>
        </div>

        <div className="border-t border-slate-200 px-2 pt-4">
          <Link href="/" className="mx-2 my-1 flex items-center rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-500 transition-all hover:bg-slate-100">
            Storefront
          </Link>
          <div className="mx-2 my-1">
            <LogoutConfirmation
              label="Keluar"
              className="flex w-full items-center rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-500 transition-all hover:bg-slate-100"
            />
          </div>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-white/60 bg-white/88 backdrop-blur-xl xl:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
              Portal Admin
            </p>
            <p className="truncate font-[var(--font-display-sans)] text-xl font-extrabold tracking-tight text-brand">
              ShoeClean Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/orders/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-3.5 text-xs font-bold text-white shadow-[0_14px_28px_rgba(0,32,69,0.16)] transition active:scale-[0.98] sm:px-4 sm:text-sm"
            >
              <PlusIcon />
              <span className="sm:hidden">Order</span>
              <span className="hidden sm:inline">Pesanan Baru</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-[0_10px_20px_rgba(25,28,30,0.05)]"
              aria-label="Buka navigasi dashboard"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 xl:hidden ${isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isMobileNavOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 transition duration-300 ${
            isMobileNavOpen ? "bg-[rgba(0,32,69,0.32)] opacity-100" : "bg-[rgba(0,32,69,0)] opacity-0"
          }`}
          onClick={() => setIsMobileNavOpen(false)}
          aria-label="Tutup navigasi dashboard"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[86vw] max-w-[320px] flex-col bg-slate-50 py-6 shadow-[0_24px_54px_rgba(0,32,69,0.2)] transition-transform duration-300 ease-out ${
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <div className="mb-8 flex items-start justify-between px-6">
              <div>
                <div className="text-lg font-black text-brand">Portal Admin</div>
                <p className="mt-1 text-xs text-muted">Workspace ShoeClean</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-sm"
                aria-label="Tutup menu"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mb-6 px-6">
              <div className="flex items-center space-x-3 rounded-xl bg-white p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-strong text-sm font-bold text-white">
                  A
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-[13px] font-semibold text-brand">Profil Admin</p>
                  <p className="text-[11px] text-muted">Workspace ShoeClean</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto px-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`mx-2 my-1 flex items-center rounded-lg px-4 py-3 text-[14px] font-semibold transition-all ${
                    current === item.key
                      ? "bg-white text-brand shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="px-6 py-4">
              <Link
                href="/dashboard/orders/create"
                onClick={() => setIsMobileNavOpen(false)}
                className="block w-full rounded-full bg-brand px-4 py-3 text-center text-[14px] font-bold text-white shadow-lg shadow-brand/10"
              >
                Pesanan Baru
              </Link>
            </div>

            <div className="border-t border-slate-200 px-2 pt-4">
              <Link
                href="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="mx-2 my-1 flex items-center rounded-lg px-4 py-3 text-[14px] font-semibold text-slate-500 transition-all hover:bg-slate-100"
              >
                Storefront
              </Link>
              <div className="mx-2 my-1">
                <LogoutConfirmation
                  label="Keluar"
                  className="flex w-full items-center rounded-lg px-4 py-3 text-[14px] font-semibold text-slate-500 transition-all hover:bg-slate-100"
                  onOpenChange={(open) => {
                    if (!open) return;
                    setIsMobileNavOpen(false);
                  }}
                />
              </div>
            </div>
          </aside>
      </div>

      <section className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 xl:ml-64 xl:px-8 xl:py-8">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div className="dashboard-header-copy">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{eyebrow}</p>
              <h1 className="font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
            </div>
            {actions ? <div className="mobile-stack w-full md:w-auto md:flex-wrap">{actions}</div> : null}
          </header>

          <div className="dashboard-stack">{children}</div>
        </div>
      </section>
    </main>
  );
}
