import Link from "next/link";
import { ApiError, getPublicTracking } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type TrackPageProps = {
  searchParams?: Promise<{
    invoice?: string;
  }>;
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const params = (await searchParams) ?? {};
  const invoice = params.invoice?.trim() ?? "";

  let errorMessage = "";
  let data: Awaited<ReturnType<typeof getPublicTracking>> | null = null;

  if (invoice) {
    try {
      data = await getPublicTracking(invoice);
    } catch (error) {
      errorMessage =
        error instanceof ApiError
          ? error.message
          : "Terjadi kendala saat memuat data tracking.";
    }
  }

  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 space-y-4">
          <header className="section-block bg-[#183a34] p-5 text-white sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                  Order tracking
                </span>
                <h1 className="mt-4 text-[2rem] font-semibold tracking-tight sm:text-5xl">
                  Cek progres pesanan langsung dari invoice.
                </h1>
                <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
                  Halaman ini dibuat singkat dan nyaman untuk customer mobile:
                  cukup masukkan invoice, lalu progres order akan tampil rapi.
                </p>
              </div>
              <Link href="/" className="btn-secondary w-full sm:w-auto">
                Kembali
              </Link>
            </div>

            <form action="/track" className="mt-6 mobile-stack">
              <input
                type="text"
                name="invoice"
                defaultValue={invoice}
                placeholder="Contoh: INV/20260326/5/0004"
                className="field border-white/10 bg-white text-foreground"
              />
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Lacak sekarang
              </button>
            </form>
          </header>

          {!invoice ? (
            <div className="section-block border-dashed bg-[#fff8ef] px-5 py-5 text-sm leading-6 text-muted">
              Masukkan nomor invoice untuk mulai tracking pesanan.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="section-block border-[#f3c9c0] bg-[#fff1ee] px-5 py-5 text-sm leading-6 text-[#9a3b2b]">
              {errorMessage}
            </div>
          ) : null}

          {data ? (
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="section-block p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                      Nomor invoice
                    </p>
                    <h2 className="mt-2 break-all text-2xl font-semibold text-foreground">
                      {data.order.invoice_number}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#edf4f1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      {data.order.status_label}
                    </span>
                    <span className="rounded-full bg-[#fff0e7] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                      {data.order.payment_status_label}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {data.order.timeline.map((step, index) => (
                    <article
                      key={step.key}
                      className={`rounded-[1.35rem] border px-4 py-4 ${
                        step.is_active
                          ? "border-line bg-surface"
                          : "border-dashed border-line bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                            step.is_active
                              ? "bg-accent text-white"
                              : "bg-surface-soft text-muted"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {step.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="space-y-4">
                <section className="section-block p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Detail outlet
                  </p>
                  <p className="mt-3 text-xl font-semibold text-foreground">
                    {data.order.outlet?.name ?? "Outlet tidak tersedia"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {data.order.outlet?.address ?? "Alamat outlet belum tersedia."}
                  </p>
                  {data.order.outlet?.phone ? (
                    <p className="mt-3 text-sm font-medium text-accent">
                      {data.order.outlet.phone}
                    </p>
                  ) : null}
                </section>

                <section className="section-block bg-[#183a34] p-5 text-white sm:p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/65">
                    Total tagihan
                  </p>
                  <p className="mt-3 text-3xl font-semibold">
                    {formatRupiah(data.order.total_price)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/78">
                    Status pembayaran: {data.order.payment_status_label}
                  </p>
                </section>

                <section className="section-block p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold">Detail layanan</h3>
                    <span className="rounded-full bg-surface px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {data.order.items.length} item
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {data.order.items.map((item) => (
                      <div key={item.id} className="soft-panel p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.service_name ?? "Layanan"}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              Qty {item.quantity}
                              {item.unit ? ` ${item.unit}` : ""}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-accent">
                            {formatRupiah(item.total_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
