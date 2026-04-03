import Image from "next/image";
import Link from "next/link";
import { PublicBottomNav } from "@/components/public-bottom-nav";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
import { ApiError, getPublicTracking } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type TrackPageProps = {
  searchParams?: Promise<{
    invoice?: string;
  }>;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8 3-3.8-3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="m5 10.5 3 3L15 6.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3.5 13.9 8l4.6 1.9-4.6 1.9L12 16.5l-1.9-4.7L5.5 9.9 10.1 8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 7.75A2.75 2.75 0 0 1 6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v8.5A2.75 2.75 0 0 1 17.25 19H6.75A2.75 2.75 0 0 1 4 16.25z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M4 9.5h16M8 14h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 20s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const helpCards = [
  {
    title: "Butuh bantuan?",
    description:
      "Kalau nomor invoice tidak ditemukan, Anda bisa kembali ke halaman pemesanan atau menghubungi outlet tempat Anda memesan.",
    cta: "Pesan lagi",
    href: "/order",
  },
  {
    title: "Cek tagihan dengan mudah",
    description:
      "Total tagihan dan rincian layanan akan tampil di halaman ini, jadi Anda bisa mengeceknya kapan saja.",
    cta: "Lihat harga",
    href: "/pricing",
  },
  {
    title: "Lacak pesanan kapan saja",
    description:
      "Halaman ini dibuat singkat dan mudah dibaca, supaya Anda tetap nyaman mengecek pesanan dari HP.",
    cta: "Kembali ke beranda",
    href: "/",
  },
];

function createMapsUrl(latitude?: number | null, longitude?: number | null) {
  if (latitude == null || longitude == null) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const session = await getOptionalAuthSession();
  const params = (await searchParams) ?? {};
  const invoice = params.invoice?.trim() ?? "";

  let errorMessage = "";
  let errorStatus: number | null = null;
  let data: Awaited<ReturnType<typeof getPublicTracking>> | null = null;

  if (invoice) {
    try {
      data = await getPublicTracking(invoice);
    } catch (error) {
      errorStatus = error instanceof ApiError ? error.status : null;
      errorMessage =
        error instanceof ApiError
          ? error.message
          : "Terjadi kendala saat memuat data pelacakan.";
    }
  }

  const activeSteps = data?.order.timeline.filter((step) => step.is_active).length ?? 0;
  const progressWidth =
    data && data.order.timeline.length > 1
      ? `${Math.max(8, ((activeSteps - 1) / (data.order.timeline.length - 1)) * 100)}%`
      : "0%";
  const outletMapsUrl = createMapsUrl(data?.order.outlet?.latitude, data?.order.outlet?.longitude);
  const pickupMapsUrl = createMapsUrl(data?.order.pickup_latitude, data?.order.pickup_longitude);
  const deliveryMapsUrl = createMapsUrl(data?.order.delivery_latitude, data?.order.delivery_longitude);

  return (
    <>
      <PublicTopNav
        current="track"
        authenticated={session?.authenticated}
        dashboardHref={session?.user.is_superadmin ? "/superadmin" : "/dashboard"}
      />

      <main className="public-main-shell">
        <section className="public-hero-intro motion-enter max-w-3xl text-center md:text-left">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-brand sm:text-[4rem] sm:leading-[1.02]">
            Lacak <span className="text-accent">status pesanan</span> Anda
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Masukkan nomor invoice untuk melihat status pengerjaan, detail layanan, dan informasi pembayaran dengan lebih mudah.
          </p>

          <div className="tablet-balance-card motion-enter motion-delay-1 mt-8 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Lacak pesanan</p>
                <p className="mt-2 text-sm font-semibold text-brand">
                  Cukup masukkan nomor invoice yang Anda terima setelah memesan.
                </p>
              </div>
              <span className="status-chip-brand hidden sm:inline-flex">Langsung cek</span>
            </div>

            <form action="/track" className="flex flex-col gap-3 sm:relative sm:block">
              <div className="pointer-events-none absolute left-4 top-5 hidden items-center text-muted sm:flex">
                <SearchIcon />
              </div>
              <input
                type="text"
                name="invoice"
                defaultValue={invoice}
                placeholder="Masukkan nomor invoice"
                className="w-full rounded-[1.2rem] border-none bg-surface-soft py-5 pl-4 pr-4 text-sm text-foreground shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)] outline-none transition focus:bg-white focus:ring-4 focus:ring-[rgba(0,32,69,0.08)] sm:pl-12 sm:pr-32 sm:text-base"
              />
              <button
                type="submit"
                className="rounded-[0.95rem] bg-brand px-5 py-4 text-sm font-bold text-white transition hover:opacity-95 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 sm:py-0"
              >
                Cari
              </button>
            </form>
          </div>
        </section>

        {data ? (
          <section className="tablet-balance-grid motion-enter motion-delay-2 gap-8 lg:grid-cols-12">
            <article className="relative motion-enter-fast overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_20px_40px_rgba(25,28,30,0.06)] lg:col-span-8 sm:p-10">
              <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

              <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-[rgba(129,242,235,0.22)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-ink">
                    Pesanan {data.order.invoice_number}
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-brand sm:text-3xl">
                    {data.order.items[0]?.service_name ?? "Pesanan Anda"}
                  </h2>
                </div>

                <div className="md:text-right">
                  <p className="text-sm font-medium text-muted">Status saat ini</p>
                  <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-brand">
                    {data.order.status_label}
                  </p>
                </div>
              </div>

              <div className="relative mb-14 pt-6">
                <div className="absolute top-[2.55rem] left-0 h-1 w-full rounded-full bg-surface-muted" />
                <div
                  className="absolute top-[2.55rem] left-0 h-1 rounded-full bg-accent transition-all"
                  style={{ width: progressWidth }}
                />

                <div
                  className="relative grid gap-6 md:gap-5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(1, data.order.timeline.length)}, minmax(0, 1fr))`,
                  }}
                >
                  {data.order.timeline.map((step, index) => (
                    <div
                      key={step.key}
                      className="motion-enter-fast flex min-w-0 flex-col items-center text-center"
                      style={{ animationDelay: `${0.07 * (index + 1)}s` }}
                    >
                      <div
                        className={`relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-sm font-semibold shadow-sm ${
                          step.is_current
                            ? "bg-brand text-accent-soft"
                            : step.is_active
                              ? "bg-accent text-white"
                              : "bg-surface-muted text-muted"
                        }`}
                      >
                        {step.is_active ? <CheckIcon /> : index + 1}
                      </div>
                      <p className={`text-xs font-bold ${step.is_active ? "text-brand" : "text-muted"}`}>
                        {step.label}
                      </p>
                      <p className={`mt-1 text-[10px] ${step.is_current ? "font-medium text-accent" : "text-muted/80"}`}>
                        {step.is_current ? "Sedang proses" : step.is_active ? "Selesai" : "Menunggu"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 border-t border-slate-100 pt-8 md:grid-cols-3">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-accent">
                    <SparkIcon />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted">Jenis layanan</p>
                    <p className="mt-1 text-sm font-bold text-brand">
                      {data.order.items[0]?.service_name ?? "Layanan pilihan Anda"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-accent">
                    <PaymentIcon />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted">Total harga</p>
                    <p className="mt-1 text-sm font-bold text-brand">
                      {formatRupiah(data.order.total_price)}{" "}
                      <span className="ml-1 font-medium text-accent">
                        {data.order.payment_status_label}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-accent">
                    <LocationIcon />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-muted">Lokasi outlet</p>
                    <p className="mt-1 text-sm font-bold text-brand">
                      {data.order.outlet?.name ?? "Outlet belum tersedia"}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="space-y-6 lg:col-span-4">
              <article className="motion-enter-fast motion-delay-1 rounded-[2rem] bg-surface-muted p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-brand">
                  <span className="text-accent">
                    <SparkIcon />
                  </span>
                  Ringkasan pesanan
                </h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-[1.15rem] bg-white p-4">
                    <span className="text-sm font-medium text-foreground">Status order</span>
                    <span className="status-chip-mint">{data.order.status_label}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.15rem] bg-white p-4">
                    <span className="text-sm font-medium text-foreground">Status pembayaran</span>
                    <span className="status-chip-brand">{data.order.payment_status_label}</span>
                  </div>
                  <div className="rounded-[1.15rem] bg-white p-4">
                    <p className="text-sm font-medium text-foreground">Catatan</p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {data.order.notes ?? "Belum ada catatan tambahan untuk pesanan ini."}
                    </p>
                  </div>
                </div>
              </article>

              <article className="motion-enter-fast motion-delay-2 relative h-56 overflow-hidden rounded-[2rem]">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD86U0U5DivTsfsbdKnZUTbQfAg8LAq8O1RseZfpvmyoeKVKaAJnHMMLk2NE0c8wp8oCDi4ZoYBvRS9aDsiDX7uHuvx_QV-dIJGVX42BWqfwq0xNwot0eiAuerPTBeby5dlWD-XjEDR0lFJ2hpqf9ioosSYZ3JxAkM1ua7B1sWousUZ8GoLtDOsJeoGtVRrsDp5Rpp1paEFSI7TFHq0AUbJ5zHizxGpa9SvhMsZYXaUmh1jnR0DSTZX80H0en0zwlfHAM48qihnjL8f"
                  alt="Sepatu yang sedang direstorasi"
                  fill
                  sizes="(min-width: 1024px) 26vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brand/80 to-transparent p-6">
                  <p className="text-sm font-medium leading-7 text-white">
                    Anda bisa mengecek perkembangan pesanan dengan cepat tanpa perlu bertanya berulang kali.
                  </p>
                </div>
              </article>

              <article className="motion-enter-fast motion-delay-3 rounded-[2rem] bg-white p-6 shadow-[0_16px_32px_rgba(25,28,30,0.05)]">
                <p className="section-label">Detail outlet</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-brand">
                  {data.order.outlet?.name ?? "Outlet tidak tersedia"}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {data.order.outlet?.address ?? "Alamat outlet belum tersedia."}
                </p>
                {data.order.outlet?.phone ? (
                  <p className="mt-4 text-sm font-semibold text-accent">{data.order.outlet.phone}</p>
                ) : null}
                {outletMapsUrl ? (
                  <a
                    href={outletMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-semibold text-brand underline decoration-[rgba(0,32,69,0.28)] underline-offset-4 transition hover:text-accent"
                  >
                    Buka lokasi cabang
                  </a>
                ) : null}
              </article>
            </aside>
          </section>
        ) : invoice && errorMessage ? (
          <section className="motion-enter motion-delay-2 rounded-[2rem] bg-white p-8 shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
            <span className="inline-flex rounded-full bg-[rgba(244,99,99,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b63c3c]">
              {errorStatus === 404 ? "Invoice belum ditemukan" : errorStatus === 503 ? "Server belum terhubung" : "Pelacakan belum berhasil"}
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-brand">
              {errorStatus === 404 ? "Nomor invoice belum ditemukan." : "Pesanan belum bisa ditampilkan."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{errorMessage}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={`/track${invoice ? `?invoice=${encodeURIComponent(invoice)}` : ""}`} className="btn-secondary w-full sm:w-auto">
                Coba lagi
              </Link>
              <Link href="/order" className="btn-primary w-full sm:w-auto">
                Pesan layanan
              </Link>
            </div>
          </section>
        ) : invoice && !errorMessage ? (
          <section className="motion-enter motion-delay-2 rounded-[2rem] bg-white p-8 shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-brand">Invoice tidak ditemukan</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Pastikan nomor invoice sudah benar. Jika Anda baru saja memesan, gunakan nomor invoice yang muncul di halaman berhasil atau bukti pesanan.
            </p>
          </section>
        ) : (
          <section className="motion-enter motion-delay-2 rounded-[2rem] bg-white p-8 shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-brand">Mulai lacak pesanan</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Masukkan nomor invoice untuk melihat status pesanan, total tagihan, outlet yang menangani, dan progres layanan.
            </p>
          </section>
        )}

        {data ? (
          <section className="tablet-balance-card motion-enter motion-delay-3 mt-8 bg-white shadow-[0_16px_34px_rgba(25,28,30,0.05)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand">Detail layanan</h3>
              <span className="status-chip-soft">{data.order.items.length} layanan</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.order.items.map((item, index) => (
                <article
                  key={item.id}
                  className="motion-enter-fast rounded-[1.4rem] bg-surface-soft p-5"
                  style={{ animationDelay: `${0.08 * (index + 1)}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand">{item.service_name ?? "Layanan"}</p>
                      <p className="mt-1 text-sm text-muted">
                        Jumlah {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-accent">{formatRupiah(item.total_price)}</p>
                  </div>
                </article>
              ))}
            </div>

            {data.order.pickup_address || data.order.delivery_address ? (
              <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2">
                {data.order.pickup_address ? (
                  <article className="rounded-[1.4rem] bg-surface-soft p-5">
                    <p className="section-label">Titik jemput</p>
                    <p className="mt-3 text-sm leading-7 text-muted">{data.order.pickup_address}</p>
                    {pickupMapsUrl ? (
                      <a
                        href={pickupMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-semibold text-accent underline underline-offset-4"
                      >
                        Buka titik jemput
                      </a>
                    ) : null}
                  </article>
                ) : null}

                {data.order.delivery_address ? (
                  <article className="rounded-[1.4rem] bg-surface-soft p-5">
                    <p className="section-label">Titik antar</p>
                    <p className="mt-3 text-sm leading-7 text-muted">{data.order.delivery_address}</p>
                    {deliveryMapsUrl ? (
                      <a
                        href={deliveryMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-semibold text-accent underline underline-offset-4"
                      >
                        Buka titik antar
                      </a>
                    ) : null}
                  </article>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {helpCards.map((card, index) => (
            <article
              key={card.title}
              className="motion-enter-fast rounded-[1.8rem] border border-slate-100 bg-white p-8 shadow-[0_12px_28px_rgba(25,28,30,0.04)] transition hover:shadow-[0_18px_38px_rgba(25,28,30,0.08)]"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-surface-soft text-brand">
                {index === 0 ? <SearchIcon /> : index === 1 ? <PaymentIcon /> : <CheckIcon />}
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{card.description}</p>
              <Link href={card.href} className="mt-5 inline-flex text-sm font-bold text-brand underline decoration-[rgba(0,32,69,0.26)] underline-offset-4 transition hover:text-accent">
                {card.cta}
              </Link>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/60 bg-white/88">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-10 text-xs text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 ShoeClean. Hak cipta dilindungi undang-undang.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/pricing" className="transition hover:text-brand">
              Harga
            </Link>
            <Link href="/track" className="transition hover:text-brand">
              Lacak Pesanan
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

      <PublicBottomNav current="track" />
    </>
  );
}




