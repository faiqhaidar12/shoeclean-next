import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getPromos } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    type?: string;
    outlet_id?: string;
    page?: string;
  }>;
};

const statusTone: Record<string, string> = {
  running: "bg-[#edf4f1] text-accent",
  scheduled: "bg-[#eef4ff] text-[#315ea8]",
  expired: "bg-[#fff1ee] text-[#9a3b2b]",
  inactive: "bg-surface text-muted",
};

export default async function DashboardPromosPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getPromos>>;

  try {
    data = await getPromos(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="promos"
          eyebrow="Promo Cabang"
          title="Promo belum tersedia di paket Anda."
          description="Fitur promo mengikuti paket langganan pemilik usaha. Upgrade ke Pro atau Bisnis untuk mengelola promo dari halaman ini."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Setelah paket di-upgrade, halaman ini akan langsung aktif dan bisa dipakai tanpa pengaturan tambahan.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Daftar promo belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="promos"
      eyebrow="Promo Cabang"
      title="Kelola promo cabang"
      description="Atur kode promo untuk pemesanan pelanggan dan pesanan internal tanpa kehilangan kontrol atas periode, batas penggunaan, dan cakupan cabang."
      actions={<Link href="/dashboard/promos/create" className="btn-primary w-full sm:w-auto">Tambah promo</Link>}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total promo</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.summary.total_promos}</p>
          <p className="mt-2 text-sm text-muted">Jumlah promo yang tercatat untuk usaha Anda saat ini.</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Promo aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.summary.active_promos}</p>
          <p className="mt-2 text-sm text-muted">Promo yang saat ini bisa dipakai pelanggan atau tim kasir.</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Akses promo</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-white">
            {data.meta.can_manage_global ? "Bisa kelola semua cabang" : "Khusus cabang"}
          </p>
          <p className="mt-2 text-sm text-white/72">
            {data.meta.can_manage_global ? "Akun ini bisa membuat promo untuk semua cabang." : "Akun ini hanya bisa membuat promo untuk cabang tertentu."}
          </p>
        </article>
      </section>

      <form action="/dashboard/promos" className="section-block p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter promo</p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">Temukan promo yang ingin diperbarui</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">Cari berdasarkan kode atau nama promo, lalu saring menurut status, tipe diskon, dan cabang.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_220px_auto]">
          <input type="text" name="search" defaultValue={params.search ?? ""} placeholder="Cari kode atau nama promo" className="field-soft" />
          <select name="status" defaultValue={params.status ?? data.filters.status ?? ""} className="field-soft">
            <option value="">Semua status</option>
            {data.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select name="type" defaultValue={params.type ?? data.filters.type ?? ""} className="field-soft">
            <option value="">Semua tipe</option>
            {data.types.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select name="outlet_id" defaultValue={params.outlet_id ?? String(data.filters.outlet_id ?? "")} className="field-soft">
            <option value="">Semua cabang</option>
            {data.outlets.map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}
          </select>
          <button type="submit" className="btn-accent w-full lg:w-auto">Terapkan</button>
        </div>
      </form>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-block p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori promo</p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.promos.total} promo ditemukan</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">Buka salah satu promo untuk mengubah nilai diskon, masa aktif, atau batas penggunaannya.</p>
            </div>
            <span className="highlight-chip">Halaman {data.promos.current_page} dari {data.promos.last_page}</span>
          </div>

          <div className="dashboard-panel-stack mt-6 xl:hidden">
            {data.promos.data.map((promo) => (
              <Link key={promo.id} href={`/dashboard/promos/${promo.id}`} className="soft-panel block p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-bold text-foreground">{promo.code}</p>
                      <span className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${statusTone[promo.availability_status] ?? "bg-surface text-muted"}`}>{promo.availability_label}</span>
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{promo.name}</p>
                    <p className="mt-1 text-sm text-muted">{promo.outlet?.name ?? "Semua cabang"} · {promo.type === "percentage" ? "Persentase" : "Nominal"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand">{promo.type === "percentage" ? `${promo.value}%` : formatRupiah(promo.value)}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand/35">Dipakai {promo.used_count}{promo.max_uses ? ` / ${promo.max_uses}` : "+"}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted">Berlaku {promo.start_date ?? "-"} sampai {promo.end_date ?? "-"}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 hidden xl:block">
            <div className="overflow-x-auto rounded-[1.75rem] border border-line/40">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[180px_minmax(0,1.2fr)_200px_180px_160px] gap-4 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  <span>Kode</span><span>Detail</span><span>Cabang / Periode</span><span>Manfaat</span><span>Status</span>
                </div>
                <div className="divide-y divide-line/35">
                  {data.promos.data.map((promo) => (
                    <Link key={promo.id} href={`/dashboard/promos/${promo.id}`} className="grid grid-cols-[180px_minmax(0,1.2fr)_200px_180px_160px] gap-4 px-6 py-5 transition hover:bg-slate-50/90">
                      <div>
                        <p className="font-mono text-sm font-bold text-foreground">{promo.code}</p>
                        <p className="mt-1 text-sm text-muted">{promo.type === "percentage" ? "Persentase" : "Nominal"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{promo.name}</p>
                        <p className="mt-1 truncate text-sm text-muted">Buka untuk mengubah aturan dan periode promo</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{promo.outlet?.name ?? "Semua cabang"}</p>
                        <p className="mt-1 truncate text-sm text-muted">{promo.start_date ?? "-"} sampai {promo.end_date ?? "-"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-brand">{promo.type === "percentage" ? `${promo.value}%` : formatRupiah(promo.value)}</p>
                        <p className="mt-1 text-sm text-muted">Dipakai {promo.used_count}{promo.max_uses ? ` / ${promo.max_uses}` : "+"}</p>
                      </div>
                      <div className="flex items-start">
                        <span className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${statusTone[promo.availability_status] ?? "bg-surface text-muted"}`}>{promo.availability_label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {data.promos.data.length === 0 ? <div className="soft-panel mt-6 p-5 text-sm text-muted">Belum ada promo yang cocok dengan filter ini.</div> : null}

          <div className="mobile-stack mt-6">
            {data.promos.current_page > 1 ? <Link href={`/dashboard/promos?${new URLSearchParams({ ...(params.search ? { search: params.search } : {}), ...(params.status ? { status: params.status } : {}), ...(params.type ? { type: params.type } : {}), ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}), page: String(data.promos.current_page - 1) }).toString()}`} className="btn-secondary w-full sm:w-auto">Halaman sebelumnya</Link> : null}
            {data.promos.current_page < data.promos.last_page ? <Link href={`/dashboard/promos?${new URLSearchParams({ ...(params.search ? { search: params.search } : {}), ...(params.status ? { status: params.status } : {}), ...(params.type ? { type: params.type } : {}), ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}), page: String(data.promos.current_page + 1) }).toString()}`} className="btn-secondary w-full sm:w-auto">Halaman berikutnya</Link> : null}
          </div>
        </div>

        <aside className="dashboard-panel-stack">
          <section className="section-dark rounded-[1.75rem] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Ringkasan promo</p>
            <div className="mt-5 space-y-4">
              <div className="soft-panel-dark p-4">
                <p className="text-sm text-white/70">Total promo</p>
                <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">{data.summary.total_promos}</p>
              </div>
              <div className="soft-panel-dark p-4">
                <p className="text-sm text-white/70">Promo sedang aktif</p>
                <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">{data.summary.active_promos}</p>
              </div>
            </div>
          </section>

          <section className="section-block p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Jenis promo</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.types.map((type) => <span key={type} className="highlight-chip">{type}</span>)}
            </div>
          </section>
        </aside>
      </section>
    </DashboardFrame>
  );
}

