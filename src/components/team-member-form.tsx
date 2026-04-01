"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { setDashboardFlash } from "@/lib/dashboard-flash";

type OutletOption = {
  id: number;
  name: string;
  slug: string;
};

type RoleOption = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  mode: "create" | "edit";
  outlets: OutletOption[];
  roles: RoleOption[];
  initialValues?: {
    id?: number;
    name?: string;
    email?: string;
    role?: string | null;
    outlet_id?: number | null;
  };
};

export function TeamMemberForm({ mode, outlets, roles, initialValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialValues?.role ?? roles[0]?.slug ?? "staff");
  const [outletId, setOutletId] = useState(String(initialValues?.outlet_id ?? outlets[0]?.id ?? ""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleLabel = useMemo(() => roles.find((item) => item.slug === role)?.name ?? role, [role, roles]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/team" : `/api/team/${initialValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          outlet_id: Number(outletId),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const firstError = payload.errors ? Object.values(payload.errors)[0]?.[0] : null;
        setError(firstError ?? payload.message ?? "User team gagal disimpan.");
        return;
      }

      setDashboardFlash({
        type: "success",
        title: mode === "create" ? "Anggota tim berhasil ditambahkan" : "Data anggota tim berhasil diperbarui",
        message: "Hak akses dan outlet penugasan sudah tersimpan.",
      });
      router.push("/dashboard/team");
      router.refresh();
    } catch {
      setError("Terjadi kendala saat menyimpan user team.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-[0_18px_38px_rgba(25,28,30,0.05)] sm:p-10 lg:p-12">
      <div className="grid gap-9 sm:gap-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Personel outlet</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display-sans)] font-extrabold tracking-[-0.03em] text-brand">
              {mode === "create" ? "Tambah anggota tim baru" : "Rapikan profil anggota tim"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Pastikan role dan penugasan outlet tepat agar akses operasional tim tetap aman dan sesuai struktur bisnis.
            </p>
          </div>

          <div className="soft-panel min-w-[220px] rounded-[1.5rem] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Role aktif</p>
            <p className="mt-3 font-[var(--font-display-sans)] text-3xl font-extrabold tracking-tight text-brand">{roleLabel}</p>
            <p className="mt-2 text-sm text-muted">{mode === "create" ? "Akan dipakai saat akun dibuat" : "Profil akses saat ini"}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <label htmlFor="team-name" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Nama</label>
                <input id="team-name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama user team" className="field-soft" />
              </div>

              <div className="space-y-3">
                <label htmlFor="team-email" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Email</label>
                <input id="team-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="team@outlet.com" className="field-soft" />
              </div>

              <div className="space-y-3">
                <label htmlFor="team-password" className="text-[10px] font-black uppercase tracking-widest text-brand/40">
                  Password {mode === "edit" ? "(opsional)" : ""}
                </label>
                <input
                  id="team-password"
                  type="password"
                  required={mode === "create"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "create" ? "Minimal sesuai default Laravel" : "Kosongkan jika tidak diubah"}
                  className="field-soft"
                />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-line/45 bg-surface/70 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/35">Hak akses dan penugasan</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-3">
                  <label htmlFor="team-role" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Role</label>
                  <select id="team-role" value={role} onChange={(event) => setRole(event.target.value)} className="field-soft">
                    {roles.map((item) => (
                      <option key={item.id} value={item.slug}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label htmlFor="team-outlet" className="text-[10px] font-black uppercase tracking-widest text-brand/40">Outlet</label>
                  <select id="team-outlet" value={outletId} onChange={(event) => setOutletId(event.target.value)} className="field-soft">
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <aside className="section-dark rounded-[1.75rem] p-6 sm:p-7 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Panduan manajemen tim</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/78">
              <p>Gunakan role sesuai kebutuhan operasional agar akses sensitif seperti promosi dan laporan tetap terkendali.</p>
              <p>Hubungkan anggota tim ke outlet yang tepat untuk menjaga scope data dan tindakan mereka di dashboard.</p>
              <p>Untuk akun edit, kosongkan password jika tidak ingin mengubah kredensial login anggota tim tersebut.</p>
            </div>
          </aside>
        </div>
      </div>

      {error ? <div className="mt-4 rounded-[1.25rem] border border-[#f7b9ab] bg-[#fff1ee] px-4 py-4 text-sm text-[#9a3b2b]">{error}</div> : null}

      <div className="mt-9 flex flex-col gap-4 border-t border-line/35 pt-8 sm:flex-row">
        <button type="button" onClick={() => router.push("/dashboard/team")} className="btn-secondary w-full flex-1">
          {mode === "create" ? "Batalkan penambahan" : "Batalkan perubahan"}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex-1">
          {isSubmitting ? "Menyimpan..." : mode === "create" ? "Simpan anggota tim" : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
