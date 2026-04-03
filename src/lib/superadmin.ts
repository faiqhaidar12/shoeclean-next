import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "@/lib/api";

export type SuperAdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export type SuperAdminPagination<T> = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: T[];
};

export type SuperAdminDashboardResponse = {
  filters: {
    month: number;
    year: number;
    available_years: number[];
  };
  metrics: {
    total_outlets: number;
    active_outlets: number;
    inactive_outlets: number;
    total_owners: number;
    total_users: number;
    total_customers: number;
    total_services: number;
    today_orders: number;
    month_orders: number;
    total_orders: number;
    today_revenue: number;
    month_revenue: number;
    total_revenue: number;
  };
  charts: {
    revenue: { labels: string[]; data: number[] };
    growth: { labels: string[]; data: number[] };
  };
  outlets: Array<{
    id: number;
    rank: number;
    name: string;
    slug: string;
    city_name: string | null;
    address: string | null;
    status: string;
    owner_name: string | null;
    month_orders: number;
    month_revenue: number;
    total_orders: number;
    total_revenue: number;
  }>;
  recent_orders: SuperAdminOrder[];
};

export type SuperAdminOrder = {
  id: number;
  invoice_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  payment_status_label: string;
  payment_method: string;
  total_price: number;
  created_at: string | null;
  customer: { name: string; phone: string } | null;
  outlet: { id: number; name: string; slug: string } | null;
  owner: { id: number; name: string } | null;
};

export type SuperAdminOrdersResponse = {
  filters: {
    search: string;
    outlet_id: number | null;
    owner_id: number | null;
    status: string;
    payment_status: string;
  };
  outlets: Array<{ id: number; name: string; slug: string }>;
  owners: Array<{ id: number; name: string }>;
  statuses: string[];
  payment_statuses: string[];
  orders: SuperAdminPagination<SuperAdminOrder>;
};

export type SuperAdminSubscription = {
  id: number;
  plan: string;
  status: string;
  status_label: string;
  started_at: string | null;
  expires_at: string | null;
  days_remaining: number | null;
  user: { id: number; name: string; email: string } | null;
};

export type SuperAdminSubscriptionsResponse = {
  summary: {
    free_owners: number;
    pro_owners: number;
    business_owners: number;
    expiring_count: number;
  };
  filters: {
    plan: string;
    status: string;
  };
  expiring: SuperAdminSubscription[];
  subscriptions: SuperAdminPagination<SuperAdminSubscription>;
};

export type SuperAdminPricingPlan = {
  id: number;
  key: string;
  name: string;
  subtitle: string | null;
  price: number;
  price_label: string;
  description: string | null;
  cta: string | null;
  order_limit: number | null;
  max_outlets: number | null;
  quota: number | null;
  features: string[];
  is_published: boolean;
  sort_order: number;
  created_at: string | null;
};

export type SuperAdminPricingResponse = {
  plans: SuperAdminPricingPlan[];
};

export type SuperAdminPaymentTransaction = {
  id: number;
  gateway: string | null;
  kind: string;
  kind_label: string;
  plan_key: string | null;
  merchant_order_id: string;
  reference: string | null;
  payment_method: string | null;
  amount: number;
  fee: number | null;
  status_code: string | null;
  status_message: string | null;
  product_detail: string | null;
  customer_email: string | null;
  checkout_payload: unknown;
  callback_payload: unknown;
  status_payload: unknown;
  paid_at: string | null;
  expires_at: string | null;
  last_synced_at: string | null;
  billable: { type: string; id: number | null } | null;
  user: { id: number; name: string; email: string } | null;
};

export type SuperAdminPaymentsResponse = {
  summary: {
    total: number;
    success: number;
    pending: number;
    failed: number;
  };
  filters: {
    search: string;
    kind: string;
    status: string;
    owner_id: number | null;
  };
  owners: Array<{ id: number; name: string }>;
  transactions: SuperAdminPagination<SuperAdminPaymentTransaction>;
};

export type SuperAdminFeedback = {
  id: number;
  category: string;
  category_label: string;
  message: string;
  created_at: string | null;
  user: { name: string } | null;
  outlet: { name: string } | null;
};

export type SuperAdminFeedbacksResponse = {
  filters: {
    category: string;
  };
  summary: {
    total: number;
    saran: number;
    ide: number;
    keluhan: number;
  };
  categories: string[];
  feedbacks: SuperAdminPagination<SuperAdminFeedback>;
};

export type SuperAdminSurvey = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: string;
  is_active: boolean;
  responses_count: number;
  average_rating: number | null;
  public_url: string;
  created_at: string | null;
  creator?: { id: number; name: string } | null;
  questions?: Array<{
    id: number;
    question: string;
    type: "rating" | "text" | "choice";
    options: string[];
    sort_order: number;
  }>;
};

export type SuperAdminSurveysResponse = {
  filters: {
    search: string;
    status: string;
  };
  summary: {
    total_surveys: number;
    active_surveys: number;
    total_responses: number;
  };
  statuses: string[];
  surveys: SuperAdminPagination<SuperAdminSurvey>;
};

export type SuperAdminSurveyDetailResponse = {
  survey: SuperAdminSurvey & {
    questions: Array<{
      id: number;
      question: string;
      type: "rating" | "text" | "choice";
      options: string[];
      sort_order: number;
    }>;
  };
  question_stats: Array<Record<string, unknown>>;
  recent_responses: Array<{
    id: number;
    respondent_name: string;
    respondent_phone: string | null;
    respondent_type: string;
    created_at: string | null;
    answers: Array<{
      question: string | null;
      type: string | null;
      answer: string | null;
      rating: number | null;
    }>;
  }>;
};

async function superAdminRequest<T>(
  path: string,
  init?: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown },
): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    throw new ApiError("Sesi login belum tersedia.", 401);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
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
    let message = "Request superadmin gagal.";

    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // Keep fallback.
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

function buildQuery(params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getSuperAdminDashboard(params?: { month?: string; year?: string }) {
  return superAdminRequest<SuperAdminDashboardResponse>(
    `/api/superadmin/dashboard${buildQuery(params)}`,
  );
}

export function getSuperAdminOrders(params?: {
  search?: string;
  outlet_id?: string;
  owner_id?: string;
  status?: string;
  payment_status?: string;
  page?: string;
}) {
  return superAdminRequest<SuperAdminOrdersResponse>(
    `/api/superadmin/orders${buildQuery(params)}`,
  );
}

export function getSuperAdminSubscriptions(params?: {
  plan?: string;
  status?: string;
  page?: string;
}) {
  return superAdminRequest<SuperAdminSubscriptionsResponse>(
    `/api/superadmin/subscriptions${buildQuery(params)}`,
  );
}

export function getSuperAdminPricing() {
  return superAdminRequest<SuperAdminPricingResponse>("/api/superadmin/pricing");
}

export function saveSuperAdminPricing(
  payload: Partial<SuperAdminPricingPlan> & { key: string; name: string; price: number; sort_order: number },
  planId?: number,
) {
  return superAdminRequest<{ message: string; plan: SuperAdminPricingPlan }>(
    planId ? `/api/superadmin/pricing/${planId}` : "/api/superadmin/pricing",
    {
      method: planId ? "PUT" : "POST",
      body: payload,
    },
  );
}

export function deleteSuperAdminPricing(planId: number) {
  return superAdminRequest<{ message: string }>(`/api/superadmin/pricing/${planId}`, {
    method: "DELETE",
  });
}

export function getSuperAdminPayments(params?: {
  search?: string;
  owner_id?: string;
  kind?: string;
  status?: string;
  page?: string;
}) {
  return superAdminRequest<SuperAdminPaymentsResponse>(
    `/api/superadmin/payments${buildQuery(params)}`,
  );
}

export function getSuperAdminFeedbacks(params?: {
  category?: string;
  page?: string;
}) {
  return superAdminRequest<SuperAdminFeedbacksResponse>(
    `/api/superadmin/feedbacks${buildQuery(params)}`,
  );
}

export function getSuperAdminSurveys(params?: {
  search?: string;
  status?: string;
  page?: string;
}) {
  return superAdminRequest<SuperAdminSurveysResponse>(
    `/api/superadmin/surveys${buildQuery(params)}`,
  );
}

export function getSuperAdminSurvey(surveyId: string) {
  return superAdminRequest<SuperAdminSurveyDetailResponse>(
    `/api/superadmin/surveys/${encodeURIComponent(surveyId)}`,
  );
}

export function createSuperAdminSurvey(payload: {
  title: string;
  description: string;
  questions: Array<{
    question: string;
    type: "rating" | "text" | "choice";
    options: string[];
  }>;
}) {
  return superAdminRequest<{ message: string; survey: SuperAdminSurvey }>(
    "/api/superadmin/surveys",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function toggleSuperAdminSurvey(surveyId: number) {
  return superAdminRequest<{ message: string; survey: SuperAdminSurvey }>(
    `/api/superadmin/surveys/${surveyId}/toggle`,
    { method: "PATCH" },
  );
}

export function deleteSuperAdminSurvey(surveyId: number) {
  return superAdminRequest<{ message: string }>(`/api/superadmin/surveys/${surveyId}`, {
    method: "DELETE",
  });
}
