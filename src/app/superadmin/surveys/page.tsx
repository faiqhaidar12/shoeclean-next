import Link from "next/link";
import { SuperAdminFrame } from "@/components/superadmin-frame";
import { SuperAdminSurveyBoard } from "@/components/superadmin-survey-board";
import {
  SuperAdminMetricCard,
  SuperAdminPagination,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminSurveys, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminSurveysPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminSurveys({
      search: readParam(params.search),
      status: readParam(params.status),
      page: readParam(params.page),
    }),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="surveys"
      eyebrow="Survey platform"
      title="Daftar survey produk"
      description="Kelola survey yang ditujukan untuk owner outlet agar insight produk dan roadmap lebih mudah dikumpulkan."
      actions={<Link href="/superadmin/surveys/create" className="btn-primary">Buat survey platform</Link>}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <SuperAdminMetricCard label="Total survey" value={data.summary.total_surveys} />
        <SuperAdminMetricCard label="Survey aktif" value={data.summary.active_surveys} tone="emerald" />
        <SuperAdminMetricCard label="Total respons" value={data.summary.total_responses} tone="indigo" />
      </section>

      <section className="section-block p-5 sm:p-6">
        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <input
            name="search"
            defaultValue={data.filters.search}
            placeholder="Cari judul atau slug survey"
            className="field-soft"
          />
          <select name="status" defaultValue={data.filters.status} className="field-soft">
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button type="submit" className="btn-secondary">
            Terapkan
          </button>
        </form>
      </section>

      <SuperAdminSurveyBoard surveys={data.surveys.data} />

      <SuperAdminPagination
        basePath="/superadmin/surveys"
        page={data.surveys.current_page}
        lastPage={data.surveys.last_page}
        searchParams={{
          search: data.filters.search,
          status: data.filters.status,
        }}
      />
    </SuperAdminFrame>
  );
}
