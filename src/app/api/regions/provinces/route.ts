import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(
    "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
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
