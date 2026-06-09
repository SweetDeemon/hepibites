# HepiBites — OpenCode Agent Context

## Tentang Project

HepiBites adalah sistem manajemen penjualan snack berbasis web. Admin dapat mengelola mitra, mencatat transaksi penjualan (cash & kredit), dan stok produk berkurang otomatis setiap ada transaksi.

---

## Produk

- **Nama produk:** HepiBite Snack
- **Satuan:** Karton
- **Harga:**
  - 1 karton → Rp 105.000
  - 10–30 karton → Rp 100.000 per karton
- Harga dihitung otomatis berdasarkan jumlah karton yang dibeli

---

## Fitur Utama

- **Manajemen Mitra** — CRUD data mitra, tracking aktivitas & lokasi
- **Transaksi Penjualan** — pencatatan lengkap per transaksi
- **Pembayaran Cash** — langsung lunas saat transaksi
- **Pembayaran Kredit** — hutang tercatat per mitra, ada jatuh tempo
- **Stok Otomatis** — stok berkurang saat transaksi tersimpan
- **Laporan** — rekap penjualan harian & bulanan

---

## Struktur Folder

```
hepibites/
├── src/
│   ├── auth/            # Login, session, role guard
│   ├── mitra/           # CRUD mitra, tracking
│   ├── produk/          # Data produk, manajemen stok
│   ├── transaksi/       # Buat & lihat transaksi penjualan
│   ├── pembayaran/      # Cash & kredit, pelunasan
│   ├── laporan/         # Dashboard & export laporan
│   └── notifikasi/      # Alert stok minim & tagihan jatuh tempo
├── prisma/ atau models/ # Skema database
├── routes/              # Definisi API routes
├── middleware/          # Auth & role middleware
├── tests/               # Unit & integration test
└── public/              # Aset statis (jika ada frontend)
```

---

## Model Data Utama

### Mitra
```
id, nama, alamat, no_hp, email, status (aktif/nonaktif), created_at
```

### Produk
```
id, nama, stok, harga_satuan (105000), harga_grosir (100000), min_grosir (10), max_grosir (30)
```

### Transaksi
```
id, mitra_id, tanggal, jumlah_karton, harga_per_karton, total_harga,
metode_bayar (cash/kredit), status_bayar (lunas/belum_lunas), created_by
```

### Kredit
```
id, transaksi_id, mitra_id, jumlah_hutang, jumlah_terbayar,
sisa_hutang, tanggal_jatuh_tempo, status (aktif/lunas)
```

### Stok Log
```
id, produk_id, tipe (masuk/keluar), jumlah, referensi_id, keterangan, created_at
```

---

## Aturan Bisnis (Business Rules)

1. **Harga otomatis:**
   - `jumlah_karton == 1` → harga Rp 105.000
   - `10 <= jumlah_karton <= 30` → harga Rp 100.000
   - Di luar range ini → validasi error atau konfirmasi manual

2. **Stok:**
   - Stok berkurang saat transaksi berstatus `tersimpan/konfirmasi`
   - Jika stok tidak cukup → transaksi ditolak dengan pesan error
   - Stok bertambah saat admin melakukan input restock

3. **Kredit:**
   - Transaksi kredit mencatat hutang penuh di tabel `kredit`
   - Pelunasan parsial diperbolehkan, `sisa_hutang` diupdate
   - Status kredit berubah `lunas` otomatis saat `sisa_hutang == 0`

4. **Role:**
   - `super_admin` — full akses
   - `admin` — kelola transaksi, mitra, stok
   - `finance` — hanya lihat laporan & pembayaran kredit

---

## Konvensi Kode

- Nama fungsi: camelCase (`createTransaksi`, `updateStok`)
- Nama file: kebab-case (`transaksi-controller.js`)
- Nama tabel DB: snake_case (`transaksi_penjualan`, `stok_log`)
- Semua response API menggunakan format:
  ```json
  { "success": true, "data": {}, "message": "..." }
  ```
- Error response:
  ```json
  { "success": false, "error": "Pesan error", "code": 400 }
  ```

---

## API Endpoints Utama

```
POST   /api/auth/login
GET    /api/mitra
POST   /api/mitra
PUT    /api/mitra/:id
DELETE /api/mitra/:id

GET    /api/produk
PUT    /api/produk/:id/restock

GET    /api/transaksi
POST   /api/transaksi           ← stok berkurang di sini
GET    /api/transaksi/:id

GET    /api/kredit
POST   /api/kredit/:id/bayar    ← pelunasan kredit

GET    /api/laporan/harian
GET    /api/laporan/bulanan
```

---

## Hal yang Perlu Diperhatikan Agent

- Selalu validasi stok sebelum menyimpan transaksi baru
- Kalkulasi harga harus mengikuti aturan tier di atas — jangan hardcode
- Setiap perubahan stok wajib dicatat di tabel `stok_log`
- Jangan hapus data transaksi — gunakan soft delete atau flag `is_cancelled`
- Semua endpoint yang mengubah data wajib dilindungi middleware auth & role
- Gunakan database transaction (atomic) untuk operasi: simpan transaksi + kurangi stok + catat kredit (jika kredit)

---

## Deployment — Vercel

Project ini di-deploy menggunakan **Vercel**.

### Stack yang Direkomendasikan untuk Vercel

- **Framework:** Next.js (App Router) — paling kompatibel dengan Vercel
- **Database:** PostgreSQL via [Neon](https://neon.tech) atau [Supabase](https://supabase.com) (serverless-friendly)
- **ORM:** Prisma
- **Auth:** NextAuth.js atau Clerk

### Struktur Folder untuk Next.js + Vercel

```
hepibites/
├── app/
│   ├── api/                  # API Routes (serverless functions)
│   │   ├── auth/
│   │   ├── mitra/
│   │   ├── transaksi/
│   │   ├── kredit/
│   │   ├── produk/
│   │   └── laporan/
│   ├── (dashboard)/          # Halaman admin
│   └── layout.tsx
├── prisma/
│   └── schema.prisma
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   └── auth.ts
├── middleware.ts              # Auth guard
├── .env.local                 # ENV lokal (jangan di-commit)
├── .env.example               # Template ENV
└── vercel.json                # Konfigurasi Vercel (opsional)
```

### Aturan Penting untuk Vercel

- **Jangan gunakan file system** untuk menyimpan data — Vercel serverless bersifat stateless
- **Prisma:** selalu gunakan singleton client agar tidak kehabisan koneksi database:
  ```ts
  // lib/db.ts
  import { PrismaClient } from '@prisma/client'
  const globalForPrisma = global as unknown as { prisma: PrismaClient }
  export const prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
- **API timeout:** Vercel Hobby plan timeout 10 detik, Pro 60 detik — hindari query berat tanpa pagination
- **Environment variables** wajib diset di Vercel Dashboard → Settings → Environment Variables

### Environment Variables yang Dibutuhkan

```env
DATABASE_URL=postgresql://...       # Koneksi database (Neon/Supabase)
NEXTAUTH_SECRET=...                  # Secret untuk session auth
NEXTAUTH_URL=https://hepibites.vercel.app
```

### Perintah Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy pertama kali (dari folder project)
vercel

# Deploy ke production
vercel --prod
```

### Cara Kerja Auto-Deploy

Setelah project dihubungkan ke GitHub:
1. Push ke branch `main` → otomatis deploy ke production
2. Push ke branch lain → otomatis deploy ke preview URL
3. Setiap PR mendapat preview URL tersendiri untuk testing

### vercel.json (Opsional)

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

---

## Peta & Lokasi

### Stack Map
- **Peta:** Leaflet.js + OpenStreetMap (gratis, tanpa API key)
- **Geocoding:** Nominatim (OpenStreetMap) — konversi alamat ke koordinat
- **Library:** `leaflet` + `react-leaflet`

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

### Lokasi Default

HepiBites berbasis di **Jombang, Jawa Timur**.

```ts
// lib/map-config.ts
export const DEFAULT_CENTER = {
  lat: -7.5469,
  lng: 112.2384, // Koordinat pusat Kota Jombang
  zoom: 13
}
```

### Geocoding Mitra di Area Jombang

```ts
// Contoh query Nominatim untuk area Jombang
const url = `https://nominatim.openstreetmap.org/search?q=${alamat},Jombang,Jawa Timur&format=json&limit=1`
```

### Aturan Penggunaan Nominatim
- Maksimal **1 request per detik** (rate limit)
- Wajib sertakan header `User-Agent: HepiBites/1.0`
- Simpan hasil geocoding di kolom `lat` & `lng` tabel `mitra` — jangan request ulang jika sudah ada

### Catatan Next.js + Leaflet
- Leaflet tidak support SSR — selalu gunakan `dynamic import` dengan `ssr: false`
```tsx
// components/MitraMap.tsx
import dynamic from 'next/dynamic'
const MapClient = dynamic(() => import('./MapClient'), { ssr: false })
```

---

## Konteks Tambahan

- Bahasa antarmuka: **Bahasa Indonesia**
- Target pengguna: admin internal perusahaan HepiBites
- Lokasi operasional: **Jombang, Jawa Timur** (koordinat default: -7.5469, 112.2384)
- Prioritas utama: akurasi data stok dan pencatatan kredit yang rapi
- Platform deploy: **Vercel** (serverless, stateless — semua state di database)
