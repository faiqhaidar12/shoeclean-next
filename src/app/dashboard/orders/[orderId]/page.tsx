import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { OrderDetailActions } from "@/components/order-detail-actions";
import { getOrderDetail } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

const paymentTone: Record<string, string> = {
  paid: "text-emerald-700 bg-emerald-50",
  unpaid: "text-foreground bg-surface",
  waiting_confirmation: "text-amber-700 bg-amber-50",
};

export default async function DashboardOrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  let data;

  try {
    data = await getOrderDetail(orderId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Detail order belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  const { order } = data;

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="hero-grid">
            <section className="section-block hero-card p-5 sm:p-7">
              <div className="mobile-stack items-start justify-between">
                <div>
                  <span className="eyebrow">Order Detail</span>
                  <h1 className="headline mt-4">{order.invoice_number}</h1>
                </div>
                <Link href="/dashboard/orders" className="btn-secondary w-full sm:w-auto">
                  Kembali ke order
                </Link>
              </div>

              <div className="hero-badge-row mt-5">
                <span className="highlight-chip">{order.status_label}</span>
                <span className="highlight-chip">{order.payment_status_label}</span>
                <span className="highlight-chip">{order.payment_method_label}</span>
              </div>

              <div className="kpi-strip mt-7">
                <article className="kpi-pill">
                  <p className="section-label">Customer</p>
                  <p className="mt-2 text-lg font-semibold">
                    {order.customer?.name ?? "Customer umum"}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">Total</p>
                  <p className="mt-2 text-lg font-semibold text-accent">
                    {formatRupiah(order.total_price)}
                  </p>
                </article>
                <article className="kpi-pill">
                  <p className="section-label">Outlet</p>
                  <p className="mt-2 text-lg font-semibold">
                    {order.outlet?.name ?? "Outlet"}
                  </p>
                </article>
              </div>
            </section>

            <OrderDetailActions
              orderId={order.id}
              currentStatus={order.status}
              paymentStatus={order.payment_status}
              hasPaymentProof={Boolean(order.payment_proof_url)}
            />
          </header>

          <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
            <section className="section-block p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-label">Layanan order</p>
                  <h2 className="mt-2 text-2xl font-semibold">Item yang dipesan</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    paymentTone[order.payment_status] ?? paymentTone.unpaid
                  }`}
                >
                  {order.payment_status_label}
                </span>
              </div>
              <div className="info-list mt-5">
                {order.items.map((item) => (
                  <div key={item.id} className="soft-panel p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.service_name ?? "Layanan"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {item.quantity} {item.unit ?? "unit"}
                        </p>
                      </div>
                      <p className="font-semibold text-accent">
                        {formatRupiah(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-4">
              <section className="section-block p-5 sm:p-6">
                <p className="section-label">Customer & outlet</p>
                <div className="info-list mt-5">
                  <div className="soft-panel p-4">
                    <p className="font-semibold text-foreground">
                      {order.customer?.name ?? "Customer umum"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {order.customer?.phone ?? "Tanpa nomor HP"}
                    </p>
                    {order.customer?.address ? (
                      <p className="mt-2 text-sm text-muted">{order.customer.address}</p>
                    ) : null}
                  </div>
                  <div className="soft-panel p-4">
                    <p className="font-semibold text-foreground">
                      {order.outlet?.name ?? "Outlet"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {order.outlet?.address ?? "Alamat outlet belum tersedia."}
                    </p>
                    {order.outlet?.phone ? (
                      <p className="mt-2 text-sm font-medium text-accent">
                        {order.outlet.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="section-block p-5 sm:p-6">
                <p className="section-label">Pembayaran</p>
                <div className="info-list mt-5">
                  <div className="soft-panel p-4">
                    <p className="font-semibold text-foreground">{order.payment_method_label}</p>
                    <p className="mt-1 text-sm text-muted">
                      Status: {order.payment_status_label}
                    </p>
                    {order.payment_verified_at ? (
                      <p className="mt-2 text-sm text-muted">
                        Diverifikasi: {new Intl.DateTimeFormat("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(order.payment_verified_at))}
                      </p>
                    ) : null}
                    {order.payment_verifier ? (
                      <p className="mt-2 text-sm text-muted">
                        Oleh: {order.payment_verifier.name}
                      </p>
                    ) : null}
                    {order.payment_notes ? (
                      <p className="mt-2 text-sm text-muted">{order.payment_notes}</p>
                    ) : null}
                  </div>

                  {order.payment_proof_url ? (
                    <div className="soft-panel overflow-hidden p-3">
                      <Image
                        src={order.payment_proof_url}
                        alt={`Bukti pembayaran ${order.invoice_number}`}
                        width={1200}
                        height={1200}
                        unoptimized
                        className="max-h-96 w-full rounded-[1.25rem] bg-surface object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="section-dark hero-card p-5 sm:p-6">
                <p className="section-label-dark">Catatan order</p>
                <div className="info-list mt-5 text-sm">
                  <div className="kpi-pill-dark">
                    <p className="font-semibold">Tipe order</p>
                    <p className="mt-1 text-white/72">{order.order_type ?? "regular"}</p>
                  </div>
                  {order.pickup_address ? (
                    <div className="kpi-pill-dark">
                      <p className="font-semibold">Alamat pickup</p>
                      <p className="mt-1 text-white/72">{order.pickup_address}</p>
                    </div>
                  ) : null}
                  {order.delivery_address ? (
                    <div className="kpi-pill-dark">
                      <p className="font-semibold">Alamat delivery</p>
                      <p className="mt-1 text-white/72">{order.delivery_address}</p>
                    </div>
                  ) : null}
                  {order.notes ? (
                    <div className="kpi-pill-dark">
                      <p className="font-semibold">Catatan</p>
                      <p className="mt-1 text-white/72">{order.notes}</p>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
