type Props = {
  title?: string;
  message: string;
};

export function BackendUnavailable({
  title = "Backend belum terhubung",
  message,
}: Props) {
  return (
    <main className="app-shell">
      <section className="page-frame px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className="section-block p-5 sm:p-7">
            <span className="eyebrow">Koneksi backend</span>
            <h1 className="headline mt-4">{title}</h1>
            <p className="subcopy mt-4">{message}</p>
            <div className="soft-panel mt-6 p-4 text-sm leading-7 text-muted">
              Jalankan Laravel lebih dulu dari folder
              {" "}
              <code>C:\laragon\www\shoeclean</code>
              {" "}
              dengan
              {" "}
              <code>php artisan serve --host=127.0.0.1 --port=8000</code>
              {" "}
              lalu refresh halaman Next.js.
            </div>
          </section>

          <aside className="section-block bg-[#183a34] p-5 text-white sm:p-7">
            <p className="text-xs uppercase tracking-[0.22em] text-white/65">
              Checklist
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-3">
                Laravel aktif di port `8000`
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-3">
                Env Next mengarah ke `http://127.0.0.1:8000`
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/8 px-4 py-3">
                Halaman di-refresh setelah backend siap
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
