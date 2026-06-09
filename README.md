# HepiBites 🍪

Sistem manajemen penjualan snack berbasis web. Admin dapat mengelola mitra, mencatat transaksi penjualan (cash & kredit), dan stok produk berkurang otomatis setiap ada transaksi.

> **Lokasi operasional:** Jombang, Jawa Timur

---

## Fitur

- **Manajemen Mitra** — CRUD data mitra, tracking lokasi via peta interaktif (Leaflet + OpenStreetMap)
- **Transaksi Penjualan** — pencatatan transaksi dengan perhitungan harga otomatis (ecer & grosir)
- **Pembayaran Cash & Kredit** — kredit dengan jatuh tempo max 5 hari, pelunasan parsial
- **Stok Otomatis** — stok berkurang saat transaksi, restock oleh admin
- **Portal Mitra** — mitra login, beli produk, riwayat transaksi
- **Laporan** — rekap penjualan harian & bulanan
- **Notifikasi** — alert stok minim & tagihan jatuh tempo
- **Peta Mitra** — visualisasi lokasi mitra di area Jombang

---

## Tech Stack

|            |                                                                 |
| ---------- | --------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                  |
| Database   | PostgreSQL via [Neon](https://neon.tech) (serverless)           |
| ORM        | [Prisma](https://prisma.io)                                     |
| Auth Admin | [NextAuth v5](https://next-auth.js.org) (credentials)           |
| Auth Mitra | JWT custom ([jose](https://github.com/panva/jose))              |
| Peta       | [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://openstreetmap.org) |
| Geocoding  | [Nominatim](https://nominatim.org)                              |
| Deployment | [Vercel](https://vercel.com) (serverless)                       |

---

## Aturan Bisnis

| Kondisi                              | Harga                            |
| ------------------------------------ | -------------------------------- |
| 1 karton                             | Rp 105.000                       |
| 10–30 karton (grosir)                | Rp 100.000/karton                |
| Di luar range                        | Validasi error                   |

---

## Mulai Cepat

```bash
# Clone
git clone https://github.com/SweetDeemon/hepibites.git
cd hepibites

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# isi DATABASE_URL, NEXTAUTH_SECRET, dll.

# Setup database
npx prisma migrate dev
npx prisma db seed

# Jalankan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
DATABASE_URL=postgresql://...       # Koneksi Neon
NEXTAUTH_SECRET=...                 # Secret NextAuth
NEXTAUTH_URL=http://localhost:3000  # atau URL Vercel
```

---

## Akun Default (Seed)

| Role         | Username      | Password  |
| ------------ | ------------- | --------- |
| Super Admin  | superadmin    | admin123  |
| Admin        | admin         | admin123  |
| Finance      | finance       | admin123  |
| Mitra        | mitra1        | mitra123  |

---

## Struktur Folder

```
src/
├── app/
│   ├── api/              # API routes (serverless)
│   ├── dashboard/        # Halaman admin
│   ├── mitra/            # Portal mitra
│   └── login/            # Halaman login terpadu
├── components/           # Komponen React bersama
├── lib/                  # Utility (db, auth, harga, geocoding)
└── middleware.ts         # Auth guard
```

---

## Lisensi

Hak cipta © 2026 HepiBites.
