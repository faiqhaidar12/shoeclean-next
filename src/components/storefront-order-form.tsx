"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import type { StorefrontOutletResponse } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

type OrderItem = {
  service_id: string;
  quantity: number;
};

type PromoState = {
  code: string;
  discount_amount: number;
  message: string;
} | null;

type Props = {
  data: StorefrontOutletResponse;
};

export function StorefrontOrderForm({ data }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([{ service_id: "", quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("regular");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
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

    return total + (service ? service.price * item.quantity : 0);
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
    setItems((current) => [...current, { service_id: "", quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.length === 1
        ? [{ service_id: "", quantity: 1 }]
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
          quantity: item.quantity,
        }));

      const formData = new FormData();
      formData.set("outlet_slug", data.outlet.slug);
      formData.set("customer_name", customerName);
      formData.set("customer_phone", customerPhone);
      formData.set("items", JSON.stringify(selectedItems));
      formData.set("order_type", orderType);
      formData.set("pickup_address", pickupAddress);
      formData.set("delivery_address", deliveryAddress);
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
        <section className="section-block p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Cabang lain
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Ganti cabang dengan sekali tap.
              </h2>
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
                    ? "border-brand bg-[#fff3eb]"
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
          Outlet ini sedang tidak bisa menerima order baru.
        </section>
      ) : null}

      <section className="section-block p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              Langkah 1
            </p>
            <h2 className="mt-2 text-xl font-semibold">Pilih layanan</h2>
          </div>
          <button type="button" onClick={addItem} className="btn-secondary">
            Tambah item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={`${index}-${item.service_id}`} className="soft-panel p-4">
              <div className="grid gap-3">
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
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(index, {
                        quantity: Math.max(1, Number(event.target.value || 1)),
                      })
                    }
                    className="field-soft"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="btn-secondary"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Langkah 2
        </p>
        <h2 className="mt-2 text-xl font-semibold">Data customer</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nama customer"
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
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Langkah 3
        </p>
        <h2 className="mt-2 text-xl font-semibold">Pengambilan & pembayaran</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={orderType}
            onChange={(event) => setOrderType(event.target.value)}
            className="field-soft"
          >
            <option value="regular">Regular</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
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
          <textarea
            required
            rows={3}
            value={pickupAddress}
            onChange={(event) => setPickupAddress(event.target.value)}
            placeholder="Alamat pickup"
            className="field-soft mt-4"
          />
        ) : null}

        {orderType === "delivery" ? (
          <textarea
            required
            rows={3}
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="Alamat delivery"
            className="field-soft mt-4"
          />
        ) : null}

        {paymentMethod === "qris" && data.outlet.qris_image_url ? (
          <div className="soft-panel mt-4 p-4">
            <img
              src={data.outlet.qris_image_url}
              alt={`QRIS ${data.outlet.name}`}
              className="mx-auto max-h-80 rounded-[1.35rem] bg-white object-contain"
            />
            <p className="mt-3 text-sm leading-6 text-muted">
              {data.outlet.qris_notes || "Scan QRIS outlet ini sesuai total estimasi."}
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
          placeholder="Catatan pembayaran"
          className="field-soft mt-4"
        />
      </section>

      <section className="section-block p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Opsional
        </p>
        <h2 className="mt-2 text-xl font-semibold">Promo & catatan order</h2>

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
          placeholder="Catatan order"
          className="field-soft mt-4"
        />
      </section>

      <section className="section-block bg-[#183a34] p-5 text-white sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-white/65">
          Ringkasan
        </p>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/70">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {pickupFee > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Pickup fee</span>
              <span>{formatRupiah(pickupFee)}</span>
            </div>
          ) : null}
          {deliveryFee > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/70">Delivery fee</span>
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
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">
            Total estimasi
          </p>
          <p className="mt-2 text-3xl font-semibold">{formatRupiah(total)}</p>
        </div>

        {submitError ? (
          <div className="mt-5 rounded-[1.35rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || data.ui.order_limit_reached}
          className="btn-primary mt-5 w-full justify-center bg-white text-accent hover:bg-[#f2eee7] disabled:opacity-60"
        >
          {isSubmitting ? "Memproses pesanan..." : "Kirim pesanan ke outlet"}
        </button>
      </section>
    </form>
  );
}
