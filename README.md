# Shoeclean Next

Frontend Next.js baru untuk migrasi bertahap dari aplikasi Laravel yang ada di `C:\laragon\www\shoeclean`.

Project ini sengaja dibuat di folder terpisah agar aplikasi existing tetap aman sambil kita memindahkan fitur sedikit demi sedikit.

## Menjalankan project

```bash
npm run dev
```

Jika PowerShell memblokir `npm`, jalankan:

```bash
npm.cmd run dev
```

Lalu buka `http://localhost:3000`.

Set env API terlebih dulu:

```bash
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Opsional untuk error monitoring production dengan Sentry:

```bash
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

## Strategi migrasi

1. Laravel tetap menjadi backend dan domain logic.
2. Next.js menjadi frontend baru.
3. Fitur yang saat ini hidup di Livewire dipindahkan bertahap ke API Laravel.

## Prioritas fase awal

1. Landing page
2. Pricing
3. Tracking order
4. Public order/storefront
5. Auth dan dashboard internal

## Draft endpoint Laravel

- `GET /api/home`
- `GET /api/pricing`
- `GET /api/track/{invoice}`
- `GET /api/outlets/{slug}`
- `POST /api/public-orders`
- `POST /api/login`
- `GET /api/me`

Nama endpoint ini masih draft dan bisa kita sesuaikan nanti.

## Catatan

- Project ini menggunakan Next.js App Router.
- Styling awal memakai Tailwind CSS.
- Fase 1 sudah mulai memakai API Laravel untuk halaman home, pricing, dan track order.
- Storefront publik juga sudah mulai dipindahkan: daftar outlet, detail outlet, submit order, dan halaman sukses order.

## Monitoring Production

Jalur gratis yang direkomendasikan:

1. Vercel Runtime Logs
2. Sentry free plan

Cara pakai di production:

1. Buat project Sentry untuk Next.js.
2. Isi env `NEXT_PUBLIC_SENTRY_DSN` dan `SENTRY_DSN` di Vercel.
3. Jika ingin source map upload yang lebih enak dibaca, isi juga `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, dan `SENTRY_PROJECT`.
4. Redeploy project Next.js.
5. Untuk log cepat, buka deployment/project di Vercel lalu cek Runtime Logs.
6. Untuk error terstruktur, buka issue di dashboard Sentry.

Catatan:

- Tanpa env Sentry, aplikasi tetap jalan normal.
- Dengan env DSN saja, error monitoring sudah aktif.
- Dengan auth token + org + project, stack trace production akan lebih mudah dibaca karena source map bisa ikut ter-upload.
