import { redirect } from "next/navigation";
import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { CustomerForm } from "@/components/customer-form";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getCustomers } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardCustomersCreatePage() {
  let data: Awaited<ReturnType<typeof getCustomers>>;

  try {
    data = await getCustomers();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Form customer belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="customers"
      eyebrow="Tambah Pelanggan"
      title="Tambah pelanggan baru"
      description="Masukkan data customer agar tim outlet lebih cepat saat membuat order berikutnya."
    >
      <section className="mb-10">
        <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="m15 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali
        </Link>
        <h2 className="mt-6 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
          Tambah pelanggan baru
        </h2>
      </section>

      <div className="max-w-3xl">
      <CustomerForm mode="create" outlets={data.outlets} />
      </div>
    </DashboardFrame>
  );
}
