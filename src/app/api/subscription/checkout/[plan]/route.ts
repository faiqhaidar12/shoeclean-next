import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ plan: string }> },
) {
  const { plan } = await context.params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const returnUrl = new URL("/dashboard/subscription", request.url).toString();

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/subscription/checkout/${encodeURIComponent(plan)}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ return_url: returnUrl }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/subscription?error=duitku-unavailable", request.url),
    );
  }

  if (!response.ok) {
    let message = "checkout-failed";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // keep fallback message
    }

    const target = new URL("/dashboard/subscription", request.url);
    target.searchParams.set("error", "checkout-failed");
    target.searchParams.set("status", String(response.status));
    target.searchParams.set("message", message);

    return NextResponse.redirect(target);
  }

  const data = (await response.json()) as { payment_url?: string };

  if (!data.payment_url) {
    const target = new URL("/dashboard/subscription", request.url);
    target.searchParams.set("error", "checkout-failed");
    target.searchParams.set("status", "invalid-response");
    target.searchParams.set("message", "payment_url tidak ditemukan");

    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(data.payment_url);
}
