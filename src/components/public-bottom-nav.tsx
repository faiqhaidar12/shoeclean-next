"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  current?: "home" | "pricing" | "track" | "order";
};

const navItems = [
  { key: "home", href: "/", label: "Beranda", icon: HomeIcon },
  { key: "pricing", href: "/pricing", label: "Harga", icon: PricingIcon },
  { key: "track", href: "/track", label: "Lacak", icon: TrackIcon },
  { key: "order", href: "/order", label: "Pesan", icon: OrderIcon },
] as const;

export function PublicBottomNav({ current = "home" }: Props) {
  const [isInputMode, setIsInputMode] = useState(false);

  useEffect(() => {
    function isMobileViewport() {
      return window.matchMedia("(max-width: 639px)").matches;
    }

    function handleFocusIn(event: FocusEvent) {
      if (!isMobileViewport()) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const isFormField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable;

      if (isFormField) {
        setIsInputMode(true);
      }
    }

    function handleFocusOut() {
      window.setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement | null;
        const stillEditing =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLSelectElement ||
          Boolean(activeElement?.isContentEditable);

        setIsInputMode(stillEditing && isMobileViewport());
      }, 0);
    }

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/92 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_38px_rgba(0,32,69,0.08)] backdrop-blur-xl transition duration-200 sm:hidden ${
        isInputMode
          ? "pointer-events-none translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isActive = current === item.key;
          const Icon = item.icon;
          const isOrder = item.key === "order";

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2 text-[11px] font-semibold transition ${
                isActive
                  ? isOrder
                    ? "bg-[linear-gradient(135deg,#002045_0%,#1a365d_100%)] text-white shadow-[0_12px_28px_rgba(0,32,69,0.22)]"
                    : "bg-[rgba(0,32,69,0.08)] text-brand"
                  : isOrder
                    ? "bg-[rgba(129,242,235,0.18)] text-accent-ink hover:bg-[rgba(129,242,235,0.28)]"
                    : "text-muted hover:bg-[rgba(0,32,69,0.04)] hover:text-brand"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isActive
                    ? isOrder
                      ? "bg-white/12"
                      : "bg-white"
                    : isOrder
                      ? "bg-white/40"
                      : "bg-transparent"
                }`}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className={isOrder && !isActive ? "font-bold" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.75 10.25 12 4.5l7.25 5.75v8a1.75 1.75 0 0 1-1.75 1.75H6.5a1.75 1.75 0 0 1-1.75-1.75v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.25 20v-5.5h5.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PricingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 6.75A1.75 1.75 0 0 1 7.75 5h8.5A1.75 1.75 0 0 1 18 6.75v10.5A1.75 1.75 0 0 1 16.25 19h-8.5A1.75 1.75 0 0 1 6 17.25V6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrackIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8 3-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OrderIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 9.5 6.3 5h11.4L19 9.5M6 9.5h12v8.75A1.75 1.75 0 0 1 16.25 20H7.75A1.75 1.75 0 0 1 6 18.25z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 13.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
