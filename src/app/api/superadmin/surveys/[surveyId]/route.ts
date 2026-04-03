import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

function csrfHeaders(request: NextRequest): Record<string, string> {
  const xsrfToken = request.cookies.get("XSRF-TOKEN")?.value;

  return xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {};
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ surveyId: string }> },
) {
  const { surveyId } = await context.params;

  const response = await fetch(`${API_BASE_URL}/api/superadmin/surveys/${surveyId}`, {
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
