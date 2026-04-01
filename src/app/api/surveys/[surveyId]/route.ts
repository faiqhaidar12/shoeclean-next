import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ surveyId: string }> },
) {
  const { surveyId } = await context.params;

  const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Cookie: request.headers.get("cookie") ?? "",
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
