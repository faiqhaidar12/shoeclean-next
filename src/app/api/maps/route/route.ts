import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseCoordinate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const fromLat = parseCoordinate(request.nextUrl.searchParams.get("fromLat"));
  const fromLng = parseCoordinate(request.nextUrl.searchParams.get("fromLng"));
  const toLat = parseCoordinate(request.nextUrl.searchParams.get("toLat"));
  const toLng = parseCoordinate(request.nextUrl.searchParams.get("toLng"));

  if (fromLat === null || fromLng === null || toLat === null || toLng === null) {
    return NextResponse.json(
      {
        message: "Koordinat rute belum lengkap.",
      },
      { status: 422 },
    );
  }

  const upstreamUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=false`;

  const response = await fetch(upstreamUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ShoeClean Next",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        message: "Rute belum bisa dimuat saat ini.",
      },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as {
    code?: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry?: {
        coordinates?: Array<[number, number]>;
      };
    }>;
  };

  const route = payload.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    return NextResponse.json(
      {
        message: "Rute belum ditemukan.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    distance_meters: route.distance,
    duration_seconds: route.duration,
    path: route.geometry.coordinates.map(([lng, lat]) => ({
      lat,
      lng,
    })),
  });
}
