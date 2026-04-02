import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { TeamMemberForm } from "@/components/team-member-form";
import { getTeam } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardTeamCreatePage() {
  let data: Awaited<ReturnType<typeof getTeam>>;

  try {
    data = await getTeam();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="team"
          eyebrow="Tim Outlet"
          title="Kelola tim tersedia mulai paket Pro."
          description="Pembuatan admin atau staf belum aktif untuk akun yang masih berada di paket gratis."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Upgrade ke Pro atau Bisnis untuk membuka fitur pengelolaan tim dan menambahkan anggota operasional dari halaman ini.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form team belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="team"
      eyebrow="Tim Outlet"
      title="Tambah admin atau staf"
      description="Buat anggota tim baru sesuai hak akses yang diizinkan oleh peran akun Anda saat ini."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/team"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke tim
        </Link>
        <TeamMemberForm mode="create" outlets={data.outlets} roles={data.roles} />
      </div>
    </DashboardFrame>
  );
}
