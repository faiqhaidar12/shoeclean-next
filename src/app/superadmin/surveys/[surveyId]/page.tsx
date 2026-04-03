import Link from "next/link";
import { SuperAdminFrame } from "@/components/superadmin-frame";
import {
  formatSuperAdminDate,
  SuperAdminMetricCard,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminSurvey } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

export default async function SuperAdminSurveyDetailPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminSurvey(surveyId),
  ]);

  const totalResponses = data.recent_responses.length;

  return (
    <SuperAdminFrame
      session={session}
      current="surveys"
      eyebrow="Hasil survey"
      title={data.survey.title}
      description={data.survey.description || "Pantau distribusi jawaban, rating, dan respons terbaru dari survey platform ini."}
      actions={
        <>
          <Link href="/superadmin/surveys" className="btn-secondary">Kembali</Link>
          <a href={data.survey.public_url} target="_blank" rel="noreferrer" className="btn-primary">
            Buka link survey
          </a>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        <SuperAdminMetricCard label="Total respons" value={data.survey.responses_count} />
        <SuperAdminMetricCard label="Rating rata-rata" value={data.survey.average_rating?.toFixed(1) ?? "-"} tone="indigo" />
        <SuperAdminMetricCard label="Status survey" value={data.survey.is_active ? "Aktif" : "Nonaktif"} tone={data.survey.is_active ? "emerald" : "rose"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <div className="space-y-4">
          {data.question_stats.map((stat, index) => {
            const question = String(stat.question ?? `Pertanyaan ${index + 1}`);
            const type = String(stat.type ?? "text");

            return (
              <article key={`${question}-${index}`} className="section-block p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                      Pertanyaan {index + 1}
                    </p>
                    <h2 className="mt-3 text-xl font-black tracking-[-0.06em] text-brand">
                      {question}
                    </h2>
                  </div>
                  <SuperAdminStatusBadge label={type} tone="blue" />
                </div>

                {type === "rating" ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="soft-panel p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Rata-rata</p>
                      <p className="mt-3 font-[var(--font-display-sans)] text-4xl font-black tracking-[-0.08em] text-brand">
                        {Number(stat.average ?? 0).toFixed(1)}
                      </p>
                    </div>
                    <div className="soft-panel p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Jumlah rating</p>
                      <p className="mt-3 font-[var(--font-display-sans)] text-4xl font-black tracking-[-0.08em] text-brand">
                        {Number(stat.count ?? 0)}
                      </p>
                    </div>
                  </div>
                ) : null}

                {type === "choice" ? (
                  <div className="mt-6 space-y-3">
                    {Object.entries((stat.distribution as Record<string, number>) ?? {}).map(([option, count]) => (
                      <div key={option} className="soft-panel flex items-center justify-between gap-4 p-4">
                        <p className="text-sm font-bold text-brand">{option}</p>
                        <p className="text-sm font-black text-brand">{count}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {type === "text" ? (
                  <div className="mt-6 space-y-3">
                    {((stat.answers as string[]) ?? []).length === 0 ? (
                      <div className="soft-panel p-5 text-sm font-semibold text-brand/50">
                        Belum ada jawaban teks.
                      </div>
                    ) : (
                      ((stat.answers as string[]) ?? []).map((answer, answerIndex) => (
                        <div key={`${answer}-${answerIndex}`} className="soft-panel p-4 text-sm font-semibold leading-7 text-brand/70">
                          {answer}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <aside className="section-block p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            Respons terbaru
          </p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
            {totalResponses} respons terakhir
          </h2>
          <div className="mt-6 space-y-3">
            {data.recent_responses.length === 0 ? (
              <div className="soft-panel p-5 text-sm font-semibold text-brand/50">
                Belum ada responden yang mengisi survey.
              </div>
            ) : (
              data.recent_responses.map((response) => (
                <div key={response.id} className="soft-panel p-5">
                  <p className="text-sm font-bold text-brand">{response.respondent_name}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                    {response.respondent_type} | {formatSuperAdminDate(response.created_at)}
                  </p>
                  <div className="mt-4 space-y-2">
                    {response.answers.slice(0, 4).map((answer, answerIndex) => (
                      <div key={`${answer.question}-${answerIndex}`} className="rounded-[1rem] bg-white px-3 py-3">
                        <p className="text-[11px] font-bold text-brand/45">{answer.question ?? "-"}</p>
                        <p className="mt-1 text-sm font-semibold text-brand">
                          {answer.rating ? `${answer.rating}/5` : answer.answer ?? "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </SuperAdminFrame>
  );
}
