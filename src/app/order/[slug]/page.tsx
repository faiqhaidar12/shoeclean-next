import Image from "next/image";
import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
import {
  ApiError,
  getStorefrontOutlet,
  type StorefrontOutletResponse,
} from "@/lib/api";
import { StorefrontOrderForm } from "@/components/storefront-order-form";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ skipBranch?: string }>;
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const session = await getOptionalAuthSession();
  let data: StorefrontOutletResponse | null = null;
  let message = "";

  try {
    const { slug } = await params;
    const query = (await searchParams) ?? {};
    data = await getStorefrontOutlet(slug, {
      skipBranch: query.skipBranch === "1",
    });
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat detail outlet.";
  }

  if (!data) {
    return (
      <BackendUnavailable
        title="Detail outlet belum bisa dimuat"
        message={message}
      />
    );
  }

  return (
    <>
      <PublicTopNav
        current="order"
        authenticated={session?.authenticated}
        dashboardHref={session?.user.is_superadmin ? "/superadmin" : "/dashboard"}
      />

      <main className="public-main-shell">
        <section className="public-hero-intro tablet-balance-grid motion-enter lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
          <div className="tablet-balance-card motion-enter motion-delay-1 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
            <p className="eyebrow">Detail outlet</p>
            <h1 className="mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] text-brand sm:text-[3.6rem] sm:leading-[1.02]">
              {data.outlet.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              {data.outlet.address || "Alamat outlet belum tersedia."}
            </p>
            {data.outlet.phone ? (
              <p className="mt-3 text-sm font-semibold text-accent">{data.outlet.phone}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="motion-enter-fast highlight-chip" style={{ animationDelay: "0.08s" }}>
                Pemesanan mudah dari HP
              </span>
              <span className="motion-enter-fast highlight-chip" style={{ animationDelay: "0.14s" }}>
                Pembayaran lebih praktis
              </span>
              <span className="motion-enter-fast highlight-chip" style={{ animationDelay: "0.2s" }}>
                Proses pesan lebih singkat
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <article
                className="motion-enter-fast rounded-[1.35rem] bg-surface-soft px-4 py-4"
                style={{ animationDelay: "0.1s" }}
              >
                <p className="section-label">Layanan</p>
                <p className="mt-2 text-2xl font-semibold text-brand">{data.services.length}</p>
              </article>
              <article
                className="motion-enter-fast rounded-[1.35rem] bg-surface-soft px-4 py-4"
                style={{ animationDelay: "0.16s" }}
              >
                <p className="section-label">Jemput</p>
                <p className="mt-2 text-base font-semibold text-brand">
                  {data.outlet.pickup_enabled
                    ? `Mulai ${formatRupiah(data.outlet.pickup_pricing?.base_fee ?? data.outlet.pickup_fee)}`
                    : "Sedang off"}
                </p>
                {data.outlet.pickup_enabled ? (
                  <p className="mt-1 text-xs text-muted">
                    {data.outlet.pickup_pricing?.base_distance_km ?? 0} km pertama
                  </p>
                ) : null}
              </article>
              <article
                className="motion-enter-fast rounded-[1.35rem] bg-surface-soft px-4 py-4"
                style={{ animationDelay: "0.22s" }}
              >
                <p className="section-label">Antar</p>
                <p className="mt-2 text-base font-semibold text-brand">
                  {data.outlet.delivery_enabled
                    ? `Mulai ${formatRupiah(data.outlet.delivery_pricing?.base_fee ?? data.outlet.delivery_fee)}`
                    : "Sedang off"}
                </p>
                {data.outlet.delivery_enabled ? (
                  <p className="mt-1 text-xs text-muted">
                    {data.outlet.delivery_pricing?.base_distance_km ?? 0} km pertama
                  </p>
                ) : null}
              </article>
            </div>
          </div>

          <aside className="tablet-balance-card motion-enter motion-delay-2 bg-brand text-white shadow-[0_24px_54px_rgba(0,32,69,0.18)]">
            <p className="section-label-dark">Cara pesan</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Semua langkah pemesanan dibuat sederhana agar nyaman di ponsel.
            </h2>
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                1. Pilih layanan dan jumlah
              </div>
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                2. Isi nama, nomor HP, dan cara penyerahan
              </div>
              <div className="rounded-[1.25rem] bg-white/10 px-4 py-4 text-sm text-white/86">
                3. Cek total lalu kirim pesanan
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/track" className="btn-accent">
                Lacak pesanan
              </Link>
              <Link href="/order" className="btn-secondary bg-white/12 text-white hover:bg-white/18">
                Outlet lain
              </Link>
            </div>
          </aside>
        </section>

        <section className="tablet-balance-grid motion-enter motion-delay-3 mt-8 gap-5 xl:grid-cols-[1.06fr_0.94fr]">
          <div>
            <StorefrontOrderForm data={data} />
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="tablet-balance-card motion-enter-fast bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
              <div>
                <p className="section-label">Layanan outlet</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                  Daftar layanan dan harga
                </h2>
              </div>
              <div className="mt-5 grid gap-3">
                {data.services.map((service, index) => (
                  <div
                    key={service.id}
                    className="motion-enter-fast rounded-[1.35rem] bg-surface-soft p-4"
                    style={{ animationDelay: `${0.08 * (index + 1)}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{service.name}</p>
                        <p className="mt-1 text-sm text-muted">Per {service.unit}</p>
                      </div>
                      <p className="shrink-0 font-semibold text-accent">
                        {formatRupiah(service.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {data.outlet.qris_image_url ? (
              <section className="tablet-balance-card motion-enter-fast motion-delay-1 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
                <p className="section-label">QRIS outlet</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                  Bayar lebih cepat dengan QRIS
                </h2>
                <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-surface-soft p-3">
                  <Image
                    src={data.outlet.qris_image_url}
                    alt={`QRIS ${data.outlet.name}`}
                    width={960}
                    height={960}
                    unoptimized
                    className="max-h-80 w-full rounded-[1.2rem] bg-surface object-contain"
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {data.outlet.qris_notes ||
                    "QRIS tersedia untuk memudahkan pembayaran pesanan Anda."}
                </p>
              </section>
            ) : null}
          </aside>
        </section>
      </main>
    </>
  );
}
