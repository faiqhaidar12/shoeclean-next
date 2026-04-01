import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { CustomerForm } from "@/components/customer-form";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getCustomer } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ customerId: string }>;
};

export default async function DashboardCustomerDetailPage({ params }: Props) {
  const { customerId } = await params;
  let data: Awaited<ReturnType<typeof getCustomer>>;

  try {
    data = await getCustomer(customerId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Detail customer belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="customers"
      eyebrow="Ubah Pelanggan"
      title={data.customer.name}
      description="Perbarui detail customer tanpa harus kembali ke dashboard lama."
    >
      <section className="mb-10">
        <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="m15 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali
        </Link>
        <h2 className="mt-6 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
          Ubah data pelanggan
        </h2>
      </section>

      <div className="max-w-3xl">
      <CustomerForm
        mode="edit"
        outlets={data.outlets}
        initialValues={{
          id: data.customer.id,
          name: data.customer.name,
          phone: data.customer.phone,
          address: data.customer.address,
          email: data.customer.email,
          outlet_id: data.customer.outlet_id,
        }}
      />
      </div>
    </DashboardFrame>
  );
}
