import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getReportsSummary } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
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

export default async function DashboardReportsPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getReportsSummary>>;

  try {
    data = await getReportsSummary(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="reports"
          eyebrow="Laporan Bisnis"
          title="Ekspor laporan belum tersedia."
          description="Fitur report dan export mengikuti paket langganan owner. Upgrade ke Pro atau Business untuk mengakses laporan dari dashboard Next."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Backend saat ini memang mengunci export untuk akun tanpa fitur exports, jadi halaman ini akan aktif otomatis begitu plan sudah sesuai.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Report belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const currentMonth = String(params.month ?? data.filters.month);
  const currentYear = String(params.year ?? data.filters.year);
  const exportQuery = new URLSearchParams({
    month: currentMonth,
    year: currentYear,
  }).toString();

  const metricCards = [
    {
      label: "Nilai order kotor",
      value: formatRupiah(data.metrics.gross_order_value),
      tone: "text-brand",
      hint: "Total nilai order pada periode terpilih.",
    },
    {
      label: "Pembayaran sukses",
      value: formatRupiah(data.metrics.successful_payment_value),
      tone: "text-accent",
      hint: "Nominal pembayaran yang sudah tervalidasi.",
    },
    {
      label: "Total pengeluaran",
      value: formatRupiah(data.metrics.expenses_total),
      tone: "text-danger",
      hint: "Akumulasi biaya operasional pada periode ini.",
    },
    {
      label: "Arus kas bersih",
      value: formatRupiah(data.metrics.net_cashflow),
      tone: data.metrics.net_cashflow >= 0 ? "text-accent" : "text-danger",
      hint: "Selisih pembayaran sukses dan total expense.",
    },
  ];

  return (
    <DashboardFrame
      current="reports"
      eyebrow="Laporan Bisnis"
      title="Ringkasan performa dan export."
      description={`Scope laporan saat ini: ${data.scope.label}. Pilih periode lalu unduh PDF atau Excel langsung dari dashboard baru.`}
      actions={
        <>
          <a href={`/api/reports/orders/export?format=excel&${exportQuery}`} className="btn-accent w-full sm:w-auto">
            Orders Excel
          </a>
          <a href={`/api/reports/orders/export?format=pdf&${exportQuery}`} className="btn-secondary w-full sm:w-auto">
            Orders PDF
          </a>
          <a href={`/api/reports/expenses/export?format=excel&${exportQuery}`} className="btn-accent w-full sm:w-auto">
            Expenses Excel
          </a>
          <a href={`/api/reports/expenses/export?format=pdf&${exportQuery}`} className="btn-secondary w-full sm:w-auto">
            Expenses PDF
          </a>
        </>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="section-dark rounded-[1.85rem] p-6 sm:p-7 text-white">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Periode aktif</p>
              <h2 className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {monthOptions.find((month) => month.value === currentMonth)?.label ?? "Bulan"} {currentYear}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/74">
                Gunakan ringkasan ini untuk membaca ritme order, pembayaran, dan biaya operasional outlet di satu periode.
              </p>
            </div>
            <span className="highlight-chip-dark">{data.scope.outlets.length} outlet dalam scope</span>
          </div>
        </section>

        <form action="/dashboard/reports" className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Pilih periode</p>
          <div className="mt-5 grid gap-3">
            <select name="month" defaultValue={currentMonth} className="field-soft">
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <input type="number" name="year" min={2020} max={2100} defaultValue={currentYear} className="field-soft" />
            <button type="submit" className="btn-primary w-full">
              Terapkan periode
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((item) => (
          <article key={item.label} className="section-block p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">{item.label}</p>
            <p className={`mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight ${item.tone}`}>{item.value}</p>
            <p className="mt-2 text-sm leading-7 text-muted">{item.hint}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-block p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Top outlets</p>
              <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
                Cabang paling aktif di periode ini
              </h2>
            </div>
            <span className="highlight-chip">{data.scope.outlets.length} outlet</span>
          </div>

          <div className="dashboard-panel-stack mt-6">
            {data.top_outlets.map((outlet) => (
              <article key={outlet.id} className="soft-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{outlet.name}</p>
                    <p className="mt-1 text-sm text-muted">{outlet.orders_count} order</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-accent">{formatRupiah(outlet.order_value)}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Expense {formatRupiah(outlet.expense_total)}</p>
                  </div>
                </div>
              </article>
            ))}
            {data.top_outlets.length === 0 ? <div className="soft-panel p-5 text-sm text-muted">Belum ada data outlet untuk periode ini.</div> : null}
          </div>
        </section>

        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Kategori expense</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            Pos biaya yang paling dominan
          </h2>

          <div className="dashboard-panel-stack mt-6">
            {data.expense_categories.map((category) => (
              <article key={category.category} className="soft-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{category.category}</p>
                    <p className="mt-1 text-sm text-muted">{category.count} transaksi</p>
                  </div>
                  <p className="shrink-0 font-semibold text-danger">{formatRupiah(category.total_amount)}</p>
                </div>
              </article>
            ))}
            {data.expense_categories.length === 0 ? <div className="soft-panel p-5 text-sm text-muted">Belum ada expense tercatat di periode ini.</div> : null}
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Order terbaru</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            Sampel order untuk audit cepat
          </h2>

          <div className="dashboard-panel-stack mt-6">
            {data.recent_orders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="soft-panel touch-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{order.invoice_number}</p>
                    <p className="mt-1 text-sm text-muted">{order.customer?.name ?? "Customer"} · {order.outlet?.name ?? "Outlet"}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-accent">{formatRupiah(order.total_price)}</p>
                </div>
              </Link>
            ))}
            {data.recent_orders.length === 0 ? (
              <div className="soft-panel p-5 text-sm text-muted">Belum ada order pada periode ini untuk ditampilkan.</div>
            ) : null}
          </div>
        </section>

        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Expense terbaru</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
            Sampel pengeluaran untuk review cepat
          </h2>

          <div className="dashboard-panel-stack mt-6">
            {data.recent_expenses.map((expense) => (
              <Link key={expense.id} href={`/dashboard/expenses/${expense.id}`} className="soft-panel touch-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{expense.category}</p>
                    <p className="mt-1 text-sm text-muted">{expense.outlet?.name ?? "Outlet"} · {expense.user?.name ?? "Tim outlet"}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-danger">{formatRupiah(expense.amount)}</p>
                </div>
              </Link>
            ))}
            {data.recent_expenses.length === 0 ? (
              <div className="soft-panel p-5 text-sm text-muted">Belum ada pengeluaran pada periode ini untuk ditampilkan.</div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardFrame>
  );
}

