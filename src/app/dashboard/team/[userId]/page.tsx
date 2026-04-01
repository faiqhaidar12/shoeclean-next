import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { TeamMemberForm } from "@/components/team-member-form";
import { getTeamMember } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function DashboardTeamMemberDetailPage({ params }: Props) {
  const { userId } = await params;
  let data: Awaited<ReturnType<typeof getTeamMember>>;

  try {
    data = await getTeamMember(userId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Detail team belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="team"
      eyebrow="Ubah personel"
      title={data.user.name}
      description="Perbarui data team member tanpa perlu kembali ke dashboard Laravel lama."
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/team"
          className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
        >
          <span aria-hidden>{"<-"}</span>
          Kembali ke personel
        </Link>
        <TeamMemberForm
          mode="edit"
          outlets={data.outlets}
          roles={data.roles}
          initialValues={{
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            outlet_id: data.user.outlet_id ?? undefined,
          }}
        />
      </div>
    </DashboardFrame>
  );
}
