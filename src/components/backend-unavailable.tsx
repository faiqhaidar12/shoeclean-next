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
          <section className="section-block hero-card p-5 sm:p-7">
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

          <aside className="section-dark hero-card p-5 sm:p-7">
            <p className="section-label-dark">
              Checklist
            </p>
            <div className="info-list mt-4">
              <div className="kpi-pill-dark">
                Laravel aktif di port `8000`
              </div>
              <div className="kpi-pill-dark">
                Env Next mengarah ke `http://127.0.0.1:8000`
              </div>
              <div className="kpi-pill-dark">
                Halaman di-refresh setelah backend siap
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
