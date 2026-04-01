import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { PromoForm } from "@/components/promo-form";
import { getPromos } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPromosCreatePage() {
  let data: Awaited<ReturnType<typeof getPromos>>;

  try {
    data = await getPromos();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="promos"
          eyebrow="Campaign Promo"
          title="Akses promo belum tersedia."
          description="Akun ini belum bisa membuat promo karena fitur promo mengikuti paket langganan owner."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Setelah paket owner di-upgrade, form ini akan langsung aktif dan bisa dipakai tanpa perubahan tambahan.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form promo belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="promos"
      eyebrow="Campaign promo"
      title="Tambah promo baru."
      description="Siapkan kode promo baru untuk seasonal push, campaign outlet, atau promo pembukaan cabang."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/promos"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke campaign
        </Link>
        <PromoForm mode="create" outlets={data.outlets} types={data.types} canManageGlobal={data.meta.can_manage_global} />
      </div>
    </DashboardFrame>
  );
}
