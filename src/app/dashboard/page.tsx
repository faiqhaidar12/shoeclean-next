import { redirect } from "next/navigation";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardSummary } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  let data: Awaited<ReturnType<typeof getDashboardSummary>>;
  const params = (await searchParams) ?? {};

  try {
    data = await getDashboardSummary({
      month: params.month,
      year: params.year,
    });
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

  return <DashboardShell data={data} />;
}
