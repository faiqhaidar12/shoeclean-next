import { SuperAdminFrame } from "@/components/superadmin-frame";
import { SuperAdminPaymentTable } from "@/components/superadmin-payment-table";
import {
  SuperAdminMetricCard,
  SuperAdminPagination,
} from "@/components/superadmin-ui";
import { requireSuperAdminSession } from "@/lib/auth";
import { getSuperAdminPayments, type SuperAdminPageProps } from "@/lib/superadmin";

export const dynamic = "force-dynamic";

function valueOf(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SuperAdminPaymentsPage({ searchParams }: SuperAdminPageProps) {
  const params = (await searchParams) ?? {};
  const [session, data] = await Promise.all([
    requireSuperAdminSession(),
    getSuperAdminPayments({
      search: valueOf(params.search),
      owner_id: valueOf(params.owner_id),
      kind: valueOf(params.kind),
      status: valueOf(params.status),
      page: valueOf(params.page),
    }),
  ]);

  return (
    <SuperAdminFrame
      session={session}
      current="payments"
      eyebrow="Log transaksi Duitku"
      title="Audit semua pembayaran"
      description="Pantau transaksi langganan dan top-up, cek status sinkronisasi, dan buka payload gateway jika perlu investigasi."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetricCard label="Total transaksi" value={data.summary.total.toLocaleString("id-ID")} />
        <SuperAdminMetricCard label="Sukses" value={data.summary.success.toLocaleString("id-ID")} tone="emerald" />
        <SuperAdminMetricCard label="Pending" value={data.summary.pending.toLocaleString("id-ID")} tone="amber" />
        <SuperAdminMetricCard label="Gagal" value={data.summary.failed.toLocaleString("id-ID")} tone="rose" />
      </section>

      <section className="section-block p-5 sm:p-6">
        <form className="grid gap-4 lg:grid-cols-5">
          <input
            name="search"
            defaultValue={data.filters.search}
            placeholder="Cari owner, email, order ID, atau reference"
            className="field-soft lg:col-span-2"
          />
          <select name="owner_id" defaultValue={data.filters.owner_id ?? ""} className="field-soft">
            <option value="">Semua owner</option>
            {data.owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
          <select name="kind" defaultValue={data.filters.kind} className="field-soft">
            <option value="">Semua jenis</option>
            <option value="subscription">Langganan</option>
            <option value="topup">Top Up</option>
          </select>
          <select name="status" defaultValue={data.filters.status} className="field-soft">
            <option value="">Semua status</option>
            <option value="00">Sukses</option>
            <option value="01">Pending</option>
            <option value="02">Dibatalkan</option>
            <option value="03">Gagal</option>
          </select>
          <button type="submit" className="btn-primary lg:col-span-5">
            Terapkan filter
          </button>
        </form>
      </section>

      <SuperAdminPaymentTable transactions={data.transactions.data} />

      <SuperAdminPagination
        basePath="/superadmin/payments"
        page={data.transactions.current_page}
        lastPage={data.transactions.last_page}
        searchParams={{
          search: data.filters.search,
          kind: data.filters.kind,
          status: data.filters.status,
          owner_id: data.filters.owner_id ? String(data.filters.owner_id) : "",
        }}
      />
    </SuperAdminFrame>
  );
}
