"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type OutletOption = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  mode: "create" | "edit";
  outlets: OutletOption[];
  initialValues?: {
    id?: number;
    name?: string;
    phone?: string;
    address?: string | null;
    email?: string | null;
    outlet_id?: number;
  };
};

export function CustomerForm({ mode, outlets, initialValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [outletId, setOutletId] = useState(
    String(initialValues?.outlet_id ?? outlets[0]?.id ?? ""),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "create"
          ? "/api/customers"
          : `/api/customers/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          email,
          outlet_id: Number(outletId),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;
        setError(firstError ?? payload.message ?? "Customer gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Pelanggan berhasil ditambahkan" : "Pelanggan berhasil diperbarui",
        message: "Data pelanggan sudah masuk ke daftar operasional outlet.",
      });
      router.push("/dashboard/customers");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan customer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
              Data pelanggan
            </p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
              {mode === "create" ? "Informasi customer baru" : "Perbarui detail customer"}
            </h2>
          </div>
          {mode === "edit" ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-brand/30">
                Pelanggan aktif
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3 sm:col-span-2">
            <label htmlFor="customer-name" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
              Nama pelanggan *
            </label>
            <input
              id="customer-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="field-soft"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="customer-phone" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
              Nomor HP / WhatsApp *
            </label>
            <input
              id="customer-phone"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="08xxxxxxxxxx"
              className="field-soft font-mono"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="customer-email" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="opsional@email.com"
              className="field-soft"
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <label htmlFor="customer-address" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
              Alamat lengkap
            </label>
            <textarea
              id="customer-address"
              rows={4}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Masukkan alamat lengkap pelanggan..."
              className="field-soft"
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <label htmlFor="customer-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
              Outlet
            </label>
            <select
              id="customer-outlet"
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
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-line/35 pt-8 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push("/dashboard/customers")}
          className="btn-secondary w-full flex-1"
        >
          {mode === "create" ? "Batalkan tambah" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan pelanggan"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
