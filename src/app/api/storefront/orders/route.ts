import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const response = await fetch(`${API_BASE_URL}/api/public/orders`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
    cache: "no-store",
  });

  const payload = await response.text();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
