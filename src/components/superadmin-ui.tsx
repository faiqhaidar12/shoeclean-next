import Link from "next/link";
import type { ReactNode } from "react";

export function formatSuperAdminCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSuperAdminDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
}

export function SuperAdminMetricCard({
  label,
  value,
  hint,
  tone = "light",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "light" | "indigo" | "purple" | "rose" | "emerald" | "amber";
}) {
  const toneClass = {
    light: "bg-white text-brand",
    indigo: "bg-gradient-to-br from-[#111827] to-[#312e81] text-white",
    purple: "bg-gradient-to-br from-[#6d28d9] to-[#a855f7] text-white",
    rose: "bg-gradient-to-br from-[#dc2626] to-[#fb7185] text-white",
    emerald: "bg-gradient-to-br from-[#059669] to-[#14b8a6] text-white",
    amber: "bg-gradient-to-br from-[#d97706] to-[#fb923c] text-white",
  }[tone];

  const mutedClass = tone === "light" ? "text-brand/40" : "text-white/60";

  return (
    <article className={`rounded-[2rem] p-7 shadow-[0_24px_50px_rgba(15,23,42,0.08)] ${toneClass}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedClass}`}>{label}</p>
      <p className="mt-4 font-[var(--font-display-sans)] text-4xl font-black tracking-[-0.06em]">
        {value}
      </p>
      {hint ? <p className={`mt-3 text-[11px] font-black uppercase tracking-[0.2em] ${mutedClass}`}>{hint}</p> : null}
    </article>
  );
}

export function SuperAdminStatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "emerald" | "amber" | "rose" | "blue" | "purple" | "slate";
}) {
  const className = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  }[tone];

  return (
    <span className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${className}`}>
      {label}
    </span>
  );
}

export function SuperAdminTableShell({
  columns,
  children,
  empty,
  minWidth = 1100,
}: {
  columns: Array<{ label: string; align?: "left" | "right"; className?: string }>;
  children: ReactNode;
  empty?: boolean;
  minWidth?: number;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
      <div className="overflow-x-auto">
        <div style={{ minWidth }} className="w-full">
          <div className="grid border-b border-black/5 bg-slate-50 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand/35" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((column) => (
              <div
                key={column.label}
                className={`${column.align === "right" ? "text-right" : "text-left"} ${column.className ?? ""}`}
              >
                {column.label}
              </div>
            ))}
          </div>
          {empty ? (
            <div className="px-6 py-10 text-center text-sm font-semibold text-brand/45">
              Belum ada data yang cocok dengan filter saat ini.
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export function SuperAdminPagination({
  basePath,
  page,
  lastPage,
  searchParams,
}: {
  basePath: string;
  page: number;
  lastPage: number;
  searchParams: Record<string, string>;
}) {
  if (lastPage <= 1) return null;

  function pageHref(target: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-black/5 bg-white px-4 py-4 text-xs font-bold text-brand/60 shadow-sm">
      <span>
        Halaman {page} dari {lastPage}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={pageHref(Math.max(1, page - 1))}
          className={`rounded-full px-4 py-2 ${page <= 1 ? "pointer-events-none bg-slate-100 text-slate-300" : "bg-slate-100 text-brand"}`}
        >
          Sebelumnya
        </Link>
        <Link
          href={pageHref(Math.min(lastPage, page + 1))}
          className={`rounded-full px-4 py-2 ${page >= lastPage ? "pointer-events-none bg-slate-100 text-slate-300" : "bg-slate-100 text-brand"}`}
        >
          Berikutnya
        </Link>
      </div>
    </div>
  );
}
