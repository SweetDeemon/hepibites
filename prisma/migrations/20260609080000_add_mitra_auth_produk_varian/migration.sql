-- CreateEnum
CREATE TYPE "VarianProduk" AS ENUM ('coklat', 'keju', 'ayam');

-- AlterTable: add columns with defaults first, then alter
ALTER TABLE "Mitra" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Mitra" ADD COLUMN "username" TEXT NOT NULL DEFAULT '';

-- Set default username for existing mitra
UPDATE "Mitra" SET "username" = 'mitra-' || id WHERE "username" = '';

ALTER TABLE "Mitra" ALTER COLUMN "username" DROP DEFAULT;
ALTER TABLE "Mitra" ALTER COLUMN "password" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Produk" ADD COLUMN "isi_per_karton" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Produk" ADD COLUMN "varian" "VarianProduk" NOT NULL DEFAULT 'coklat';

ALTER TABLE "Produk" ALTER COLUMN "varian" DROP DEFAULT;

-- AlterTable: add produk_id with default, then set from first produk
ALTER TABLE "Transaksi" ADD COLUMN "produk_id" TEXT NOT NULL DEFAULT 'default-produk';

ALTER TABLE "Transaksi" ALTER COLUMN "produk_id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Mitra_username_key" ON "Mitra"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Produk_nama_varian_key" ON "Produk"("nama", "varian");

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_produk_id_fkey" FOREIGN KEY ("produk_id") REFERENCES "Produk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
