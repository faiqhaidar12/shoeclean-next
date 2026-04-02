"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

type Position = {
  lat: number;
  lng: number;
};

type RouteResponse = {
  distance_meters: number;
  duration_seconds: number;
  path: Position[];
};

type Props = {
  title: string;
  description: string;
  from: Position | null;
  to: Position | null;
  fromLabel?: string;
  toLabel?: string;
  heightClassName?: string;
};

const DynamicLeafletMapCanvas = dynamic(
  () =>
    import("@/components/leaflet-map-canvas").then((module) => module.LeafletMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-[1.5rem] border border-[color:var(--border-subtle)] bg-[var(--surface-subtle)] text-sm text-[var(--text-muted)]">
        Menyiapkan peta rute...
      </div>
    ),
  },
);

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

export function LeafletRoutePreview({
  title,
  description,
  from,
  to,
  fromLabel = "Cabang",
  toLabel = "Tujuan",
  heightClassName,
}: Props) {
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadRoute() {
      if (!from || !to) {
        setRoute(null);
        setMessage("Titik cabang atau tujuan belum lengkap.");
        return;
      }

      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/maps/route?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}`,
        );
        const payload = (await response.json()) as RouteResponse & { message?: string };

        if (!response.ok) {
          setRoute(null);
          setMessage(payload.message ?? "Rute belum bisa dimuat.");
          return;
        }

        setRoute(payload);
        setMessage("");
      } catch {
        setRoute(null);
        setMessage("Terjadi kendala saat memuat rute.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoute();
  }, [from, to]);

  const summary = useMemo(() => {
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
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-[var(--brand-900)]">{title}</p>
        <p className="text-sm leading-6 text-[var(--text-muted)]">{description}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{fromLabel}</p>
          <p className="mt-2 font-semibold text-[var(--brand-900)]">
            {from ? `${from.lat.toFixed(5)}, ${from.lng.toFixed(5)}` : "-"}
          </p>
        </div>
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{toLabel}</p>
          <p className="mt-2 font-semibold text-[var(--brand-900)]">
            {to ? `${to.lat.toFixed(5)}, ${to.lng.toFixed(5)}` : "-"}
          </p>
        </div>
      </div>

      {summary ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Estimasi jarak</p>
            <p className="mt-2 font-semibold text-[var(--brand-900)]">{summary.distance}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(0,32,69,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Estimasi waktu</p>
            <p className="mt-2 font-semibold text-[var(--brand-900)]">{summary.duration}</p>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">{message}</p>
      ) : null}
      {isLoading ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">Menghitung rute...</p>
      ) : null}

      <div className="mt-4">
        <DynamicLeafletMapCanvas
          heightClassName={heightClassName}
          value={to}
          onChange={() => {}}
          staticPosition={from}
          staticLabel={fromLabel}
          editableLabel={toLabel}
          routePath={route?.path ?? []}
          readOnly
        />
      </div>
    </section>
  );
}
