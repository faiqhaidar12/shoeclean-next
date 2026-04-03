import { SuperAdminFrame } from "@/components/superadmin-frame";
import {
  formatSuperAdminDate,
  SuperAdminMetricCard,
  SuperAdminPagination,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminFeedbacks, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function paramValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminFeedbacksPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminFeedbacks({
      category: paramValue(params.category),
      page: paramValue(params.page),
    }),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="feedbacks"
      eyebrow="Feedback platform"
      title="Saran dan keluhan outlet"
      description="Baca masukan owner, admin, dan staf agar prioritas pengembangan produk lebih mudah diputuskan."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetricCard label="Total feedback" value={data.summary.total} />
        <SuperAdminMetricCard label="Saran" value={data.summary.saran} tone="indigo" />
        <SuperAdminMetricCard label="Ide" value={data.summary.ide} tone="amber" />
        <SuperAdminMetricCard label="Keluhan" value={data.summary.keluhan} tone="rose" />
      </section>

      <section className="section-block p-5 sm:p-6">
        <form className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="category"
            value=""
            className={`rounded-full px-5 py-3 text-sm font-bold transition ${
              data.filters.category === "" ? "bg-brand text-white" : "bg-slate-100 text-brand"
            }`}
          >
            Semua
          </button>
          {data.categories.map((category) => (
            <button
              key={category}
              type="submit"
              name="category"
              value={category}
              className={`rounded-full px-5 py-3 text-sm font-bold capitalize transition ${
                data.filters.category === category ? "bg-brand text-white" : "bg-slate-100 text-brand"
              }`}
            >
              {category}
            </button>
          ))}
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {data.feedbacks.data.length === 0 ? (
          <div className="section-block p-8 text-sm font-semibold text-brand/50 xl:col-span-2">
            Belum ada feedback yang masuk.
          </div>
        ) : (
          data.feedbacks.data.map((feedback) => (
            <article key={feedback.id} className="section-block p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SuperAdminStatusBadge
                    label={feedback.category_label}
                    tone={feedback.category === "keluhan" ? "rose" : feedback.category === "ide" ? "amber" : "blue"}
                  />
                  <h2 className="mt-4 text-sm font-bold text-brand">
                    {feedback.user?.name ?? "Pengguna"}
                  </h2>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                    {feedback.outlet?.name ?? "Platform"} | {formatSuperAdminDate(feedback.created_at)}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold leading-8 text-brand/70">
                {feedback.message}
              </p>
            </article>
          ))
        )}
      </section>

      <SuperAdminPagination
        basePath="/superadmin/feedbacks"
        page={data.feedbacks.current_page}
        lastPage={data.feedbacks.last_page}
        searchParams={{
          category: data.filters.category,
        }}
      />
    </SuperAdminFrame>
  );
}
