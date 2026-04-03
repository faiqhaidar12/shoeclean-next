"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setDashboardFlash } from "@/lib/dashboard-flash";
import type { SuperAdminSurvey } from "@/lib/superadmin";
import { SuperAdminStatusBadge } from "@/components/superadmin-ui";

type Props = {
  surveys: SuperAdminSurvey[];
};

export function SuperAdminSurveyBoard({ surveys }: Props) {
  const router = useRouter();

  async function toggleSurvey(survey: SuperAdminSurvey) {
    const response = await fetch(`/api/superadmin/surveys/${survey.id}/toggle`, {
      method: "PATCH",
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setDashboardFlash({
        type: "error",
        title: "Survey gagal diubah",
        message: payload.message ?? "Status survey belum berhasil diperbarui.",
      });
      router.refresh();
      return;
    }

    setDashboardFlash({
      type: "success",
      title: "Status survey diperbarui",
      message: payload.message ?? "Survey platform berhasil diperbarui.",
    });
    router.refresh();
  }

  async function deleteSurvey(survey: SuperAdminSurvey) {
    if (!window.confirm(`Yakin ingin menghapus survey "${survey.title}"?`)) return;

    const response = await fetch(`/api/superadmin/surveys/${survey.id}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setDashboardFlash({
        type: "error",
        title: "Survey gagal dihapus",
        message: payload.message ?? "Survey platform belum berhasil dihapus.",
      });
      router.refresh();
      return;
    }

    setDashboardFlash({
      type: "success",
      title: "Survey dihapus",
      message: payload.message ?? "Survey platform sudah dihapus.",
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {surveys.length === 0 ? (
        <div className="section-block p-8 text-sm font-semibold text-brand/50 xl:col-span-2">
          Belum ada survey platform.
        </div>
      ) : (
        surveys.map((survey) => (
          <article key={survey.id} className="section-block p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                  {survey.slug}
                </p>
                <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
                  {survey.title}
                </h2>
              </div>
              <SuperAdminStatusBadge
                label={survey.is_active ? "Aktif" : "Nonaktif"}
                tone={survey.is_active ? "emerald" : "slate"}
              />
            </div>

            <p className="mt-4 min-h-[52px] text-sm font-semibold leading-7 text-brand/55">
              {survey.description || "Belum ada deskripsi survey."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="soft-panel p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  Respons
                </p>
                <p className="mt-2 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
                  {survey.responses_count}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  Rating
                </p>
                <p className="mt-2 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
                  {survey.average_rating?.toFixed(1) ?? "-"}
                </p>
              </div>
              <div className="soft-panel p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                  Dibuat oleh
                </p>
                <p className="mt-3 truncate text-sm font-bold text-brand">
                  {survey.creator?.name ?? "Superadmin"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/superadmin/surveys/${survey.id}`} className="btn-secondary">
                Lihat hasil
              </Link>
              <a href={survey.public_url} target="_blank" rel="noreferrer" className="btn-accent">
                Buka link survey
              </a>
              <button type="button" onClick={() => toggleSurvey(survey)} className="btn-secondary">
                {survey.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                type="button"
                onClick={() => deleteSurvey(survey)}
                className="rounded-full bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100"
              >
                Hapus
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
