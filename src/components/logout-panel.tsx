"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutPanel() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Logout gagal diproses.");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke layanan logout.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="soft-panel p-5 sm:p-6">
        <p className="section-label">Konfirmasi logout</p>
        <h2 className="mt-2 text-2xl font-semibold">Keluar dari session aktif</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Session Laravel akan dihapus, lalu Anda diarahkan kembali ke halaman login.
        </p>

        {error ? (
          <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">
            {error}
          </div>
        ) : null}

        <div className="mobile-stack mt-5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="btn-primary w-full sm:w-auto"
          >
            {isSubmitting ? "Memproses logout..." : "Logout sekarang"}
          </button>
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
