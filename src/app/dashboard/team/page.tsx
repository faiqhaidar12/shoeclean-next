import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ApiError } from "@/lib/api";
import { getTeam } from "@/lib/auth";

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

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="team"
          eyebrow="Tim Outlet"
          title="Kelola tim tersedia mulai paket Pro."
          description="Akun baru masih memakai paket gratis, jadi pengelolaan admin dan staf belum aktif di halaman ini."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Setelah paket di-upgrade ke Pro atau Bisnis, halaman tim akan langsung aktif untuk menambah admin atau staf tanpa pengaturan tambahan.
            </p>
          </section>
        </DashboardFrame>
      );
    }

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
      title="Kelola admin dan staf"
      description="Atur anggota tim, peran, dan cabang akses dari satu halaman yang mudah dipantau."
      actions={
        <Link href="/dashboard/team/create" className="btn-primary w-full sm:w-auto">
          Tambah anggota tim
        </Link>
      }
    >
      <section className="grid min-w-0 gap-4 lg:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total personel</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {data.users.total}
          </p>
          <p className="mt-2 text-sm text-muted">Jumlah anggota tim yang berada dalam cakupan akun aktif saat ini.</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Bisa dikelola</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {editableUsers}
          </p>
          <p className="mt-2 text-sm text-muted">Anggota tim yang bisa Anda ubah langsung dengan akun yang sedang dipakai.</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Peran aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
            {data.meta.actor_role ?? "tim"}
          </p>
          <p className="mt-2 text-sm text-white/72">Hak kelola tim mengikuti peran akun yang sedang Anda gunakan saat ini.</p>
        </article>
      </section>

      <form action="/dashboard/team" className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter personel</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
              Temukan anggota tim yang ingin dikelola
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Cari berdasarkan nama atau email, lalu saring menurut cabang untuk mempercepat pengelolaan akun staf.
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
            <option value="">Semua cabang</option>
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

      <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori tim</p>
            <h2 className="mt-2 break-words font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
              {data.users.total} anggota tim ditemukan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
              Buka profil anggota tim untuk memperbarui peran, cabang, atau akses masuk sesuai kewenangan Anda.
            </p>
          </div>
          <span className="highlight-chip w-fit self-start lg:self-auto">Peran aktif: {data.meta.actor_role ?? "tim"}</span>
        </div>

        <div className="dashboard-panel-stack mt-6 min-w-0 lg:hidden">
          {data.users.data.map((user) =>
            user.permissions.can_edit ? (
              <Link
                key={user.id}
                href={`/dashboard/team/${user.id}`}
                className="soft-panel block p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="mt-1 text-sm text-muted">{user.email}</p>
                    <p className="mt-1 text-sm text-muted">
                      {user.outlet?.name ?? "Belum terhubung ke cabang"} · {user.role_label ?? user.role ?? "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                      user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                    }`}
                  >
                    {user.email_verified ? "Terverifikasi" : "Belum verifikasi"}
                  </span>
                </div>
              </Link>
            ) : (
              <div key={user.id} className="soft-panel p-5 opacity-90">
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="mt-1 text-sm text-muted">{user.email}</p>
                    <p className="mt-1 text-sm text-muted">
                      {user.outlet?.name ?? "Belum terhubung ke cabang"} · {user.role_label ?? user.role ?? "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex min-h-8 w-fit items-center rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                      user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                    }`}
                  >
                    {user.email_verified ? "Terverifikasi" : "Belum verifikasi"}
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
                <span>Cabang</span>
                <span>Peran</span>
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
                        <p className="truncate font-semibold text-foreground">{user.outlet?.name ?? "Belum terhubung ke cabang"}</p>
                        <p className="mt-1 truncate text-sm text-muted">Bisa diubah</p>
                      </div>
                      <div className="font-semibold text-foreground">{user.role_label ?? user.role ?? "-"}</div>
                      <div className="flex items-start">
                        <span
                          className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                            user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                          }`}
                        >
                          {user.email_verified ? "Terverifikasi" : "Belum verifikasi"}
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
                        <p className="truncate font-semibold text-foreground">{user.outlet?.name ?? "Belum terhubung ke cabang"}</p>
                        <p className="mt-1 truncate text-sm text-muted">Hanya bisa dilihat</p>
                      </div>
                      <div className="font-semibold text-foreground">{user.role_label ?? user.role ?? "-"}</div>
                      <div className="flex items-start">
                        <span
                          className={`inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] leading-none font-black uppercase tracking-[0.16em] ${
                            user.email_verified ? "bg-[#edf4f1] text-accent" : "bg-surface text-muted"
                          }`}
                        >
                          {user.email_verified ? "Terverifikasi" : "Belum verifikasi"}
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
          <div className="soft-panel mt-6 p-5 text-sm text-muted">Belum ada anggota tim yang cocok dengan filter ini.</div>
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
