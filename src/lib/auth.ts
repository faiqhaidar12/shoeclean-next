import { cookies } from "next/headers";
import { API_BASE_URL, ApiError } from "@/lib/api";
import { canAccessDashboardModule, type DashboardModuleKey, type DashboardUser } from "@/lib/dashboard-access";

export type AuthSession = {
  authenticated: boolean;
  user: DashboardUser & {
    email_verified: boolean;
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
  filters: {
    month: number;
    year: number;
    available_years: number[];
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
  multi_outlet: {
    owned_outlet_count: number;
    is_combined_scope: boolean;
    show_business_upsell: boolean;
    top_performing_outlet: {
      id: number;
      name: string;
      slug: string;
      revenue_total: number;
      orders_total: number;
    } | null;
    outlet_performance: Array<{
      id: number;
      name: string;
      slug: string;
      orders_total: number;
      pending_total: number;
      ready_total: number;
      revenue_total: number;
    }>;
  };
  charts: {
    revenue: {
      labels: string[];
      data: number[];
      period_label: string;
    };
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
    has_payment_proof: boolean;
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
    created_at: string | null;
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
    pickup_latitude: number | null;
    pickup_longitude: number | null;
    delivery_address: string | null;
    delivery_latitude: number | null;
    delivery_longitude: number | null;
    discount_amount: number;
    payment_notes: string | null;
    payment_verified_at: string | null;
    payment_proof_url: string | null;
    payment_summary: {
      has_payment_proof: boolean;
      can_mark_paid: boolean;
      can_verify_payment: boolean;
      successful_payments_total: number;
    };
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
      latitude: number | null;
      longitude: number | null;
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
      method_label: string;
      status: string;
      status_label: string;
      created_at: string | null;
    }>;
    payment_verifier: {
      name: string;
    } | null;
  };
};

export type CustomersIndexResponse = {
  filters: {
    search: string;
    outlet_id: number | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  customers: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      name: string;
      phone: string;
      address: string | null;
      email: string | null;
      created_at: string | null;
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }>;
  };
  meta: {
    can_choose_outlet: boolean;
  };
};

export type CustomerDetailResponse = {
  customer: {
    id: number;
    name: string;
    phone: string;
    address: string | null;
    email: string | null;
    created_at: string | null;
    outlet_id: number;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export type InternalOrderCreateMetaResponse = {
  order_limit: {
    allowed: boolean;
    remaining: number | null;
    plan: string;
    total_orders: number;
    limit: number | null;
  };
  selected_outlet_id: number | null;
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
    pickup_enabled?: boolean;
    delivery_enabled?: boolean;
    pickup_fee: number;
    delivery_fee: number;
    pickup_pricing?: {
      enabled: boolean;
      base_distance_km: number;
      base_fee: number;
      extra_fee_per_km: number;
      final_fee: number;
    };
    delivery_pricing?: {
      enabled: boolean;
      base_distance_km: number;
      base_fee: number;
      extra_fee_per_km: number;
      final_fee: number;
    };
    latitude: number | null;
    longitude: number | null;
  }>;
  services: Array<{
    id: number;
    outlet_id: number;
    name: string;
    unit: string;
    price: number;
  }>;
  user: {
    id: number;
    roles: string[];
    can_choose_outlet: boolean;
  };
};

export type InternalOrderCustomerSearchResponse = {
  customers: Array<{
    id: number;
    name: string;
    phone: string;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
  }>;
};

export type ServicesIndexResponse = {
  filters: {
    search: string;
    status: string;
    outlet_id: number | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  services: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      name: string;
      unit: string;
      price: number;
      status: string;
      created_at: string | null;
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }>;
  };
};

export type ExpensesIndexResponse = {
  filters: {
    search: string;
    month: number;
    year: number;
    outlet_id: number | null;
  };
  summary: {
    total_amount: number;
    categories_count: number;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  categories: string[];
  available_years: number[];
  expenses: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      category: string;
      amount: number;
      description: string | null;
      expense_date: string | null;
      created_at: string | null;
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
      user: {
        id: number;
        name: string;
      } | null;
    }>;
  };
  meta: {
    can_choose_outlet: boolean;
  };
};

export type ExpenseDetailResponse = {
  expense: {
    id: number;
    category: string;
    amount: number;
    description: string | null;
    expense_date: string | null;
    created_at: string | null;
    outlet_id: number;
    user_id: number;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
    user: {
      id: number;
      name: string;
    } | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  categories: string[];
};

export type PromosIndexResponse = {
  filters: {
    search: string;
    status: string;
    type: string;
    outlet_id: number | null;
  };
  summary: {
    total_promos: number;
    active_promos: number;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  types: string[];
  statuses: string[];
  promos: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      code: string;
      name: string;
      type: string;
      value: number;
      min_order: number;
      max_discount: number | null;
      max_uses: number | null;
      used_count: number;
      start_date: string | null;
      end_date: string | null;
      is_active: boolean;
      availability_status: string;
      availability_label: string;
      created_at: string | null;
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }>;
  };
  meta: {
    can_manage_global: boolean;
    feature_plan: string;
  };
};

export type PromoDetailResponse = {
  promo: {
    id: number;
    code: string;
    name: string;
    type: string;
    value: number;
    min_order: number;
    max_discount: number | null;
    max_uses: number | null;
    used_count: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    availability_status: string;
    availability_label: string;
    created_at: string | null;
    outlet_id: number | null;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  types: string[];
  statuses: string[];
  meta: {
    can_manage_global: boolean;
  };
};

export type OutletsIndexResponse = {
  filters: {
    search: string;
    status: string;
  };
  summary: {
    total_outlets: number;
    active_outlets: number;
  };
  outlets: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      name: string;
      slug: string;
      address: string;
      phone: string;
      status: string;
      pickup_fee: number;
      delivery_fee: number;
      province_id: string | null;
      province_name: string | null;
      city_id: string | null;
      city_name: string | null;
      district_id: string | null;
      district_name: string | null;
      latitude: number | null;
      longitude: number | null;
      qris_image_url: string | null;
      qris_image_original_name: string | null;
      qris_notes: string | null;
      created_at: string | null;
      counts: {
        users: number;
        services: number;
        orders: number;
      };
    }>;
  };
  statuses: string[];
  meta: {
    is_owner: boolean;
    can_create: boolean;
    max_outlets: number | null;
    current_outlets: number;
  };
};

export type OutletDetailResponse = {
  outlet: {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    address: string;
    phone: string;
    status: string;
    pickup_enabled?: boolean;
    delivery_enabled?: boolean;
    pickup_fee: number;
    delivery_fee: number;
    pickup_base_distance_km?: number;
    pickup_base_fee?: number;
    pickup_extra_fee_per_km?: number;
    delivery_base_distance_km?: number;
    delivery_base_fee?: number;
    delivery_extra_fee_per_km?: number;
    province_id: string | null;
    province_name: string | null;
    city_id: string | null;
    city_name: string | null;
    district_id: string | null;
    district_name: string | null;
    latitude: number | null;
    longitude: number | null;
    qris_image_url: string | null;
    qris_image_original_name: string | null;
    qris_notes: string | null;
    created_at: string | null;
    counts: {
      users: number;
      services: number;
      orders: number;
    };
  };
  statuses: string[];
  meta: {
    is_owner: boolean;
    can_edit_status: boolean;
  };
};

export type ReportsSummaryResponse = {
  filters: {
    month: number;
    year: number;
  };
  scope: {
    outlet_ids: number[];
    outlets: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    label: string;
  };
  metrics: {
    orders_count: number;
    gross_order_value: number;
    successful_payment_value: number;
    paid_orders_count: number;
    waiting_confirmation_count: number;
    unpaid_count: number;
    expenses_total: number;
    net_cashflow: number;
  };
  top_outlets: Array<{
    id: number;
    name: string;
    slug: string;
    orders_count: number;
    order_value: number;
    expense_total: number;
  }>;
  expense_categories: Array<{
    category: string;
    total_amount: number;
    count: number;
  }>;
  recent_orders: Array<{
    id: number;
    invoice_number: string;
    status: string;
    payment_status: string;
    total_price: number;
    created_at: string | null;
    customer: {
      name: string;
    } | null;
    outlet: {
      name: string;
      slug: string;
    } | null;
  }>;
  recent_expenses: Array<{
    id: number;
    category: string;
    amount: number;
    expense_date: string | null;
    outlet: {
      name: string;
      slug: string;
    } | null;
    user: {
      name: string;
    } | null;
  }>;
  exports: {
    orders_excel_url: string;
    orders_pdf_url: string;
    expenses_excel_url: string;
    expenses_pdf_url: string;
  };
};

  export type SubscriptionSummaryResponse = {
    owner_name: string;
    current_plan: string;
  active_subscription: {
    id: number;
    plan: string;
    status: string;
    started_at: string | null;
    expires_at: string | null;
    days_remaining: number | null;
    payment_gateway: string | null;
    transaction_id: string | null;
    reference_id: string | null;
  } | null;
  order_limit: {
    allowed: boolean;
    remaining: number | null;
    plan: string;
    total_orders: number;
    limit: number | null;
  };
  outlet_capacity: {
    current: number;
    max: number | null;
    can_create: boolean;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
    status: string;
  }>;
  plan_details: Record<
    string,
    {
      name: string;
      subtitle: string;
      price: number;
      price_label: string;
      is_published: boolean;
      order_limit?: number | null;
      max_outlets?: number | null;
      description: string;
      cta: string;
      features?: string[];
      quota?: number;
    }
  >;
    payment_links: {
      pro: string;
      business: string;
      topup: string;
    };
    pending_transactions: Array<{
      id: number;
      kind: string;
      plan_key: string | null;
      plan_label: string;
      merchant_order_id: string;
      reference: string | null;
      payment_method: string | null;
      status_code: string | null;
      status_message: string | null;
      amount: number;
      amount_label: string;
      payment_url: string | null;
      popup_script_url: string | null;
      expires_at: string | null;
      created_at: string | null;
      last_synced_at: string | null;
      is_expired: boolean;
    }>;
      subscription_history: Array<{
        id: number;
        plan: string;
      status: string;
      started_at: string | null;
      expires_at: string | null;
      payment_gateway: string | null;
      transaction_id: string | null;
      reference_id: string | null;
      amount: number | null;
      amount_label: string | null;
      receipt_item: string;
      payment_transaction: {
        gateway: string | null;
        merchant_order_id: string | null;
        reference: string | null;
        payment_method: string | null;
        status_code: string | null;
        status_message: string | null;
        paid_at: string | null;
      } | null;
    }>;
    quota_history: Array<{
      id: number;
      quota_total: number;
      quota_used: number;
      quota_remaining: number;
      purchased_at: string | null;
      payment_gateway: string | null;
      transaction_id: string | null;
      reference_id: string | null;
      amount: number | null;
      amount_label: string | null;
      receipt_item: string;
      payment_transaction: {
        gateway: string | null;
        merchant_order_id: string | null;
        reference: string | null;
        payment_method: string | null;
        status_code: string | null;
        status_message: string | null;
        paid_at: string | null;
      } | null;
    }>;
  };

export type SurveysIndexResponse = {
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
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  surveys: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
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
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
    }>;
  };
};

export type SurveyDetailResponse = {
  survey: {
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
    outlet_id: number | null;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
    questions: Array<{
      id: number;
      question: string;
      type: string;
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

export type ServiceDetailResponse = {
  service: {
    id: number;
    name: string;
    unit: string;
    price: number;
    status: string;
    created_at: string | null;
    outlet_id: number;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  units: string[];
  statuses: string[];
};

export type TeamIndexResponse = {
  filters: {
    search: string;
    outlet_id: number | null;
  };
  users: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Array<{
      id: number;
      name: string;
      email: string;
      email_verified: boolean;
      role: string | null;
      role_label: string | null;
      outlet: {
        id: number;
        name: string;
        slug: string;
      } | null;
      created_at: string | null;
      permissions: {
        can_edit: boolean;
      };
    }>;
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  roles: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  meta: {
    can_manage_team: boolean;
    actor_role: string | null;
  };
};

export type TeamMemberDetailResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    email_verified: boolean;
    role: string | null;
    role_label: string | null;
    outlet_id: number | null;
    outlet: {
      id: number;
      name: string;
      slug: string;
    } | null;
    created_at: string | null;
    permissions: {
      can_edit: boolean;
    };
  };
  outlets: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  roles: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

async function protectedRequest<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const targetUrl = `${API_BASE_URL}${path}`;

  if (!cookieHeader) {
    throw new ApiError("Sesi login belum tersedia.", 401);
  }

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[ShoeClean API] Protected request failed", {
      targetUrl,
      error: error instanceof Error ? error.message : String(error),
    });

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
  const targetUrl = `${API_BASE_URL}${path}`;

  if (!cookieHeader) {
    throw new ApiError("Sesi login belum tersedia.", 401);
  }

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      method: init?.method ?? "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[ShoeClean API] Protected mutation failed", {
      targetUrl,
      error: error instanceof Error ? error.message : String(error),
    });

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

export async function getOptionalAuthSession() {
  try {
    return await getAuthSession();
  } catch {
    return null;
  }
}

export async function requireDashboardModuleAccess(
  module: DashboardModuleKey,
  options?: { outletId?: number | null },
) {
  const session = await getAuthSession();

  if (!canAccessDashboardModule(session.user, module, options)) {
    const error = new ApiError("Akses ke halaman ini tidak tersedia untuk akun Anda.", 403);
    throw error;
  }

  return session;
}

export async function requireSuperAdminSession() {
  const session = await getAuthSession();

  if (!session.user.is_superadmin) {
    throw new ApiError("Akses superadmin tidak tersedia untuk akun Anda.", 403);
  }

  return session;
}

export function getDashboardSummary(params?: {
  month?: string;
  year?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.month) searchParams.set("month", params.month);
  if (params?.year) searchParams.set("year", params.year);

  const query = searchParams.toString();

  return protectedRequest<DashboardSummary>(`/api/dashboard/summary${query ? `?${query}` : ""}`);
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

export function getCustomers(params?: {
  search?: string;
  outlet_id?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.outlet_id) searchParams.set("outlet_id", params.outlet_id);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<CustomersIndexResponse>(`/api/customers${query ? `?${query}` : ""}`);
}

export function getCustomer(customerId: string) {
  return protectedRequest<CustomerDetailResponse>(`/api/customers/${encodeURIComponent(customerId)}`);
}

export function getInternalOrderCreateMeta(outletId?: string) {
  const query = outletId ? `?${new URLSearchParams({ outlet_id: outletId }).toString()}` : "";

  return protectedRequest<InternalOrderCreateMetaResponse>(`/api/orders/create/meta${query}`);
}

export function getServices(params?: {
  search?: string;
  status?: string;
  outlet_id?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.outlet_id) searchParams.set("outlet_id", params.outlet_id);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<ServicesIndexResponse>(`/api/services${query ? `?${query}` : ""}`);
}

export function getExpenses(params?: {
  search?: string;
  month?: string;
  year?: string;
  outlet_id?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.month) searchParams.set("month", params.month);
  if (params?.year) searchParams.set("year", params.year);
  if (params?.outlet_id) searchParams.set("outlet_id", params.outlet_id);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<ExpensesIndexResponse>(`/api/expenses${query ? `?${query}` : ""}`);
}

export function getExpense(expenseId: string) {
  return protectedRequest<ExpenseDetailResponse>(`/api/expenses/${encodeURIComponent(expenseId)}`);
}

export function getPromos(params?: {
  search?: string;
  status?: string;
  type?: string;
  outlet_id?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.outlet_id) searchParams.set("outlet_id", params.outlet_id);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<PromosIndexResponse>(`/api/promos${query ? `?${query}` : ""}`);
}

export function getPromo(promoId: string) {
  return protectedRequest<PromoDetailResponse>(`/api/promos/${encodeURIComponent(promoId)}`);
}

export function getOutlets(params?: {
  search?: string;
  status?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<OutletsIndexResponse>(`/api/outlets${query ? `?${query}` : ""}`);
}

export function getOutlet(outletId: string) {
  return protectedRequest<OutletDetailResponse>(`/api/outlets/${encodeURIComponent(outletId)}`);
}

export function getReportsSummary(params?: {
  month?: string;
  year?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.month) searchParams.set("month", params.month);
  if (params?.year) searchParams.set("year", params.year);

  const query = searchParams.toString();

  return protectedRequest<ReportsSummaryResponse>(
    `/api/reports/summary${query ? `?${query}` : ""}`,
  );
}

export function getSubscriptionSummary() {
  return protectedRequest<SubscriptionSummaryResponse>("/api/subscription/summary");
}

export function getSurveys(params?: {
  search?: string;
  status?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<SurveysIndexResponse>(`/api/surveys${query ? `?${query}` : ""}`);
}

export function getSurvey(surveyId: string) {
  return protectedRequest<SurveyDetailResponse>(`/api/surveys/${encodeURIComponent(surveyId)}`);
}

export function getService(serviceId: string) {
  return protectedRequest<ServiceDetailResponse>(`/api/services/${encodeURIComponent(serviceId)}`);
}

export function getTeam(params?: {
  search?: string;
  outlet_id?: string;
  page?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.outlet_id) searchParams.set("outlet_id", params.outlet_id);
  if (params?.page) searchParams.set("page", params.page);

  const query = searchParams.toString();

  return protectedRequest<TeamIndexResponse>(`/api/team${query ? `?${query}` : ""}`);
}

export function getTeamMember(userId: string) {
  return protectedRequest<TeamMemberDetailResponse>(`/api/team/${encodeURIComponent(userId)}`);
}
