import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "@/lib/api";

export type AuthSession = {
  authenticated: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    email_verified: boolean;
    roles: string[];
    primary_role: string | null;
    current_plan: string;
    remaining_orders: number | null;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
};

export type DashboardSummary = {
  user: {
    id: number;
    name: string;
    email: string;
    roles: string[];
    current_plan: string;
    remaining_orders: number | null;
    is_owner: boolean;
    is_superadmin: boolean;
  };
  scope: {
    outlet_ids: number[];
    outlets: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    active_label: string;
  };
  metrics: {
    today_orders: number;
    month_orders: number;
    today_revenue: number;
    month_revenue: number;
    pending_orders: number;
    ready_orders: number;
    total_customers: number;
  };
  recent_orders: Array<{
    id: number;
    invoice_number: string;
    status: string;
    payment_status: string;
    total_price: number;
    created_at: string | null;
    customer: {
      name: string;
      phone: string;
    } | null;
    outlet: {
      name: string;
      slug: string;
    } | null;
  }>;
};

export type OrdersResponse = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: Array<{
    id: number;
    invoice_number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_state: string;
    total_price: number;
    created_at: string | null;
    customer: {
      name: string;
      phone: string;
    } | null;
    outlet: {
      name: string;
      slug: string;
    } | null;
  }>;
};

export type OrderDetailResponse = {
  order: {
    id: number;
    invoice_number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_method: string | null;
    payment_method_label: string;
    total_price: number;
    notes: string | null;
    order_type: string | null;
    pickup_address: string | null;
    delivery_address: string | null;
    discount_amount: number;
    payment_notes: string | null;
    payment_verified_at: string | null;
    payment_proof_url: string | null;
    customer: {
      name: string;
      phone: string;
      address: string | null;
      email: string | null;
    } | null;
    outlet: {
      name: string;
      slug: string;
      address: string | null;
      phone: string | null;
      qris_image_url: string | null;
      qris_notes: string | null;
    } | null;
    items: Array<{
      id: number;
      service_name: string | null;
      quantity: number;
      unit: string | null;
      price: number;
      total_price: number;
    }>;
    payments: Array<{
      id: number;
      amount: number;
      method: string;
      status: string;
      created_at: string | null;
    }>;
    payment_verifier: {
      name: string;
    } | null;
  };
};

async function protectedRequest<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    throw new ApiError("Sesi login belum tersedia.", 401);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      `Tidak bisa terhubung ke backend Laravel di ${API_BASE_URL}. Pastikan server Laravel sedang berjalan.`,
      503,
    );
  }

  if (!response.ok) {
    let message = response.status === 401 ? "Sesi login tidak valid." : "Request gagal.";

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // keep fallback message
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

async function protectedMutate<T>(
  path: string,
  init?: {
    method?: "POST" | "PATCH";
    body?: unknown;
  },
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    throw new ApiError("Sesi login belum tersedia.", 401);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method ?? "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      `Tidak bisa terhubung ke backend Laravel di ${API_BASE_URL}. Pastikan server Laravel sedang berjalan.`,
      503,
    );
  }

  if (!response.ok) {
    let message = response.status === 401 ? "Sesi login tidak valid." : "Request gagal.";

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // keep fallback message
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getAuthSession() {
  return protectedRequest<AuthSession>("/api/auth/session");
}

export function getDashboardSummary() {
  return protectedRequest<DashboardSummary>("/api/dashboard/summary");
}

export function getOrders(params?: {
  search?: string;
  status?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<OrdersResponse>(`/api/orders${query ? `?${query}` : ""}`);
}

export function getOrderDetail(orderId: string) {
  return protectedRequest<OrderDetailResponse>(`/api/orders/${encodeURIComponent(orderId)}`);
}

export function updateOrderStatus(orderId: string, status: string) {
  return protectedMutate<OrderDetailResponse>(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function markOrderPaid(orderId: string) {
  return protectedMutate<OrderDetailResponse>(`/api/orders/${encodeURIComponent(orderId)}/mark-paid`);
}

export function verifyOrderPayment(orderId: string) {
  return protectedMutate<OrderDetailResponse>(`/api/orders/${encodeURIComponent(orderId)}/verify-payment`);
}
