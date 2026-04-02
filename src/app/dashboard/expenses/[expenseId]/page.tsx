import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ExpenseForm } from "@/components/expense-form";
import { getExpense, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ expenseId: string }>;
};

export default async function DashboardExpenseDetailPage({ params }: Props) {
  const { expenseId } = await params;
  let data: Awaited<ReturnType<typeof getExpense>>;

  try {
    await requireDashboardModuleAccess("expenses");
    data = await getExpense(expenseId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="expenses"
          eyebrow="Ubah biaya"
          title="Detail pengeluaran tidak bisa dibuka."
          description="Hanya owner atau admin yang dapat melihat dan memperbarui pengeluaran outlet."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Gunakan akun yang memiliki akses keuangan untuk membuka halaman ini.</p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Detail pengeluaran belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="expenses"
      eyebrow="Ubah biaya"
      title={data.expense.category}
      description={`Nominal saat ini ${formatRupiah(data.expense.amount)}. Perbarui kategori, tanggal, dan catatan agar jurnal biaya cabang tetap akurat.`}
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/expenses"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke jurnal
        </Link>
        <ExpenseForm
          mode="edit"
          outlets={data.outlets}
          categories={data.categories}
          initialValues={{
            id: data.expense.id,
            category: data.expense.category,
            amount: data.expense.amount,
            description: data.expense.description,
            expense_date: data.expense.expense_date,
            outlet_id: data.expense.outlet_id,
            outlet_name: data.expense.outlet?.name ?? null,
          }}
        />
      </div>
    </DashboardFrame>
  );
}
