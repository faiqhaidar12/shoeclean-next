import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SurveyListActions } from "@/components/survey-list-actions";
import { getSurveys } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function DashboardSurveysPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  let data: Awaited<ReturnType<typeof getSurveys>>;

  try {
    data = await getSurveys(params);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="surveys"
          eyebrow="Survey Pelanggan"
          title="Survey hanya tersedia untuk owner."
          description="Modul ini mengikuti scope owner karena survey outlet melekat ke cabang yang dimiliki owner."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Jika nanti admin perlu akses melihat hasil survey, kita bisa tambahkan mode read-only.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Survey belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="surveys"
      eyebrow="Survey Pelanggan"
      title="Kelola survey customer outlet."
      description="Buat survey baru, bagikan link publik, dan pantau jumlah respons langsung dari dashboard baru."
      actions={<Link href="/dashboard/surveys/create" className="btn-primary w-full sm:w-auto">Buat survey</Link>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total survey</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-accent">{data.summary.total_surveys}</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Survey aktif</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.summary.active_surveys}</p>
        </article>
        <article className="section-dark rounded-[1.75rem] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Total respons</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white">{data.summary.total_responses}</p>
        </article>
      </section>

      <form action="/dashboard/surveys" className="section-block p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Filter survey</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight text-brand">Temukan survey yang ingin ditinjau</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-muted">Cari berdasarkan judul atau slug, lalu saring menurut status aktif untuk mempercepat review.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <input type="text" name="search" defaultValue={params.search ?? ""} placeholder="Cari judul atau slug survey" className="field-soft" />
          <select name="status" defaultValue={params.status ?? data.filters.status ?? ""} className="field-soft">
            <option value="">Semua status</option>
            {data.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button type="submit" className="btn-accent w-full lg:w-auto">Terapkan</button>
        </div>
      </form>

      <section className="section-block p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Direktori survey</p>
            <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.surveys.total} survey ditemukan</h2>
          </div>
          <span className="highlight-chip">Halaman {data.surveys.current_page} dari {data.surveys.last_page}</span>
        </div>

        <div className="dashboard-panel-stack mt-6">
          {data.surveys.data.map((survey) => (
            <div key={survey.id} className="soft-panel p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <Link href={`/dashboard/surveys/${survey.id}`} className="font-semibold text-foreground">{survey.title}</Link>
                  <p className="mt-1 text-sm text-muted">{survey.outlet?.name ?? "Outlet"} · {survey.slug}</p>
                  <p className="mt-3 text-sm leading-7 text-muted">{survey.description ?? "Tanpa deskripsi"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="highlight-chip">{survey.is_active ? "Aktif" : "Nonaktif"}</span>
                    <span className="highlight-chip">{survey.responses_count} respons</span>
                    <span className="highlight-chip">Rating {survey.average_rating ?? "-"}</span>
                  </div>
                  <a href={survey.public_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-accent">Buka link survey publik</a>
                </div>
                <SurveyListActions surveyId={survey.id} isActive={survey.is_active} />
              </div>
            </div>
          ))}
          {data.surveys.data.length === 0 ? <div className="soft-panel p-5 text-sm text-muted">Belum ada survey yang cocok dengan filter ini.</div> : null}
        </div>
      </section>
    </DashboardFrame>
  );
}

