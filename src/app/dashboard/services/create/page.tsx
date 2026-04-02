import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ServiceForm } from "@/components/service-form";
import { getServices, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardServicesCreatePage() {
  let data: Awaited<ReturnType<typeof getServices>>;

  try {
    await requireDashboardModuleAccess("services");
    data = await getServices();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="services"
          eyebrow="Layanan Outlet"
          title="Tambah layanan hanya untuk owner atau admin."
          description="Akun staf tidak memiliki akses untuk membuat layanan baru."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Gunakan akun owner atau admin untuk mengelola layanan outlet.</p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form layanan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="services"
      eyebrow="Layanan Outlet"
      title="Tambah layanan baru"
      description="Tambahkan layanan baru dengan harga dan satuan yang siap dipakai tim saat menerima pesanan harian."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/services"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke layanan
        </Link>
        <ServiceForm mode="create" outlets={data.outlets} units={["kg", "pcs", "pasang", "meter"]} />
      </div>
    </DashboardFrame>
  );
}
