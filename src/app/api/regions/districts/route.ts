import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get("city_id");

  if (!cityId) {
    return NextResponse.json([], { status: 200 });
  }

  const response = await fetch(
    `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${cityId}.json`,
    {
      cache: "force-cache",
      next: { revalidate: 86400 },
    },
  );

  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
