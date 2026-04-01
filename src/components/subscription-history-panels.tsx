"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";

type SubscriptionEntry = {
  id: number;
  plan: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  mayar_transaction_id: string | null;
  amount: number | null;
  amount_label: string | null;
  receipt_item: string;
};

type QuotaEntry = {
  id: number;
  quota_total: number;
  quota_used: number;
  quota_remaining: number;
  purchased_at: string | null;
  mayar_transaction_id: string | null;
  amount: number | null;
  amount_label: string | null;
  receipt_item: string;
};

type ReceiptState =
  | {
      kind: "subscription";
      title: string;
      date: string;
      transactionId: string;
      item: string;
      amountLabel: string;
      metaLabel: string;
      metaValue: string;
    }
  | {
      kind: "quota";
      title: string;
      date: string;
      transactionId: string;
      item: string;
      amountLabel: string;
      metaLabel: string;
      metaValue: string;
    }
  | null;

type Props = {
  customerName: string;
  subscriptionHistory: SubscriptionEntry[];
  quotaHistory: QuotaEntry[];
};

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SubscriptionHistoryPanels({ customerName, subscriptionHistory, quotaHistory }: Props) {
  const [activeReceipt, setActiveReceipt] = useState<ReceiptState>(null);

  const merchantLabel = useMemo(() => "ShoeClean Business Suite", []);

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Riwayat subscription</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">Aktivitas paket terbaru</h2>
          <div className="dashboard-panel-stack mt-6">
            {subscriptionHistory.map((subscription) => (
              <div key={subscription.id} className="soft-panel p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="min-w-0">
                    <p className="font-semibold capitalize text-foreground">{subscription.plan}</p>
                    <p className="mt-1 text-sm text-muted">
                      Aktif hingga {subscription.expires_at ? formatDate(subscription.expires_at) : "tanpa batas"}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        subscription.status === "active"
                          ? "bg-[#edf4f1] text-accent"
                          : subscription.status === "expired"
                            ? "bg-[#fff1ee] text-[#9a3b2b]"
                            : "bg-surface text-muted"
                      }`}
                    >
                      {subscription.status}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReceipt({
                          kind: "subscription",
                          title: "Nota Tagihan",
                          date: formatDate(subscription.started_at),
                          transactionId: subscription.mayar_transaction_id ?? "manual",
                          item: subscription.receipt_item,
                          amountLabel: subscription.amount_label ?? formatRupiah(subscription.amount ?? 0),
                          metaLabel: "Status",
                          metaValue: subscription.status,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand/70 shadow-sm ring-1 ring-black/5 transition hover:text-brand"
                    >
                      Nota
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {subscriptionHistory.length === 0 ? <div className="soft-panel p-4 text-sm text-muted">Belum ada riwayat subscription.</div> : null}
          </div>
        </section>

        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Riwayat top-up quota</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">Tambahan order quota terbaru</h2>
          <div className="dashboard-panel-stack mt-6">
            {quotaHistory.map((quota) => (
              <div key={quota.id} className="soft-panel p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{quota.quota_total} order</p>
                    <p className="mt-1 text-sm text-muted">
                      Sisa {quota.quota_remaining} · Dibeli {formatDate(quota.purchased_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span className="inline-flex rounded-full bg-[#edf4f1] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                      Masuk
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReceipt({
                          kind: "quota",
                          title: "Nota Tagihan",
                          date: formatDate(quota.purchased_at),
                          transactionId: quota.mayar_transaction_id ?? "manual",
                          item: quota.receipt_item,
                          amountLabel: quota.amount_label ?? formatRupiah(quota.amount ?? 0),
                          metaLabel: "Sisa quota",
                          metaValue: `${quota.quota_remaining}/${quota.quota_total}`,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand/70 shadow-sm ring-1 ring-black/5 transition hover:text-brand"
                    >
                      Nota
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {quotaHistory.length === 0 ? <div className="soft-panel p-4 text-sm text-muted">Belum ada riwayat top-up quota.</div> : null}
          </div>
        </section>
      </div>

      {activeReceipt ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm" onClick={() => setActiveReceipt(null)}>
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_26px_80px_rgba(0,32,69,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-dashed border-line/70 bg-gradient-to-br from-slate-50 to-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand text-white shadow-[0_14px_30px_rgba(0,32,69,0.18)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M14 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">{activeReceipt.title}</h2>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">{merchantLabel}</p>
            </div>

            <div className="space-y-4 p-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Tanggal</span>
                <span className="font-bold text-brand">{activeReceipt.date}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">No. Transaksi</span>
                <span className="max-w-[170px] truncate text-right font-bold text-brand" title={activeReceipt.transactionId}>
                  {activeReceipt.transactionId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Pelanggan</span>
                <span className="font-bold text-brand">{customerName}</span>
              </div>

              <div className="border-t border-dashed border-line/80" />

              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="max-w-[60%] font-bold leading-tight text-brand">{activeReceipt.item}</span>
                <span className="font-bold text-brand">{activeReceipt.amountLabel}</span>
              </div>

              <div className="border-t border-dashed border-line/80" />

              <div className="rounded-[1.15rem] border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">Total Dibayar</span>
                  <span className="text-lg font-extrabold text-emerald-700">{activeReceipt.amountLabel}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{activeReceipt.metaLabel}</span>
                <span className="font-bold text-brand">{activeReceipt.metaValue}</span>
              </div>
            </div>

            <div className="border-t border-line/50 bg-slate-50 px-8 py-5">
              <button type="button" onClick={() => setActiveReceipt(null)} className="btn-secondary w-full">
                Tutup nota
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
