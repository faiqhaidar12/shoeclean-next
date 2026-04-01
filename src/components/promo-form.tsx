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
  types: string[];
  canManageGlobal: boolean;
  initialValues?: {
    id?: number;
    outlet_id?: number | null;
    code?: string;
    name?: string;
    type?: string;
    value?: number;
    min_order?: number;
    max_discount?: number | null;
    max_uses?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    is_active?: boolean;
  };
};

export function PromoForm({ mode, outlets, types, canManageGlobal, initialValues }: Props) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(
    initialValues?.outlet_id === null ? "global" : String(initialValues?.outlet_id ?? outlets[0]?.id ?? "global"),
  );
  const [code, setCode] = useState(initialValues?.code ?? "");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [type, setType] = useState(initialValues?.type ?? types[0] ?? "percentage");
  const [value, setValue] = useState(String(initialValues?.value ?? ""));
  const [minOrder, setMinOrder] = useState(String(initialValues?.min_order ?? 0));
  const [maxDiscount, setMaxDiscount] = useState(String(initialValues?.max_discount ?? ""));
  const [maxUses, setMaxUses] = useState(String(initialValues?.max_uses ?? ""));
  const [startDate, setStartDate] = useState(initialValues?.start_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(
    initialValues?.end_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const valueSuffix = useMemo(() => (type === "percentage" ? "%" : "rupiah"), [type]);
  const promoPreview = useMemo(() => {
    const numericValue = Number(value || 0);

    if (type === "percentage") return `${numericValue || 0}%`;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericValue || 0);
  }, [type, value]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/promos" : `/api/promos/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlet_id: outletId === "global" ? null : Number(outletId),
          code: code.trim().toUpperCase(),
          name,
          type,
          value: Number(value),
          min_order: Number(minOrder || 0),
          max_discount: type === "percentage" && maxDiscount ? Number(maxDiscount) : null,
          max_uses: maxUses ? Number(maxUses) : null,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Promo gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Promo berhasil dibuat" : "Promo berhasil diperbarui",
        message: "Pengaturan promo siap dipakai di storefront dan order internal.",
      });
      router.push("/dashboard/promos");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan promo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="grid gap-9 sm:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Campaign promo</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
              {mode === "create" ? "Bangun promo baru untuk campaign outlet" : "Perbarui konfigurasi promo aktif"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Atur kode promo, periode, dan batas penggunaan dengan ritme yang rapi agar storefront dan order internal selalu sinkron.
            </p>
          </div>

          <div className="soft-panel min-w-[220px] rounded-[1.5rem] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Preview benefit</p>
            <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{promoPreview}</p>
            <p className="mt-2 text-sm text-muted">Tipe <span className="font-semibold text-foreground">{type}</span></p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="promo-code" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Kode promo</label>
                <input id="promo-code" required maxLength={20} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="HEMAT10" className="field-soft font-mono" />
              </div>
              <div className="space-y-3">
                <label htmlFor="promo-name" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Nama promo</label>
                <input id="promo-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Promo akhir pekan" className="field-soft" />
              </div>
              <div className="space-y-3">
                <label htmlFor="promo-type" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Tipe diskon</label>
                <select id="promo-type" value={type} onChange={(event) => setType(event.target.value)} className="field-soft">
                  {types.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label htmlFor="promo-value" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Nilai diskon ({valueSuffix})</label>
                <input id="promo-value" type="number" min={1} required value={value} onChange={(event) => setValue(event.target.value)} placeholder={type === "percentage" ? "10" : "15000"} className="field-soft" />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-line/45 bg-surface/70 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Cakupan dan aturan</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="promo-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Outlet</label>
                  <select id="promo-outlet" value={outletId} onChange={(event) => setOutletId(event.target.value)} className="field-soft">
                    {canManageGlobal ? <option value="global">Semua outlet</option> : null}
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label htmlFor="promo-min-order" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Minimum order</label>
                  <input id="promo-min-order" type="number" min={0} value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="0" className="field-soft" />
                </div>
                {type === "percentage" ? (
                  <div className="space-y-3">
                    <label htmlFor="promo-max-discount" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Maksimal diskon</label>
                    <input id="promo-max-discount" type="number" min={0} value={maxDiscount} onChange={(event) => setMaxDiscount(event.target.value)} placeholder="50000" className="field-soft" />
                  </div>
                ) : null}
                <div className="space-y-3">
                  <label htmlFor="promo-max-uses" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Batas penggunaan</label>
                  <input id="promo-max-uses" type="number" min={1} value={maxUses} onChange={(event) => setMaxUses(event.target.value)} placeholder="Kosongkan jika unlimited" className="field-soft" />
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-line/45 bg-surface/70 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Periode promo</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="promo-start" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Mulai berlaku</label>
                  <input id="promo-start" type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className="field-soft" />
                </div>
                <div className="space-y-3">
                  <label htmlFor="promo-end" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Tanggal berakhir</label>
                  <input id="promo-end" type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} className="field-soft" />
                </div>
              </div>
            </div>

            <label className="soft-panel flex items-start gap-3 p-5">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="mt-1 h-4 w-4 rounded border-line" />
              <span>
                <span className="block font-semibold text-foreground">Promo aktif</span>
                <span className="mt-1 block text-sm leading-7 text-muted">Nonaktifkan jika promo ingin disimpan dulu tanpa muncul di storefront.</span>
              </span>
            </label>
          </section>

          <aside className="section-dark rounded-[1.75rem] p-6 sm:p-7 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Panduan campaign</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>Gunakan kode promo yang pendek dan mudah diingat customer agar konversi checkout tetap tinggi.</p>
              <p>Untuk diskon persentase, gunakan maksimal diskon jika owner ingin menjaga margin tetap sehat.</p>
              <p>Promo global cocok untuk kampanye besar, sedangkan promo outlet cocok untuk aktivasi cabang tertentu.</p>
            </div>
          </aside>
        </div>
      </div>

      {error ? <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">{error}</div> : null}

      <div className="mt-9 flex flex-col gap-4 border-t border-line/35 pt-8 sm:flex-row">
        <button type="button" onClick={() => router.push("/dashboard/promos")} className="btn-secondary w-full flex-1">
          {mode === "create" ? "Batalkan campaign" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan promo" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
