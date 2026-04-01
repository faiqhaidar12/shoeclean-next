import Image from "next/image";
import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
import {
  ApiError,
  getStorefrontSuccess,
  type StorefrontSuccessResponse,
} from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type OrderSuccessPageProps = {
  params: Promise<{
    slug: string;
    orderId: string;
  }>;
};

function CheckBadge() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(129,242,235,0.18)] text-accent-soft">
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
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

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const session = await getOptionalAuthSession();
  let data: StorefrontSuccessResponse | null = null;
  let message = "";

  try {
    const { slug, orderId } = await params;
    data = await getStorefrontSuccess(slug, orderId);
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat data order.";
  }

  if (!data) {
    return (
      <BackendUnavailable
        title="Halaman sukses order belum bisa dimuat"
        message={message}
      />
    );
  }

  return (
    <>
      <PublicTopNav current="track" authenticated={session?.authenticated} />

      <main className="public-main-shell">
        <section className="tablet-balance-card motion-enter bg-brand text-white shadow-[0_24px_54px_rgba(0,32,69,0.18)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <CheckBadge />
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                  Pesanan terkirim
                </span>
              </div>
              <h1 className="mt-5 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[3.8rem] sm:leading-[1.02]">
                Order berhasil masuk ke outlet.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                Simpan nomor invoice ini. Customer bisa memakai invoice yang sama untuk tracking progres dari smartphone kapan saja.
              </p>
            </div>

            <div className="rounded-[1.6rem] bg-white/10 p-5 md:max-w-[420px] lg:min-w-[320px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
                Nomor invoice
              </p>
              <p className="mt-3 break-all text-2xl font-semibold tracking-[-0.03em]">
                {data.order.invoice_number}
              </p>
              <p className="mt-3 text-sm text-white/72">
                Simpan atau screenshot bagian ini untuk kebutuhan tracking.
              </p>
            </div>
          </div>
        </section>

        <section className="tablet-balance-grid motion-enter motion-delay-1 mt-8 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="tablet-balance-card motion-enter-fast bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-surface-soft p-4">
                <p className="section-label">Outlet</p>
                <p className="mt-2 text-lg font-semibold text-brand">{data.outlet.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {data.outlet.address || "Alamat outlet belum tersedia."}
                </p>
              </div>

              <div className="rounded-[1.35rem] bg-surface-soft p-4">
                <p className="section-label">Total tagihan</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-accent">
                  {formatRupiah(data.order.total_price)}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {data.order.payment_method_label} • {data.order.payment_status_label}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-brand">
                  Ringkasan layanan
                </h2>
                <span className="status-chip-soft">{data.order.items.length} item</span>
              </div>
              <div className="mt-4 grid gap-3">
                {data.order.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="motion-enter-fast rounded-[1.35rem] bg-surface-soft p-4"
                    style={{ animationDelay: `${0.08 * (index + 1)}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.service_name || "Layanan"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.quantity} {item.unit || "unit"}
                        </p>
                      </div>
                      <p className="font-semibold text-accent">
                        {formatRupiah(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="tablet-balance-card motion-enter-fast motion-delay-1 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
              <p className="section-label">Langkah berikutnya</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4 text-sm text-foreground">
                  Simpan invoice untuk tracking
                </div>
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4 text-sm text-foreground">
                  Hubungi outlet jika perlu konfirmasi tambahan
                </div>
                <div className="rounded-[1.25rem] bg-surface-soft px-4 py-4 text-sm text-foreground">
                  Cek status pembayaran dan progres dari halaman tracking
                </div>
              </div>
            </section>

            {data.outlet.qris_image_url &&
            data.order.payment_status !== "waiting_confirmation" ? (
              <section className="tablet-balance-card motion-enter-fast motion-delay-2 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
                <p className="section-label">QRIS outlet</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                  Selesaikan pembayaran lebih cepat
                </h2>
                <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-surface-soft p-3">
                  <Image
                    src={data.outlet.qris_image_url}
                    alt={`QRIS ${data.outlet.name}`}
                    width={960}
                    height={960}
                    unoptimized
                    className="max-h-80 w-full rounded-[1.25rem] bg-surface object-contain"
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {data.outlet.qris_notes || "Scan QRIS ini sesuai total invoice."}
                </p>
              </section>
            ) : null}
          </aside>
        </section>

        <section className="tablet-balance-card motion-enter motion-delay-2 mt-8 bg-white shadow-[0_18px_38px_rgba(25,28,30,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-label">Aksi cepat</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">
                Lanjutkan dari sini
              </h2>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={`/track?invoice=${encodeURIComponent(data.order.invoice_number)}`}
                className="btn-primary w-full sm:w-auto"
              >
                Lacak progress
              </Link>
              <Link
                href={`/order/${data.outlet.slug}?skipBranch=1`}
                className="btn-secondary w-full sm:w-auto"
              >
                Buat order baru
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

