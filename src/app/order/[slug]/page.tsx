import Image from "next/image";
import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
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
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="hero-grid">
            <div className="section-block hero-card p-5 sm:p-7">
              <span className="eyebrow">Storefront Outlet</span>
              <h1 className="headline mt-4">{data.outlet.name}</h1>
              <p className="subcopy mt-4">
                {data.outlet.address || "Alamat outlet belum tersedia."}
              </p>
              <div className="hero-badge-row mt-5">
                <span className="highlight-chip">Form ramah smartphone</span>
                <span className="highlight-chip">Pembayaran fleksibel</span>
                <span className="highlight-chip">Proses lebih singkat</span>
              </div>
              {data.outlet.phone ? (
                <p className="mt-3 text-sm font-medium text-accent">
                  {data.outlet.phone}
                </p>
              ) : null}

              <div className="kpi-strip mt-6">
                <article className="kpi-pill">
                  <p className="section-label">
                    Layanan
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {data.services.length}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">
                    Pickup fee
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {data.outlet.pickup_fee > 0
                      ? formatRupiah(data.outlet.pickup_fee)
                      : "Tidak ada"}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">
                    QRIS
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {data.outlet.has_qris ? "Tersedia" : "Belum ada"}
                  </p>
                </article>
              </div>

              <div className="mobile-stack mt-6">
                <Link href="/order" className="btn-secondary w-full sm:w-auto">
                  Ganti outlet
                </Link>
                <Link href="/track" className="btn-accent w-full sm:w-auto">
                  Lacak pesanan
                </Link>
              </div>
            </div>

            <aside className="section-dark hero-card p-5 sm:p-7">
              <p className="section-label-dark">
                Ringkas untuk mobile
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Flow order dibuat singkat agar customer nyaman isi dari smartphone.
              </h2>
              <div className="hero-badge-row mt-5">
                <span className="highlight-chip-dark">Pilih layanan</span>
                <span className="highlight-chip-dark">Isi data</span>
                <span className="highlight-chip-dark">Kirim order</span>
              </div>
              <div className="info-list mt-5">
                <div className="kpi-pill-dark">
                  Pilih layanan dan jumlah
                </div>
                <div className="kpi-pill-dark">
                  Isi data customer
                </div>
                <div className="kpi-pill-dark">
                  Tentukan pickup, delivery, atau bayar di outlet
                </div>
              </div>
            </aside>
          </header>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <StorefrontOrderForm data={data} />
            </div>

            <aside className="space-y-4">
              <section className="section-block p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                      Layanan outlet
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Harga yang mudah dibaca.
                    </h2>
                  </div>
                </div>
                <div className="info-list mt-5">
                  {data.services.map((service) => (
                    <div key={service.id} className="soft-panel p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {service.name}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            Per {service.unit}
                          </p>
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
                <section className="section-block p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    QRIS outlet
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Customer bisa bayar lebih cepat.
                  </h2>
                  <div className="soft-panel mt-5 overflow-hidden p-3">
                    <Image
                    src={data.outlet.qris_image_url}
                    alt={`QRIS ${data.outlet.name}`}
                    width={960}
                    height={960}
                    unoptimized
                    className="max-h-80 w-full rounded-[1.25rem] bg-surface object-contain"
                  />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {data.outlet.qris_notes ||
                      "QRIS outlet tersedia untuk mempermudah pembayaran customer."}
                  </p>
                </section>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
