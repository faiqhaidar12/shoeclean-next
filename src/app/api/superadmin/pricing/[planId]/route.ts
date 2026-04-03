import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

function csrfHeaders(request: NextRequest): Record<string, string> {
  const xsrfToken = request.cookies.get("XSRF-TOKEN")?.value;

  return xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {};
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ planId: string }> },
) {
  const { planId } = await context.params;
  const body = await request.json();

  const response = await fetch(`${API_BASE_URL}/api/superadmin/pricing/${planId}`, {
    method: "PUT",
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ planId: string }> },
) {
  const { planId } = await context.params;

  const response = await fetch(`${API_BASE_URL}/api/superadmin/pricing/${planId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
      ...csrfHeaders(request),
    },
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
