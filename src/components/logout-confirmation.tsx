"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type Props = {
  label?: string;
  className?: string;
  fullWidth?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M15 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function LogoutConfirmation({
  label = "Logout",
  className = "btn-primary",
  fullWidth = false,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Logout gagal diproses.");
        return;
      }

      setOpen(false);
      router.push("/login");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke layanan logout.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className}${fullWidth ? " w-full" : ""}`}
      >
        {label}
      </button>

      {mounted
        ? createPortal(
            <div
              className={`fixed inset-0 z-[90] transition duration-300 ${
                open ? "pointer-events-auto" : "pointer-events-none"
              }`}
              aria-hidden={!open}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`absolute inset-0 bg-[rgba(0,32,69,0.42)] transition-opacity duration-300 ${
                  open ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Tutup konfirmasi logout"
              />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <section
                  className={`w-full max-w-md rounded-[2rem] bg-white p-6 shadow-[0_28px_64px_rgba(0,32,69,0.22)] transition duration-300 sm:p-7 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="logout-title"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(0,32,69,0.08)] text-brand">
                      <LogoutIcon />
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-brand"
                      aria-label="Tutup"
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-brand/38">
                    Konfirmasi logout
                  </p>
                  <h2 id="logout-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                    Apakah Anda yakin ingin keluar?
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Session aktif akan dihapus dan Anda akan diarahkan kembali ke halaman login. Gunakan ini saat selesai bekerja atau saat memakai perangkat bersama.
                  </p>

                  {error ? (
                    <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
                      {error}
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isSubmitting}
                      className="btn-primary w-full sm:w-auto"
                    >
                      {isSubmitting ? "Memproses logout..." : "Ya, keluar sekarang"}
                    </button>
                  </div>
                </section>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
