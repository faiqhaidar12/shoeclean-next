import { SuperAdminFrame } from "@/components/superadmin-frame";
import {
  formatSuperAdminDate,
  SuperAdminMetricCard,
  SuperAdminPagination,
  SuperAdminStatusBadge,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminSubscriptions, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function queryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminSubscriptionsPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminSubscriptions({
      plan: queryValue(params.plan),
      status: queryValue(params.status),
      page: queryValue(params.page),
    }),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="subscriptions"
      eyebrow="Insight langganan"
      title="Distribusi paket owner"
      description="Pantau owner Free, Pro, Business, akun yang akan segera berakhir, dan riwayat langganan terbaru."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetricCard label="Owner Free" value={data.summary.free_owners} />
        <SuperAdminMetricCard label="Owner Pro" value={data.summary.pro_owners} tone="indigo" />
        <SuperAdminMetricCard label="Owner Business" value={data.summary.business_owners} tone="purple" />
        <SuperAdminMetricCard label="Segera berakhir" value={data.summary.expiring_count} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <article className="section-block p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            Perlu follow-up
          </p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
            Langganan segera berakhir
          </h2>
          <div className="mt-6 space-y-3">
            {data.expiring.length === 0 ? (
              <div className="soft-panel p-5 text-sm font-semibold text-brand/50">
                Tidak ada langganan yang akan berakhir dalam 7 hari ke depan.
              </div>
            ) : (
              data.expiring.map((subscription) => (
                <div key={subscription.id} className="soft-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand">
                        {subscription.user?.name ?? "-"}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-brand/50">
                        {subscription.user?.email ?? "-"}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                      {subscription.days_remaining ?? 0} hari
                    </span>
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40">
                    {subscription.plan.toUpperCase()} | Berakhir {formatSuperAdminDate(subscription.expires_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="section-block p-6 sm:p-8">
          <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px] md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
                Riwayat langganan
              </p>
              <h2 className="mt-3 font-[var(--font-display-sans)] text-2xl font-black tracking-[-0.06em] text-brand">
                Semua transaksi paket
              </h2>
            </div>
            <select name="plan" defaultValue={data.filters.plan} className="field-soft">
              <option value="">Semua paket</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
            <select name="status" defaultValue={data.filters.status} className="field-soft">
              <option value="">Semua status</option>
              <option value="active">Aktif</option>
              <option value="expired">Berakhir</option>
            </select>
          </form>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[220px_180px_160px_160px_120px] gap-4 border-b border-black/5 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                <div>Owner</div>
                <div>Paket</div>
                <div>Mulai</div>
                <div>Berakhir</div>
                <div>Status</div>
              </div>
              {data.subscriptions.data.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm font-semibold text-brand/45">
                  Belum ada langganan yang cocok dengan filter saat ini.
                </div>
              ) : (
                data.subscriptions.data.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="grid grid-cols-[220px_180px_160px_160px_120px] gap-4 border-b border-black/5 px-6 py-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-brand">{subscription.user?.name ?? "-"}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-brand/50">
                        {subscription.user?.email ?? "-"}
                      </p>
                    </div>
                    <div>
                      <SuperAdminStatusBadge
                        label={subscription.plan.toUpperCase()}
                        tone={subscription.plan === "business" ? "purple" : "blue"}
                      />
                    </div>
                    <div className="text-sm font-semibold text-brand/65">
                      {formatSuperAdminDate(subscription.started_at)}
                    </div>
                    <div className="text-sm font-semibold text-brand/65">
                      {subscription.expires_at ? formatSuperAdminDate(subscription.expires_at) : "Tanpa batas"}
                    </div>
                    <div>
                      <SuperAdminStatusBadge
                        label={subscription.status_label}
                        tone={subscription.status === "active" ? "emerald" : "rose"}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <SuperAdminPagination
            basePath="/superadmin/subscriptions"
            page={data.subscriptions.current_page}
            lastPage={data.subscriptions.last_page}
            searchParams={{
              plan: data.filters.plan,
              status: data.filters.status,
            }}
          />
        </article>
      </section>
    </SuperAdminFrame>
  );
}
