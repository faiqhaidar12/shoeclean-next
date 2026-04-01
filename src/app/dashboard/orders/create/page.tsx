import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { InternalOrderCreateForm } from "@/components/internal-order-create-form";
import { getInternalOrderCreateMeta } from "@/lib/auth";
import { API_BASE_URL, ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ outlet_id?: string }>;
};

export default async function DashboardOrderCreatePage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getInternalOrderCreateMeta>>;

  try {
    data = await getInternalOrderCreateMeta(params.outlet_id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Form buat order belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="orders"
      eyebrow="Pendaftaran Unit"
      title="Buat pesanan baru."
      description="Flow kasir internal sekarang mengikuti komposisi Stitch: customer, layanan, metode penyerahan, dan ringkasan biaya tetap dalam satu kanvas yang nyaman di desktop maupun tablet."
      actions={
        <>
          <Link href="/dashboard/orders" className="btn-secondary w-full sm:w-auto">
            Batal
          </Link>
          <a href={`${API_BASE_URL}/orders/create`} className="btn-secondary w-full sm:w-auto">
            Form Laravel lama
          </a>
        </>
      }
    >
      <InternalOrderCreateForm data={data} />
    </DashboardFrame>
  );
}
