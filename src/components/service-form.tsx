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
  units: string[];
  statuses?: string[];
  initialValues?: {
    id?: number;
    name?: string;
    unit?: string;
    price?: number;
    status?: string;
    outlet_id?: number;
  };
};

export function ServiceForm({
  mode,
  outlets,
  units,
  statuses = ["active", "inactive"],
  initialValues,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [unit, setUnit] = useState(initialValues?.unit ?? units[0] ?? "pasang");
  const [price, setPrice] = useState(String(initialValues?.price ?? ""));
  const [status, setStatus] = useState(initialValues?.status ?? "active");
  const [outletId, setOutletId] = useState(String(initialValues?.outlet_id ?? outlets[0]?.id ?? ""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePreview = useMemo(() => {
    const numericPrice = Number(price || 0);

    return Number.isFinite(numericPrice)
      ? new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(numericPrice)
      : "Rp0";
  }, [price]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/services" : `/api/services/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          unit,
          price: Number(price),
          status,
          outlet_id: Number(outletId),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Layanan gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Layanan berhasil dibuat" : "Layanan berhasil diperbarui",
        message: "Tim outlet sekarang bisa langsung memakai layanan ini saat membuat pesanan.",
      });
      router.push("/dashboard/services");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan layanan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="grid gap-9 sm:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Katalog layanan</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
              {mode === "create" ? "Bangun layanan unggulan baru" : "Rapikan detail layanan outlet"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Pastikan nama, unit, dan harga layanan jelas agar tim kasir dan customer melihat struktur layanan yang konsisten.
            </p>
          </div>

          <div className="soft-panel min-w-[220px] rounded-[1.5rem] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Preview harga</p>
            <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
              {pricePreview}
            </p>
            <p className="mt-2 text-sm text-muted">
              Unit <span className="font-semibold text-foreground">{unit}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="service-name" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Nama layanan *
                </label>
                <input
                  id="service-name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Deep Clean Signature"
                  className="field-soft"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="service-unit" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Unit layanan
                </label>
                <select
                  id="service-unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  className="field-soft"
                >
                  {units.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label htmlFor="service-price" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Harga layanan *
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-brand/25">
                    RP
                  </span>
                  <input
                    id="service-price"
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="25000"
                    className="field-soft !pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-line/45 bg-surface/70 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Penempatan layanan</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="service-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                    Outlet
                  </label>
                  <select
                    id="service-outlet"
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
                </div>

                <div className="space-y-3">
                  <label htmlFor="service-status" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                    Status layanan
                  </label>
                  <select
                    id="service-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="field-soft"
                    disabled={mode === "create" && statuses.length <= 1}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <aside className="section-dark rounded-[1.75rem] p-6 sm:p-7 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Panduan operasional</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>
                Gunakan nama layanan yang mudah dikenali kasir, misalnya berdasarkan hasil akhir atau level treatment.
              </p>
              <p>
                Harga akan dipakai ulang di order internal dan storefront, jadi hindari singkatan yang membingungkan tim outlet.
              </p>
              <p>
                Status <span className="font-semibold text-white">inactive</span> cocok saat layanan sedang disembunyikan sementara tanpa harus dihapus.
              </p>
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
        <button type="button" onClick={() => router.push("/dashboard/services")} className="btn-secondary w-full flex-1">
          {mode === "create" ? "Batalkan tambah" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan layanan" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
