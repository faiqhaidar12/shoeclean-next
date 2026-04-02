"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type Position = {
  lat: number;
  lng: number;
};

type Props = {
  heightClassName?: string;
  value: Position | null;
  onChange: (position: Position) => void;
  staticPosition?: Position | null;
  staticLabel?: string;
  editableLabel?: string;
  routePath?: Position[];
  readOnly?: boolean;
};

const outletIcon = L.divIcon({
  className: "leaflet-custom-pin",
  html: '<span class="leaflet-custom-pin__inner leaflet-custom-pin__inner--outlet"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const customerIcon = L.divIcon({
  className: "leaflet-custom-pin",
  html: '<span class="leaflet-custom-pin__inner leaflet-custom-pin__inner--customer"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function centerFromProps(staticPosition?: Position | null, value?: Position | null): Position {
  return value ?? staticPosition ?? { lat: -6.200000, lng: 106.816666 };
}

function MapViewportSync({
  value,
  staticPosition,
}: {
  value: Position | null;
  staticPosition?: Position | null;
}) {
  const map = useMap();
  const lastCenterRef = useRef<string | null>(null);

  useEffect(() => {
    const nextCenter = centerFromProps(staticPosition, value);
    const nextKey = `${nextCenter.lat}:${nextCenter.lng}`;

    if (lastCenterRef.current === nextKey) {
      return;
    }

    lastCenterRef.current = nextKey;
    map.setView(nextCenter, value ? 16 : staticPosition ? 15 : 13, {
      animate: false,
    });
  }, [map, staticPosition, value]);

  return null;
}

function ClickToPick({
  onChange,
}: {
  onChange: (position: Position) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        lat: Number(event.latlng.lat.toFixed(7)),
        lng: Number(event.latlng.lng.toFixed(7)),
      });
    },
  });

  return null;
}

export function LeafletMapCanvas({
  heightClassName = "h-[320px]",
  value,
  onChange,
  staticPosition,
  staticLabel = "Lokasi outlet",
  editableLabel = "Titik yang dipilih",
  routePath = [],
  readOnly = false,
}: Props) {
  const center = useMemo(() => centerFromProps(staticPosition, value), [staticPosition, value]);

  return (
    <div className={`overflow-hidden rounded-[1.5rem] border border-[color:var(--border-subtle)] ${heightClassName}`}>
      <MapContainer
        center={center}
        zoom={value ? 16 : staticPosition ? 15 : 13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewportSync value={value} staticPosition={staticPosition} />
        {!readOnly ? <ClickToPick onChange={onChange} /> : null}

        {routePath.length > 1 ? (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: "#002045",
              weight: 5,
              opacity: 0.8,
            }}
          />
        ) : null}

        {staticPosition ? (
          <Marker position={staticPosition} icon={outletIcon}>
            <Popup>{staticLabel}</Popup>
          </Marker>
        ) : null}

        {value ? (
          <Marker
            position={value}
            icon={customerIcon}
            draggable={!readOnly}
            eventHandlers={{
              dragend(event) {
                const marker = event.target;
                const latLng = marker.getLatLng();
                onChange({
                  lat: Number(latLng.lat.toFixed(7)),
                  lng: Number(latLng.lng.toFixed(7)),
                });
              },
            }}
          >
            <Popup>{editableLabel}</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
