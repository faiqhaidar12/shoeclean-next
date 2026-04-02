import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({
      results: [],
    });
  }

  const upstreamUrl = new URL("https://nominatim.openstreetmap.org/search");
  upstreamUrl.searchParams.set("format", "jsonv2");
  upstreamUrl.searchParams.set("q", query);
  upstreamUrl.searchParams.set("limit", "5");
  upstreamUrl.searchParams.set("addressdetails", "1");
  upstreamUrl.searchParams.set("accept-language", "id");

  const response = await fetch(upstreamUrl.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ShoeClean Next",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        message: "Pencarian lokasi sedang tidak tersedia.",
        results: [],
      },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    name?: string;
  }>;

  return NextResponse.json({
    results: payload.map((item) => ({
      label: item.display_name,
      name: item.name ?? item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    })),
  });
}
