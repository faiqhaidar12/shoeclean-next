import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardFrame } from "@/components/dashboard-frame";
import { LeafletRoutePreview } from "@/components/leaflet-route-preview";
import { OrderDetailActions } from "@/components/order-detail-actions";
import { ApiError } from "@/lib/api";
import { getOrderDetail } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
};

const paymentTone: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-surface-soft text-brand",
  waiting_confirmation: "bg-amber-50 text-amber-700",
};

const statusTone: Record<string, string> = {
  completed: "bg-emerald-500 text-white",
  picked_up: "bg-emerald-500 text-white",
  cancelled: "bg-red-500 text-white",
  ready: "bg-blue-500 text-white",
  processing: "bg-accent text-white",
  pending: "bg-white text-brand",
};

function createMapsUrl(latitude?: number | null, longitude?: number | null) {
  if (latitude == null || longitude == null) {
    return null;
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "completed" || status === "picked_up") {
    return (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "cancelled") {
    return (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (status === "ready") {
    return (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "processing") {
    return (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v4m0 10v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M3 12h4m10 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 8v4l2.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function DashboardOrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  let data: Awaited<ReturnType<typeof getOrderDetail>>;

  try {
    data = await getOrderDetail(orderId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return <BackendUnavailable title="Detail pesanan belum terhubung" message={error.message} />;
    }

    throw error;
  }

  const { order } = data;
  const subtotal = order.items.reduce((sum, item) => sum + item.total_price, 0);
  const statusClass = statusTone[order.status] ?? "bg-white text-brand";
  const paymentClass = paymentTone[order.payment_status] ?? paymentTone.unpaid;
  const pickupMapsUrl = createMapsUrl(order.pickup_latitude, order.pickup_longitude);
  const deliveryMapsUrl = createMapsUrl(order.delivery_latitude, order.delivery_longitude);
  const outletMapsUrl = createMapsUrl(order.outlet?.latitude, order.outlet?.longitude);
  const outletPoint =
    order.outlet?.latitude != null && order.outlet?.longitude != null
      ? { lat: order.outlet.latitude, lng: order.outlet.longitude }
      : null;
  const pickupPoint =
    order.pickup_latitude != null && order.pickup_longitude != null
      ? { lat: order.pickup_latitude, lng: order.pickup_longitude }
      : null;
  const deliveryPoint =
    order.delivery_latitude != null && order.delivery_longitude != null
      ? { lat: order.delivery_latitude, lng: order.delivery_longitude }
      : null;

  return (
    <DashboardFrame
      current="orders"
      eyebrow="Detail Pesanan"
      title={order.invoice_number}
      description="Pantau layanan, pembayaran, dan tindak lanjut pesanan dari satu halaman yang lebih lengkap."
    >
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 transition hover:text-accent"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="m15 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kembali
          </Link>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-brand/40">
            {order.created_at
              ? `Dibuat pada ${new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(order.created_at))}`
              : "Waktu dibuat belum tersedia"}{" "}
            · {order.outlet?.name ?? "Cabang"}
          </p>
        </div>
      </section>

      <section className="mb-8 overflow-hidden rounded-[2.2rem] bg-surface-soft p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-[1.6rem] shadow-[0_18px_38px_rgba(25,28,30,0.08)] ${statusClass}`}
            >
              <StatusIcon status={order.status} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand/30">Status saat ini</p>
              <h2 className="mt-2 text-3xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.04em] text-brand">
                {order.status_label}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] ${paymentClass}`}>
                  {order.payment_status_label}
                </span>
                <span className="rounded-full bg-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand/60">
                  {order.payment_method_label}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] bg-white px-5 py-5 shadow-sm lg:min-w-[280px]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand/30">Total tagihan</p>
            <p className="mt-3 text-4xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.04em] text-brand">
              {formatRupiah(order.total_price)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)] md:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-accent">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="section-label">Detail layanan</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">Layanan yang dipesan</h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-line/35">
              <div className="hidden grid-cols-[minmax(0,1fr)_110px_140px_160px] gap-4 bg-surface-soft px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 md:grid">
                <span>Layanan</span>
                <span className="text-center">Jumlah</span>
                <span className="text-right">Harga</span>
                <span className="text-right">Subtotal</span>
              </div>

              <div className="divide-y divide-line/35">
                {order.items.map((item) => (
                  <article key={item.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_110px_140px_160px] md:items-center">
                    <div>
                      <p className="text-sm font-bold text-brand">{item.service_name ?? "Layanan"}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-brand/30">
                        Layanan yang dipilih pelanggan
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:block md:text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35 md:hidden">Jumlah</span>
                      <p className="text-sm font-bold text-brand">
                        {item.quantity}{" "}
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/40">{item.unit ?? "unit"}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35 md:hidden">Harga</span>
                      <p className="text-sm font-medium text-brand/60">{formatRupiah(item.price)}</p>
                    </div>
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35 md:hidden">Subtotal</span>
                      <p className="font-[var(--font-display-sans)] text-lg font-extrabold text-brand">{formatRupiah(item.total_price)}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border-t border-line/35 bg-surface-soft/65 px-5 py-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-semibold text-brand/60">Subtotal layanan</span>
                    <span className="font-bold text-brand">{formatRupiah(subtotal)}</span>
                  </div>
                  {order.discount_amount > 0 ? (
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-emerald-700">Diskon</span>
                      <span className="font-bold text-emerald-700">-{formatRupiah(order.discount_amount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4 border-t border-line/35 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand/40">Total tagihan</span>
                    <span className="text-2xl font-[var(--font-display-sans)] font-extrabold text-brand">
                      {formatRupiah(order.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)] md:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-accent">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="section-label">Data pelanggan</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-brand">Identitas pesanan</h2>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-surface-soft text-3xl font-[var(--font-display-sans)] font-extrabold italic text-brand shadow-sm">
                {order.customer?.name?.charAt(0) ?? "P"}
              </div>
              <div>
                <p className="text-2xl font-[var(--font-display-sans)] font-extrabold text-brand">
                  {order.customer?.name ?? "Pelanggan umum"}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  {order.customer?.phone ?? "Tanpa nomor HP"}
                </p>
                {order.customer?.address ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3 text-xs font-medium text-brand/70">
                    <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                    </svg>
                    {order.customer.address}
                  </div>
                ) : null}
              </div>
            </div>

            {order.notes ? (
              <div className="mt-8 border-t border-line/35 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand/35">Catatan pesanan</p>
                <p className="mt-3 text-sm font-medium italic leading-7 text-brand/75">&ldquo;{order.notes}&rdquo;</p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-8">
          <OrderDetailActions
            orderId={order.id}
            currentStatus={order.status}
            paymentStatus={order.payment_status}
            hasPaymentProof={Boolean(order.payment_proof_url)}
            canMarkPaid={order.payment_summary.can_mark_paid}
            canVerifyPayment={order.payment_summary.can_verify_payment}
          />

          <section className="rounded-[2rem] border border-line/35 bg-white p-6 shadow-[0_12px_28px_rgba(25,28,30,0.04)]">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-accent">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7.75A2.75 2.75 0 0 1 6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v8.5A2.75 2.75 0 0 1 17.25 19H6.75A2.75 2.75 0 0 1 4 16.25z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M4 9.5h16M8 14h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-[var(--font-display-sans)] font-extrabold text-brand">Pembayaran</h3>
            </div>

            <div className={`rounded-[1.5rem] p-5 ${paymentClass}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand/40">Status pembayaran</p>
              <p className="mt-2 text-2xl font-[var(--font-display-sans)] font-extrabold">{order.payment_status_label}</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-brand/45">
                Cara bayar: {order.payment_method_label}
              </p>
            </div>

            {order.payments.length > 0 ? (
              <div className="mt-6 space-y-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-[1.25rem] border border-line/35 bg-white px-4 py-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand/35">{payment.method_label}</p>
                      <p className="mt-1 text-sm text-muted">
                        {payment.created_at
                          ? new Intl.DateTimeFormat("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(payment.created_at))
                          : "Waktu tidak tersedia"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-[var(--font-display-sans)] text-lg font-extrabold text-brand">{formatRupiah(payment.amount)}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-accent">{payment.status_label}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {order.payment_proof_url ? (
              <div className="mt-6 space-y-4 rounded-[1.5rem] border border-line/35 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">Bukti pembayaran</p>
                <div className="overflow-hidden rounded-[1.25rem] bg-surface-soft p-2">
                  <Image
                    src={order.payment_proof_url}
                    alt={`Bukti pembayaran ${order.invoice_number}`}
                    width={1200}
                    height={1200}
                    unoptimized
                    className="max-h-96 w-full rounded-[1rem] bg-surface object-contain"
                  />
                </div>
                {order.payment_notes ? <p className="text-sm leading-7 text-muted">{order.payment_notes}</p> : null}
                {order.payment_verified_at ? (
                  <p className="text-sm text-muted">
                    Diverifikasi{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(order.payment_verified_at))}
                    {order.payment_verifier ? ` oleh ${order.payment_verifier.name}` : ""}
                  </p>
                ) : null}
              </div>
            ) : null}

            {!order.payment_proof_url && order.payment_status !== "paid" && order.outlet?.qris_image_url ? (
              <div className="mt-6 rounded-[1.5rem] border border-line/35 bg-white p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">QRIS cabang</p>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-surface-soft p-2">
                  <Image
                    src={order.outlet.qris_image_url}
                    alt={`QRIS ${order.outlet.name}`}
                    width={960}
                    height={960}
                    unoptimized
                    className="max-h-72 w-full rounded-[1rem] bg-surface object-contain"
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {order.outlet.qris_notes || "Gunakan QRIS cabang ini bila pelanggan ingin membayar non-tunai secara manual."}
                </p>
              </div>
            ) : null}
          </section>

          <section className="section-dark hero-card p-5 sm:p-6">
            <p className="section-label-dark">Informasi tambahan</p>
            <div className="info-list mt-5 text-sm">
              <div className="kpi-pill-dark">
                <p className="font-semibold">Jenis pesanan</p>
                <p className="mt-1 text-white/72">{order.order_type ?? "regular"}</p>
              </div>
              <div className="kpi-pill-dark">
                <p className="font-semibold">Cabang</p>
                <p className="mt-1 text-white/72">{order.outlet?.name ?? "Cabang"}</p>
              </div>
              {order.pickup_address ? (
                <div className="kpi-pill-dark">
                  <p className="font-semibold">Alamat penjemputan</p>
                  <p className="mt-1 text-white/72">{order.pickup_address}</p>
                  {pickupMapsUrl ? (
                    <a
                      href={pickupMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-accent-soft underline underline-offset-4"
                    >
                      Buka titik jemput
                    </a>
                  ) : null}
                </div>
              ) : null}
              {order.delivery_address ? (
                <div className="kpi-pill-dark">
                  <p className="font-semibold">Alamat pengantaran</p>
                  <p className="mt-1 text-white/72">{order.delivery_address}</p>
                  {deliveryMapsUrl ? (
                    <a
                      href={deliveryMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-accent-soft underline underline-offset-4"
                    >
                      Buka titik antar
                    </a>
                  ) : null}
                </div>
              ) : null}
              {order.outlet?.address ? (
                <div className="kpi-pill-dark">
                  <p className="font-semibold">Lokasi cabang</p>
                  <p className="mt-1 text-white/72">{order.outlet.address}</p>
                  {outletMapsUrl ? (
                    <a
                      href={outletMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-xs font-semibold text-accent-soft underline underline-offset-4"
                    >
                      Buka lokasi cabang
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {outletPoint && pickupPoint ? (
            <LeafletRoutePreview
              title="Rute penjemputan"
              description="Rute ini membantu admin atau driver melihat jalur dari cabang ke titik jemput customer."
              from={outletPoint}
              to={pickupPoint}
              fromLabel={order.outlet?.name ?? "Cabang"}
              toLabel="Titik jemput"
            />
          ) : null}

          {outletPoint && deliveryPoint ? (
            <LeafletRoutePreview
              title="Rute pengantaran"
              description="Rute ini membantu admin atau driver melihat jalur dari cabang ke titik antar customer."
              from={outletPoint}
              to={deliveryPoint}
              fromLabel={order.outlet?.name ?? "Cabang"}
              toLabel="Titik antar"
            />
          ) : null}
        </div>
      </div>
    </DashboardFrame>
  );
}
