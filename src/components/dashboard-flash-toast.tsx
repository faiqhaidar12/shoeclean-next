"use client";

import { DashboardFlash } from "@/lib/dashboard-flash";

type Props = {
  flash: DashboardFlash | null;
  visible: boolean;
  onClose: () => void;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 8.5h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 8v5m0 3h.01M10.3 4.8 3.7 16.2A2 2 0 0 0 5.4 19h13.2a2 2 0 0 0 1.73-2.98L13.73 4.8a2 2 0 0 0-3.46 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardFlashToast({ flash, visible, onClose }: Props) {
  if (!flash) {
    return null;
  }

  const tone =
    flash.type === "success"
      ? "border-emerald-200/80 bg-white text-emerald-900"
      : flash.type === "error"
        ? "border-rose-200/80 bg-white text-rose-900"
        : "border-sky-200/80 bg-white text-sky-900";

  const iconTone =
    flash.type === "success"
      ? "bg-emerald-100 text-emerald-600"
      : flash.type === "error"
        ? "bg-rose-100 text-rose-600"
        : "bg-sky-100 text-sky-600";

  return (
    <div
      className={`pointer-events-none fixed inset-x-4 top-[5.25rem] z-[80] transition-all duration-300 ease-out xl:left-[18rem] xl:right-8 xl:top-6 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto ml-auto flex max-w-xl items-start gap-3 rounded-[1.6rem] border px-4 py-4 shadow-[0_22px_60px_rgba(0,32,69,0.12)] backdrop-blur ${tone}`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconTone}`}>
          {flash.type === "success" ? <CheckIcon /> : flash.type === "error" ? <AlertIcon /> : <InfoIcon />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] opacity-55">
            {flash.type === "success" ? "Berhasil" : flash.type === "error" ? "Perlu perhatian" : "Info"}
          </p>
          <p className="mt-1 text-sm font-bold">{flash.title}</p>
          {flash.message ? <p className="mt-1 text-sm opacity-75">{flash.message}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 transition hover:bg-slate-200"
          aria-label="Tutup notifikasi"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
