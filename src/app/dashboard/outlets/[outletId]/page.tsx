import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { OutletForm } from "@/components/outlet-form";
import { getOutlet, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ outletId: string }>;
};

export default async function DashboardOutletDetailPage({ params }: Props) {
  const { outletId } = await params;
  let data: Awaited<ReturnType<typeof getOutlet>>;

  try {
    await requireDashboardModuleAccess("outlets", { outletId: Number(outletId) });
    data = await getOutlet(outletId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="outlets"
          eyebrow="Cabang Outlet"
          title="Cabang ini tidak bisa diakses."
          description="Akses edit cabang dibatasi untuk pemilik usaha atau admin yang memang ditempatkan di cabang tersebut."
        >
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
            <p className="text-sm text-muted">
              Jika akun ini memang perlu akses lebih luas, izin akses cabang perlu diperbarui terlebih dulu.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Detail outlet belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="outlets"
      eyebrow="Cabang Outlet"
      title={data.outlet.name}
      description="Perbarui identitas cabang, status layanan, biaya jemput dan antar, serta QRIS agar informasi pelanggan selalu sesuai."
    >
      <section className="mb-10">
        <Link href="/dashboard/outlets" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="m15 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali ke cabang
        </Link>
        <h2 className="mt-6 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
          Ubah data cabang
        </h2>
      </section>

      <div className="max-w-4xl">
        <OutletForm
          mode="edit"
          statuses={data.statuses}
          initialValues={{
            id: data.outlet.id,
            name: data.outlet.name,
            slug: data.outlet.slug,
            address: data.outlet.address,
            phone: data.outlet.phone,
            status: data.outlet.status,
            pickup_fee: data.outlet.pickup_fee,
            delivery_fee: data.outlet.delivery_fee,
            province_id: data.outlet.province_id,
            province_name: data.outlet.province_name,
            city_id: data.outlet.city_id,
            city_name: data.outlet.city_name,
            district_id: data.outlet.district_id,
            district_name: data.outlet.district_name,
            qris_image_url: data.outlet.qris_image_url,
            qris_image_original_name: data.outlet.qris_image_original_name,
            qris_notes: data.outlet.qris_notes,
          }}
        />
      </div>
    </DashboardFrame>
  );
}
