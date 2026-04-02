"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/format";

type SubscriptionEntry = {
  id: number;
  plan: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  payment_gateway: string | null;
  transaction_id: string | null;
  reference_id: string | null;
  amount: number | null;
  amount_label: string | null;
  receipt_item: string;
  payment_transaction: {
    gateway: string | null;
    merchant_order_id: string | null;
    reference: string | null;
    payment_method: string | null;
    status_code: string | null;
    status_message: string | null;
    paid_at: string | null;
  } | null;
};

type QuotaEntry = {
  id: number;
  quota_total: number;
  quota_used: number;
  quota_remaining: number;
  purchased_at: string | null;
  payment_gateway: string | null;
  transaction_id: string | null;
  reference_id: string | null;
  amount: number | null;
  amount_label: string | null;
  receipt_item: string;
  payment_transaction: {
    gateway: string | null;
    merchant_order_id: string | null;
    reference: string | null;
    payment_method: string | null;
    status_code: string | null;
    status_message: string | null;
    paid_at: string | null;
  } | null;
};

type ReceiptState = {
  title: string;
  date: string;
  transactionId: string;
  item: string;
  amountLabel: string;
  metaLabel: string;
  metaValue: string;
  reference: string;
  paymentMethod: string;
  paidAt: string;
  gateway: string;
} | null;

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

function statusLabel(status: string) {
  if (status === "active") return "Aktif";
  if (status === "expired") return "Berakhir";
  return status;
}

function TableActionButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-end text-right text-[11px] font-black uppercase tracking-[0.18em] text-accent transition hover:text-brand"
    >
      {label}
    </button>
  );
}

export function SubscriptionHistoryPanels({ customerName, subscriptionHistory, quotaHistory }: Props) {
  const [activeReceipt, setActiveReceipt] = useState<ReceiptState>(null);
  const merchantLabel = useMemo(() => "ShoeClean Business Suite", []);

  return (
    <>
      <div className="dashboard-panel-stack min-w-0">
        <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Riwayat langganan</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
            Aktivitas paket terbaru
          </h2>

          {subscriptionHistory.length === 0 ? (
            <div className="soft-panel mt-6 p-4 text-sm text-muted">Belum ada riwayat langganan.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[140px_190px_190px_170px_130px_140px] gap-4 rounded-[1.25rem] bg-slate-50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  <span>Paket</span>
                  <span>Masa aktif terbaru</span>
                  <span>Pembayaran terakhir</span>
                  <span>Tagihan</span>
                  <span>Status</span>
                  <span className="text-right">Aksi</span>
                </div>
                <div className="mt-3 space-y-3">
                  {subscriptionHistory.map((subscription) => (
                    <div key={subscription.id} className="soft-panel p-5">
                      <div className="grid grid-cols-[140px_190px_190px_170px_130px_140px] items-center gap-4">
                        <div>
                          <p className="font-semibold capitalize text-foreground">{subscription.plan}</p>
                          <p className="mt-1 text-xs text-muted">
                            {subscription.payment_transaction?.payment_method?.toUpperCase() ?? "-"}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                          {subscription.expires_at ? formatDate(subscription.expires_at) : "Tanpa batas"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(subscription.payment_transaction?.paid_at ?? subscription.started_at)}
                          </p>
                          <p
                            className="mt-1 truncate text-xs text-muted"
                            title={subscription.payment_transaction?.reference ?? "-"}
                          >
                            {subscription.payment_transaction?.reference ?? "-"}
                          </p>
                        </div>
                        <div className="font-[var(--font-display-sans)] text-lg font-extrabold tracking-tight text-brand">
                          {subscription.amount_label ?? formatRupiah(subscription.amount ?? 0)}
                        </div>
                        <div>
                          <span
                            className={`inline-flex min-h-8 items-center rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                              subscription.status === "active"
                                ? "bg-[#edf4f1] text-accent"
                                : subscription.status === "expired"
                                  ? "bg-[#fff1ee] text-[#9a3b2b]"
                                  : "bg-surface text-muted"
                            }`}
                          >
                            {statusLabel(subscription.status)}
                          </span>
                        </div>
                        <div className="flex min-w-0 items-center justify-end">
                          <TableActionButton
                            label="Nota"
                            onClick={() =>
                              setActiveReceipt({
                                title: "Nota Tagihan",
                                date: formatDate(subscription.started_at),
                                transactionId: subscription.transaction_id ?? "manual",
                                item: subscription.receipt_item,
                                amountLabel: subscription.amount_label ?? formatRupiah(subscription.amount ?? 0),
                                metaLabel: "Status",
                                metaValue: statusLabel(subscription.status),
                                reference: subscription.payment_transaction?.reference ?? "-",
                                paymentMethod: subscription.payment_transaction?.payment_method ?? "-",
                                paidAt: formatDate(subscription.payment_transaction?.paid_at ?? subscription.started_at),
                                gateway: subscription.payment_transaction?.gateway ?? (subscription.payment_gateway ?? "-"),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Riwayat top-up kuota</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
            Tambahan kuota pesanan terbaru
          </h2>

          {quotaHistory.length === 0 ? (
            <div className="soft-panel mt-6 p-4 text-sm text-muted">Belum ada riwayat top-up kuota.</div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[170px_180px_180px_170px_140px] gap-4 rounded-[1.25rem] bg-slate-50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  <span>Kuota</span>
                  <span>Dibeli</span>
                  <span>Sisa</span>
                  <span>Tagihan</span>
                  <span className="text-right">Aksi</span>
                </div>
                <div className="mt-3 space-y-3">
                  {quotaHistory.map((quota) => (
                    <div key={quota.id} className="soft-panel p-5">
                      <div className="grid grid-cols-[170px_180px_180px_170px_140px] items-center gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{quota.quota_total} pesanan</p>
                          <p className="mt-1 text-xs text-muted">
                            {quota.payment_transaction?.payment_method?.toUpperCase() ?? "-"}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-foreground">{formatDate(quota.purchased_at)}</div>
                        <div className="text-sm font-semibold text-foreground">
                          {quota.quota_remaining}/{quota.quota_total}
                        </div>
                        <div className="font-[var(--font-display-sans)] text-lg font-extrabold tracking-tight text-brand">
                          {quota.amount_label ?? formatRupiah(quota.amount ?? 0)}
                        </div>
                        <div className="flex min-w-0 items-center justify-end">
                          <TableActionButton
                            label="Nota"
                            onClick={() =>
                              setActiveReceipt({
                                title: "Nota Tagihan",
                                date: formatDate(quota.purchased_at),
                                transactionId: quota.transaction_id ?? "manual",
                                item: quota.receipt_item,
                                amountLabel: quota.amount_label ?? formatRupiah(quota.amount ?? 0),
                                metaLabel: "Sisa kuota",
                                metaValue: `${quota.quota_remaining}/${quota.quota_total}`,
                                reference: quota.payment_transaction?.reference ?? "-",
                                paymentMethod: quota.payment_transaction?.payment_method ?? "-",
                                paidAt: formatDate(quota.payment_transaction?.paid_at ?? quota.purchased_at),
                                gateway: quota.payment_transaction?.gateway ?? (quota.payment_gateway ?? "-"),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {activeReceipt ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-brand/45 p-4 backdrop-blur-sm"
          onClick={() => setActiveReceipt(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_26px_80px_rgba(0,32,69,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-dashed border-line/70 bg-gradient-to-br from-slate-50 to-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand text-white shadow-[0_14px_30px_rgba(0,32,69,0.18)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <path
                    d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M14 4v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
                {activeReceipt.title}
              </h2>
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
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">Referensi</span>
                <span className="max-w-[170px] truncate text-right font-bold text-brand" title={activeReceipt.reference}>
                  {activeReceipt.reference}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Metode bayar</span>
                <span className="font-bold uppercase text-brand">{activeReceipt.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Gateway</span>
                <span className="font-bold uppercase text-brand">{activeReceipt.gateway}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Lunas pada</span>
                <span className="font-bold text-brand">{activeReceipt.paidAt}</span>
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
