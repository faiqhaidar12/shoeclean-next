import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ExpenseForm } from "@/components/expense-form";
import { getExpenses, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardExpensesCreatePage() {
  let data: Awaited<ReturnType<typeof getExpenses>>;

  try {
    await requireDashboardModuleAccess("expenses");
    data = await getExpenses();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="expenses"
          eyebrow="Input biaya"
          title="Tambah pengeluaran hanya untuk owner atau admin."
          description="Akun staf tidak memiliki akses untuk membuat catatan pengeluaran baru."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Gunakan akun owner atau admin untuk mengelola biaya outlet.</p>
          </section>
        </DashboardFrame>
      );
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
      title="Catat pengeluaran baru"
      description="Simpan biaya harian cabang agar pemilik usaha dan admin lebih mudah memantau arus kas."
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
