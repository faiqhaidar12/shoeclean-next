"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setDashboardFlash } from "@/lib/dashboard-flash";

declare global {
  interface Window {
    Duitku?: {
      Checkout?: {
        process: (
          reference: string,
          options?: {
            successEvent?: (result: unknown) => void;
            pendingEvent?: (result: unknown) => void;
            errorEvent?: (result: unknown) => void;
            closeEvent?: (result: unknown) => void;
          },
        ) => void;
      };
      checkout?: {
        process: (
          reference: string,
          options?: {
            successEvent?: (result: unknown) => void;
            pendingEvent?: (result: unknown) => void;
            errorEvent?: (result: unknown) => void;
            closeEvent?: (result: unknown) => void;
          },
        ) => void;
      };
    };
    checkout?: {
      process: (
        reference: string,
        options?: {
          successEvent?: (result: unknown) => void;
          pendingEvent?: (result: unknown) => void;
          errorEvent?: (result: unknown) => void;
          closeEvent?: (result: unknown) => void;
        },
      ) => void;
    };
  }
}

type Props = {
  plan: string;
  label: string;
  className: string;
  successTitle?: string;
  returnTo?: string;
};

type CheckoutResponse = {
  reference?: string;
  payment_url?: string;
  popup_script_url?: string;
  message?: string;
};

let currentScriptUrl: string | null = null;
let loadingPromise: Promise<void> | null = null;

function resolveCheckoutProcess() {
  return (
    window.Duitku?.Checkout?.process ??
    window.Duitku?.checkout?.process ??
    window.checkout?.process ??
    null
  );
}

function loadDuitkuScript(scriptUrl: string) {
  if (resolveCheckoutProcess()) {
    return Promise.resolve();
  }

  if (loadingPromise && currentScriptUrl === scriptUrl) {
    return loadingPromise;
  }

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-duitku-pop="true"]');

    if (existing && currentScriptUrl === scriptUrl) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Gagal memuat script Duitku POP.")), { once: true });
      return;
    }

    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.dataset.duitkuPop = "true";
    script.onload = () => {
      currentScriptUrl = scriptUrl;
      resolve();
    };
    script.onerror = () => reject(new Error("Gagal memuat script Duitku POP."));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

export function SubscriptionPopButton({ plan, label, className, successTitle, returnTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/subscription/pop/${encodeURIComponent(plan)}`, {
        method: "POST",
        cache: "no-store",
      });

      const payload = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(payload.message ?? "Gagal menyiapkan pembayaran.");
      }

      if (!payload.reference) {
        if (payload.payment_url) {
          window.location.href = payload.payment_url;
          return;
        }

        throw new Error("Referensi pembayaran Duitku tidak ditemukan.");
      }

      const scriptUrl = payload.popup_script_url;
      if (!scriptUrl) {
        if (payload.payment_url) {
          window.location.href = payload.payment_url;
          return;
        }

        throw new Error("Script popup Duitku tidak tersedia.");
      }

      await loadDuitkuScript(scriptUrl);
      const process = resolveCheckoutProcess();

      if (!process) {
        if (payload.payment_url) {
          window.location.href = payload.payment_url;
          return;
        }

        throw new Error("Popup Duitku belum tersedia di browser ini.");
      }

      process(payload.reference, {
        successEvent: () => {
          setDashboardFlash({
            type: "success",
            title: successTitle ?? "Pembayaran berhasil dikonfirmasi.",
            message: "Status langganan akan diperbarui otomatis dalam beberapa saat.",
          });
          const target = `${returnTo ?? "/dashboard/subscription"}?payment=success&plan=${encodeURIComponent(plan)}`;
          router.push(target);
          window.setTimeout(() => router.refresh(), 1200);
          window.setTimeout(() => router.refresh(), 2600);
        },
        pendingEvent: () => {
          setDashboardFlash({
            type: "info",
            title: "Pembayaran sedang menunggu konfirmasi.",
            message: "Anda dapat membuka kembali halaman langganan untuk melihat status terbaru.",
          });
          const target = `${returnTo ?? "/dashboard/subscription"}?payment=pending&plan=${encodeURIComponent(plan)}`;
          router.push(target);
          window.setTimeout(() => router.refresh(), 1000);
        },
        errorEvent: () => {
          setError("Pembayaran belum berhasil. Silakan coba lagi.");
          setDashboardFlash({
            type: "error",
            title: "Pembayaran belum berhasil.",
            message: "Silakan coba lagi atau pilih metode pembayaran lain.",
          });
        },
        closeEvent: () => {
          setDashboardFlash({
            type: "info",
            title: "Popup pembayaran ditutup.",
            message: "Anda bisa melanjutkan pembayaran lagi kapan saja dari halaman ini.",
          });
          if (pathname !== (returnTo ?? "/dashboard/subscription")) {
            router.push(returnTo ?? "/dashboard/subscription");
          } else {
            router.refresh();
          }
        },
      });
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Gagal menyiapkan pembayaran.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button type="button" onClick={handleClick} className={className} disabled={isLoading}>
        {isLoading ? "Menyiapkan pembayaran..." : label}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
