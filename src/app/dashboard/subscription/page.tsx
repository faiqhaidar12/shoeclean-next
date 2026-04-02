import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { SubscriptionPopButton } from "@/components/subscription-pop-button";
import { SubscriptionHistoryPanels } from "@/components/subscription-history-panels";
import { getOptionalAuthSession, getSubscriptionSummary } from "@/lib/auth";
import { ApiError, getPublicPricing } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Bisnis",
  topup: "Top Up",
};

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function DashboardSubscriptionPage({
  searchParams,
}: {
  searchParams?: Promise<{ payment?: string; plan?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const paymentState = resolvedSearchParams?.payment ?? "";
  const highlightedPlan = resolvedSearchParams?.plan ?? "";
  let data: Awaited<ReturnType<typeof getSubscriptionSummary>>;

  try {
    data = await getSubscriptionSummary();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 403) {
      const session = await getOptionalAuthSession();

      if (session?.authenticated) {
        const pricing = await getPublicPricing();
        const fallbackPlans = Object.entries(pricing.plans);

        return (
          <DashboardFrame
            current="subscription"
            eyebrow="Langganan Bisnis"
            title="Pilih paket untuk bisnis Anda"
            description="Akun Anda sudah bisa melihat daftar paket. Ringkasan detail akan tampil otomatis setelah data langganan tersinkron penuh."
          >
            <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
              <div className="grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
                {fallbackPlans.map(([key, plan]) => {
                  const isCurrent = session.user.current_plan === key;
                  const upgradeUrl =
                    key === "pro"
                      ? "/api/subscription/checkout/pro"
                      : key === "business"
                        ? "/api/subscription/checkout/business"
                        : key === "topup"
                          ? "/api/subscription/checkout/topup"
                          : null;
                  const isPublished = plan.is_published ?? true;

                  return (
                    <article key={key} className={`${isCurrent ? "section-dark text-white" : "section-block"} rounded-[1.75rem] p-5 sm:p-6`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? "text-white/55" : "text-brand/35"}`}>{plan.subtitle}</p>
                          <h3 className={`mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight ${isCurrent ? "text-white" : "text-brand"}`}>{plan.name}</h3>
                        </div>
                        {isCurrent ? (
                          <span className={isCurrent ? "highlight-chip-dark" : "highlight-chip"}>Paket aktif</span>
                        ) : !isPublished ? (
                          <span className="highlight-chip">Coming Soon</span>
                        ) : null}
                      </div>
                      <p className={`mt-4 break-words font-[var(--font-display-sans)] text-[2rem] leading-tight font-extrabold ${isCurrent ? "text-white" : "text-accent"}`}>
                        {plan.price_label ?? formatRupiah(plan.price)}
                      </p>
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
                          Tambahan {"quota" in plan ? plan.quota : 0} pesanan untuk bisnis yang masih memakai paket gratis.
                        </div>
                      )}

                      {upgradeUrl ? (
                        isPublished ? (
                          <SubscriptionPopButton
                            plan={key}
                            label={plan.cta}
                            returnTo="/dashboard/subscription"
                            className={`${isCurrent ? "btn-accent" : "btn-primary"} mt-5 w-full`}
                          />
                        ) : (
                          <span className="btn-secondary mt-5 w-full opacity-80">Coming Soon</span>
                        )
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          </DashboardFrame>
        );
      }

      return (
        <DashboardFrame
          current="subscription"
          eyebrow="Langganan Bisnis"
          title="Halaman langganan hanya untuk pemilik usaha."
          description="Admin dan staf tidak memiliki akses ke area tagihan, paket, dan kuota bisnis."
        >
          <section className="section-block p-5 sm:p-6">
            <p className="text-sm leading-7 text-muted">
              Jika dibutuhkan, admin tertentu bisa diberi akses lihat saja ke status paket di tahap berikutnya.
            </p>
          </section>
        </DashboardFrame>
      );
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Langganan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const planEntries = Object.entries(data.plan_details);

  return (
    <DashboardFrame
      current="subscription"
      eyebrow="Langganan Bisnis"
      title="Paket, kuota, dan kapasitas bisnis"
      description="Pantau status paket aktif, batas pesanan, kapasitas cabang, dan ambil aksi upgrade atau top-up dari halaman ini."
    >
      {paymentState ? (
        <section
          className={`rounded-[1.6rem] border px-5 py-4 sm:px-6 ${
            paymentState === "success"
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={`text-[10px] font-black uppercase tracking-[0.22em] ${
              paymentState === "success" ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {paymentState === "success" ? "Pembayaran berhasil" : "Menunggu konfirmasi"}
          </p>
          <h2
            className={`mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight ${
              paymentState === "success" ? "text-emerald-950" : "text-amber-950"
            }`}
          >
            {paymentState === "success"
              ? `${planLabels[highlightedPlan] ?? "Paket"} sedang disiapkan untuk akun Anda`
              : `Pembayaran ${planLabels[highlightedPlan] ?? "paket"} sedang diproses`}
          </h2>
          <p className={`mt-2 text-sm leading-7 ${paymentState === "success" ? "text-emerald-900/80" : "text-amber-900/80"}`}>
            {paymentState === "success"
              ? "Halaman ini akan menyegarkan status secara otomatis. Jika paket aktif belum berubah, tunggu beberapa detik lalu buka lagi halaman ini."
              : "Duitku masih memproses pembayaran Anda. Setelah konfirmasi masuk, paket akan aktif secara otomatis tanpa perlu mengulangi pembayaran."}
          </p>
        </section>
      ) : null}

      {data.pending_transactions.length > 0 ? (
        <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Pembayaran belum selesai</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">
                Lanjutkan pembayaran yang masih tertunda
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
                Jika popup tertutup atau pembayaran belum selesai, Anda bisa membuka lagi tagihan yang sama dari sini tanpa membuat transaksi baru.
              </p>
            </div>
            <div className="highlight-chip">Tersimpan otomatis dari transaksi terakhir</div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[1080px]">
              <div className="grid grid-cols-[150px_220px_180px_170px_170px_200px] gap-4 rounded-[1.25rem] bg-slate-50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">
                <span>Paket</span>
                <span>Referensi</span>
                <span>Status</span>
                <span>Batas bayar</span>
                <span>Nominal</span>
                <span className="text-right">Aksi</span>
              </div>
              <div className="mt-3 space-y-3">
                {data.pending_transactions.map((transaction) => (
                  <article key={transaction.id} className="soft-panel p-5">
                    <div className="grid grid-cols-[150px_220px_180px_170px_170px_200px] items-center gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{transaction.plan_label}</p>
                        <p className="mt-1 text-xs text-muted">{transaction.payment_method ?? "Belum ditentukan"}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground" title={transaction.reference ?? "-"}>
                          {transaction.reference ?? "-"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted" title={transaction.merchant_order_id}>
                          {transaction.merchant_order_id}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex min-h-8 items-center rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${
                          transaction.is_expired
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {transaction.is_expired ? "Kedaluwarsa" : transaction.status_message || "Menunggu"}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-foreground">{formatDateTime(transaction.expires_at)}</div>
                      <div className="font-[var(--font-display-sans)] text-lg font-extrabold tracking-tight text-brand">
                        {transaction.amount_label}
                      </div>
                      <div className="flex justify-end">
                        {transaction.payment_url && !transaction.is_expired ? (
                          <a href={transaction.payment_url} target="_blank" rel="noreferrer" className="btn-primary">
                            Lanjutkan
                          </a>
                        ) : (
                          <span className="btn-secondary opacity-80">
                            {transaction.is_expired ? "Kedaluwarsa" : "Belum tersedia"}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="section-dark rounded-[1.85rem] p-6 sm:p-7 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Status paket</p>
          <h2 className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {data.active_subscription ? `Paket ${data.active_subscription.plan} sedang aktif` : "Saat ini Anda masih memakai paket gratis"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/74">
            Gunakan halaman ini untuk melihat sisa kuota, kapasitas cabang, dan pilihan upgrade bisnis Anda.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Masa aktif</p>
              <p className="mt-2 font-semibold text-white">
                {data.active_subscription?.expires_at ? `${data.active_subscription.days_remaining ?? 0} hari lagi` : "Belum ada masa aktif"}
              </p>
            </div>
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Status pesanan</p>
              <p className="mt-2 font-semibold text-white">{data.order_limit.allowed ? "Masih bisa menerima pesanan" : "Batas pesanan tercapai"}</p>
            </div>
            <div className="soft-panel-dark p-4">
              <p className="text-sm text-white/70">Slot outlet</p>
              <p className="mt-2 font-semibold text-white">{data.outlet_capacity.can_create ? "Masih tersedia" : "Kapasitas penuh"}</p>
            </div>
          </div>
        </section>

        <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Ringkasan cepat</p>
          <div className="dashboard-panel-stack mt-5">
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Paket aktif</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-accent">{data.current_plan}</p>
            </div>
            <div className="soft-panel p-4">
              <p className="text-sm text-muted">Sisa pesanan</p>
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
              <p className="text-sm text-muted">Total pesanan</p>
              <p className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-danger">{data.order_limit.total_orders}</p>
            </div>
          </div>
        </section>
      </section>

      <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Pilihan paket</p>
        <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Pilih jalur pertumbuhan bisnis</h2>

        <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-4">
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
            const isPublished = plan.is_published ?? true;

            return (
              <article key={key} className={`${isCurrent ? "section-dark text-white" : "section-block"} ${highlightedPlan === key ? "ring-2 ring-accent/60 shadow-[0_0_0_8px_rgba(129,242,235,0.14)]" : ""} rounded-[1.75rem] p-5 sm:p-6`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCurrent ? "text-white/55" : "text-brand/35"}`}>{plan.subtitle}</p>
                    <h3 className={`mt-2 font-[var(--font-display-sans)] text-2xl font-extrabold tracking-tight ${isCurrent ? "text-white" : "text-brand"}`}>{plan.name}</h3>
                  </div>
                  {isCurrent ? (
                    <span className={isCurrent ? "highlight-chip-dark" : "highlight-chip"}>Paket aktif</span>
                  ) : !isPublished ? (
                    <span className={isCurrent ? "highlight-chip-dark" : "highlight-chip"}>Coming Soon</span>
                  ) : null}
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
                    Tambahan {plan.quota} pesanan untuk bisnis yang masih memakai paket gratis.
                  </div>
                )}
                {upgradeUrl ? (
                  isPublished ? (
                    <SubscriptionPopButton
                      plan={key}
                      label={plan.cta}
                      returnTo="/dashboard/subscription"
                      className={`${isCurrent ? "btn-accent" : "btn-primary"} mt-5 w-full`}
                    />
                  ) : (
                    <span className={`${isCurrent ? "btn-secondary" : "btn-secondary"} mt-5 w-full opacity-80`}>
                      Coming Soon
                    </span>
                  )
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="section-block min-w-0 overflow-hidden p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Outlet dalam paket</p>
          <h2 className="mt-2 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">Cabang yang sedang tercakup</h2>
          <div className="dashboard-panel-stack mt-6">
            {data.outlets.map((outlet) => (
              <div key={outlet.id} className="soft-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{outlet.name}</p>
                    <p className="mt-1 text-sm text-muted">Alamat singkat: {outlet.slug}</p>
                  </div>
                  <span className="highlight-chip">{outlet.status}</span>
                </div>
              </div>
            ))}
            {data.outlets.length === 0 ? <div className="soft-panel p-4 text-sm text-muted">Belum ada cabang aktif yang terhubung ke akun ini.</div> : null}
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
