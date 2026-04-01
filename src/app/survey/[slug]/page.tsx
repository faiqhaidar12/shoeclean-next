import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { PublicTopNav } from "@/components/public-top-nav";
import { PublicSurveyForm } from "@/components/public-survey-form";
import { getOptionalAuthSession } from "@/lib/auth";
import { ApiError, getPublicSurvey } from "@/lib/api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicSurveyPage({ params }: Props) {
  const session = await getOptionalAuthSession();
  let data: Awaited<ReturnType<typeof getPublicSurvey>> | null = null;
  let message = "";

  try {
    const { slug } = await params;
    data = await getPublicSurvey(slug);
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat survey.";
  }

  if (!data) {
    return (
      <BackendUnavailable
        title="Survey belum bisa dimuat"
        message={message}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <PublicTopNav authenticated={session?.authenticated} />

          <header className="hero-grid">
            <div className="section-block hero-card p-5 sm:p-7">
              <span className="eyebrow">Customer Survey</span>
              <h1 className="headline mt-4">{data.survey.title}</h1>
              <p className="subcopy mt-4">
                {data.survey.description ||
                  "Bantu kami meningkatkan kualitas layanan dengan mengisi survey singkat ini."}
              </p>
              <div className="hero-badge-row mt-5">
                <span className="highlight-chip">Singkat</span>
                <span className="highlight-chip">Mobile friendly</span>
                <span className="highlight-chip">Respons cepat</span>
              </div>
              {data.survey.outlet ? (
                <div className="soft-panel mt-6 p-4">
                  <p className="font-semibold text-foreground">{data.survey.outlet.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {data.survey.outlet.address || "Alamat outlet belum tersedia."}
                  </p>
                  {data.survey.outlet.phone ? (
                    <p className="mt-3 text-sm font-medium text-accent">
                      {data.survey.outlet.phone}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <aside className="section-dark hero-card p-5 sm:p-7">
              <p className="section-label-dark">Alur pengisian</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Dibuat ringan supaya nyaman diisi langsung dari smartphone.
              </h2>
              <div className="info-list mt-5">
                <div className="kpi-pill-dark">Isi nama singkat</div>
                <div className="kpi-pill-dark">Jawab pertanyaan</div>
                <div className="kpi-pill-dark">Kirim feedback</div>
              </div>
              <Link href="/" className="btn-secondary mt-6 w-full sm:w-auto">
                Kembali ke beranda
              </Link>
            </aside>
          </header>

          <PublicSurveyForm survey={data.survey} />
        </div>
      </section>
    </main>
  );
}
