import Link from "next/link";
import { SuperAdminFrame } from "@/components/superadmin-frame";
import { SuperAdminSurveyBuilder } from "@/components/superadmin-survey-builder";
import { requireSuperAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminSurveyCreatePage() {
  const session = await requireSuperAdminSession();

  return (
    <SuperAdminFrame
      session={session}
      current="surveys"
      eyebrow="Survey platform"
      title="Buat survey baru"
      description="Susun survey platform yang bisa dibagikan ke owner outlet untuk mengumpulkan feedback produk."
      actions={<Link href="/superadmin/surveys" className="btn-secondary">Kembali</Link>}
    >
      <SuperAdminSurveyBuilder />
    </SuperAdminFrame>
  );
}
