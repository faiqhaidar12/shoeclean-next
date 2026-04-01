"use client";

import { useRouter } from "next/navigation";
import { LogoutConfirmation } from "@/components/logout-confirmation";

export function LogoutPanel() {
  const router = useRouter();

  return (
    <div className="max-w-xl">
      <div className="soft-panel p-5 sm:p-6">
        <p className="section-label">Konfirmasi logout</p>
        <h2 className="mt-2 text-2xl font-semibold">Keluar dari session aktif</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Session Laravel akan dihapus, lalu Anda diarahkan kembali ke halaman login.
        </p>

        <div className="mobile-stack mt-5">
          <LogoutConfirmation label="Logout sekarang" className="btn-primary w-full sm:w-auto" />
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary w-full sm:w-auto"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
