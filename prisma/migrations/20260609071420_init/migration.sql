-- CreateEnum
CREATE TYPE "Role" AS ENUM ('super_admin', 'admin', 'finance');

-- CreateEnum
CREATE TYPE "StatusMitra" AS ENUM ('aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('cash', 'kredit');

-- CreateEnum
CREATE TYPE "StatusBayar" AS ENUM ('lunas', 'belum_lunas');

-- CreateEnum
CREATE TYPE "StatusKredit" AS ENUM ('aktif', 'lunas');

-- CreateEnum
CREATE TYPE "TipeStok" AS ENUM ('masuk', 'keluar');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mitra" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "no_hp" TEXT,
    "email" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "StatusMitra" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "harga_satuan" INTEGER NOT NULL DEFAULT 105000,
    "harga_grosir" INTEGER NOT NULL DEFAULT 100000,
    "min_grosir" INTEGER NOT NULL DEFAULT 10,
    "max_grosir" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" TEXT NOT NULL,
    "mitra_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah_karton" INTEGER NOT NULL,
    "harga_per_karton" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    "metode_bayar" "MetodeBayar" NOT NULL,
    "status_bayar" "StatusBayar" NOT NULL DEFAULT 'belum_lunas',
    "created_by" TEXT NOT NULL,
    "is_cancelled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kredit" (
    "id" TEXT NOT NULL,
    "transaksi_id" TEXT NOT NULL,
    "mitra_id" TEXT NOT NULL,
    "jumlah_hutang" INTEGER NOT NULL,
    "jumlah_terbayar" INTEGER NOT NULL DEFAULT 0,
    "sisa_hutang" INTEGER NOT NULL,
    "tanggal_jatuh_tempo" TIMESTAMP(3) NOT NULL,
    "status" "StatusKredit" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokLog" (
    "id" TEXT NOT NULL,
    "produk_id" TEXT NOT NULL,
    "tipe" "TipeStok" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "referensi_id" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Kredit_transaksi_id_key" ON "Kredit"("transaksi_id");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kredit" ADD CONSTRAINT "Kredit_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "Transaksi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kredit" ADD CONSTRAINT "Kredit_mitra_id_fkey" FOREIGN KEY ("mitra_id") REFERENCES "Mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokLog" ADD CONSTRAINT "StokLog_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
