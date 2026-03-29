"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: number;
  currentStatus: string;
  paymentStatus: string;
  hasPaymentProof: boolean;
};

const statusFlow = [
  { value: "processing", label: "Mulai proses", allowedFrom: ["pending"] },
  { value: "ready", label: "Tandai siap", allowedFrom: ["processing"] },
  { value: "picked_up", label: "Tandai diambil", allowedFrom: ["ready"] },
  { value: "completed", label: "Selesaikan order", allowedFrom: ["picked_up", "ready"] },
  { value: "cancelled", label: "Batalkan", allowedFrom: ["pending", "processing"] },
];

export function OrderDetailActions({
  orderId,
  currentStatus,
  paymentStatus,
  hasPaymentProof,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  async function runAction(path: string, init?: RequestInit) {
    setError("");
    setBusyAction(path);

    try {
      const response = await fetch(path, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;
        setError(firstError ?? payload.message ?? "Aksi gagal diproses.");
        return;
      }

      router.refresh();
    } catch {
      setError("Terjadi kendala saat mengirim aksi.");
    } finally {
      setBusyAction("");
    }
  }

  const availableStatusActions = statusFlow.filter((item) =>
    item.allowedFrom.includes(currentStatus),
  );

  return (
    <section className="section-dark hero-card p-5 sm:p-6">
      <p className="section-label-dark">Aksi cepat</p>
      <div className="info-list mt-5">
        {availableStatusActions.map((action) => (
          <button
            key={action.value}
            type="button"
            onClick={() =>
              runAction(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: action.value }),
              })
            }
            disabled={busyAction === `/api/orders/${orderId}/status`}
            className="btn-secondary w-full !border-white/10 !bg-white !text-accent"
          >
            {busyAction === `/api/orders/${orderId}/status` ? "Memproses..." : action.label}
          </button>
        ))}

        {paymentStatus !== "paid" ? (
          <button
            type="button"
            onClick={() => runAction(`/api/orders/${orderId}/mark-paid`, { method: "POST" })}
            disabled={busyAction === `/api/orders/${orderId}/mark-paid`}
            className="btn-primary w-full"
          >
            {busyAction === `/api/orders/${orderId}/mark-paid`
              ? "Memproses..."
              : "Tandai lunas cash"}
          </button>
        ) : null}

        {hasPaymentProof && paymentStatus !== "paid" ? (
          <button
            type="button"
            onClick={() =>
              runAction(`/api/orders/${orderId}/verify-payment`, { method: "POST" })
            }
            disabled={busyAction === `/api/orders/${orderId}/verify-payment`}
            className="btn-accent w-full"
          >
            {busyAction === `/api/orders/${orderId}/verify-payment`
              ? "Memverifikasi..."
              : "Verifikasi bukti bayar"}
          </button>
        ) : null}

        {error ? (
          <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
