"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { LeafletLocationPicker } from "@/components/leaflet-location-picker";
import type { StorefrontOutletResponse } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

type OrderItem = {
  service_id: string;
  quantity: string;
};

type PromoState = {
  code: string;
  discount_amount: number;
  message: string;
} | null;

type LocationPoint = {
  lat: number;
  lng: number;
};

type Props = {
  data: StorefrontOutletResponse;
};

export function StorefrontOrderForm({ data }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([{ service_id: "", quantity: "1" }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("regular");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupPoint, setPickupPoint] = useState<LocationPoint | null>(null);
  const [deliveryPoint, setDeliveryPoint] = useState<LocationPoint | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PromoState>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_at_store");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const subtotal = items.reduce((total, item) => {
    const service = data.services.find(
      (currentService) => String(currentService.id) === item.service_id,
    );
    const quantity = Math.max(1, Number(item.quantity || "1"));

    return total + (service ? service.price * quantity : 0);
  }, 0);

  const pickupFee = orderType === "pickup" ? data.outlet.pickup_fee : 0;
  const deliveryFee = orderType === "delivery" ? data.outlet.delivery_fee : 0;
  const discountAmount = promo?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + pickupFee + deliveryFee - discountAmount);

  function updateItem(index: number, patch: Partial<OrderItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setPromo(null);
    setPromoMessage("");
  }

  function addItem() {
    setItems((current) => [...current, { service_id: "", quantity: "1" }]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [{ service_id: "", quantity: "1" }]
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
    setPromo(null);
    setPromoMessage("");
  }

  async function applyPromo() {
    if (!promoCode.trim()) {
      setPromo(null);
      setPromoMessage("Masukkan kode promo terlebih dahulu.");
      return;
    }

    if (subtotal <= 0) {
      setPromo(null);
      setPromoMessage("Pilih minimal satu layanan sebelum memakai promo.");
      return;
    }

    setIsApplyingPromo(true);
    setPromoMessage("");

    try {
      const response = await fetch("/api/storefront/promos/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outlet_slug: data.outlet.slug,
          code: promoCode.trim(),
          subtotal,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        promo?: { code: string; discount_amount: number };
      };

      if (!response.ok || !payload.promo) {
        setPromo(null);
        setPromoMessage(payload.message ?? "Promo tidak bisa dipakai.");
        return;
      }

      setPromo({
        code: payload.promo.code,
        discount_amount: payload.promo.discount_amount,
        message: payload.message ?? "Promo berhasil diterapkan.",
      });
      setPromoMessage(payload.message ?? "Promo berhasil diterapkan.");
    } catch {
      setPromo(null);
      setPromoMessage("Terjadi kendala saat memvalidasi promo.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const selectedItems = items
        .filter((item) => item.service_id)
        .map((item) => ({
          service_id: Number(item.service_id),
          quantity: Math.max(1, Number(item.quantity || "1")),
        }));

      const formData = new FormData();
      formData.set("outlet_slug", data.outlet.slug);
      formData.set("customer_name", customerName);
      formData.set("customer_phone", customerPhone);
      formData.set("items", JSON.stringify(selectedItems));
      formData.set("order_type", orderType);
      formData.set("pickup_address", pickupAddress);
      formData.set("delivery_address", deliveryAddress);
      formData.set("pickup_latitude", pickupPoint ? String(pickupPoint.lat) : "");
      formData.set("pickup_longitude", pickupPoint ? String(pickupPoint.lng) : "");
      formData.set("delivery_latitude", deliveryPoint ? String(deliveryPoint.lat) : "");
      formData.set("delivery_longitude", deliveryPoint ? String(deliveryPoint.lng) : "");
      formData.set("promo_code", promo?.code ?? promoCode.trim());
      formData.set("notes", notes);
      formData.set("payment_method", paymentMethod);
      formData.set("payment_notes", paymentNotes);

      if (paymentProof) {
        formData.set("payment_proof", paymentProof);
      }

      const response = await fetch("/api/storefront/orders", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        message?: string;
        next_frontend_path?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;
        setSubmitError(firstError ?? payload.message ?? "Pesanan gagal dibuat.");
        return;
      }

      router.push(payload.next_frontend_path ?? "/track");
    } catch {
      setSubmitError("Terjadi kendala saat mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {data.ui.show_branch_selection ? (
        <section className="section-block hero-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Outlet lain</p>
              <h2 className="mt-2 text-xl font-semibold">Pilih outlet yang paling dekat atau paling nyaman.</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.sibling_outlets.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => router.push(`/order/${branch.slug}?skipBranch=1`)}
                className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                  branch.slug === data.outlet.slug
                    ? "border-brand bg-[#fff3eb] shadow-[0_18px_40px_-32px_rgba(191,93,48,0.45)]"
                    : "border-line bg-surface hover:bg-white"
                }`}
              >
                <p className="font-semibold text-foreground">{branch.name}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {branch.address || "Alamat outlet belum tersedia."}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {data.ui.order_limit_reached ? (
        <section className="section-block border-[#f3c9c0] bg-[#fff1ee] px-5 py-5 text-sm leading-6 text-[#9a3b2b]">
          Mohon maaf, outlet ini sedang belum bisa menerima pesanan baru untuk sementara waktu.
        </section>
      ) : null}

      <section className="section-block hero-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Langkah 1</p>
            <h2 className="mt-2 text-xl font-semibold">Pilih layanan</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Pilih layanan yang Anda butuhkan, lalu tentukan jumlah pasangnya.
            </p>
          </div>
          <button type="button" onClick={addItem} className="btn-secondary w-full sm:w-auto">
            Tambah layanan
          </button>
        </div>

        <div className="info-list mt-4">
          {items.map((item, index) => (
            <div key={`${index}-${item.service_id}`} className="soft-panel p-4 sm:p-5">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-brand">Layanan {index + 1}</p>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-sm font-semibold text-muted transition hover:text-brand"
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
                <select
                  value={item.service_id}
                  onChange={(event) =>
                    updateItem(index, { service_id: event.target.value })
                  }
                  className="field-soft"
                >
                  <option value="">Pilih layanan</option>
                  {data.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {formatRupiah(service.price)}
                    </option>
                  ))}
                </select>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, {
                        quantity: event.target.value,
                      })
                    }
                    onBlur={() =>
                      updateItem(index, {
                        quantity: String(Math.max(1, Number(item.quantity || "1"))),
                      })
                    }
                    className="field-soft"
                  />
                  <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
                    Jumlah
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block p-4 sm:p-5">
        <p className="section-label">Langkah 2</p>
        <h2 className="mt-2 text-xl font-semibold">Data pemesan</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Isi nama dan nomor HP yang aktif agar outlet bisa menghubungi Anda jika diperlukan.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nama Anda"
            className="field-soft"
          />
          <input
            required
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Nomor HP"
            className="field-soft"
          />
        </div>
      </section>

      <section className="section-block p-4 sm:p-5">
        <p className="section-label">Langkah 3</p>
        <h2 className="mt-2 text-xl font-semibold">Pengambilan & pembayaran</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Pilih cara penyerahan sepatu dan cara pembayaran yang paling nyaman untuk Anda.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={orderType}
            onChange={(event) => setOrderType(event.target.value)}
            className="field-soft"
          >
            <option value="regular">Datang langsung ke outlet</option>
            <option value="pickup">Jemput ke alamat Anda</option>
            <option value="delivery">Kirim kembali ke alamat Anda</option>
          </select>

          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            className="field-soft"
          >
            <option value="pay_at_store">Bayar di outlet</option>
            {data.outlet.has_qris ? <option value="qris">QRIS outlet</option> : null}
          </select>
        </div>

        {orderType === "pickup" ? (
          <div className="mt-4 space-y-4">
            <textarea
              required
              rows={3}
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
              placeholder="Alamat penjemputan"
              className="field-soft"
            />
            <LeafletLocationPicker
              title="Titik jemput di peta"
              description="Klik peta atau geser pin agar driver tahu titik jemput yang paling tepat."
              value={pickupPoint}
              onChange={setPickupPoint}
              staticPosition={
                data.outlet.latitude !== null && data.outlet.longitude !== null
                  ? { lat: data.outlet.latitude, lng: data.outlet.longitude }
                  : null
              }
              staticLabel={data.outlet.name}
              editableLabel="Titik jemput"
              clearLabel="Hapus titik jemput"
            />
          </div>
        ) : null}

        {orderType === "delivery" ? (
          <div className="mt-4 space-y-4">
            <textarea
              required
              rows={3}
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Alamat pengantaran"
              className="field-soft"
            />
            <LeafletLocationPicker
              title="Titik antar di peta"
              description="Pilih titik pengantaran yang paling tepat agar driver tidak bingung saat mengantar."
              value={deliveryPoint}
              onChange={setDeliveryPoint}
              staticPosition={
                data.outlet.latitude !== null && data.outlet.longitude !== null
                  ? { lat: data.outlet.latitude, lng: data.outlet.longitude }
                  : null
              }
              staticLabel={data.outlet.name}
              editableLabel="Titik antar"
              clearLabel="Hapus titik antar"
            />
          </div>
        ) : null}

        {paymentMethod === "qris" && data.outlet.qris_image_url ? (
          <div className="soft-panel mt-4 p-4">
            <div className="overflow-hidden rounded-[1.35rem] bg-white p-2">
              <Image
                src={data.outlet.qris_image_url}
                alt={`QRIS ${data.outlet.name}`}
                width={960}
                height={960}
                unoptimized
                className="mx-auto max-h-80 rounded-[1rem] bg-white object-contain"
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {data.outlet.qris_notes || "Silakan scan QRIS ini sesuai total tagihan yang terlihat di ringkasan pesanan."}
            </p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setPaymentProof(event.target.files?.[0] ?? null)
              }
              className="field mt-4"
            />
          </div>
        ) : null}

        <textarea
          rows={3}
          value={paymentNotes}
          onChange={(event) => setPaymentNotes(event.target.value)}
          placeholder="Catatan pembayaran, jika ada"
          className="field-soft mt-4"
        />
      </section>

      <section className="section-block p-4 sm:p-5">
        <p className="section-label">Opsional</p>
        <h2 className="mt-2 text-xl font-semibold">Promo & catatan tambahan</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Jika Anda punya kode promo atau pesan khusus untuk outlet, tuliskan di sini.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={promoCode}
            onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
            placeholder="Masukkan kode promo"
            className="field-soft"
          />
          <button
            type="button"
            onClick={applyPromo}
            disabled={isApplyingPromo}
            className="btn-accent"
          >
            {isApplyingPromo ? "Memeriksa..." : "Pakai promo"}
          </button>
        </div>
        {promoMessage ? <p className="mt-3 text-sm text-muted">{promoMessage}</p> : null}

        <textarea
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Tambahkan catatan untuk outlet jika diperlukan"
          className="field-soft mt-4"
        />
      </section>

      <section className="section-dark hero-card p-5 sm:p-6">
        <p className="section-label-dark">Ringkasan</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
          Perkiraan total pesanan
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/72">
          Setelah semua data sudah benar, kirim pesanan Anda ke outlet melalui tombol di bawah ini.
        </p>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {pickupFee > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Biaya jemput</span>
              <span>{formatRupiah(pickupFee)}</span>
            </div>
          ) : null}
          {deliveryFee > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Biaya antar</span>
              <span>{formatRupiah(deliveryFee)}</span>
            </div>
          ) : null}
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between gap-4 text-[#ffd7c2]">
              <span>Diskon</span>
              <span>-{formatRupiah(discountAmount)}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">Perkiraan total</p>
          <p className="mt-2 text-3xl font-semibold">{formatRupiah(total)}</p>
        </div>

        {submitError ? (
          <div className="mt-5 rounded-[1.35rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
            {submitError}
          </div>
        ) : null}

        <div className="mt-6 rounded-[1.5rem] bg-white/8 p-3">
          <button
            type="submit"
            disabled={isSubmitting || data.ui.order_limit_reached}
            className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#81f2eb,#d8fffb)] px-5 py-4 text-base font-extrabold tracking-[-0.02em] text-[#003734] shadow-[0_18px_34px_rgba(129,242,235,0.18)] transition hover:brightness-[0.98] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Memproses pesanan..." : "Kirim pesanan ke outlet"}
          </button>
        </div>
      </section>
    </form>
  );
}
