"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type OutletOption = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  mode: "create" | "edit";
  outlets: OutletOption[];
  categories: string[];
  initialValues?: {
    id?: number;
    category?: string;
    amount?: number;
    description?: string | null;
    expense_date?: string | null;
    outlet_id?: number;
    outlet_name?: string | null;
  };
};

export function ExpenseForm({ mode, outlets, categories, initialValues }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(initialValues?.category ?? categories[0] ?? "Lainnya");
  const [amount, setAmount] = useState(String(initialValues?.amount ?? ""));
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [expenseDate, setExpenseDate] = useState(initialValues?.expense_date ?? new Date().toISOString().slice(0, 10));
  const [outletId, setOutletId] = useState(String(initialValues?.outlet_id ?? outlets[0]?.id ?? ""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountPreview = useMemo(() => {
    const numericAmount = Number(amount || 0);

    return Number.isFinite(numericAmount)
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(numericAmount)
      : "Rp0";
  }, [amount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/expenses" : `/api/expenses/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(mode === "create" ? { outlet_id: Number(outletId) } : {}),
          category,
          amount: Number(amount),
          description: description.trim() ? description : null,
          expense_date: expenseDate,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Pengeluaran gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Pengeluaran berhasil dicatat" : "Pengeluaran berhasil diperbarui",
        message: "Ringkasan keuangan cabang sudah ikut diperbarui.",
      });
      router.push("/dashboard/expenses");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan pengeluaran.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="grid gap-9 sm:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Jurnal biaya</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
              {mode === "create" ? "Catat pengeluaran baru" : "Perbarui catatan pengeluaran cabang"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Simpan pengeluaran dengan kategori dan tanggal yang jelas agar pemilik usaha mudah membaca arus kas cabang.
            </p>
          </div>

          <div className="soft-panel min-w-[220px] rounded-[1.5rem] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Preview nominal</p>
            <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
              {amountPreview}
            </p>
            <p className="mt-2 text-sm text-muted">Kategori <span className="font-semibold text-foreground">{category}</span></p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="expense-category" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Kategori
                </label>
                <select
                  id="expense-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="field-soft"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label htmlFor="expense-amount" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Nominal
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-brand/25">
                    RP
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="50000"
                    className="field-soft !pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="expense-date" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Tanggal pengeluaran
                </label>
                <input
                  id="expense-date"
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(event) => setExpenseDate(event.target.value)}
                  className="field-soft"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="expense-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Cabang
                </label>
                {mode === "create" ? (
                  <select
                    id="expense-outlet"
                    value={outletId}
                    onChange={(event) => setOutletId(event.target.value)}
                    className="field-soft"
                  >
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input id="expense-outlet" value={initialValues?.outlet_name ?? ""} disabled className="field-soft opacity-80" />
                )}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-line/45 bg-surface/70 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Catatan tambahan</p>
              <div className="mt-5 space-y-3">
                <label htmlFor="expense-description" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Deskripsi
                </label>
                <textarea
                  id="expense-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Tuliskan keterangan singkat agar pengeluaran ini lebih mudah dipahami saat ditinjau kembali."
                  className="field-soft min-h-[160px]"
                />
              </div>
            </div>
          </section>

          <aside className="section-dark rounded-[1.75rem] p-6 sm:p-7 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Panduan pencatatan</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>Pilih kategori yang paling sesuai agar laporan bulanan tetap mudah dibaca pemilik usaha.</p>
              <p>Tambahkan deskripsi singkat jika pengeluaran bersifat tidak rutin, misalnya penggantian alat atau kebutuhan event.</p>
              <p>Gunakan tanggal transaksi aktual supaya grafik laporan dan ekspor biaya tetap akurat.</p>
            </div>
          </aside>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}

      <div className="mt-9 flex flex-col gap-4 border-t border-line/35 pt-8 sm:flex-row">
        <button type="button" onClick={() => router.push("/dashboard/expenses")} className="btn-secondary w-full flex-1">
          {mode === "create" ? "Batalkan pencatatan" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan pengeluaran" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
