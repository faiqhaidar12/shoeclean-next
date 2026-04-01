const rawApiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export const API_BASE_URL = rawApiBaseUrl.startsWith("http://") ||
  rawApiBaseUrl.startsWith("https://")
  ? rawApiBaseUrl
  : `https://${rawApiBaseUrl}`;

export type PublicOutlet = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  pickup_fee: number;
  delivery_fee: number;
  has_qris: boolean;
  services_count: number;
};

export type PublicService = {
  id: number;
  name: string;
  unit: string;
  price: number;
  outlet: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type HomeResponse = {
  meta: {
    product_name: string;
    tagline: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primary_cta: { label: string; href: string };
    secondary_cta: { label: string; href: string };
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  services: PublicService[];
  outlets: PublicOutlet[];
};

export type PricingPlan = {
  name: string;
  subtitle: string;
  price: number;
  price_label: string;
  order_limit: number | null;
  max_outlets: number | null;
  description: string;
  cta: string;
  features: string[];
};

export type PricingResponse = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  plans: {
    free: PricingPlan;
    pro: PricingPlan;
    business: PricingPlan;
    topup: {
      name: string;
      subtitle: string;
      price: number;
      price_label: string;
      quota: number;
      description: string;
      cta: string;
    };
  };
  outlets: PublicOutlet[];
};

export type TrackResponse = {
  order: {
    id: number;
    invoice_number: string;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    payment_method: string | null;
    total_price: number;
    notes: string | null;
    order_type: string | null;
    customer: {
      name: string;
      phone: string;
    } | null;
    outlet: {
      name: string;
      address: string | null;
      phone: string | null;
      qris_image_url: string | null;
    } | null;
    items: Array<{
      id: number;
      service_name: string | null;
      quantity: number;
      unit: string | null;
      price: number;
      total_price: number;
    }>;
    timeline: Array<{
      key: string;
      label: string;
      description: string;
      is_active: boolean;
      is_current: boolean;
    }>;
  };
};

export type StorefrontListResponse = {
  filters: {
    search: string;
    province_id: string | null;
    city_id: string | null;
  };
  provinces: Array<{
    id: string;
    name: string;
  }>;
  cities: Array<{
    id: string;
    name: string;
  }>;
  outlets: PublicOutlet[];
};

export type StorefrontOutletResponse = {
  outlet: PublicOutlet & {
    qris_image_url?: string | null;
    qris_notes?: string | null;
  };
  services: Array<{
    id: number;
    name: string;
    unit: string;
    price: number;
  }>;
  sibling_outlets: PublicOutlet[];
  ui: {
    show_branch_selection: boolean;
    order_limit_reached: boolean;
  };
};

export type StorefrontSuccessResponse = {
  outlet: PublicOutlet & {
    qris_image_url?: string | null;
    qris_notes?: string | null;
  };
  order: {
    id: number;
    invoice_number: string;
    order_type: string;
    payment_status: string;
    payment_status_label: string;
    payment_method: string | null;
    payment_method_label: string;
    discount_amount: number;
    total_price: number;
    payment_notes: string | null;
    customer: {
      name: string | null;
      phone: string | null;
    };
    items: Array<{
      id: number;
      service_name: string | null;
      quantity: number;
      unit: string | null;
      total_price: number;
    }>;
  };
};

export type PublicSurveyResponse = {
  survey: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    type: string;
    is_active: boolean;
    outlet: {
      id: number;
      name: string;
      slug: string;
      address: string | null;
      phone: string | null;
    } | null;
    questions: Array<{
      id: number;
      question: string;
      type: "rating" | "text" | "choice";
      options: string[];
      sort_order: number;
    }>;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 60 },
    });
  } catch {
    throw new ApiError(
      `Tidak bisa terhubung ke backend Laravel di ${API_BASE_URL}. Pastikan server Laravel sedang berjalan.`,
      503,
    );
  }

  if (!response.ok) {
    let message = "Request gagal.";

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      // Use the default message when the response body is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function getPublicHome() {
  return request<HomeResponse>("/api/public/home");
}

export function getPublicPricing() {
  return request<PricingResponse>("/api/public/pricing");
}

export function getPublicTracking(invoice: string) {
  return request<TrackResponse>(
    `/api/public/track/${encodeURIComponent(invoice)}`,
  );
}

export function getPublicOutlets(params?: {
  search?: string;
  province_id?: string;
  city_id?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.province_id) searchParams.set("province_id", params.province_id);
  if (params?.city_id) searchParams.set("city_id", params.city_id);

  const query = searchParams.toString();

  return request<StorefrontListResponse>(
    `/api/public/outlets${query ? `?${query}` : ""}`,
  );
}

export function getStorefrontOutlet(
  slug: string,
  options?: { skipBranch?: boolean },
) {
  const searchParams = new URLSearchParams();

  if (options?.skipBranch) {
    searchParams.set("skip_branch", "1");
  }

  const query = searchParams.toString();

  return request<StorefrontOutletResponse>(
    `/api/public/outlets/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`,
  );
}

export function getStorefrontSuccess(slug: string, orderId: string) {
  return request<StorefrontSuccessResponse>(
    `/api/public/outlets/${encodeURIComponent(slug)}/orders/${encodeURIComponent(orderId)}/success`,
  );
}

export function getPublicSurvey(slug: string) {
  return request<PublicSurveyResponse>(
    `/api/public/surveys/${encodeURIComponent(slug)}`,
  );
}
