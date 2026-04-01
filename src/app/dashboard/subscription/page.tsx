import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SubscriptionHistoryPanels } from "@/components/subscription-history-panels";
import { getSubscriptionSummary } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardSubscriptionPage() {
  let data: Awaited<ReturnType<typeof getSubscriptionSummary>>;

  try {
    data = await getSubscriptionSummary();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <DashboardFrame
          current="subscription"
          eyebrow="Langganan Bisnis"
          title="Halaman langganan hanya untuk owner."
          description="Admin dan staff tidak memiliki akses ke area billing, plan, dan kuota bisnis."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Jika Anda ingin admin tertentu bisa melihat status paket tanpa mengubahnya, kita bisa tambah mode read-only di langkah berikutnya.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Subscription belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const planEntries = Object.entries(data.plan_details);

  return (
    <DashboardFrame
      current="subscription"
      eyebrow="Langganan Bisnis"
      title="Plan, quota, dan kapasitas bisnis."
      description="Pantau status paket aktif, batas order, kapasitas outlet, dan ambil aksi upgrade atau top-up langsung dari dashboard baru."
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="section-dark rounded-[1.85rem] p-6 sm:p-7 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Status langganan</p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {data.active_subscription ? `Paket ${data.active_subscription.plan} sedang aktif` : "Saat ini Anda berada di paket free"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/74">
            Gunakan halaman ini untuk membaca sisa kuota, kapasitas outlet, dan jalur upgrade bisnis Anda.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Masa aktif</p>
              <p className="mt-2 font-semibold text-white">
                {data.active_subscription?.expires_at ? `${data.active_subscription.days_remaining ?? 0} hari lagi` : "Belum ada masa aktif"}
              </p>
            </div>
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Status order</p>
              <p className="mt-2 font-semibold text-white">{data.order_limit.allowed ? "Masih bisa menerima order" : "Limit order tercapai"}</p>
            </div>
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Slot outlet</p>
              <p className="mt-2 font-semibold text-white">{data.outlet_capacity.can_create ? "Masih tersedia" : "Kapasitas penuh"}</p>
            </div>
          </div>
        </section>

        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Ringkasan cepat</p>
          <div className="dashboard-panel-stack mt-5">
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Paket aktif</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-accent">{data.current_plan}</p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Sisa order</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
                {data.order_limit.remaining === null ? "Tanpa batas" : data.order_limit.remaining}
              </p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Outlet terpakai</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-foreground">
                {data.outlet_capacity.max === null ? `${data.outlet_capacity.current}+` : `${data.outlet_capacity.current}/${data.outlet_capacity.max}`}
              </p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Total order</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-danger">{data.order_limit.total_orders}</p>
            </div>
          </div>
        </section>
      </section>

      <section className="section-block p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Katalog paket</p>
        <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Pilih jalur pertumbuhan bisnis</h2>

        <div className="mt-6 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
          {planEntries.map(([key, plan]) => {
            const isCurrent = data.current_plan === key;
            const upgradeUrl =
              key === "pro"
                ? data.payment_links.pro
                : key === "business"
                  ? data.payment_links.business
                  : key === "topup"
                    ? data.payment_links.topup
                    : null;

            return (
              <article key={key} className={`${isCurrent ? "section-dark text-white" : "section-block"} rounded-[1.75rem] p-5 sm:p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? "text-white/55" : "text-brand/35"}`}>{plan.subtitle}</p>
                    <h3 className={`mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight ${isCurrent ? "text-white" : "text-brand"}`}>{plan.name}</h3>
                  </div>
                  {isCurrent ? <span className={isCurrent ? "highlight-chip-dark" : "highlight-chip"}>Paket aktif</span> : null}
                </div>
                <p className={`mt-4 break-words font-[var(--font-display-sans)] text-[2rem] leading-tight font-extrabold ${isCurrent ? "text-white" : "text-accent"}`}>{plan.price_label ?? formatRupiah(plan.price)}</p>
                <p className={`mt-3 text-sm leading-7 ${isCurrent ? "text-white/72" : "text-muted"}`}>{plan.description}</p>
                {"features" in plan && plan.features ? (
                  <div className="dashboard-panel-stack mt-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className={`${isCurrent ? "soft-panel-dark text-white/82" : "soft-panel text-foreground"} p-3 text-sm`}>
                        {feature}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`${isCurrent ? "soft-panel-dark text-white/82" : "soft-panel text-foreground"} mt-4 p-4 text-sm`}>
                    Tambahan {plan.quota} order untuk bisnis yang masih di paket free.
                  </div>
                )}
                {upgradeUrl ? (
                  <a href={upgradeUrl} className={`${isCurrent ? "btn-accent" : "btn-primary"} mt-5 w-full`}>
                    {plan.cta}
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="section-block p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Outlet dalam paket</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Cabang yang sedang tercakup</h2>
          <div className="dashboard-panel-stack mt-6">
            {data.outlets.map((outlet) => (
              <div key={outlet.id} className="soft-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{outlet.name}</p>
                    <p className="mt-1 text-sm text-muted">Slug: {outlet.slug}</p>
                  </div>
                  <span className="highlight-chip">{outlet.status}</span>
                </div>
              </div>
            ))}
            {data.outlets.length === 0 ? <div className="soft-panel p-4 text-sm text-muted">Belum ada outlet aktif untuk owner ini.</div> : null}
          </div>
        </section>

        <SubscriptionHistoryPanels
          customerName={data.owner_name}
          subscriptionHistory={data.subscription_history}
          quotaHistory={data.quota_history}
        />
      </div>
    </DashboardFrame>
  );
}
