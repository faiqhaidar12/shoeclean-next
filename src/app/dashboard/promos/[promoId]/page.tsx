import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { PromoForm } from "@/components/promo-form";
import { getPromo } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ promoId: string }>;
};

export default async function DashboardPromoDetailPage({ params }: Props) {
  const { promoId } = await params;
  let data: Awaited<ReturnType<typeof getPromo>>;

  try {
    data = await getPromo(promoId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="promos"
          eyebrow="Ubah promo"
          title="Promo ini tidak bisa diakses."
          description="Kemungkinan promo berlaku untuk cabang lain atau berada di luar cakupan akun Anda."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Jika promo ini memang perlu dikelola di akun ini, aksesnya perlu diperluas terlebih dulu agar tetap aman.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Detail promo belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="promos"
      eyebrow="Ubah promo"
      title={data.promo.code}
      description="Perbarui periode aktif, nilai diskon, batas penggunaan, dan cakupan cabang promo ini."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/promos"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke promo
        </Link>
        <PromoForm
          mode="edit"
          outlets={data.outlets}
          types={data.types}
          canManageGlobal={data.meta.can_manage_global}
          initialValues={{
            id: data.promo.id,
            outlet_id: data.promo.outlet_id,
            code: data.promo.code,
            name: data.promo.name,
            type: data.promo.type,
            value: data.promo.value,
            min_order: data.promo.min_order,
            max_discount: data.promo.max_discount,
            max_uses: data.promo.max_uses,
            start_date: data.promo.start_date,
            end_date: data.promo.end_date,
            is_active: data.promo.is_active,
          }}
        />
      </div>
    </DashboardFrame>
  );
}
