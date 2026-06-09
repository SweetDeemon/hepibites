<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/status-production-22c55e?style=for-the-badge">
  <img alt="Status" src="https://img.shields.io/badge/status-production-22c55e?style=for-the-badge">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/next.js-16-000000?style=for-the-badge&logo=nextdotjs">
  <img alt="Next.js" src="https://img.shields.io/badge/next.js-16-000000?style=for-the-badge&logo=nextdotjs">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/postgresql-neon-00e599?style=for-the-badge&logo=postgresql">
  <img alt="Neon" src="https://img.shields.io/badge/postgresql-neon-00e599?style=for-the-badge&logo=postgresql">
</picture>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/prisma-orm-2d3748?style=for-the-badge&logo=prisma">
  <img alt="Prisma" src="https://img.shields.io/badge/prisma-orm-2d3748?style=for-the-badge&logo=prisma">
</picture>

<br />

# HepiBites

**Sistem Manajemen Penjualan Snack** — Solusi pencatatan transaksi, stok, dan kredit untuk usaha snack HepiBites yang berbasis di **Jombang, Jawa Timur**.

---

## Tentang

HepiBites adalah platform web internal yang digunakan untuk mengelola seluruh operasional penjualan snack. Mulai dari pendataan mitra, pencatatan transaksi cash & kredit, manajemen stok otomatis, hingga laporan penjualan harian dan bulanan — semuanya dalam satu sistem.

### Fitur Utama

| Fitur | Deskripsi |
| --- | --- |
| **Manajemen Mitra** | CRUD data mitra, tracking lokasi via peta interaktif (Leaflet + OpenStreetMap) |
| **Transaksi Penjualan** | Pencatatan transaksi dengan perhitungan harga otomatis (ecer & grosir) |
| **Cash & Kredit** | Pembayaran cash langsung lunas, kredit dengan jatuh tempo max 5 hari |
| **Stok Otomatis** | Stok berkurang saat transaksi, restock oleh admin, tercatat di stok log |
| **Portal Mitra** | Mitra dapat login, membeli produk, dan melihat riwayat transaksi sendiri |
| **Laporan** | Rekap penjualan harian & bulanan dengan ringkasan pendapatan |
| **Notifikasi** | Alert stok menipis & tagihan kredit mendekati jatuh tempo |
| **Peta Mitra** | Visualisasi lokasi mitra di area Jombang |

---

## Aturan Bisnis

| Kondisi | Harga Per Karton |
| --- | --- |
| 1 karton | Rp 105.000 |
| 10–30 karton (grosir) | Rp 100.000 |
| Di luar range | Validasi error |

- **1 karton** = 60 pcs
- Harga dihitung otomatis berdasarkan jumlah karton
- Setiap perubahan stok dicatat di `stok_log`
- Transaksi kredit wajib memiliki jatuh tempo (maksimal 5 hari)

---

## Tech Stack

| Teknologi | Penggunaan |
| --- | --- |
| [Next.js 16](https://nextjs.org) (App Router) | Framework frontend & API routes |
| [Neon](https://neon.tech) (PostgreSQL) | Database serverless |
| [Prisma](https://prisma.io) | ORM & migrasi database |
| [NextAuth v5](https://next-auth.js.org) | Autentikasi admin (credentials) |
| [jose](https://github.com/panva/jose) | JWT untuk autentikasi mitra |
| [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://openstreetmap.org) | Peta interaktif |
| [Nominatim](https://nominatim.org) | Geocoding alamat mitra |
| [Vercel](https://vercel.com) | Deployment serverless |

---

## Arsitektur

```
hepibites/
├── src/
│   ├── app/
│   │   ├── api/                    API routes (serverless functions)
│   │   ├── dashboard/              Halaman admin
│   │   ├── mitra/                  Portal mitra
│   │   └── login/                  Halaman login terpadu
│   ├── components/                 Komponen React bersama
│   ├── lib/                        Utility (db, auth, harga, geocoding)
│   └── middleware.ts               Auth guard (admin & mitra)
├── prisma/
│   ├── schema.prisma               Skema database
│   └── seed.ts                     Data awal
└── vercel.json                     Konfigurasi deployment
```

### Hak Akses

| Role | Akses |
| --- | --- |
| **Super Admin** | Full akses seluruh fitur |
| **Admin** | Kelola transaksi, mitra, stok |
| **Finance** | Lihat laporan & pembayaran kredit |
| **Mitra** | Portal sendiri: beli produk, riwayat, profil |

---

## Lisensi

Hak cipta © 2026 HepiBites.
