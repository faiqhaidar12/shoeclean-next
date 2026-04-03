import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

function csrfHeaders(request: NextRequest): Record<string, string> {
  const xsrfToken = request.cookies.get("XSRF-TOKEN")?.value;

  return xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {};
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/api/superadmin/pricing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      ...csrfHeaders(request),
    },
    body: JSON.stringify(body),
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
