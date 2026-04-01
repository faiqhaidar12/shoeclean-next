import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/reports/orders/export${query ? `?${query}` : ""}`,
    {
      headers: {
        Accept: request.headers.get("accept") ?? "*/*",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition":
        response.headers.get("Content-Disposition") ?? 'attachment; filename="report"',
    },
  });
}
