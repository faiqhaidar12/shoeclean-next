import Link from "next/link";
import { BackendUnavailable } from "@/components/backend-unavailable";
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

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
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
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="section-block bg-[#183a34] p-5 text-white sm:p-7">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
              Pesanan terkirim
            </span>
            <h1 className="mt-4 text-[2rem] font-semibold tracking-tight sm:text-5xl">
              Order berhasil masuk ke outlet.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
              Simpan nomor invoice ini. Customer bisa pakai invoice yang sama
              untuk tracking progres dari smartphone kapan saja.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="section-block p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Nomor invoice
              </p>
              <h2 className="mt-2 break-all text-2xl font-semibold text-foreground">
                {data.order.invoice_number}
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="soft-panel p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Outlet
                  </p>
                  <p className="mt-2 text-lg font-semibold">{data.outlet.name}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {data.outlet.address || "Alamat outlet belum tersedia."}
                  </p>
                </div>
                <div className="soft-panel bg-surface-soft/55 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Total tagihan
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-accent">
                    {formatRupiah(data.order.total_price)}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {data.order.payment_method_label} •{" "}
                    {data.order.payment_status_label}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold">Ringkasan layanan</h3>
                  <span className="rounded-full bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {data.order.items.length} item
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {data.order.items.map((item) => (
                    <div key={item.id} className="soft-panel p-4">
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

            <div className="space-y-4">
              <section className="section-block p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">
                  Langkah berikutnya
                </p>
                <div className="mt-4 space-y-3">
                  <div className="soft-panel p-4">Simpan invoice untuk tracking</div>
                  <div className="soft-panel p-4">
                    Hubungi outlet jika perlu konfirmasi tambahan
                  </div>
                  <div className="soft-panel p-4">
                    Cek status pembayaran dan progres dari halaman tracking
                  </div>
                </div>
              </section>

              {data.outlet.qris_image_url &&
              data.order.payment_status !== "waiting_confirmation" ? (
                <section className="section-block p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    QRIS outlet
                  </p>
                  <img
                    src={data.outlet.qris_image_url}
                    alt={`QRIS ${data.outlet.name}`}
                    className="mt-4 max-h-80 w-full rounded-[1.5rem] bg-surface object-contain"
                  />
                  <p className="mt-4 text-sm leading-6 text-muted">
                    {data.outlet.qris_notes || "Scan QRIS ini sesuai total invoice."}
                  </p>
                </section>
              ) : null}
            </div>
          </div>

          <div className="mobile-stack">
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
  );
}
