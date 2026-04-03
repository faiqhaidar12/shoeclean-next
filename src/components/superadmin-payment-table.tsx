"use client";

import { useEffect, useState } from "react";
import type { SuperAdminPaymentTransaction } from "@/lib/superadmin";
import {
  formatSuperAdminCurrency,
  formatSuperAdminDate,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";

type Props = {
  transactions: SuperAdminPaymentTransaction[];
};

function statusTone(statusCode: string | null) {
  if (statusCode === "00") return "emerald";
  if (statusCode === "01") return "amber";
  return "rose";
}

function payloadToString(value: unknown) {
  if (!value) return "-";
  return JSON.stringify(value, null, 2);
}

export function SuperAdminPaymentTable({ transactions }: Props) {
  const [detail, setDetail] = useState<SuperAdminPaymentTransaction | null>(null);

  useEffect(() => {
    if (!detail) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.setProperty("overflow", "hidden");

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [detail]);

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-[180px_120px_220px_220px_120px_150px_120px_150px_100px] gap-4 border-b border-black/5 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
              <div>Owner</div>
              <div>Jenis</div>
              <div>Merchant Order ID</div>
              <div>Reference</div>
              <div>Metode</div>
              <div>Status</div>
              <div className="text-right">Nominal</div>
              <div>Lunas</div>
              <div className="text-right">Aksi</div>
            </div>

            {transactions.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm font-semibold text-brand/45">
                Belum ada transaksi yang cocok dengan filter saat ini.
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[180px_120px_220px_220px_120px_150px_120px_150px_100px] gap-4 border-b border-black/5 px-6 py-5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brand">
                      {transaction.user?.name ?? "-"}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-brand/50">
                      {transaction.customer_email ?? transaction.user?.email ?? "-"}
                    </p>
                  </div>
                  <div>
                    <SuperAdminStatusBadge
                      label={transaction.kind_label}
                      tone={transaction.kind === "subscription" ? "blue" : "emerald"}
                    />
                  </div>
                  <div className="break-all font-semibold text-brand/80">
                    {transaction.merchant_order_id}
                  </div>
                  <div className="break-all font-semibold text-brand/70">
                    {transaction.reference ?? "-"}
                  </div>
                  <div className="font-bold uppercase text-brand/70">
                    {transaction.payment_method ?? "-"}
                  </div>
                  <div>
                    <SuperAdminStatusBadge
                      label={transaction.status_message ?? transaction.status_code ?? "-"}
                      tone={statusTone(transaction.status_code)}
                    />
                  </div>
                  <div className="text-right font-[var(--font-display-sans)] text-base font-black tracking-[-0.06em] text-brand">
                    {formatSuperAdminCurrency(transaction.amount)}
                  </div>
                  <div className="text-sm font-semibold text-brand/60">
                    {formatSuperAdminDate(transaction.paid_at)}
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setDetail(transaction)}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-accent"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setDetail(null)}
            className="absolute inset-0 bg-brand/40 backdrop-blur-sm"
            aria-label="Tutup detail transaksi"
          />
          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/5 bg-white/95 px-5 py-5 backdrop-blur sm:px-8">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand/35">
                  Log transaksi
                </p>
                <h2 className="mt-2 break-all font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.08em] text-brand">
                  {detail.merchant_order_id}
                </h2>
                <p className="mt-2 break-all text-sm font-semibold text-brand/55">
                  Reference: {detail.reference ?? "-"}
                </p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="btn-secondary">
                Tutup
              </button>
            </div>

            <div className="max-h-[calc(90vh-110px)] overflow-y-auto p-5 sm:p-8">
              <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
                <section className="soft-panel p-5 sm:p-6">
                  <h3 className="font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
                    Ringkasan transaksi
                  </h3>
                  <dl className="mt-5 space-y-4 text-sm">
                    {[
                      ["Owner", detail.user?.name ?? "-"],
                      ["Email", detail.customer_email ?? detail.user?.email ?? "-"],
                      ["Jenis", detail.kind_label],
                      ["Paket", detail.plan_key?.toUpperCase() ?? "-"],
                      ["Metode", detail.payment_method ?? "-"],
                      [
                        "Status",
                        `${detail.status_message ?? "-"} (${detail.status_code ?? "-"})`,
                      ],
                      ["Nominal", formatSuperAdminCurrency(detail.amount)],
                      ["Fee", detail.fee !== null ? formatSuperAdminCurrency(detail.fee) : "-"],
                      ["Produk", detail.product_detail ?? "-"],
                      [
                        "Terkait data",
                        detail.billable ? `${detail.billable.type} #${detail.billable.id}` : "-",
                      ],
                      ["Lunas pada", formatSuperAdminDate(detail.paid_at)],
                      ["Sinkron terakhir", formatSuperAdminDate(detail.last_synced_at)],
                    ].map(([label, value]) => (
                      <div key={label} className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)]">
                        <dt className="font-semibold text-brand/45">{label}</dt>
                        <dd className="break-all font-bold text-brand/80">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <section className="space-y-5">
                  {[
                    ["Payload checkout", detail.checkout_payload],
                    ["Payload callback", detail.callback_payload],
                    ["Payload status sync", detail.status_payload],
                  ].map(([label, payload]) => (
                    <article key={String(label)} className="soft-panel p-5 sm:p-6">
                      <h3 className="font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
                        {String(label)}
                      </h3>
                      <pre className="mt-4 max-h-[300px] overflow-auto rounded-[1.5rem] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                        {payloadToString(payload)}
                      </pre>
                    </article>
                  ))}
                </section>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
