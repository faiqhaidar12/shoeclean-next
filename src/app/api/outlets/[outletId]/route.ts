import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ outletId: string }> },
) {
  const { outletId } = await context.params;
  const formData = await request.formData();
  formData.append("_method", "PUT");

  const response = await fetch(`${API_BASE_URL}/api/outlets/${outletId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
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
