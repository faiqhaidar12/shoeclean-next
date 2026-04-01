import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ServiceForm } from "@/components/service-form";
import { getServices } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardServicesCreatePage() {
  let data: Awaited<ReturnType<typeof getServices>>;

  try {
    data = await getServices();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form layanan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="services"
      eyebrow="Registri layanan"
      title="Bangun layanan baru."
      description="Tambahkan layanan baru dengan struktur harga dan unit yang siap dipakai tim outlet di operasional harian."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/services"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke katalog
        </Link>
        <ServiceForm mode="create" outlets={data.outlets} units={["kg", "pcs", "pasang", "meter"]} />
      </div>
    </DashboardFrame>
  );
}
