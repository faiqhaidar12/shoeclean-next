import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(request: NextRequest) {
  const response = await fetch(
    `${API_BASE_URL}/superadmin/reports/marketing/pdf`,
    {
      headers: {
        Accept: "application/pdf",
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    },
  );

  const payload = await response.arrayBuffer();

  return new NextResponse(payload, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/pdf",
      "Content-Disposition":
        response.headers.get("Content-Disposition") ??
        'attachment; filename="shoeclean-marketing-kit.pdf"',
    },
  });
}
