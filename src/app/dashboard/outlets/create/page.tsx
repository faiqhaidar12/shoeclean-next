import { redirect } from "next/navigation";
import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { OutletForm } from "@/components/outlet-form";
import { getOutlets, requireDashboardModuleAccess } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardOutletsCreatePage() {
  let data: Awaited<ReturnType<typeof getOutlets>>;

  try {
    await requireDashboardModuleAccess("outlets");
    data = await getOutlets();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="outlets"
          eyebrow="Cabang Outlet"
          title="Akses membuat cabang belum tersedia."
          description="Pembuatan cabang baru saat ini hanya tersedia untuk pemilik usaha yang masih punya slot cabang."
        >
          <section className="rounded-[2rem] bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
            <p className="text-sm text-muted">
              Jika akun usaha sudah mencapai batas cabang, upgrade paket atau hapus cabang lama
              terlebih dulu.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Form outlet belum terhubung"
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
      title="Tambah cabang baru"
      description="Siapkan identitas cabang, area layanan, biaya jemput dan antar, serta QRIS untuk cabang baru."
    >
      <section className="mb-10">
        <Link href="/dashboard/outlets" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="m15 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali ke cabang
        </Link>
        <h2 className="mt-6 font-[var(--font-display-sans)] text-4xl font-extrabold italic tracking-[-0.04em] text-brand sm:text-5xl">
          Tambah cabang baru
        </h2>
      </section>

      <div className="max-w-4xl">
        <OutletForm mode="create" statuses={data.statuses} />
      </div>
    </DashboardFrame>
  );
}
