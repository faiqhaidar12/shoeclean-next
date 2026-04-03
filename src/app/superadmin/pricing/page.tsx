import { SuperAdminFrame } from "@/components/superadmin-frame";
import { SuperAdminPricingManager } from "@/components/superadmin-pricing-manager";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminPricing } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

export default async function SuperAdminPricingPage() {
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminPricing(),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="pricing"
      eyebrow="Harga SaaS"
      title="Kelola katalog paket"
      description="Atur harga, benefit, urutan tampil, dan status publish agar landing page dan dashboard owner selalu mengikuti konfigurasi terbaru."
    >
      <SuperAdminPricingManager plans={data.plans} />
    </SuperAdminFrame>
  );
}
