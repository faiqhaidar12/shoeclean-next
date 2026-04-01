import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const provinceId = request.nextUrl.searchParams.get("province_id");

  if (!provinceId) {
    return NextResponse.json([], { status: 200 });
  }

  const response = await fetch(
    `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
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
