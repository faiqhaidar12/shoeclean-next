import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getExpenses, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    month?: string;
    year?: string;
    outlet_id?: string;
    page?: string;
  }>;
};

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default async function DashboardExpensesPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getExpenses>>;

  try {
    await requireDashboardModuleAccess("expenses");
    data = await getExpenses(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="expenses"
          eyebrow="Jurnal Pengeluaran"
          title="Halaman pengeluaran hanya untuk owner atau admin."
          description="Staf tidak memiliki akses untuk melihat atau mengubah jurnal pengeluaran."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Gunakan akun owner atau admin untuk membuka jurnal pengeluaran outlet.</p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Daftar pengeluaran belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const currentMonth = String(params.month ?? data.filters.month);
  const currentYear = String(params.year ?? data.filters.year);

  return (
    <DashboardFrame
      current="expenses"
      eyebrow="Jurnal Pengeluaran"
      title="Pantau biaya operasional outlet."
      description="Catat biaya harian, telusuri pengeluaran per cabang, dan jaga arus kas tetap rapi dari satu halaman."
      actions={
        <Link href="/dashboard/expenses/create" className="btn-primary w-full sm:w-auto">
          Tambah pengeluaran
        </Link>
      }
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total bulan berjalan</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {formatRupiah(data.summary.total_amount)}
          </p>
          <p className="mt-2 text-sm text-muted">Akumulasi biaya pada periode yang sedang Anda lihat sekarang.</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Kategori aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            {data.summary.categories_count}
          </p>
          <p className="mt-2 text-sm text-muted">Kategori biaya yang muncul pada periode terpilih.</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Periode aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
            {monthOptions.find((month) => month.value === currentMonth)?.label ?? "Bulan"} {currentYear}
          </p>
          <p className="mt-2 text-sm text-white/72">Gunakan filter untuk melihat ritme pengeluaran cabang antar bulan dan tahun.</p>
        </article>
      </section>

      <form action="/dashboard/expenses" className="section-block p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter biaya</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">
              Temukan transaksi yang ingin ditinjau
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">
            Cari kategori atau deskripsi, lalu sempitkan berdasarkan cabang dan periode agar pemeriksaan arus kas lebih cepat.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_220px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={params.search ?? ""}
            placeholder="Cari kategori atau deskripsi"
            className="field-soft"
          />
          <select name="month" defaultValue={currentMonth} className="field-soft">
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select name="year" defaultValue={currentYear} className="field-soft">
            {data.available_years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="section-block p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori biaya</p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
                {data.expenses.total} transaksi ditemukan
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                Buka salah satu transaksi untuk memperbarui kategori, tanggal, atau detail pengeluaran.
              </p>
            </div>
            <span className="highlight-chip">
              Halaman {data.expenses.current_page} dari {data.expenses.last_page}
            </span>
          </div>

          <div className="dashboard-panel-stack mt-6 xl:hidden">
            {data.expenses.data.map((expense) => (
              <Link key={expense.id} href={`/dashboard/expenses/${expense.id}`} className="soft-panel block p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{expense.category}</p>
                    <p className="mt-1 text-sm text-muted">{expense.outlet?.name ?? "Cabang utama"} · {expense.user?.name ?? "Tim outlet"}</p>
                  </div>
                  <p className="font-semibold text-brand">{formatRupiah(expense.amount)}</p>
                </div>
                {expense.description ? (
                  <p className="mt-4 line-clamp-2 text-sm leading-7 text-muted">{expense.description}</p>
                ) : null}
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">{expense.expense_date ?? "-"}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 hidden xl:block">
            <div className="overflow-x-auto rounded-[1.75rem] border border-line/40">
            <div className="min-w-[920px]">
            <div className="grid grid-cols-[180px_minmax(280px,1.2fr)_220px_180px] gap-4 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
              <span>Kategori</span>
              <span>Detail</span>
              <span>Cabang / Tim</span>
              <span>Nominal</span>
            </div>
            <div className="divide-y divide-line/35">
              {data.expenses.data.map((expense) => (
                <Link
                  key={expense.id}
                  href={`/dashboard/expenses/${expense.id}`}
                  className="grid grid-cols-[180px_minmax(280px,1.2fr)_220px_180px] gap-4 px-6 py-5 transition hover:bg-slate-50/90"
                >
                  <div>
                    <p className="font-semibold text-foreground">{expense.category}</p>
                    <p className="mt-1 text-sm text-muted">{expense.expense_date ?? "-"}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">Buka untuk melihat detail transaksi</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{expense.description ?? "Belum ada catatan tambahan."}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{expense.outlet?.name ?? "Cabang utama"}</p>
                    <p className="mt-1 truncate text-sm text-muted">{expense.user?.name ?? "Tim outlet"}</p>
                  </div>
                  <div className="font-semibold text-brand">{formatRupiah(expense.amount)}</div>
                </Link>
              ))}
            </div>
            </div>
            </div>
          </div>

          {data.expenses.data.length === 0 ? (
            <div className="soft-panel mt-6 p-5 text-sm text-muted">Belum ada pengeluaran yang cocok dengan filter ini.</div>
          ) : null}

          <div className="mobile-stack mt-6">
            {data.expenses.current_page > 1 ? (
              <Link
                href={`/dashboard/expenses?${new URLSearchParams({
                  ...(params.search ? { search: params.search } : {}),
                  month: currentMonth,
                  year: currentYear,
                  ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                  page: String(data.expenses.current_page - 1),
                }).toString()}`}
                className="btn-secondary w-full sm:w-auto"
              >
                Halaman sebelumnya
              </Link>
            ) : null}
            {data.expenses.current_page < data.expenses.last_page ? (
              <Link
                href={`/dashboard/expenses?${new URLSearchParams({
                  ...(params.search ? { search: params.search } : {}),
                  month: currentMonth,
                  year: currentYear,
                  ...(params.outlet_id ? { outlet_id: params.outlet_id } : {}),
                  page: String(data.expenses.current_page + 1),
                }).toString()}`}
                className="btn-secondary w-full sm:w-auto"
              >
                Halaman berikutnya
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="dashboard-panel-stack">
          <section className="section-dark rounded-[1.75rem] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Ringkasan bulan ini</p>
            <div className="mt-5 space-y-4">
              <div className="soft-panel-dark p-4">
                <p className="text-sm text-white/70">Total pengeluaran</p>
                <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
                  {formatRupiah(data.summary.total_amount)}
                </p>
              </div>
              <div className="soft-panel-dark p-4">
                <p className="text-sm text-white/70">Kategori aktif</p>
                <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">
                  {data.summary.categories_count}
                </p>
              </div>
            </div>
          </section>

          <section className="section-block p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Kategori standar</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.categories.map((category) => (
                <span key={category} className="highlight-chip">
                  {category}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </DashboardFrame>
  );
}

