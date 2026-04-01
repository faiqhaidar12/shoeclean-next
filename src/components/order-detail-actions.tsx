"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: number;
  currentStatus: string;
  paymentStatus: string;
  hasPaymentProof: boolean;
  canMarkPaid?: boolean;
  canVerifyPayment?: boolean;
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
  canMarkPaid = true,
  canVerifyPayment = false,
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
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
        Kontrol status order
      </h2>
      <p className="mt-2 text-sm leading-7 text-white/72">
        Jalankan aksi outlet sesuai fase order dan status pembayaran saat ini.
      </p>
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
            className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-white px-5 py-4 text-sm font-bold text-accent shadow-[0_16px_28px_rgba(0,0,0,0.12)] transition hover:brightness-[0.99] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === `/api/orders/${orderId}/status` ? "Memproses..." : action.label}
          </button>
        ))}

        {!hasPaymentProof && paymentStatus !== "paid" ? (
          <div className="kpi-pill-dark">
            <p className="text-sm font-semibold">Belum ada bukti bayar</p>
            <p className="mt-1 text-sm text-white/72">
              Gunakan aksi lunas cash jika pembayaran diterima langsung di outlet.
            </p>
          </div>
        ) : null}

        {canMarkPaid ? (
          <button
            type="button"
            onClick={() => runAction(`/api/orders/${orderId}/mark-paid`, { method: "POST" })}
            disabled={busyAction === `/api/orders/${orderId}/mark-paid`}
            className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#81f2eb,#d8fffb)] px-5 py-4 text-sm font-extrabold text-[#003734] shadow-[0_18px_34px_rgba(129,242,235,0.18)] transition hover:brightness-[0.99] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction === `/api/orders/${orderId}/mark-paid`
              ? "Memproses..."
              : "Tandai lunas cash"}
          </button>
        ) : null}

        {canVerifyPayment ? (
          <button
            type="button"
            onClick={() =>
              runAction(`/api/orders/${orderId}/verify-payment`, { method: "POST" })
            }
            disabled={busyAction === `/api/orders/${orderId}/verify-payment`}
            className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-white/12 px-5 py-4 text-sm font-extrabold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/16 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
