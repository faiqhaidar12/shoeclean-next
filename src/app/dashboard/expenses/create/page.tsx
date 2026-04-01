import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ExpenseForm } from "@/components/expense-form";
import { getExpenses } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardExpensesCreatePage() {
  let data: Awaited<ReturnType<typeof getExpenses>>;

  try {
    data = await getExpenses();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form pengeluaran belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="expenses"
      eyebrow="Input biaya"
      title="Catat pengeluaran baru."
      description="Simpan biaya operasional harian outlet supaya owner dan admin bisa memantau cashflow lebih rapi."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/expenses"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke jurnal
        </Link>
        <ExpenseForm mode="create" outlets={data.outlets} categories={data.categories} />
      </div>
    </DashboardFrame>
  );
}
