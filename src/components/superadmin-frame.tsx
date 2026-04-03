"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { DashboardFlashToast } from "@/components/dashboard-flash-toast";
import { LogoutConfirmation } from "@/components/logout-confirmation";
import { takeDashboardFlash, type DashboardFlash } from "@/lib/dashboard-flash";
import type { AuthSession } from "@/lib/auth";

const NAV_ITEMS = [
  { key: "dashboard", label: "Command Center", href: "/superadmin" },
  { key: "orders", label: "Order Platform", href: "/superadmin/orders" },
  { key: "subscriptions", label: "Langganan", href: "/superadmin/subscriptions" },
  { key: "pricing", label: "Harga SaaS", href: "/superadmin/pricing" },
  { key: "payments", label: "Transaksi", href: "/superadmin/payments" },
  { key: "surveys", label: "Survey Platform", href: "/superadmin/surveys" },
  { key: "feedbacks", label: "Feedback", href: "/superadmin/feedbacks" },
] as const;

type SuperAdminNavKey = (typeof NAV_ITEMS)[number]["key"];

type Props = {
  session: AuthSession;
  current: SuperAdminNavKey;
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

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

export function SuperAdminFrame({
  session,
  current,
  eyebrow,
  title,
  description,
  actions,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [flash, setFlash] = useState<DashboardFlash | null>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const userInitial = session.user.name.slice(0, 1).toUpperCase();

  useEffect(() => {
    const flashTimer = window.setTimeout(() => {
      setFlash(takeDashboardFlash());
    }, 0);

    return () => {
      window.clearTimeout(flashTimer);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!flash) return;

    const enterTimer = window.setTimeout(() => setFlashVisible(true), 20);
    const exitTimer = window.setTimeout(() => setFlashVisible(false), 4200);
    const cleanupTimer = window.setTimeout(() => setFlash(null), 4500);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, [flash]);

  const sidebarContent = (
    <>
      <div className="px-6">
        <Link href="/superadmin" className="block font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
          ShoeClean
        </Link>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-brand/35">
          Superadmin Console
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-black text-white">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-brand">{session.user.name}</p>
              <p className="text-[11px] font-semibold text-brand/45">Akun superadmin</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`mx-2 flex items-center justify-between rounded-2xl px-4 py-3 text-[13px] font-bold transition ${
              current === item.key ? "bg-white text-brand shadow-sm" : "text-brand/55 hover:bg-white/70"
            }`}
          >
            <span>{item.label}</span>
            {current === item.key ? (
              <span className="h-2 w-2 rounded-full bg-accent" />
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="border-t border-black/5 px-4 pt-4">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex rounded-2xl px-4 py-3 text-[13px] font-bold text-brand/55 hover:bg-white"
        >
          Halaman publik
        </Link>
        <LogoutConfirmation
          label="Keluar"
          className="flex w-full rounded-2xl px-4 py-3 text-left text-[13px] font-bold text-brand/55 hover:bg-white"
        />
      </div>
    </>
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f6f1] font-sans text-brand">
      <DashboardFlashToast
        flash={flash}
        visible={flashVisible}
        onClose={() => {
          setFlashVisible(false);
          window.setTimeout(() => setFlash(null), 220);
        }}
      />
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col bg-slate-50/95 py-6 shadow-[18px_0_40px_rgba(15,23,42,0.06)] xl:flex">
        {sidebarContent}
      </aside>

      <div className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl xl:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand/35">Superadmin</p>
            <p className="truncate font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-brand"
            aria-label="Buka menu superadmin"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 xl:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 transition duration-300 ${
            mobileOpen ? "bg-brand/40 opacity-100" : "bg-brand/0 opacity-0"
          }`}
          aria-label="Tutup menu superadmin"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[86vw] max-w-[340px] flex-col bg-slate-50 py-6 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-2 flex items-center justify-between px-6">
            <p className="font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
              ShoeClean
            </p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-sm"
              aria-label="Tutup menu"
            >
              <CloseIcon />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>

      <section className="px-4 py-6 sm:px-6 xl:ml-72 xl:px-8 xl:py-10">
        <div className="mx-auto max-w-[1480px]">
          <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
              <h1 className="mt-3 font-[var(--font-display-sans)] text-4xl font-black tracking-[-0.08em] text-brand sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 text-sm font-semibold leading-7 text-brand/55">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </header>
          <div className="space-y-6">{children}</div>
        </div>
      </section>
    </main>
  );
}
