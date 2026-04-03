"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { LeafletLocationPicker } from "@/components/leaflet-location-picker";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type RegionOption = {
  id: string;
  name: string;
};

type Props = {
  mode: "create" | "edit";
  statuses: string[];
  initialValues?: {
    id?: number;
    name?: string;
    slug?: string;
    address?: string;
    phone?: string;
    status?: string;
    pickup_enabled?: boolean;
    delivery_enabled?: boolean;
    pickup_fee?: number;
    delivery_fee?: number;
    pickup_base_distance_km?: number;
    pickup_base_fee?: number;
    pickup_extra_fee_per_km?: number;
    delivery_base_distance_km?: number;
    delivery_base_fee?: number;
    delivery_extra_fee_per_km?: number;
    province_id?: string | null;
    province_name?: string | null;
    city_id?: string | null;
    city_name?: string | null;
    district_id?: string | null;
    district_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    qris_image_url?: string | null;
    qris_image_original_name?: string | null;
    qris_notes?: string | null;
  };
};

export function OutletForm({ mode, statuses, initialValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [status, setStatus] = useState(initialValues?.status ?? "active");
  const [pickupEnabled, setPickupEnabled] = useState(Boolean(initialValues?.pickup_enabled));
  const [deliveryEnabled, setDeliveryEnabled] = useState(Boolean(initialValues?.delivery_enabled));
  const [pickupFee, setPickupFee] = useState(String(initialValues?.pickup_base_fee ?? initialValues?.pickup_fee ?? 20000));
  const [deliveryFee, setDeliveryFee] = useState(String(initialValues?.delivery_base_fee ?? initialValues?.delivery_fee ?? 20000));
  const [pickupBaseDistance, setPickupBaseDistance] = useState(String(initialValues?.pickup_base_distance_km ?? 10));
  const [pickupBaseFee, setPickupBaseFee] = useState(String(initialValues?.pickup_base_fee ?? initialValues?.pickup_fee ?? 20000));
  const [pickupExtraFeePerKm, setPickupExtraFeePerKm] = useState(String(initialValues?.pickup_extra_fee_per_km ?? 2000));
  const [deliveryBaseDistance, setDeliveryBaseDistance] = useState(String(initialValues?.delivery_base_distance_km ?? 10));
  const [deliveryBaseFee, setDeliveryBaseFee] = useState(String(initialValues?.delivery_base_fee ?? initialValues?.delivery_fee ?? 20000));
  const [deliveryExtraFeePerKm, setDeliveryExtraFeePerKm] = useState(String(initialValues?.delivery_extra_fee_per_km ?? 2000));
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisNotes, setQrisNotes] = useState(initialValues?.qris_notes ?? "");
  const [removeQris, setRemoveQris] = useState(false);
  const [provinces, setProvinces] = useState<RegionOption[]>([]);
  const [cities, setCities] = useState<RegionOption[]>([]);
  const [districts, setDistricts] = useState<RegionOption[]>([]);
  const [provinceId, setProvinceId] = useState(initialValues?.province_id ?? "");
  const [provinceName, setProvinceName] = useState(initialValues?.province_name ?? "");
  const [cityId, setCityId] = useState(initialValues?.city_id ?? "");
  const [cityName, setCityName] = useState(initialValues?.city_name ?? "");
  const [districtId, setDistrictId] = useState(initialValues?.district_id ?? "");
  const [districtName, setDistrictName] = useState(initialValues?.district_name ?? "");
  const [latitude, setLatitude] = useState<number | null>(initialValues?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initialValues?.longitude ?? null);
  const [error, setError] = useState("");
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setSlug(initialValues?.slug ?? "");
    setAddress(initialValues?.address ?? "");
    setPhone(initialValues?.phone ?? "");
    setStatus(initialValues?.status ?? "active");
    setPickupEnabled(Boolean(initialValues?.pickup_enabled));
    setDeliveryEnabled(Boolean(initialValues?.delivery_enabled));
    setPickupFee(String(initialValues?.pickup_base_fee ?? initialValues?.pickup_fee ?? 20000));
    setDeliveryFee(String(initialValues?.delivery_base_fee ?? initialValues?.delivery_fee ?? 20000));
    setPickupBaseDistance(String(initialValues?.pickup_base_distance_km ?? 10));
    setPickupBaseFee(String(initialValues?.pickup_base_fee ?? initialValues?.pickup_fee ?? 20000));
    setPickupExtraFeePerKm(String(initialValues?.pickup_extra_fee_per_km ?? 2000));
    setDeliveryBaseDistance(String(initialValues?.delivery_base_distance_km ?? 10));
    setDeliveryBaseFee(String(initialValues?.delivery_base_fee ?? initialValues?.delivery_fee ?? 20000));
    setDeliveryExtraFeePerKm(String(initialValues?.delivery_extra_fee_per_km ?? 2000));
    setQrisFile(null);
    setQrisNotes(initialValues?.qris_notes ?? "");
    setRemoveQris(false);
    setProvinceId(initialValues?.province_id ?? "");
    setProvinceName(initialValues?.province_name ?? "");
    setCityId(initialValues?.city_id ?? "");
    setCityName(initialValues?.city_name ?? "");
    setDistrictId(initialValues?.district_id ?? "");
    setDistrictName(initialValues?.district_name ?? "");
    setLatitude(initialValues?.latitude ?? null);
    setLongitude(initialValues?.longitude ?? null);
    setError("");
  }, [initialValues]);

  useEffect(() => {
    let active = true;

    async function loadProvinces() {
      setIsLoadingRegions(true);

      try {
        const response = await fetch("/api/regions/provinces");
        const data = (await response.json()) as RegionOption[];

        if (active) {
          setProvinces(data);
        }
      } catch {
        if (active) {
          setError("Daftar provinsi belum bisa dimuat.");
        }
      } finally {
        if (active) {
          setIsLoadingRegions(false);
        }
      }
    }

    loadProvinces();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCities() {
      if (!provinceId) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch(`/api/regions/cities?province_id=${provinceId}`);
        const data = (await response.json()) as RegionOption[];
        if (active) {
          setCities(data);
        }
      } catch {
        if (active) {
          setError("Daftar kota belum bisa dimuat.");
        }
      }
    }

    loadCities();

    return () => {
      active = false;
    };
  }, [provinceId]);

  useEffect(() => {
    let active = true;

    async function loadDistricts() {
      if (!cityId) {
        setDistricts([]);
        return;
      }

      try {
        const response = await fetch(`/api/regions/districts?city_id=${cityId}`);
        const data = (await response.json()) as RegionOption[];
        if (active) {
          setDistricts(data);
        }
      } catch {
        if (active) {
          setError("Daftar kecamatan belum bisa dimuat.");
        }
      }
    }

    loadDistricts();

    return () => {
      active = false;
    };
  }, [cityId]);

  function handleProvinceChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedId = event.target.value;
    const selected = provinces.find((item) => item.id === selectedId);

    setProvinceId(selectedId);
    setProvinceName(selected?.name ?? "");
    setCityId("");
    setCityName("");
    setDistrictId("");
    setDistrictName("");
  }

  function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedId = event.target.value;
    const selected = cities.find((item) => item.id === selectedId);

    setCityId(selectedId);
    setCityName(selected?.name ?? "");
    setDistrictId("");
    setDistrictName("");
  }

  function handleDistrictChange(event: ChangeEvent<HTMLSelectElement>) {
    const selectedId = event.target.value;
    const selected = districts.find((item) => item.id === selectedId);

    setDistrictId(selectedId);
    setDistrictName(selected?.name ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === "create" ? "/api/outlets" : `/api/outlets/${initialValues?.id}`;

      const formData = new FormData();
      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("address", address);
      formData.set("phone", phone);
      formData.set("status", status);
      formData.set("pickup_enabled", pickupEnabled ? "1" : "0");
      formData.set("delivery_enabled", deliveryEnabled ? "1" : "0");
      formData.set("pickup_fee", pickupBaseFee);
      formData.set("delivery_fee", deliveryBaseFee);
      formData.set("pickup_base_distance_km", pickupBaseDistance);
      formData.set("pickup_base_fee", pickupBaseFee);
      formData.set("pickup_extra_fee_per_km", pickupExtraFeePerKm);
      formData.set("delivery_base_distance_km", deliveryBaseDistance);
      formData.set("delivery_base_fee", deliveryBaseFee);
      formData.set("delivery_extra_fee_per_km", deliveryExtraFeePerKm);
      formData.set("qris_notes", qrisNotes);
      formData.set("province_id", provinceId);
      formData.set("province_name", provinceName);
      formData.set("city_id", cityId);
      formData.set("city_name", cityName);
      formData.set("district_id", districtId);
      formData.set("district_name", districtName);
      formData.set("latitude", latitude === null ? "" : String(latitude));
      formData.set("longitude", longitude === null ? "" : String(longitude));
      formData.set("remove_qris", removeQris ? "1" : "0");

      if (qrisFile) {
        formData.set("qris_image", qrisFile);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors
          ? Object.values(payload.errors)[0]?.[0]
          : null;
        setError(firstError ?? payload.message ?? "Outlet gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Outlet berhasil diregistrasikan" : "Perubahan outlet berhasil disimpan",
        message: "Informasi cabang dan preferensi operasional sudah diperbarui.",
      });
      router.push("/dashboard/outlets");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan outlet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="grid gap-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
            Data cabang
          </p>
          <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
            {mode === "create" ? "Identitas outlet baru" : "Perbarui data cabang"}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="outlet-name" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Nama cabang *
          </label>
          <input
            id="outlet-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Shoe Clean Heritage Outlet"
            className="field-soft"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="outlet-slug" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Alamat singkat cabang
          </label>
          <input
            id="outlet-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="shoeclean-tebet"
            className="field-soft"
          />
          <p className="text-[9px] font-black uppercase tracking-widest text-brand/30">
            Preview slug: <span className="text-accent">{slug || "-"}</span>
          </p>
        </div>

        <div className="space-y-3">
          <label htmlFor="outlet-phone" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Nomor kontak
          </label>
          <input
            id="outlet-phone"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="081234567890"
            className="field-soft"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="outlet-status" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Status
          </label>
          <select
            id="outlet-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field-soft"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label htmlFor="pickup-fee" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Biaya penjemputan
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand/25">
              RP
            </span>
            <input
              id="pickup-fee"
              type="number"
              min={0}
              required
              value={pickupFee}
              onChange={(event) => setPickupFee(event.target.value)}
              className="field-soft !pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="delivery-fee" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Biaya pengantaran
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand/25">
              RP
            </span>
            <input
              id="delivery-fee"
              type="number"
              min={0}
              required
              value={deliveryFee}
              onChange={(event) => setDeliveryFee(event.target.value)}
              className="field-soft !pl-10"
            />
          </div>
        </div>

        <div className="soft-panel space-y-4 p-4 sm:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">Layanan jemput</p>
              <p className="mt-2 text-sm text-muted">Aktifkan jika cabang ini melayani penjemputan ke alamat pelanggan.</p>
            </div>
            <input type="checkbox" checked={pickupEnabled} onChange={(event) => setPickupEnabled(event.target.checked)} className="mt-1 h-5 w-5" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="number" min={0} step="0.1" value={pickupBaseDistance} onChange={(event) => setPickupBaseDistance(event.target.value)} className="field-soft" placeholder="Jarak dasar (km)" disabled={!pickupEnabled} />
            <input type="number" min={0} value={pickupBaseFee} onChange={(event) => setPickupBaseFee(event.target.value)} className="field-soft" placeholder="Biaya dasar" disabled={!pickupEnabled} />
            <input type="number" min={0} value={pickupExtraFeePerKm} onChange={(event) => setPickupExtraFeePerKm(event.target.value)} className="field-soft" placeholder="Tambah / km" disabled={!pickupEnabled} />
          </div>
        </div>

        <div className="soft-panel space-y-4 p-4 sm:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">Layanan antar</p>
              <p className="mt-2 text-sm text-muted">Aktifkan jika cabang ini melayani pengantaran kembali ke alamat pelanggan.</p>
            </div>
            <input type="checkbox" checked={deliveryEnabled} onChange={(event) => setDeliveryEnabled(event.target.checked)} className="mt-1 h-5 w-5" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="number" min={0} step="0.1" value={deliveryBaseDistance} onChange={(event) => setDeliveryBaseDistance(event.target.value)} className="field-soft" placeholder="Jarak dasar (km)" disabled={!deliveryEnabled} />
            <input type="number" min={0} value={deliveryBaseFee} onChange={(event) => setDeliveryBaseFee(event.target.value)} className="field-soft" placeholder="Biaya dasar" disabled={!deliveryEnabled} />
            <input type="number" min={0} value={deliveryExtraFeePerKm} onChange={(event) => setDeliveryExtraFeePerKm(event.target.value)} className="field-soft" placeholder="Tambah / km" disabled={!deliveryEnabled} />
          </div>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label htmlFor="outlet-address" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Alamat lengkap
          </label>
          <textarea
            id="outlet-address"
            required
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Alamat lengkap cabang untuk memudahkan pelanggan dan tim Anda."
            className="field-soft min-h-[120px]"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="province-id" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Provinsi
          </label>
          <select
            id="province-id"
            required
            value={provinceId}
            onChange={handleProvinceChange}
            className="field-soft"
            disabled={isLoadingRegions}
          >
            <option value="">Pilih provinsi</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label htmlFor="city-id" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Kota/Kabupaten
          </label>
          <select
            id="city-id"
            required
            value={cityId}
            onChange={handleCityChange}
            className="field-soft"
            disabled={!provinceId}
          >
            <option value="">Pilih kota/kabupaten</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label htmlFor="district-id" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Kecamatan
          </label>
          <select
            id="district-id"
            value={districtId}
            onChange={handleDistrictChange}
            className="field-soft"
            disabled={!cityId}
          >
            <option value="">Pilih kecamatan</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <LeafletLocationPicker
            title="Titik lokasi cabang"
            description="Letakkan pin tepat di posisi outlet agar driver dan pelanggan lebih mudah menemukan cabang ini."
            value={latitude !== null && longitude !== null ? { lat: latitude, lng: longitude } : null}
            onChange={(position) => {
              setLatitude(position?.lat ?? null);
              setLongitude(position?.lng ?? null);
            }}
            editableLabel="Lokasi outlet"
            clearLabel="Hapus titik cabang"
          />
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label htmlFor="qris-image" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            QRIS cabang
          </label>
          <input
            id="qris-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setQrisFile(event.target.files?.[0] ?? null)}
            className="field-soft"
          />
          <p className="text-[9px] font-black uppercase tracking-widest text-brand/30">
            Opsional. QRIS ini akan tampil di halaman selesai pesan untuk pelanggan.
          </p>
          {initialValues?.qris_image_url && !removeQris ? (
            <div className="soft-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative h-24 w-24 overflow-hidden rounded-[1rem] bg-surface">
                  <Image
                    src={initialValues.qris_image_url}
                    alt={initialValues.qris_image_original_name ?? "QRIS outlet"}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {initialValues.qris_image_original_name ?? "QRIS yang sedang dipakai"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRemoveQris(true)}
                    className="mt-2 text-sm font-semibold text-[#9a3b2b]"
                  >
                    Hapus QRIS ini
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {removeQris ? (
            <div className="soft-panel p-4 text-sm text-muted">
              QRIS akan dihapus saat cabang disimpan.
              <button
                type="button"
                onClick={() => setRemoveQris(false)}
                className="ml-2 font-semibold text-accent"
              >
                Batalkan
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 sm:col-span-2">
          <label htmlFor="qris-notes" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
            Catatan pembayaran QRIS
          </label>
          <textarea
            id="qris-notes"
            value={qrisNotes}
            onChange={(event) => setQrisNotes(event.target.value)}
            placeholder="Instruksi pembayaran atau catatan singkat untuk pelanggan"
            className="field-soft min-h-[120px]"
          />
        </div>
      </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
          {error}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-line/35 pt-8 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push("/dashboard/outlets")}
          className="btn-secondary w-full flex-1"
        >
          {mode === "create" ? "Batalkan" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan cabang"
              : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
