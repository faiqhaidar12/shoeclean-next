import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { ApiError, getPublicPricing, type PricingResponse } from "@/lib/api";

const planOrder = ["free", "pro", "business"] as const;

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  let data: PricingResponse | null = null;
  let message = "";

  try {
    data = await getPublicPricing();
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat halaman pricing.";
  }

  if (!data) {
    return <BackendUnavailable message={message} title="Pricing belum terhubung" />;
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="section-block p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="eyebrow">{data.hero.badge}</span>
                <h1 className="headline mt-4">{data.hero.title}</h1>
                <p className="subcopy mt-4">{data.hero.description}</p>
              </div>
              <div className="mobile-stack">
                <Link href="/" className="btn-secondary w-full sm:w-auto">
                  Kembali
                </Link>
                <Link href="/order" className="btn-accent w-full sm:w-auto">
                  Mulai order
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-3">
            {planOrder.map((key) => {
              const plan = data.plans[key];
              const highlighted = key === "pro";

              return (
                <article
                  key={plan.name}
                  className={`relative overflow-hidden rounded-[1.75rem] border p-5 sm:p-6 ${
                    highlighted
                      ? "border-brand bg-[linear-gradient(180deg,#fff4ec,#fffdf9)] shadow-[0_24px_60px_-34px_var(--glow)]"
                      : "border-line bg-white/88"
                  }`}
                >
                  {highlighted ? (
                    <span className="absolute right-4 top-4 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Paling cocok
                    </span>
                  ) : null}
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    {plan.subtitle}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold">{plan.name}</h2>
                  <p className="mt-3 text-3xl font-semibold text-accent">
                    {plan.price_label}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {plan.description}
                  </p>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="soft-panel bg-surface-soft/45 px-4 py-3 text-sm font-medium text-ink-soft"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link href="/order" className="btn-primary w-full">
                      {plan.cta}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="section-block bg-[#183a34] p-5 text-white sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-white/65">
                Top-up Free Plan
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {data.plans.topup.name} {data.plans.topup.price_label}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/78">
                {data.plans.topup.description}
              </p>
              <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Tambahan kuota
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {data.plans.topup.quota} order
                </p>
              </div>
            </article>

            <article className="section-block p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Cocok untuk
              </p>
              <div className="mt-5 space-y-3">
                <div className="soft-panel p-4">
                  <p className="font-semibold">Free</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Outlet baru yang ingin mulai digital tanpa komitmen awal.
                  </p>
                </div>
                <div className="soft-panel p-4">
                  <p className="font-semibold">Pro</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Satu outlet aktif yang butuh operasional lebih rapi dan tanpa batas order.
                  </p>
                </div>
                <div className="soft-panel p-4">
                  <p className="font-semibold">Business</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Multi cabang dengan kebutuhan kontrol dan laporan yang lebih luas.
                  </p>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
