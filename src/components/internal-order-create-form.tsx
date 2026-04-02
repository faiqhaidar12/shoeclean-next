"use client";

import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { LeafletLocationPicker } from "@/components/leaflet-location-picker";
import type {
  InternalOrderCreateMetaResponse,
  InternalOrderCustomerSearchResponse,
} from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

type Props = {
  data: InternalOrderCreateMetaResponse;
};

type OrderItem = {
  service_id: string;
  quantity: string;
};

type SelectedCustomer = InternalOrderCustomerSearchResponse["customers"][number] | null;

type PromoState = {
  id: number;
  code: string;
  name: string;
  discount_amount: number;
} | null;

type LocationPoint = {
  lat: number;
  lng: number;
};

const orderTypeCards = [
  {
    value: "regular",
    title: "Drop-off",
    description: "Customer datang langsung ke outlet.",
    icon: StoreIcon,
  },
  {
    value: "pickup",
    title: "Pickup",
    description: "Kurir outlet menjemput ke lokasi customer.",
    icon: PickupIcon,
  },
  {
    value: "delivery",
    title: "Delivery",
    description: "Pesanan selesai diantar kembali ke alamat tujuan.",
    icon: DeliveryIcon,
  },
] as const;

export function InternalOrderCreateForm({ data }: Props) {
  const router = useRouter();
  const [outletId, setOutletId] = useState(String(data.selected_outlet_id ?? ""));
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState<
    InternalOrderCustomerSearchResponse["customers"]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectedCustomer>(null);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([{ service_id: "", quantity: "1" }]);
  const [orderType, setOrderType] = useState("regular");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupPoint, setPickupPoint] = useState<LocationPoint | null>(null);
  const [deliveryPoint, setDeliveryPoint] = useState<LocationPoint | null>(null);
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PromoState>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentOutlet = data.outlets.find((outlet) => String(outlet.id) === outletId) ?? null;
  const currentOutletPoint =
    currentOutlet && currentOutlet.latitude !== null && currentOutlet.longitude !== null
      ? { lat: currentOutlet.latitude, lng: currentOutlet.longitude }
      : null;
  const availableServices = useMemo(
    () => data.services.filter((service) => String(service.outlet_id) === outletId),
    [data.services, outletId],
  );

  const normalizedItems = items.map((item) => {
    const parsed = Number(item.quantity);
    const quantity = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;

    return { ...item, quantity };
  });

  const selectedItems = normalizedItems.filter((item) => item.service_id && item.quantity > 0);

  const subtotal = selectedItems.reduce((total, item) => {
    const service = availableServices.find(
      (currentService) => String(currentService.id) === item.service_id,
    );

    return total + (service ? service.price * item.quantity : 0);
  }, 0);

  const pickupFee = orderType === "pickup" ? Number(currentOutlet?.pickup_fee ?? 0) : 0;
  const deliveryFee = orderType === "delivery" ? Number(currentOutlet?.delivery_fee ?? 0) : 0;
  const discountAmount = promo?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + pickupFee + deliveryFee - discountAmount);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearch.trim().length < 2 || selectedCustomer) {
        setCustomerOptions([]);
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch(
          `/api/orders/create/customers?${new URLSearchParams({ search: customerSearch.trim() }).toString()}`,
        );

        const payload = (await response.json()) as InternalOrderCustomerSearchResponse;
        setCustomerOptions(payload.customers ?? []);
      } catch {
        setCustomerOptions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, selectedCustomer]);

  useEffect(() => {
    setPickupAddress("");
    setDeliveryAddress("");
    setPickupPoint(null);
    setDeliveryPoint(null);
    setPromo(null);
    setPromoCode("");
    setPromoMessage("");
  }, [outletId]);

  useEffect(() => {
    if (orderType !== "pickup") {
      setPickupAddress("");
      setPickupPoint(null);
    }

    if (orderType !== "delivery") {
      setDeliveryAddress("");
      setDeliveryPoint(null);
    }
  }, [orderType]);

  function addItem() {
    setItems((current) => [...current, { service_id: "", quantity: "1" }]);
    setPromo(null);
    setPromoMessage("");
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

  function updateItem(index: number, patch: Partial<OrderItem>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setPromo(null);
    setPromoMessage("");
  }

  function normalizeQuantityInput(index: number) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const parsed = Number(item.quantity);
        const safeValue = Number.isFinite(parsed) && parsed > 0 ? String(Math.floor(parsed)) : "1";

        return { ...item, quantity: safeValue };
      }),
    );
  }

  async function applyPromo() {
    if (!promoCode.trim() || !outletId || subtotal <= 0) {
      setPromo(null);
      setPromoMessage("Pilih outlet dan layanan dulu sebelum memakai promo.");
      return;
    }

    setIsApplyingPromo(true);
    setPromoMessage("");

    try {
      const response = await fetch("/api/orders/create/promos/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outlet_id: Number(outletId),
          code: promoCode.trim().toUpperCase(),
          subtotal,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        promo?: PromoState;
        errors?: Record<string, string[]>;
      };

      if (!response.ok || !payload.promo) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setPromo(null);
        setPromoMessage(firstError ?? payload.message ?? "Promo tidak berlaku.");
        return;
      }

      setPromo(payload.promo);
      setPromoMessage(payload.message ?? "Promo berhasil diterapkan.");
    } catch {
      setPromo(null);
      setPromoMessage("Terjadi kendala saat memvalidasi promo.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function quickAddCustomer() {
    if (!outletId) {
      setSubmitError("Pilih outlet terlebih dahulu.");
      return;
    }

    setIsQuickAdding(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders/create/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outlet_id: Number(outletId),
          name: quickName,
          phone: quickPhone,
        }),
      });

      const payload = (await response.json()) as {
        customer?: SelectedCustomer;
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok || !payload.customer) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setSubmitError(firstError ?? payload.message ?? "Customer gagal ditambahkan.");
        return;
      }

      setSelectedCustomer(payload.customer);
      setCustomerSearch(`${payload.customer.name} • ${payload.customer.phone}`);
      setShowQuickAdd(false);
      setQuickName("");
      setQuickPhone("");
      setCustomerOptions([]);
    } catch {
      setSubmitError("Terjadi kendala saat menambahkan customer.");
    } finally {
      setIsQuickAdding(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: selectedCustomer?.id,
          outlet_id: Number(outletId),
          notes,
          order_type: orderType,
          pickup_address: pickupAddress,
          delivery_address: deliveryAddress,
          pickup_latitude: pickupPoint?.lat,
          pickup_longitude: pickupPoint?.lng,
          delivery_latitude: deliveryPoint?.lat,
          delivery_longitude: deliveryPoint?.lng,
          promo_code: promo?.code ?? promoCode.trim(),
          items: normalizedItems
            .filter((item) => item.service_id && item.quantity > 0)
            .map((item) => ({
              service_id: Number(item.service_id),
              quantity: item.quantity,
            })),
        }),
      });

      const payload = (await response.json()) as {
        next_frontend_path?: string;
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setSubmitError(firstError ?? payload.message ?? "Order gagal dibuat.");
        return;
      }

      router.push(payload.next_frontend_path ?? "/dashboard/orders");
      router.refresh();
    } catch {
      setSubmitError("Terjadi kendala saat membuat order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border-subtle)] bg-white/96 p-6 shadow-[0_24px_80px_rgba(9,27,52,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--brand-900)] sm:flex">
                <CustomerIcon />
              </div>
              <div className="min-w-0">
                <p className="section-label">Informasi pelanggan</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.02em] text-[var(--brand-900)] sm:text-[2rem]">
                  Mulai dari outlet dan customer yang benar.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-[0.98rem]">
                  Pilih outlet operasional dulu, lalu cari customer existing atau tambahkan
                  customer baru tanpa keluar dari halaman kasir.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FieldShell label="Outlet aktif">
                <select
                  value={outletId}
                  onChange={(event) => {
                    setOutletId(event.target.value);
                    setSelectedCustomer(null);
                    setCustomerSearch("");
                    setCustomerOptions([]);
                    setPromo(null);
                    setPromoMessage("");
                  }}
                  className="field-soft"
                >
                  <option value="">Pilih outlet</option>
                  {data.outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </FieldShell>

              <FieldShell label="Cari customer">
                <input
                  value={customerSearch}
                  onChange={(event) => {
                    setCustomerSearch(event.target.value);
                    setSelectedCustomer(null);
                  }}
                  placeholder="Nama atau nomor WhatsApp"
                  className="field-soft"
                />
              </FieldShell>
            </div>

            {selectedCustomer ? (
              <div className="mt-5 rounded-[1.5rem] border border-[var(--accent-line)] bg-[var(--accent-soft)]/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-[var(--brand-900)]">
                      {selectedCustomer.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {selectedCustomer.phone} • {selectedCustomer.outlet?.name ?? "Outlet"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-700)] shadow-sm">
                    Customer terpilih
                  </span>
                </div>
              </div>
            ) : null}

            {!selectedCustomer && customerOptions.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {customerOptions.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setCustomerSearch(`${customer.name} • ${customer.phone}`);
                      setCustomerOptions([]);
                    }}
                    className="rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-line)] hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-[var(--brand-900)]">
                      {customer.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {customer.phone} • {customer.outlet?.name ?? "Outlet"}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowQuickAdd((current) => !current)}
                className="btn-secondary w-full sm:w-auto"
              >
                {showQuickAdd ? "Tutup quick add" : "Tambah customer cepat"}
              </button>
              {isSearching ? (
                <p className="text-sm text-[var(--text-muted)]">Mencari customer...</p>
              ) : null}
            </div>

            {showQuickAdd ? (
              <div className="mt-5 rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldShell label="Nama customer">
                    <input
                      value={quickName}
                      onChange={(event) => setQuickName(event.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="field-soft"
                    />
                  </FieldShell>
                  <FieldShell label="Nomor WhatsApp">
                    <input
                      value={quickPhone}
                      onChange={(event) => setQuickPhone(event.target.value)}
                      placeholder="0812xxxxxxx"
                      className="field-soft"
                    />
                  </FieldShell>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={quickAddCustomer}
                    disabled={isQuickAdding}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {isQuickAdding ? "Menyimpan..." : "Simpan customer"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border-subtle)] bg-white/96 p-6 shadow-[0_24px_80px_rgba(9,27,52,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-mint-soft)] text-[var(--brand-900)] sm:flex">
                <ServiceStackIcon />
              </div>
              <div className="min-w-0">
                <p className="section-label">Pilih layanan</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.02em] text-[var(--brand-900)] sm:text-[2rem]">
                  Susun item order seperti form kasir modern.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-[0.98rem]">
                  Tambahkan beberapa layanan sekaligus, atur quantity, lalu biarkan ringkasan
                  menghitung total secara otomatis.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={addItem} className="btn-secondary w-full sm:w-auto">
                Tambah item layanan
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {items.map((item, index) => {
                const selectedService = availableServices.find(
                  (service) => String(service.id) === item.service_id,
                );

                return (
                  <div
                    key={`${index}-${item.service_id}`}
                    className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] p-5 transition duration-200 hover:bg-white"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <FieldShell label={`Layanan ${index + 1}`}>
                          <select
                            value={item.service_id}
                            onChange={(event) =>
                              updateItem(index, { service_id: event.target.value })
                            }
                            className="field-soft"
                          >
                            <option value="">Pilih layanan</option>
                            {availableServices.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} - {formatRupiah(service.price)}
                              </option>
                            ))}
                          </select>
                        </FieldShell>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-[120px_auto] lg:min-w-[238px]">
                        <FieldShell label="Qty">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, { quantity: event.target.value })
                            }
                            onBlur={() => normalizeQuantityInput(index)}
                            className="field-soft"
                          />
                        </FieldShell>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="btn-secondary w-full"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedService ? (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)] shadow-sm">
                          {formatRupiah(selectedService.price)} / item
                        </span>
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-800)]">
                          Subtotal {formatRupiah(selectedService.price * (normalizedItems[index]?.quantity || 0))}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border-subtle)] bg-white/96 p-6 shadow-[0_24px_80px_rgba(9,27,52,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[rgba(207,232,227,0.72)] text-[var(--brand-900)] sm:flex">
                <NoteIcon />
              </div>
              <div className="min-w-0">
              <p className="section-label">Catatan tambahan</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.02em] text-[var(--brand-900)] sm:text-[2rem]">
                  Lengkapi promo, alamat, dan catatan pesanan.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-[0.98rem]">
                  Isi bagian ini jika pesanan perlu dijemput, diantar, memakai promo, atau
                  membutuhkan catatan khusus untuk tim Anda.
              </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <FieldShell label="Kode promo">
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                  placeholder="Masukkan kode promo"
                  className="field-soft"
                />
              </FieldShell>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={isApplyingPromo}
                  className="btn-accent w-full"
                >
                  {isApplyingPromo ? "Memeriksa..." : "Validasi promo"}
                </button>
              </div>
            </div>

            {promoMessage ? (
              <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{promoMessage}</p>
            ) : null}

            <div className="mt-5 grid gap-4">
              {orderType === "pickup" ? (
                <div className="space-y-4">
                  <FieldShell label="Alamat pickup">
                    <textarea
                      rows={4}
                      value={pickupAddress}
                      onChange={(event) => setPickupAddress(event.target.value)}
                      placeholder="Alamat lengkap penjemputan"
                      className="field-soft min-h-[120px]"
                    />
                  </FieldShell>
                  <LeafletLocationPicker
                    title="Titik jemput customer"
                    description="Klik peta atau geser pin agar tim dan driver melihat titik jemput yang paling presisi."
                    value={pickupPoint}
                    onChange={setPickupPoint}
                    staticPosition={currentOutletPoint}
                    staticLabel={currentOutlet?.name ?? "Outlet"}
                    editableLabel="Titik jemput"
                    clearLabel="Hapus titik jemput"
                  />
                </div>
              ) : null}

              {orderType === "delivery" ? (
                <div className="space-y-4">
                  <FieldShell label="Alamat delivery">
                    <textarea
                      rows={4}
                      value={deliveryAddress}
                      onChange={(event) => setDeliveryAddress(event.target.value)}
                      placeholder="Alamat lengkap pengantaran"
                      className="field-soft min-h-[120px]"
                    />
                  </FieldShell>
                  <LeafletLocationPicker
                    title="Titik antar customer"
                    description="Pilih titik pengantaran agar cabang dan driver tidak hanya mengandalkan alamat teks."
                    value={deliveryPoint}
                    onChange={setDeliveryPoint}
                    staticPosition={currentOutletPoint}
                    staticLabel={currentOutlet?.name ?? "Outlet"}
                    editableLabel="Titik antar"
                    clearLabel="Hapus titik antar"
                  />
                </div>
              ) : null}

              <FieldShell label="Catatan order">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Tambahkan catatan untuk tim outlet atau kurir"
                  className="field-soft min-h-[120px]"
                />
              </FieldShell>
            </div>
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="overflow-hidden rounded-[2rem] border border-[color:var(--border-subtle)] bg-white/96 p-6 shadow-[0_24px_80px_rgba(9,27,52,0.08)] sm:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-100)] text-[var(--brand-900)] sm:flex">
                <RouteIcon />
              </div>
              <div>
                <p className="section-label">Metode penyerahan</p>
                <h2 className="mt-2 font-heading text-xl font-extrabold tracking-[-0.02em] text-[var(--brand-900)]">
                  Tentukan alur serah terima.
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {orderTypeCards.map((option) => {
                const isActive = orderType === option.value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOrderType(option.value)}
                    className={`rounded-[1.5rem] border-2 px-4 py-4 text-left transition duration-200 ${
                      isActive
                        ? "border-[var(--accent-line)] bg-[var(--accent-soft)] shadow-[0_12px_30px_rgba(129,242,235,0.18)]"
                        : "border-transparent bg-[var(--surface-subtle)] hover:border-[color:var(--border-subtle)] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                            isActive ? "bg-white text-[var(--brand-900)]" : "bg-white/80 text-[var(--text-muted)]"
                          }`}
                        >
                          <Icon />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--brand-900)]">
                            {option.title}
                          </p>
                          <p className="mt-1 text-sm leading-5 text-[var(--text-muted)]">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`mt-1 h-5 w-5 rounded-full border ${
                          isActive
                            ? "border-[var(--brand-900)] bg-[var(--brand-900)] shadow-[inset_0_0_0_4px_white]"
                            : "border-[var(--border-strong)] bg-transparent"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#17345c_0%,#0d1f3f_100%)] p-6 text-white shadow-[0_28px_70px_rgba(0,32,69,0.34)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label-dark">Ringkasan pesanan</p>
                <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-[-0.02em] text-white">
                  Siap dikonfirmasi ke outlet.
                </h2>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/78">
                {selectedItems.length} item
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <SummaryRow
                label={`Layanan (${selectedItems.length} item)`}
                value={formatRupiah(subtotal)}
              />
              {pickupFee > 0 ? <SummaryRow label="Biaya jemput" value={formatRupiah(pickupFee)} /> : null}
              {deliveryFee > 0 ? <SummaryRow label="Biaya antar" value={formatRupiah(deliveryFee)} /> : null}
              {discountAmount > 0 ? <SummaryRow label="Diskon promo" value={`-${formatRupiah(discountAmount)}`} /> : null}
              <SummaryRow label="Plan aktif" value={data.order_limit.plan} highlight="soft" />
              <SummaryRow
                label="Sisa kuota"
                value={
                  data.order_limit.remaining === null
                    ? "Tanpa batas"
                    : String(data.order_limit.remaining)
                }
                highlight="soft"
              />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/56">
                    Total estimasi
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                    {formatRupiah(total)}
                  </p>
                </div>
                <div className="rounded-[1.25rem] bg-white/8 px-4 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">
                    Outlet
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/88">
                    {currentOutlet?.name ?? "Belum dipilih"}
                  </p>
                </div>
              </div>
            </div>

            {submitError ? (
              <div className="mt-5 rounded-[1.5rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm leading-6 text-[#9a3b2b]">
                {submitError}
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.6rem] border border-white/12 bg-white/8 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[3.9rem] w-full items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#81f2eb_0%,#c9fffb_100%)] px-6 py-4 text-base font-extrabold tracking-[-0.02em] text-[#06213f] shadow-[0_18px_38px_rgba(129,242,235,0.3)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(129,242,235,0.36)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Membuat order..." : "Buat order internal"}
              </button>
            </div>
            <p className="mt-3 text-center text-xs leading-5 text-white/58">
              Dengan menyimpan order ini, outlet akan langsung menerima data customer, layanan,
              dan instruksi operasional yang Anda pilih.
            </p>
          </section>

          <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border-subtle)] bg-[linear-gradient(135deg,rgba(129,242,235,0.16),rgba(255,255,255,0.96))] p-6 shadow-[0_24px_80px_rgba(9,27,52,0.08)]">
            <div className="absolute right-[-38px] top-[-34px] h-32 w-32 rounded-full bg-[rgba(129,242,235,0.26)] blur-2xl" />
            <div className="absolute bottom-[-44px] left-[-22px] h-28 w-28 rounded-full bg-[rgba(0,32,69,0.12)] blur-2xl" />
            <div className="relative">
              <p className="section-label">Ringkasan kasir</p>
              <h3 className="mt-2 font-heading text-xl font-extrabold tracking-[-0.02em] text-[var(--brand-900)]">
                Semua informasi penting ada di satu sisi.
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                Gunakan panel ini untuk memastikan layanan, kuota pesanan, dan cabang aktif
                sudah sesuai sebelum pesanan disimpan.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoPill label="Layanan tersedia" value={String(availableServices.length)} />
                <InfoPill label="Pesanan bulan ini" value={String(data.order_limit.total_orders)} />
              </div>
            </div>
          </section>
        </div>
      </section>
    </form>
  );
}

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "soft";
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-[1.25rem] px-4 py-3 text-sm ${
        highlight ? "bg-white/8 text-white" : "bg-white/5 text-white/78"
      }`}
    >
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/55 bg-white/76 px-4 py-4 backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--brand-900)]">
        {value}
      </p>
    </div>
  );
}

function CustomerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M19 8v4m-2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ServiceStackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5 7.5 12 4l7 3.5L12 11 5 7.5Zm0 4.5 7 3.5 7-3.5M5 16.5l7 3.5 7-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M7 4.75h7.75L18.25 8v11.25A1.75 1.75 0 0 1 16.5 21h-9A1.75 1.75 0 0 1 5.75 19.25v-12.75A1.75 1.75 0 0 1 7.5 4.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14.5 4.75V8h3.25" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12h6m-6 3h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M8 6.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm12.5 11.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0ZM6.25 8.5v4a3 3 0 0 0 3 3h7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m14.5 13 2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.75 9.25 6.25 5h11.5l1.5 4.25M5.5 9.25h13v9.25A1.5 1.5 0 0 1 17 20H7a1.5 1.5 0 0 1-1.5-1.5V9.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function PickupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.75 14.5V10.75a1.5 1.5 0 0 1 1.5-1.5h6l2.5 2.75h2.75a1.75 1.75 0 0 1 1.75 1.75v.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="16.75" r="1.75" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="16.75" r="1.75" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.75 7.75A1.75 1.75 0 0 1 6.5 6h7A1.75 1.75 0 0 1 15.25 7.75v8.5A1.75 1.75 0 0 1 13.5 18h-7a1.75 1.75 0 0 1-1.75-1.75v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M15.25 9.25h2.25l1.75 2.25v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

