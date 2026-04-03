import Image from "next/image";
import Link from "next/link";
import { PublicBottomNav } from "@/components/public-bottom-nav";
import { PublicTopNav } from "@/components/public-top-nav";
import { getOptionalAuthSession } from "@/lib/auth";
import { BackendUnavailable } from "@/components/backend-unavailable";
import { ApiError, getPublicHome, type HomeResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuChC3umSBoMQu1TyZT6mfSt_3id4TWJzAGVwYTHiE5Il4ina0zgSMvhD7J9zLH_mIAwMMSiX3VCUoJZxJcDBZCaYcsj6vJmznrYTXLWnlHVWJILFSl4U5TcZoIXT9meLe8X71hO2_3vITsomjefd4rXZ2Nny5y1wKcn6E5gGItixYUa-6mUnQgi8WpymbuN2jvHVy02NzI1maRi_R07J5oag8zkoee6FyrFUCDQpgbBNy3RnIzhOU18ysUoyqrsQ8uJiJXATiRpZ5m3";

const reviewerAvatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCaA8Sv_AMsgFZfWYIdrlShY2enEcOqJfkzwp9vYuDjF8lXIwi-i-bGubGn4JbrNN8EZsRvMDesfJj4LtqsPMdgaAZWdzpzFwSLupILzF-3Uqn3H4PbRaQbCCFAVRC78sj5oarhLU2toWlVv4Kl1u2ecHUBpy3FmNyitpVbVzdLOXxNT8etChZjULsQwul1hxeFy5vduNehtGc0WJUjZnKkwxoyTjDxJbztYw8i7aKyo1i1pzTrCxDvokNvuIGz-aaFZWZ38iHHPnUc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4grwGTLOPynp2SEOSpwp--UeHfD9dP8LkRrYx286JVp3HA7bYEEPEw13JcdgmfeHsKE6ji6SmLIjrJ1HLTzk_aCDGBXiJXMNHckLPVIDAncT0XPJtGELoAo7goW8F3GC2fiEQONnD2SzwW_qjREd7ahQKR7M7k_aJ0YZCH0frkZjF98bb5OBGvDo1Pz1Qjslwq2VibJyBgKsofokU1LbS0_fOZfzHx5jH-uZ9WuC0STeUIeNd_vh6frjRkzGxQxWG7izbf9TogTsi",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB8EY9E3lik2l4XNTIRDC-XcnSYTLGu1elitDO6ZC6cP_ops5MO1rBb40oaLWNzPMBD39FNtDq8HVqN5VgzQOEyZUGSlz3yZqg9lfkuB74LXo2CtU_e4LmbybN_L3q8RAM1bfUQC2Qf6JJGjMfP36rbn8n8omG1JZBXhHQGuJTWJSVKhkiiNDnpLpXJ2b9j3F7hTy7EuxkC7elRF_o-Lt5IHKy6mqwr314KhaHuJbEDuKOmfgydbizwoVVd5Oln7jRxl2Q3ppEnvYJQ",
];

function SparkleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" fill="currentColor" />
    </svg>
  );
}

function TrendIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 16l5-5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TeamIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M20 19v-1a3 3 0 0 0-2-2.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 5.2a3 3 0 0 1 0 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BarsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 19V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 19V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3.6l2.6 5.26 5.8.85-4.2 4.1.99 5.79L12 16.88 6.81 19.6l.99-5.79-4.2-4.1 5.8-.85L12 3.6Z" />
    </svg>
  );
}

export default async function Home() {
  const session = await getOptionalAuthSession();
  let data: HomeResponse | null = null;
  let message = "";

  try {
    data = await getPublicHome();
  } catch (error) {
    message =
      error instanceof ApiError
        ? error.message
        : "Terjadi kendala saat memuat data halaman publik.";
  }

  if (!data) {
    return <BackendUnavailable message={message} />;
  }

  const testimonials = [
    {
      name: "Raka",
      role: "Pemilik usaha perawatan sepatu",
      text:
        "Pelanggan jadi lebih tenang karena bisa cek status pesanan sendiri. Tim kami juga lebih hemat waktu saat jam sibuk.",
    },
    {
      name: "Nadia",
      role: "Admin outlet",
      text:
        "Form pemesanan dari HP terasa lebih mudah dipahami. Banyak pelanggan langsung lanjut pesan tanpa harus banyak bertanya.",
    },
    {
      name: "Fajar",
      role: "Pemilik outlet",
      text:
        "Tampilan yang rapi bikin usaha kami terlihat lebih profesional, terutama saat pelanggan baru pertama kali memesan.",
    },
  ];

  return (
    <main className="public-home-shell">
      <PublicTopNav
        current="home"
        authenticated={session?.authenticated}
        dashboardHref={session?.user.is_superadmin ? "/superadmin" : "/dashboard"}
      />

      <div className="public-content-offset">
        <section className="public-hero-intro motion-enter relative overflow-hidden py-16 sm:py-20 md:py-24">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="motion-enter motion-delay-1 lg:col-span-7">
              <div className="motion-enter-fast mb-8 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5" style={{ animationDelay: "0.08s" }}>
                <SparkleIcon className="h-4 w-4 text-accent-ink" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-accent-ink">
                  Website order dan dashboard untuk bisnis perawatan sepatu
                </span>
              </div>

              <h1 className="motion-enter-fast max-w-4xl font-[var(--font-display-sans)] text-5xl font-extrabold leading-[1.08] tracking-[-0.05em] text-brand md:text-7xl" style={{ animationDelay: "0.14s" }}>
                Buat pengalaman{" "}
                <span className="bg-[linear-gradient(135deg,#002045_0%,#1a365d_100%)] bg-clip-text text-transparent">
                  pesan, lacak, dan kelola pesanan
                </span>{" "}
                yang lebih rapi dan meyakinkan.
              </h1>

              <p className="motion-enter-fast mt-8 max-w-xl text-lg leading-relaxed text-muted" style={{ animationDelay: "0.2s" }}>
                ShoeClean membantu usaha perawatan sepatu menerima pesanan online, menampilkan proses pengerjaan dengan jelas, dan memberi pengalaman yang nyaman untuk pelanggan maupun tim outlet.
              </p>

              <div className="motion-enter-fast mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "0.26s" }}>
                <Link href="/register" className="rounded-full bg-[linear-gradient(135deg,#002045_0%,#1a365d_100%)] px-8 py-4 text-center text-lg font-bold text-white shadow-xl shadow-brand/20 transition-transform duration-300 hover:scale-[1.02]">
                  Coba untuk Bisnis Anda
                </Link>
                <Link href="/pricing" className="flex items-center justify-center gap-2 rounded-full bg-surface-soft px-8 py-4 text-center text-lg font-bold text-brand transition-colors hover:bg-surface-muted">
                  Lihat Harga
                </Link>
              </div>
            </div>

            <div className="motion-enter motion-delay-2 relative lg:col-span-5">
              <div className="relative z-10 rounded-[2rem] bg-white p-6 shadow-2xl">
                <Image
                  src={heroImage}
                  alt="Sneaker premium sedang dibersihkan dengan teliti"
                  width={1200}
                  height={900}
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  priority
                  className="h-[450px] w-full rounded-2xl object-cover"
                />

                <div className="motion-enter-fast motion-float absolute -bottom-6 -left-4 flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-xl" style={{ animationDelay: "0.35s" }}>
                  <div className="rounded-full bg-accent-soft p-3">
                    <TrendIcon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand">Pesanan lebih tertata</div>
                    <div className="text-xs text-muted">Pelanggan bisa cek status tanpa repot</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent-soft/20 blur-3xl" />
            </div>
          </div>
        </section>

        <section className="motion-enter motion-delay-2 bg-surface-soft py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <h2 className="font-[var(--font-display-sans)] text-3xl font-extrabold text-brand md:text-4xl">
                Satu produk untuk menjual, mengelola, dan menumbuhkan bisnis Anda.
              </h2>
              <p className="mt-6 text-lg text-muted">
                Dari halaman pemesanan sampai pelacakan status, semuanya dirancang agar pelanggan merasa nyaman dan bisnis Anda terlihat lebih profesional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="motion-enter-fast flex flex-col justify-between rounded-[2rem] bg-white p-10 md:col-span-2" style={{ animationDelay: "0.08s" }}>
                <div className="max-w-md">
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-strong">
                    <TrendIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-brand">Pelacakan pesanan yang jelas</h3>
                  <p className="text-muted">
                    Pelanggan bisa melihat perkembangan pesanan dengan mudah, tanpa perlu bolak-balik chat untuk menanyakan status.
                  </p>
                </div>
                <div className="mt-12 rounded-xl border border-line bg-surface-soft p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                      Pengalaman pelanggan
                    </span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-ink">
                      Lacak
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full w-2/3 bg-accent" />
                  </div>
                </div>
              </div>

              <div className="motion-enter-fast flex flex-col justify-between rounded-[2rem] bg-brand-strong p-10 text-white" style={{ animationDelay: "0.16s" }}>
                <div>
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <TeamIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold">Bantu tim bekerja lebih rapi</h3>
                  <p className="text-white/70">
                    Atur pesanan, layanan, pelanggan, dan aktivitas outlet dari satu tempat yang mudah dipahami.
                  </p>
                </div>
                <div className="mt-8 flex -space-x-3">
                  {[0, 1, 2].map((index) => (
                    <Image
                      key={index}
                      src={reviewerAvatars[index]}
                      alt="staf"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border-2 border-brand-strong object-cover"
                    />
                  ))}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-strong bg-accent text-xs font-bold text-white">
                    +12
                  </div>
                </div>
              </div>

              <div className="motion-enter-fast rounded-[2rem] bg-white p-10" style={{ animationDelay: "0.24s" }}>
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
                  <BarsIcon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-brand">Harga yang mudah dipahami</h3>
                <p className="text-muted">
                  Tampilkan pilihan harga dan layanan dengan tampilan yang rapi agar pelanggan lebih yakin untuk memesan.
                </p>
              </div>

              <div className="motion-enter-fast rounded-[2rem] bg-[linear-gradient(135deg,#006a66_0%,#00504d_100%)] p-10 text-white md:col-span-2" style={{ animationDelay: "0.32s" }}>
                <div className="flex flex-col gap-12 md:flex-row md:items-center">
                  <div className="flex-1">
                    <h3 className="mb-4 text-2xl font-bold">Pantau bisnis dengan lebih tenang</h3>
                    <p className="mb-8 text-white/80">
                      Lihat pesanan, pemasukan, dan perkembangan outlet dari dashboard yang lebih ringan dan mudah dibaca.
                    </p>
                    <Link href="/dashboard" className="rounded-full bg-white px-6 py-2 text-sm font-bold text-accent">
                      Buka Dasbor
                    </Link>
                  </div>
                  <div className="flex h-32 flex-1 items-end justify-around gap-2">
                    <div className="h-[40%] w-full rounded-t-lg bg-white/20" />
                    <div className="h-[60%] w-full rounded-t-lg bg-white/40" />
                    <div className="h-[90%] w-full rounded-t-lg bg-white/60" />
                    <div className="h-[75%] w-full rounded-t-lg bg-white" />
                    <div className="h-[100%] w-full rounded-t-lg bg-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="motion-enter motion-delay-3 overflow-hidden py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 flex flex-col justify-between md:flex-row md:items-end">
              <div className="max-w-xl">
                <h2 className="font-[var(--font-display-sans)] text-3xl font-extrabold text-brand md:text-4xl">
                  Dibuat untuk usaha yang ingin tampil lebih meyakinkan di mata pelanggan.
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <div key={item.name} className="motion-enter-fast rounded-3xl border border-line/30 bg-white p-8 shadow-sm" style={{ animationDelay: `${0.08 * (index + 1)}s` }}>
                  <div className="mb-6 flex gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <StarIcon key={starIndex} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="mb-8 leading-relaxed text-muted">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={reviewerAvatars[index]}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-brand">{item.name}</div>
                      <div className="text-xs text-muted">{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="motion-enter motion-delay-4 py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[3rem] bg-brand-strong p-12 text-center text-white md:p-20">
              <div className="relative z-10">
                <h2 className="motion-enter-fast mb-8 font-[var(--font-display-sans)] text-4xl font-extrabold tracking-[-0.04em] md:text-5xl" style={{ animationDelay: "0.1s" }}>
                  Siap membuat proses pesan dan lacak sepatu jadi lebih nyaman?
                </h2>
                <p className="motion-enter-fast mx-auto mb-12 max-w-2xl text-lg text-white/70" style={{ animationDelay: "0.18s" }}>
                  Mulai dari pemesanan, pelacakan, sampai pengelolaan outlet, semuanya bisa berjalan dalam satu alur yang rapi.
                </p>
                <div className="motion-enter-fast flex flex-col justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.26s" }}>
                  <Link href="/register" className="rounded-full bg-accent px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-[#007b77]">
                    Mulai Sekarang
                  </Link>
                  <Link href="/order" className="rounded-full border border-white/20 bg-white/10 px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-white/20">
                    Coba Alur Pesan
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#adc7f7]/10 blur-[100px]" />
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
          <div className="mb-0">
            <div className="mb-2 font-[var(--font-display-sans)] text-xl font-black text-brand">
              ShoeClean
            </div>
            <p className="text-xs text-slate-400">
              {"© 2026 ShoeClean. Hak cipta dilindungi."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/pricing" className="text-xs text-slate-400 transition-colors hover:text-brand">
              Ketentuan
            </Link>
            <Link href="/pricing" className="text-xs text-slate-400 transition-colors hover:text-brand">
              Privasi
            </Link>
            <Link href="/track" className="text-xs text-slate-400 transition-colors hover:text-brand">
              Lacak Pesanan
            </Link>
            <Link href="/order" className="text-xs text-slate-400 transition-colors hover:text-brand">
              Pesan
            </Link>
          </div>
        </div>
      </footer>

      <PublicBottomNav current="home" />
    </main>
  );
}




