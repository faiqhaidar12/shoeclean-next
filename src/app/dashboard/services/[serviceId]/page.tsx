import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { ServiceForm } from "@/components/service-form";
import { getService } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ serviceId: string }>;
};

export default async function DashboardServiceDetailPage({ params }: Props) {
  const { serviceId } = await params;
  let data: Awaited<ReturnType<typeof getService>>;

  try {
    data = await getService(serviceId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Detail layanan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="services"
      eyebrow="Ubah layanan"
      title={data.service.name}
      description="Perbarui harga, unit, outlet, dan status layanan agar katalog outlet tetap rapi dan mudah dipakai tim."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/services"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke katalog
        </Link>
        <ServiceForm
          mode="edit"
          outlets={data.outlets}
          units={data.units}
          statuses={data.statuses}
          initialValues={{
            id: data.service.id,
            name: data.service.name,
            unit: data.service.unit,
            price: data.service.price,
            status: data.service.status,
            outlet_id: data.service.outlet_id,
          }}
        />
      </div>
    </DashboardFrame>
  );
}
