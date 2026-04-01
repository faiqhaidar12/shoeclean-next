import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getTeam } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    outlet_id?: string;
    page?: string;
  }>;
};

export default async function DashboardTeamPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getTeam>>;

  try {
    data = await getTeam(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Modul tim belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const editableUsers = data.users.data.filter((user) => user.permissions.can_edit).length;

  return (
    <DashboardFrame
      current="team"
      eyebrow="Tim Outlet"
      title="Kelola admin dan staff."
      description="Owner dan admin bisa mengatur user team outlet langsung dari dashboard baru dengan struktur akses yang lebih mudah dibaca."
      actions={
        <Link href="/dashboard/team/create" className="btn-primary w-full sm:w-auto">
          Tambah user team
        </Link>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total personel</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {data.users.total}
          </p>
          <p className="mt-2 text-sm text-muted">Jumlah anggota tim yang berada dalam scope akun aktif saat ini.</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Bisa dikelola</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {editableUsers}
          </p>
          <p className="mt-2 text-sm text-muted">Anggota tim yang dapat diperbarui langsung oleh role Anda saat ini.</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Role aktor</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
            {data.meta.actor_role ?? "team"}
          </p>
          <p className="mt-2 text-sm text-white/72">Hak kelola daftar staf mengikuti role login yang sedang digunakan sekarang.</p>
        </article>
      </section>

      <form action="/dashboard/team" className="section-block p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter personel</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
              Temukan anggota tim yang ingin dikelola
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Cari berdasarkan nama atau email, lalu saring menurut outlet untuk mempercepat pengelolaan akun staf.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_240px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari nama atau email"
            className="field-soft"
          />
          <select
            name="outlet_id"
            defaultValue={params.outlet_id ?? String(data.filters.outlet_id ?? "")}
            className="field-soft"
          >
            <option value="">Semua outlet</option>
            {data.outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-accent w-full lg:w-auto">
            Terapkan
          </button>
        </div>
      </form>

      <section className="section-block p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori tim</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
              {data.users.total} user ditemukan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Buka profil anggota tim untuk memperbarui role, outlet, atau kredensial login sesuai kewenangan Anda.
            </p>
          </div>
          <span className="highlight-chip">Aktor: {data.meta.actor_role ?? "team"}</span>
        </div>

        <div className="dashboard-panel-stack mt-6 lg:hidden">
          {data.users.data.map((user) =>
            user.permissions.can_edit ? (
              <Link
                key={user.id}
                href={`/dashboard/team/${user.id}`}
                className="soft-panel block p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="mt-1 text-sm text-muted">{user.email}</p>
                    <p className="mt-1 text-sm text-muted">
                      {user.outlet?.name ?? "Tanpa outlet"} · {user.role_label ?? user.role ?? "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                      user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                    }`}
                  >
                    {user.email_verified ? "verified" : "unverified"}
                  </span>
                </div>
              </Link>
            ) : (
              <div key={user.id} className="soft-panel p-5 opacity-90">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="mt-1 text-sm text-muted">{user.email}</p>
                    <p className="mt-1 text-sm text-muted">
                      {user.outlet?.name ?? "Tanpa outlet"} · {user.role_label ?? user.role ?? "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                      user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                    }`}
                  >
                    {user.email_verified ? "verified" : "unverified"}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 hidden lg:block">
          <div className="overflow-x-auto rounded-[1.75rem] border border-line/40">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[minmax(280px,1.2fr)_220px_180px_160px] gap-4 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                <span>Personel</span>
                <span>Outlet</span>
                <span>Role</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-line/35">
                {data.users.data.map((user) =>
                  user.permissions.can_edit ? (
                    <Link
                      key={user.id}
                      href={`/dashboard/team/${user.id}`}
                      className="grid grid-cols-[minmax(280px,1.2fr)_220px_180px_160px] gap-4 px-6 py-5 transition hover:bg-slate-50/90"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{user.outlet?.name ?? "Tanpa outlet"}</p>
                        <p className="mt-1 truncate text-sm text-muted">Bisa dikelola</p>
                      </div>
                      <div className="font-semibold text-foreground">{user.role_label ?? user.role ?? "-"}</div>
                      <div className="flex items-start">
                        <span
                          className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                            user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                          }`}
                        >
                          {user.email_verified ? "verified" : "unverified"}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={user.id}
                      className="grid grid-cols-[minmax(280px,1.2fr)_220px_180px_160px] gap-4 px-6 py-5 opacity-90"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{user.outlet?.name ?? "Tanpa outlet"}</p>
                        <p className="mt-1 truncate text-sm text-muted">Hanya lihat</p>
                      </div>
                      <div className="font-semibold text-foreground">{user.role_label ?? user.role ?? "-"}</div>
                      <div className="flex items-start">
                        <span
                          className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                            user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                          }`}
                        >
                          {user.email_verified ? "verified" : "unverified"}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {data.users.data.length === 0 ? (
          <div className="soft-panel mt-6 p-5 text-sm text-muted">Belum ada user team yang cocok dengan filter ini.</div>
        ) : null}

        <div className="mobile-stack mt-6">
          {data.users.current_page > 1 ? (
            <Link
              href={`/dashboard/team?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                page: String(data.users.current_page - 1),
              }).toString()}`}
              className="btn-secondary w-full sm:w-auto"
            >
              Halaman sebelumnya
            </Link>
          ) : null}
          {data.users.current_page < data.users.last_page ? (
            <Link
              href={`/dashboard/team?${new URLSearchParams({
                ...(params.search ? { search: params.search } : {}),
                ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                page: String(data.users.current_page + 1),
              }).toString()}`}
              className="btn-secondary w-full sm:w-auto"
            >
              Halaman berikutnya
            </Link>
          ) : null}
        </div>
      </section>
    </DashboardFrame>
  );
}
