import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardSummary } from "@/lib/auth";
import { ApiError, API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof getDashboardSummary>>;

  try {
    data = await getDashboardSummary();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    if (error instanceof ApiError && error.status === 503) {
      return (
        <BackendUnavailable
          title="Dashboard belum terhubung"
          message={error.message}
        />
      );
    }

    throw error;
  }

  return (
    <DashboardShell
      data={data}
      legacyDashboardUrl={`${API_BASE_URL}/dashboard`}
    />
  );
}
