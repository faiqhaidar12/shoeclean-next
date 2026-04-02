"use client";

import dynamic from "next/dynamic";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";

type Position = {
  lat: number;
  lng: number;
};

type Props = {
  title: string;
  description: string;
  value: Position | null;
  onChange: (position: Position | null) => void;
  staticPosition?: Position | null;
  staticLabel?: string;
  editableLabel?: string;
  clearLabel?: string;
  heightClassName?: string;
};

type SearchResult = {
  label: string;
  name: string;
  lat: number;
  lng: number;
};

type RouteResponse = {
  distance_meters: number;
  duration_seconds: number;
  path: Position[];
};

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function formatDuration(durationSeconds: number) {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} jam ${remainingMinutes} menit` : `${hours} jam`;
  }

  return `${minutes} menit`;
}

const DynamicLeafletMapCanvas = dynamic(
  () =>
    import("@/components/leaflet-map-canvas").then((module) => module.LeafletMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)]">
        Menyiapkan peta...
      </div>
    ),
  },
);

export function LeafletLocationPicker({
  title,
  description,
  value,
  onChange,
  staticPosition,
  staticLabel,
  editableLabel,
  clearLabel = "Hapus titik",
  heightClassName,
}: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [routeMessage, setRouteMessage] = useState("");
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  async function handleSearch() {
    if (search.trim().length < 3) {
      setResults([]);
      setSearchMessage("Masukkan minimal 3 karakter untuk mencari lokasi.");
      return;
    }

    setIsSearching(true);
    setSearchMessage("");

    try {
      const response = await fetch(`/api/maps/search?q=${encodeURIComponent(search.trim())}`);
      const payload = (await response.json()) as {
        message?: string;
        results?: SearchResult[];
      };

      if (!response.ok) {
        setResults([]);
        setSearchMessage(payload.message ?? "Lokasi belum bisa dicari saat ini.");
        return;
      }

      const nextResults = payload.results ?? [];
      setResults(nextResults);
      setSearchMessage(
        nextResults.length > 0
          ? "Pilih hasil yang paling mendekati alamat atau titik jemput/antar."
          : "Lokasi belum ditemukan. Coba kata kunci yang lebih spesifik.",
      );
    } catch {
      setResults([]);
      setSearchMessage("Terjadi kendala saat mencari lokasi.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSearch();
    }
  }

  function useCurrentLocation() {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setSearchMessage("Perangkat ini belum mendukung akses lokasi.");
      return;
    }

    setIsLocating(true);
    setSearchMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: Number(position.coords.latitude.toFixed(7)),
          lng: Number(position.coords.longitude.toFixed(7)),
        });
        setResults([]);
        setSearchMessage("Lokasi saat ini berhasil dipakai sebagai titik pin.");
        setIsLocating(false);
      },
      (error) => {
        const nextMessage =
          error.code === error.PERMISSION_DENIED
            ? "Akses lokasi ditolak. Izinkan akses lokasi di browser untuk memakai fitur ini."
            : "Lokasi saat ini belum bisa diambil. Coba lagi dalam beberapa saat.";

        setSearchMessage(nextMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  useEffect(() => {
    async function loadRoute() {
      if (!staticPosition || !value) {
        setRoute(null);
        setRouteMessage("");
        return;
      }

      setIsLoadingRoute(true);
      setRouteMessage("");

      try {
        const response = await fetch(
          `/api/maps/route?fromLat=${staticPosition.lat}&fromLng=${staticPosition.lng}&toLat=${value.lat}&toLng=${value.lng}`,
        );
        const payload = (await response.json()) as RouteResponse & { message?: string };

        if (!response.ok) {
          setRoute(null);
          setRouteMessage(payload.message ?? "Rute belum bisa dimuat.");
          return;
        }

        setRoute(payload);
        setRouteMessage("");
      } catch {
        setRoute(null);
        setRouteMessage("Terjadi kendala saat menghitung rute.");
      } finally {
        setIsLoadingRoute(false);
      }
    }

    void loadRoute();
  }, [staticPosition, value]);

  const routeSummary = useMemo(() => {
    if (!route) {
      return null;
    }

    return {
      distance: formatDistance(route.distance_meters),
      duration: formatDuration(route.duration_seconds),
    };
  }, [route]);

  return (
    <section className="rounded-[1.6rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--brand-900)]">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{description}</p>
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--brand)]"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari alamat, nama jalan, atau nama tempat"
            className="field-soft flex-1"
          />
          <div className="flex flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void handleSearch();
              }}
              disabled={isSearching}
              className="btn-secondary w-full sm:w-auto"
            >
              {isSearching ? "Mencari..." : "Cari lokasi"}
            </button>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={isLocating}
              className="btn-secondary w-full sm:w-auto"
            >
              {isLocating ? "Mengambil lokasi..." : "Gunakan lokasi saat ini"}
            </button>
          </div>
        </div>

        {searchMessage ? (
          <p className="text-sm leading-6 text-[var(--text-muted)]">{searchMessage}</p>
        ) : null}

        {results.length > 0 ? (
          <div className="grid gap-2">
            {results.map((result) => (
              <button
                key={`${result.lat}-${result.lng}-${result.label}`}
                type="button"
                onClick={() => {
                  onChange({ lat: result.lat, lng: result.lng });
                  setSearch(result.label);
                  setResults([]);
                  setSearchMessage("Titik lokasi sudah dipilih dari hasil pencarian.");
                }}
                className="rounded-[1.2rem] border border-[color:var(--border-subtle)] bg-white px-4 py-3 text-left transition hover:border-[var(--accent-line)] hover:bg-[var(--surface-subtle)]"
              >
                <p className="text-sm font-semibold text-[var(--brand-900)]">{result.name}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{result.label}</p>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <DynamicLeafletMapCanvas
          heightClassName={heightClassName}
          value={value}
          onChange={(position) => onChange(position)}
          staticPosition={staticPosition}
          staticLabel={staticLabel}
          editableLabel={editableLabel}
          routePath={route?.path ?? []}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Latitude</p>
          <p className="mt-2 font-semibold text-[var(--brand-900)]">{value ? value.lat.toFixed(7) : "-"}</p>
        </div>
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Longitude</p>
          <p className="mt-2 font-semibold text-[var(--brand-900)]">{value ? value.lng.toFixed(7) : "-"}</p>
        </div>
      </div>

      {routeSummary ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Estimasi jarak</p>
            <p className="mt-2 font-semibold text-[var(--brand-900)]">{routeSummary.distance}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Estimasi waktu</p>
            <p className="mt-2 font-semibold text-[var(--brand-900)]">{routeSummary.duration}</p>
          </div>
        </div>
      ) : null}

      {isLoadingRoute ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">Menghitung rute dari cabang ke titik pilihan...</p>
      ) : null}
      {routeMessage ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{routeMessage}</p>
      ) : null}
    </section>
  );
}
