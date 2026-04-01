import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { getSurvey } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ surveyId: string }>;
};

export default async function DashboardSurveyDetailPage({ params }: Props) {
  const { surveyId } = await params;
  let data: Awaited<ReturnType<typeof getSurvey>>;

  try {
    data = await getSurvey(surveyId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login");

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="surveys"
          eyebrow="Hasil Survey"
          title="Survey ini tidak bisa diakses."
          description="Akses hasil survey dibatasi ke owner outlet yang memiliki survey tersebut."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">Jika owner lain atau superadmin perlu melihat hasil ini dari dashboard Next, kita bisa perluas policy di langkah berikutnya.</p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Hasil survey belum terhubung" message={error.message} />;
    }

    throw error;
  }

  return (
    <DashboardFrame
      current="surveys"
      eyebrow="Hasil Survey"
      title={data.survey.title}
      description={`Survey untuk ${data.survey.outlet?.name ?? "outlet"} dengan ${data.survey.responses_count} respons dan rating rata-rata ${data.survey.average_rating ?? "-"}.`}
      actions={
        <>
          <a href={data.survey.public_url} target="_blank" rel="noreferrer" className="btn-accent w-full sm:w-auto">Buka link publik</a>
          <Link href="/dashboard/surveys" className="btn-secondary w-full sm:w-auto">Kembali ke surveys</Link>
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Status</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-accent">{data.survey.is_active ? "Aktif" : "Nonaktif"}</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Total respons</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{data.survey.responses_count}</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Rating rata-rata</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-danger">{data.survey.average_rating ?? "-"}</p>
        </article>
        <article className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Jumlah pertanyaan</p>
          <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-foreground">{data.survey.questions.length}</p>
        </article>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Statistik pertanyaan</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Ringkasan jawaban per pertanyaan</h2>
          <div className="dashboard-panel-stack mt-6">
            {data.question_stats.map((stat, index) => (
              <article key={index} className="soft-panel p-5">
                <p className="font-semibold text-foreground">{String(stat.question ?? "")}</p>
                <p className="mt-1 text-sm text-muted">Tipe: {String(stat.type ?? "")}</p>

                {"average" in stat ? (
                  <div className="dashboard-panel-stack mt-4">
                    <p className="text-sm text-muted">Rata-rata {String(stat.average)} dari {String(stat.count)} rating</p>
                    {Object.entries((stat.distribution as Record<string, number>) ?? {}).map(([rating, count]) => (
                      <div key={rating} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{rating} bintang</span>
                        <span className="text-muted">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {"options" in stat ? (
                  <div className="dashboard-panel-stack mt-4">
                    {((stat.options as string[]) ?? []).map((option) => (
                      <div key={option} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{option}</span>
                        <span className="text-muted">{((stat.distribution as Record<string, number>) ?? {})[option] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {"answers" in stat ? (
                  <div className="dashboard-panel-stack mt-4">
                    {((stat.answers as string[]) ?? []).length > 0 ? (
                      ((stat.answers as string[]) ?? []).map((answer, answerIndex) => (
                        <div key={answerIndex} className="rounded-[1rem] bg-white px-3 py-3 text-sm text-muted">{answer}</div>
                      ))
                    ) : (
                      <div className="rounded-[1rem] bg-white px-3 py-3 text-sm text-muted">Belum ada jawaban teks.</div>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Respons terbaru</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Audit cepat jawaban customer</h2>
          <div className="dashboard-panel-stack mt-6">
            {data.recent_responses.map((response) => (
              <article key={response.id} className="soft-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{response.respondent_name}</p>
                    <p className="mt-1 text-sm text-muted">{response.respondent_type} · {response.respondent_phone ?? "tanpa nomor"}</p>
                  </div>
                  <span className="highlight-chip">{response.created_at ?? "-"}</span>
                </div>
                <div className="dashboard-panel-stack mt-4">
                  {response.answers.map((answer, index) => (
                    <div key={index} className="rounded-[1rem] bg-white px-3 py-3 text-sm">
                      <p className="font-semibold text-foreground">{answer.question}</p>
                      <p className="mt-1 text-muted">{answer.type === "rating" ? `${answer.rating} bintang` : answer.answer}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {data.recent_responses.length === 0 ? <div className="soft-panel p-5 text-sm text-muted">Belum ada respons untuk survey ini.</div> : null}
          </div>
        </section>
      </div>
    </DashboardFrame>
  );
}

