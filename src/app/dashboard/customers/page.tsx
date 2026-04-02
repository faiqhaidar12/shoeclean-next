import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getCustomers } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    outlet_id?: string;
    page?: string;
  }>;
};

export default async function DashboardCustomersPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getCustomers>>;

  try {
    data = await getCustomers(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Daftar pelanggan belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="customers"
      eyebrow="Pelanggan"
      title="Daftar pelanggan"
      description="Simpan data pelanggan agar pemesanan ulang, pencarian, dan riwayat layanan lebih mudah dikelola."
      actions={
        <Link href="/dashboard/customers/create" className="btn-primary w-full sm:w-auto">
          Tambah pelanggan
        </Link>
      }
    >
      <section className="mb-10 min-w-0 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
            Pelanggan
          </p>
          <h2 className="mt-4 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
            Data pelanggan
          </h2>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
            Data yang siap dipakai saat melayani pelanggan
          </p>
        </div>
      </section>

      <section className="mb-12 min-w-0 space-y-8 overflow-x-hidden">
        <form action="/dashboard/customers" className="relative min-w-0 max-w-3xl">
          <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center text-brand/20">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari pelanggan berdasarkan nama atau nomor HP..."
            className="field-soft !rounded-[1.8rem] !bg-surface-soft/70 !py-5 !pl-16 pr-5 text-sm shadow-[0_10px_24px_rgba(25,28,30,0.04)] transition hover:!bg-surface-soft"
          />
        </form>

        <form action="/dashboard/customers" className="flex min-w-0 items-center gap-3 overflow-x-auto pb-2">
          <button
            type="submit"
            className={`flex-shrink-0 rounded-full px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${
              !params.outlet_id
                ? "bg-brand text-white shadow-[0_12px_24px_rgba(0,32,69,0.12)]"
                : "bg-surface-soft text-brand/45 hover:text-accent"
            }`}
          >
            Semua outlet
          </button>

          {data.outlets.map((outlet) => {
            const active = String(outlet.id) === params.outlet_id;

            return (
              <button
                key={outlet.id}
                type="submit"
                name="outlet_id"
                value={String(outlet.id)}
                className={`flex-shrink-0 rounded-full px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition ${
                  active
                    ? "bg-brand text-white shadow-[0_12px_24px_rgba(0,32,69,0.12)]"
                    : "bg-surface-soft text-brand/45 hover:text-accent"
                }`}
              >
                {outlet.name}
              </button>
            );
          })}

          {params.search ? <input type="hidden" name="search" value={params.search} /> : null}
        </form>
      </section>

      {data.customers.data.length === 0 ? (
        <section className="rounded-[2rem] bg-white p-12 text-center shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-surface-soft text-accent/25">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none">
              <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-[var(--font-display-sans)] text-2xl font-extrabold italic text-brand">
            Belum ada pelanggan
          </h3>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
            Tambahkan pelanggan pertama Anda
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-5 lg:hidden">
            {data.customers.data.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="rounded-[1.8rem] bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(25,28,30,0.07)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft text-xl font-[var(--font-display-sans)] font-extrabold italic text-accent shadow-inner">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-[var(--font-display-sans)] font-extrabold italic text-brand">
                        {customer.name}
                      </h3>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex rounded-full bg-surface-soft px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand/55">
                    Buka
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {customer.outlet ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                      {customer.outlet.name}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">
                    {customer.email ?? "Tanpa email"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted">
                  {customer.address ?? "Tidak ada alamat pelanggan."}
                </p>
              </Link>
            ))}
          </section>

          <section className="hidden lg:block">
            <div className="overflow-x-auto">
              <div className="min-w-[1080px]">
                <div className="grid grid-cols-[1.05fr_0.95fr_0.85fr_1.15fr_0.5fr] gap-4 px-5 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/30">
                  <span>Nama pelanggan</span>
                  <span>Kontak</span>
                  <span>Outlet</span>
                  <span>Alamat pelanggan</span>
                  <span className="text-right">Aksi</span>
                </div>

                <div className="space-y-4">
                  {data.customers.data.map((customer) => (
                    <Link
                      key={customer.id}
                      href={`/dashboard/customers/${customer.id}`}
                      className="group grid grid-cols-[1.05fr_0.95fr_0.85fr_1.15fr_0.5fr] items-center gap-4 rounded-[1.9rem] border border-line/35 bg-white px-5 py-6 shadow-[0_10px_24px_rgba(25,28,30,0.04)] transition hover:-translate-y-[1px] hover:border-[rgba(0,32,69,0.08)] hover:shadow-[0_18px_36px_rgba(25,28,30,0.08)]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft text-xl font-[var(--font-display-sans)] font-extrabold italic text-accent shadow-inner transition group-hover:bg-accent/10">
                          {customer.name.charAt(0)}
                        </div>
                        <p className="text-lg font-[var(--font-display-sans)] font-extrabold italic text-brand transition group-hover:text-accent">
                          {customer.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-brand">{customer.phone}</p>
                        <p className="mt-1 text-xs text-muted">{customer.email ?? "Tanpa email"}</p>
                      </div>

                      <div>
                        {customer.outlet ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent transition group-hover:bg-accent group-hover:text-white">
                            {customer.outlet.name}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Outlet belum tersedia</span>
                        )}
                      </div>

                      <p className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-brand/35">
                        {customer.address ?? "Tidak ada alamat"}
                      </p>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand/55 transition group-hover:bg-brand group-hover:text-white">
                          Buka
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
                            <path d="M4.5 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">
              Halaman {data.customers.current_page} dari {data.customers.last_page}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              {data.customers.current_page > 1 ? (
                <Link
                  href={`/dashboard/customers?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                    page: String(data.customers.current_page - 1),
                  }).toString()}`}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Halaman sebelumnya
                </Link>
              ) : null}
              {data.customers.current_page < data.customers.last_page ? (
                <Link
                  href={`/dashboard/customers?${new URLSearchParams({
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                    page: String(data.customers.current_page + 1),
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
