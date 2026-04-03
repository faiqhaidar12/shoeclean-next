"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { setDashboardFlash } from "@/lib/dashboard-flash";
import type { SuperAdminPricingPlan } from "@/lib/superadmin";
import { SuperAdminStatusBadge } from "@/components/superadmin-ui";

type PricingDraft = {
  id?: number;
  key: string;
  name: string;
  subtitle: string;
  price: string;
  description: string;
  cta: string;
  order_limit: string;
  max_outlets: string;
  quota: string;
  is_published: boolean;
  sort_order: string;
  features_text: string;
};

type Props = {
  plans: SuperAdminPricingPlan[];
};

const EMPTY_DRAFT: PricingDraft = {
  key: "",
  name: "",
  subtitle: "",
  price: "0",
  description: "",
  cta: "",
  order_limit: "",
  max_outlets: "",
  quota: "",
  is_published: true,
  sort_order: "10",
  features_text: "",
};

function toDraft(plan: SuperAdminPricingPlan): PricingDraft {
  return {
    id: plan.id,
    key: plan.key,
    name: plan.name,
    subtitle: plan.subtitle ?? "",
    price: String(plan.price),
    description: plan.description ?? "",
    cta: plan.cta ?? "",
    order_limit: plan.order_limit !== null ? String(plan.order_limit) : "",
    max_outlets: plan.max_outlets !== null ? String(plan.max_outlets) : "",
    quota: plan.quota !== null ? String(plan.quota) : "",
    is_published: plan.is_published,
    sort_order: String(plan.sort_order),
    features_text: plan.features.join("\n"),
  };
}

export function SuperAdminPricingManager({ plans }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<PricingDraft>(EMPTY_DRAFT);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function patchDraft(patch: Partial<PricingDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        draft.id ? `/api/superadmin/pricing/${draft.id}` : "/api/superadmin/pricing",
        {
          method: draft.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: draft.key,
            name: draft.name,
            subtitle: draft.subtitle,
            price: Number(draft.price || 0),
            description: draft.description,
            cta: draft.cta,
            order_limit: draft.order_limit ? Number(draft.order_limit) : null,
            max_outlets: draft.max_outlets ? Number(draft.max_outlets) : null,
            quota: draft.quota ? Number(draft.quota) : null,
            is_published: draft.is_published,
            sort_order: Number(draft.sort_order || 10),
            features: draft.features_text
              .split("\n")
              .map((feature) => feature.trim())
              .filter(Boolean),
          }),
        },
      );

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "Harga gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: draft.id ? "Harga diperbarui" : "Harga ditambahkan",
        message: payload.message ?? "Perubahan harga paket SaaS berhasil disimpan.",
      });
      setDraft(EMPTY_DRAFT);
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan harga.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(plan: SuperAdminPricingPlan) {
    if (!window.confirm(`Yakin ingin menghapus paket ${plan.name}?`)) return;

    try {
      const response = await fetch(`/api/superadmin/pricing/${plan.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Harga gagal dihapus.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: "Harga dihapus",
        message: payload.message ?? "Data harga paket sudah dihapus.",
      });

      if (draft.id === plan.id) {
        setDraft(EMPTY_DRAFT);
      }

      router.refresh();
    } catch {
      setError("Terjadi kendala saat menghapus harga.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(440px,0.9fr)_minmax(0,1.1fr)]">
      <section className="section-block p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              {draft.id ? "Ubah harga paket" : "Tambah harga paket"}
            </p>
            <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
              Katalog harga SaaS
            </h2>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-7 text-brand/55">
              Atur paket, fitur, harga, dan status publish yang tampil di halaman harga serta dashboard owner.
            </p>
          </div>
          {draft.id ? (
            <button type="button" onClick={() => setDraft(EMPTY_DRAFT)} className="btn-secondary">
              Batal
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Key paket
              </label>
              <input
                required
                value={draft.key}
                onChange={(event) => patchDraft({ key: event.target.value })}
                className="field-soft"
                placeholder="pro"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Nama paket
              </label>
              <input
                required
                value={draft.name}
                onChange={(event) => patchDraft({ name: event.target.value })}
                className="field-soft"
                placeholder="Pro"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Subjudul
              </label>
              <input
                value={draft.subtitle}
                onChange={(event) => patchDraft({ subtitle: event.target.value })}
                className="field-soft"
                placeholder="Untuk 1 cabang aktif"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Label CTA
              </label>
              <input
                value={draft.cta}
                onChange={(event) => patchDraft({ cta: event.target.value })}
                className="field-soft"
                placeholder="Upgrade ke Pro"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Harga
              </label>
              <input
                type="number"
                min="0"
                value={draft.price}
                onChange={(event) => patchDraft({ price: event.target.value })}
                className="field-soft"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Batas pesanan
              </label>
              <input
                type="number"
                min="0"
                value={draft.order_limit}
                onChange={(event) => patchDraft({ order_limit: event.target.value })}
                className="field-soft"
                placeholder="100"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Maks. cabang
              </label>
              <input
                type="number"
                min="0"
                value={draft.max_outlets}
                onChange={(event) => patchDraft({ max_outlets: event.target.value })}
                className="field-soft"
                placeholder="1"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Kuota top-up
              </label>
              <input
                type="number"
                min="0"
                value={draft.quota}
                onChange={(event) => patchDraft({ quota: event.target.value })}
                className="field-soft"
                placeholder="500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
              Deskripsi
            </label>
            <textarea
              value={draft.description}
              onChange={(event) => patchDraft({ description: event.target.value })}
              className="field-soft min-h-[140px]"
              placeholder="Deskripsi paket untuk landing page dan dashboard owner."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
              Fitur paket
            </label>
            <textarea
              value={draft.features_text}
              onChange={(event) => patchDraft({ features_text: event.target.value })}
              className="field-soft min-h-[180px]"
              placeholder="Tulis satu fitur per baris"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
            <label className="flex items-center justify-between rounded-[1.5rem] border border-black/5 bg-slate-50 px-5 py-4 text-sm font-bold text-brand">
              <span>Sudah dipublish</span>
              <input
                type="checkbox"
                checked={draft.is_published}
                onChange={(event) => patchDraft({ is_published: event.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-accent"
              />
            </label>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                Urutan
              </label>
              <input
                type="number"
                min="0"
                value={draft.sort_order}
                onChange={(event) => patchDraft({ sort_order: event.target.value })}
                className="field-soft"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Menyimpan..." : draft.id ? "Simpan perubahan" : "Simpan harga"}
          </button>
        </form>
      </section>

      <section className="section-block p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
              Daftar harga
            </p>
            <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
              Paket yang sedang tersedia
            </h2>
          </div>
          <span className="highlight-chip">{plans.length} item</span>
        </div>

        <div className="mt-8 space-y-4">
          {plans.length === 0 ? (
            <div className="soft-panel p-5 text-sm font-semibold text-brand/50">
              Belum ada harga yang tersimpan.
            </div>
          ) : (
            plans.map((plan) => (
              <article key={plan.id} className="soft-panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-[var(--font-display-sans)] text-xl font-black tracking-[-0.06em] text-brand">
                        {plan.name}
                      </h3>
                      <SuperAdminStatusBadge
                        label={plan.is_published ? "Publish" : "Coming Soon"}
                        tone={plan.is_published ? "emerald" : "amber"}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-brand/35">
                      {plan.key.toUpperCase()} | Urutan {plan.sort_order}
                    </p>
                    <p className="mt-3 text-sm font-semibold leading-7 text-brand/60">
                      {plan.subtitle || plan.description || "Belum ada deskripsi paket."}
                    </p>
                    <p className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.08em] text-brand">
                      {plan.price_label}
                      {plan.key === "topup" ? "" : "/bulan"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDraft(toDraft(plan))}
                      className="btn-secondary"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan)}
                      className="rounded-full bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
