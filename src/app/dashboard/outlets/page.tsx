import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getOutlets } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function DashboardOutletsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getOutlets>>;

  try {
    data = await getOutlets(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="outlets"
          eyebrow="Registri Outlet"
          title="Akses outlet tidak tersedia"
          description="Halaman ini saat ini dibatasi untuk owner dan admin outlet."
        >
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
            <p className="text-sm text-muted">
              Jika Anda ingin staff juga bisa melihat detail outlet, kita bisa evaluasi ulang scope aksesnya pada langkah berikutnya.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Daftar outlet belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="outlets"
      eyebrow="Ringkasan Jaringan"
      title="Registri outlet"
      description="Mengawasi semua pusat restorasi aktif, status operasional, dan kapasitas cabang dari satu workspace."
      actions={
        data.meta.can_create ? (
          <Link href="/dashboard/outlets/create" className="btn-primary w-full sm:w-auto">
            Tambah outlet baru
          </Link>
        ) : (
          <Link href="/dashboard/subscription" className="btn-secondary w-full sm:w-auto">
            Upgrade paket
          </Link>
        )
      }
    >
      <section className="mb-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            Ringkasan jaringan
          </p>
          <h2 className="mt-4 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
            Registri outlet
          </h2>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
            Mengawasi semua pusat restorasi aktif
          </p>
        </div>

        {!data.meta.can_create ? (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              Maksimal {data.meta.max_outlets ?? data.meta.current_outlets} outlet
            </span>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">
              Kapasitas paket sudah terpakai
            </p>
          </div>
        ) : null}
      </section>

      <section className="mb-12 grid gap-4 lg:grid-cols-[1fr_220px_auto]">
        <form action="/dashboard/outlets" className="contents">
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari outlet, slug, atau alamat"
            className="field-soft"
          />
          <select
            name="status"
            defaultValue={params.status ?? data.filters.status ?? ""}
            className="field-soft"
          >
            <option value="">Semua status</option>
            {data.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-accent w-full lg:w-auto">
            Terapkan
          </button>
        </form>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.8rem] bg-brand p-6 text-white shadow-[0_18px_40px_rgba(0,32,69,0.14)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
            Total outlet
          </p>
          <p className="mt-3 text-5xl font-[var(--font-display-sans)] font-extrabold">
            {data.summary.total_outlets}
          </p>
        </article>
        <article className="rounded-[1.8rem] bg-accent p-6 text-white shadow-[0_18px_40px_rgba(0,106,102,0.16)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/45">
            Outlet aktif
          </p>
          <p className="mt-3 text-5xl font-[var(--font-display-sans)] font-extrabold">
            {data.summary.active_outlets}
          </p>
        </article>
        <article className="rounded-[1.8rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted">
            Kapasitas paket
          </p>
          <p className="mt-3 text-xl font-[var(--font-display-sans)] font-extrabold text-brand">
            {data.meta.max_outlets === null
              ? "Unlimited outlet"
              : `${data.meta.current_outlets} dari ${data.meta.max_outlets}`}
          </p>
          <p className="mt-2 text-sm text-muted">Slot outlet yang sudah dipakai saat ini.</p>
        </article>
      </section>

      {data.outlets.data.length === 0 ? (
        <section className="rounded-[2rem] bg-white p-12 text-center shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-surface-soft text-accent/25">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-[var(--font-display-sans)] text-2xl font-extrabold italic text-brand">
            Belum ada outlet
          </h3>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
            Mulai bangun jaringan artisan Anda
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.outlets.data.map((outlet) => (
              <Link
                key={outlet.id}
                href={`/dashboard/outlets/${outlet.id}`}
                className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_14px_32px_rgba(25,28,30,0.05)] transition duration-300 hover:-translate-y-[2px] hover:shadow-[0_22px_44px_rgba(25,28,30,0.08)]"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/8 blur-2xl transition group-hover:bg-accent/12" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-[var(--font-display-sans)] font-extrabold italic text-brand transition group-hover:text-accent">
                      {outlet.name}
                    </h3>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-3 text-brand/65">
                        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
                          <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .95.68l1.49 4.49a1 1 0 0 1-.5 1.21l-2.26 1.13a11.04 11.04 0 0 0 5.52 5.52l1.13-2.26a1 1 0 0 1 1.21-.5l4.49 1.49a1 1 0 0 1 .69.95V19a2 2 0 0 1-2 2h-1C9.72 21 3 14.28 3 6V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {outlet.phone}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-brand/40">
                        <svg className="mt-0.5 h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
                          <path d="M12 20s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" />
                          <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                        </svg>
                        <span className="line-clamp-3 text-[11px] font-semibold uppercase tracking-[0.08em]">
                          {outlet.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                    outlet.status === "active"
                      ? "bg-[rgba(129,242,235,0.2)] text-accent-ink"
                      : "bg-surface-soft text-brand/55"
                  }`}>
                    {outlet.status}
                  </span>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-surface-soft p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/35">
                      Staf outlet
                    </p>
                    <p className="mt-2 text-lg font-[var(--font-display-sans)] font-extrabold text-brand">
                      {outlet.counts.users}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-surface-soft p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/35">
                      Layanan
                    </p>
                    <p className="mt-2 text-lg font-[var(--font-display-sans)] font-extrabold text-brand">
                      {outlet.counts.services}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Pickup</span>
                    <span className="font-bold text-brand">{formatRupiah(outlet.pickup_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Delivery</span>
                    <span className="font-bold text-brand">{formatRupiah(outlet.delivery_fee)}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-line/35 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand/40">
                      Sistem aktif
                    </span>
                  </div>
                  <span className="rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent transition group-hover:bg-accent group-hover:text-white">
                    Buka outlet
                  </span>
                </div>
              </Link>
            ))}
          </section>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">
              Halaman {data.outlets.current_page} dari {data.outlets.last_page}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              {data.outlets.current_page > 1 ? (
                <Link
                  href={`/dashboard/outlets?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(data.outlets.current_page - 1),
                  }).toString()}`}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Halaman sebelumnya
                </Link>
              ) : null}
              {data.outlets.current_page < data.outlets.last_page ? (
                <Link
                  href={`/dashboard/outlets?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.status ? { status: params.status } : {}),
                    page: String(data.outlets.current_page + 1),
                  }).toString()}`}
                  className="btn-primary w-full sm:w-auto"
                >
                  Halaman berikutnya
                </Link>
              ) : null}
            </div>
          </div>
        </>
      )}
    </DashboardFrame>
  );
}
