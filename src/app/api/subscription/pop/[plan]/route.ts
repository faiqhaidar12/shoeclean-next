import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ plan: string }> },
) {
  const { plan } = await context.params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return NextResponse.json({ message: "Sesi login belum tersedia." }, { status: 401 });
  }

  const returnUrl = new URL("/dashboard/subscription", request.url).toString();

  const response = await fetch(`${API_BASE_URL}/api/subscription/checkout/${encodeURIComponent(plan)}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ return_url: returnUrl }),
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
