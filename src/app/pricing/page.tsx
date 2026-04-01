import Link from "next/link";
import { PublicBottomNav } from "@/components/public-bottom-nav";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { ApiError, getPublicPricing, type PricingResponse } from "@/lib/api";

const planOrder = ["free", "pro", "business"] as const;

const planDisplay: Record<(typeof planOrder)[number], { label: string; badge?: string }> = {
  free: { label: "Pemula" },
  pro: { label: "Profesional", badge: "Paling populer" },
  business: { label: "Business" },
};

const featureHighlights = [
  {
    title: "Operasional outlet yang rapi",
    description:
      "Kelola order, status pengerjaan, pelanggan, dan pembayaran dari satu workspace yang konsisten.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-accent">
        <path
          d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v6.5A2.75 2.75 0 0 1 17.25 16H6.75A2.75 2.75 0 0 1 4 13.25z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M8 19h8M12 16v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Siap dipakai tim outlet",
    description:
      "Owner, admin, dan staff bisa bekerja dari alur yang sama tanpa perlu pindah-pindah tools.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-accent-ink">
        <path
          d="M8.75 11a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM15.25 12.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M4.75 18.25c.63-2.27 2.48-3.75 4.99-3.75 1.63 0 3.03.5 4.01 1.42M13.5 18.25c.45-1.35 1.61-2.25 3.25-2.25 1.07 0 1.96.37 2.5 1.02"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Laporan yang langsung berguna",
    description:
      "Pantau revenue, expense, performa outlet, dan pertumbuhan bisnis tanpa merakit dashboard sendiri.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-brand">
        <path
          d="M6 18V11m6 7V6m6 12v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M4 19.25h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: "Bisa upgrade paket kapan saja?",
    answer:
      "Bisa. Anda dapat mulai dari paket yang paling ringan lalu upgrade saat outlet dan volume order bertambah.",
  },
  {
    question: "Apa yang dihitung sebagai outlet?",
    answer:
      "Outlet adalah cabang atau titik operasional yang Anda kelola di sistem, termasuk lokasi utama dan cabang lain.",
  },
  {
    question: "Kalau masih di paket gratis bagaimana saat order bertambah?",
    answer:
      "Anda bisa memakai top-up kuota order terlebih dulu, atau langsung pindah ke paket Pro jika operasional sudah aktif tiap hari.",
  },
];

export const dynamic = "force-dynamic";

function CheckIcon({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
        dark ? "bg-white/12 text-accent-soft" : "bg-[rgba(129,242,235,0.22)] text-accent-ink"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path
          d="m5 10.5 3.1 3.1L15 6.7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default async function PricingPage() {
  const session = await getOptionalAuthSession();
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
    <>
      <PublicTopNav current="pricing" authenticated={session?.authenticated} />

      <main className="public-main-shell">
        <section className="public-hero-intro motion-enter text-center sm:mb-20">
          <p className="eyebrow mx-auto">{data.hero.badge}</p>
          <h1 className="mx-auto mt-6 max-w-4xl text-[2.5rem] font-semibold tracking-[-0.05em] text-brand sm:text-[4.25rem] sm:leading-[1.02]">
            Paket yang tumbuh mengikuti <span className="text-accent">operasional laundry sepatu</span> Anda
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            {data.hero.description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <span className="text-sm font-semibold text-muted">Bulanan</span>
            <div className="flex h-8 w-16 items-center rounded-full bg-surface-muted p-1">
              <span className="h-6 w-6 rounded-full bg-white shadow-sm" />
            </div>
            <span className="text-sm font-semibold text-brand">
              Tahunan <span className="text-accent">(segera hadir)</span>
            </span>
          </div>
        </section>

        <section className="motion-enter motion-delay-1 grid items-stretch gap-6 md:grid-cols-3">
          {planOrder.map((key) => {
            const plan = data.plans[key];
            const highlighted = key === "pro";
            const display = planDisplay[key];

            return (
              <article
                key={plan.name}
                className={`motion-enter-fast relative flex h-full flex-col overflow-hidden rounded-[2rem] p-6 sm:p-8 ${
                  highlighted
                    ? "scale-[1.01] bg-brand text-white shadow-[0_28px_60px_rgba(0,32,69,0.24)] md:scale-[1.04]"
                    : "border border-transparent bg-white shadow-[0_20px_40px_rgba(25,28,30,0.06)]"
                }`}
                style={{ animationDelay: `${0.1 * (planOrder.indexOf(key) + 1)}s` }}
              >
                {display.badge ? (
                  <div className="absolute right-0 top-0 rounded-bl-[1.4rem] bg-[rgba(129,242,235,0.95)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-accent-ink">
                    {display.badge}
                  </div>
                ) : null}

                <div className="mb-8">
                  <h2 className={`font-semibold tracking-[-0.03em] ${highlighted ? "text-accent-soft" : "text-brand"} text-2xl`}>
                    {display.label}
                  </h2>
                  <p className={`mt-2 text-sm ${highlighted ? "text-white/68" : "text-muted"}`}>{plan.subtitle}</p>
                  <div className="mt-6 flex items-end gap-1">
                    <span className={`text-4xl font-semibold tracking-[-0.05em] ${highlighted ? "text-white" : "text-brand"}`}>
                      {plan.price_label}
                    </span>
                    {plan.price > 0 ? (
                      <span className={`pb-1 text-sm font-medium ${highlighted ? "text-white/68" : "text-muted"}`}>
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-4 text-sm leading-7 ${highlighted ? "text-white/78" : "text-muted"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10 flex flex-1 flex-col gap-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className={`flex items-start gap-3 text-sm font-medium ${
                        highlighted ? "text-white/92" : "text-foreground"
                      }`}
                    >
                      <CheckIcon dark={highlighted} />
                      <span className="leading-6">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={key === "business" ? "/register" : "/login"}
                  className={
                    highlighted
                      ? "inline-flex w-full items-center justify-center rounded-full bg-accent-soft px-5 py-4 text-sm font-bold text-accent-ink shadow-[0_16px_28px_rgba(0,0,0,0.12)] transition hover:brightness-[0.98]"
                      : key === "business"
                        ? "inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-4 text-sm font-bold text-white transition hover:bg-brand-strong"
                        : "inline-flex w-full items-center justify-center rounded-full bg-surface-muted px-5 py-4 text-sm font-bold text-brand transition hover:bg-[rgba(224,227,229,0.92)]"
                  }
                >
                  {plan.cta}
                </Link>
              </article>
            );
          })}
        </section>

        <section className="motion-enter motion-delay-2 mt-24">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.04em] text-brand sm:text-[2.55rem]">
            Semua detail penting untuk bisnis Anda sudah diperhitungkan.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <article
              className="motion-enter-fast rounded-[2rem] bg-surface-soft p-8 md:col-span-2"
              style={{ animationDelay: "0.08s" }}
            >
              {featureHighlights[0].icon}
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-brand">
                {featureHighlights[0].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{featureHighlights[0].description}</p>
            </article>

            <article
              className="motion-enter-fast rounded-[2rem] bg-[rgba(129,242,235,0.16)] p-8 md:col-span-2"
              style={{ animationDelay: "0.16s" }}
            >
              {featureHighlights[1].icon}
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-accent-ink">
                {featureHighlights[1].title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-accent-ink/80">{featureHighlights[1].description}</p>
            </article>

            <article
              className="motion-enter-fast overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_16px_38px_rgba(25,28,30,0.06)] md:col-span-4"
              style={{ animationDelay: "0.24s" }}
            >
              <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr]">
                <div>
                  {featureHighlights[2].icon}
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-brand">
                    {featureHighlights[2].title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {featureHighlights[2].description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="status-chip-mint">Order & payment</span>
                    <span className="status-chip-brand">Expense & report</span>
                    <span className="status-chip-soft">Promo & survey</span>
                  </div>

                  <Link href="/register" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-accent">
                    Coba alur kerja lengkap
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                      <path
                        d="M4.5 10h11m0 0-4-4m4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>

                <div className="rounded-[1.7rem] bg-surface-soft p-6">
                  <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#002045,#1a365d)] p-5 text-white shadow-[0_22px_46px_rgba(0,32,69,0.18)]">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/58">
                      <span>Ringkasan workspace</span>
                      <span>Live</span>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] bg-white/10 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Outlet</p>
                        <p className="mt-2 text-2xl font-semibold">{data.outlets.length}</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-white/10 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Paket aktif</p>
                        <p className="mt-2 text-2xl font-semibold">3</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-white/10 p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/58">Top-up</p>
                        <p className="mt-2 text-2xl font-semibold">{data.plans.topup.quota}</p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-[1.35rem] bg-white/8 p-4 text-sm text-white/80">
                      Kuota tambahan tersedia untuk outlet yang masih berada di paket gratis, tanpa perlu langsung migrasi penuh.
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="motion-enter motion-delay-3 mt-24 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="motion-enter-fast section-dark p-6 sm:p-8" style={{ animationDelay: "0.1s" }}>
            <p className="section-label-dark">{data.plans.topup.subtitle}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              {data.plans.topup.name} untuk outlet yang masih bertumbuh
            </h2>
            <p className="subcopy-dark mt-4">{data.plans.topup.description}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="kpi-pill-dark min-w-[180px]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/58">Harga</p>
                <p className="mt-2 text-3xl font-semibold">{data.plans.topup.price_label}</p>
              </div>
              <div className="kpi-pill-dark min-w-[180px]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/58">Tambahan kuota</p>
                <p className="mt-2 text-3xl font-semibold">{data.plans.topup.quota} order</p>
              </div>
            </div>

            <Link href="/login" className="btn-accent mt-8">
              {data.plans.topup.cta}
            </Link>
          </article>

          <article
            className="motion-enter-fast rounded-[2rem] bg-white/84 p-6 shadow-[0_16px_38px_rgba(25,28,30,0.06)] sm:p-8"
            style={{ animationDelay: "0.2s" }}
          >
            <p className="section-label">Panduan cepat memilih plan</p>
            <div className="mt-6 space-y-5">
              <div className="motion-enter-fast rounded-[1.4rem] bg-surface-soft p-5" style={{ animationDelay: "0.12s" }}>
                <h3 className="font-semibold text-brand">Free</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Cocok untuk mulai digital dan menguji alur order tanpa komitmen biaya bulanan.
                </p>
              </div>
              <div className="motion-enter-fast rounded-[1.4rem] bg-surface-soft p-5" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-semibold text-brand">Pro</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Pilihan paling stabil untuk outlet aktif yang ingin order tanpa batas dan operasional tim yang lebih rapi.
                </p>
              </div>
              <div className="motion-enter-fast rounded-[1.4rem] bg-surface-soft p-5" style={{ animationDelay: "0.28s" }}>
                <h3 className="font-semibold text-brand">Business</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Dipakai saat bisnis sudah mengelola banyak cabang dan butuh kontrol yang lebih luas dari satu panel.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.04em] text-brand sm:text-[2.45rem]">
            Pertanyaan umum
          </h2>
          <div className="mt-10 space-y-5">
            {faqs.map((faq, index) => (
              <article
                key={faq.question}
                className="motion-enter-fast rounded-[1.6rem] bg-surface-soft p-6"
                style={{ animationDelay: `${0.08 * (index + 1)}s` }}
              >
                <h3 className="text-base font-semibold text-brand">{faq.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/88">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 ShoeClean. Sistem operasional untuk bisnis perawatan sepatu.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/pricing" className="transition hover:text-brand">
              Harga
            </Link>
            <Link href="/track" className="transition hover:text-brand">
              Pelacakan
            </Link>
            <Link href="/login" className="transition hover:text-brand">
              Masuk
            </Link>
            <Link href="/register" className="transition hover:text-brand">
              Daftar
            </Link>
          </div>
        </div>
      </footer>

      <PublicBottomNav current="pricing" />
    </>
  );
}


