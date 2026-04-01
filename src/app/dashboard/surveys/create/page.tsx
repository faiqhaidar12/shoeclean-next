import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SurveyBuilderForm } from "@/components/survey-builder-form";
import { getSurveys } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardSurveysCreatePage() {
  let data: Awaited<ReturnType<typeof getSurveys>>;

  try {
    data = await getSurveys();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="surveys"
          eyebrow="Buat Survey"
          title="Akses buat survey hanya untuk owner."
          description="Survey outlet saat ini masih dikelola di level owner."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Jika dibutuhkan, kita bisa buka akses buat survey ke admin tertentu di langkah berikutnya.</p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Form survey belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="surveys"
      eyebrow="Buat Survey"
      title="Buat survey customer baru."
      description="Susun pertanyaan rating, teks, atau pilihan ganda untuk mengukur pengalaman customer di outlet tertentu."
    >
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard/surveys" className="mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent">
          <span aria-hidden>{"<-"}</span>
          Kembali ke survey
        </Link>
        <SurveyBuilderForm outlets={data.outlets} />
      </div>
    </DashboardFrame>
  );
}
