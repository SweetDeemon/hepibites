import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password,
      nama: 'Super Admin',
      role: 'super_admin',
    },
  })

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      nama: 'Admin HepiBites',
      role: 'admin',
    },
  })

  await prisma.user.upsert({
    where: { username: 'finance' },
    update: {},
    create: {
      username: 'finance',
      password,
      nama: 'Finance HepiBites',
      role: 'finance',
    },
  })

  const varianData = [
    { varian: 'coklat' as const, stok: 50 },
    { varian: 'keju' as const, stok: 40 },
    { varian: 'ayam' as const, stok: 30 },
  ]

  for (const v of varianData) {
    await prisma.produk.upsert({
      where: { nama_varian: { nama: 'HepiBite Snack', varian: v.varian } },
      update: { stok: v.stok },
      create: {
        nama: 'HepiBite Snack',
        varian: v.varian,
        stok: v.stok,
        isi_per_karton: 60,
        harga_satuan: 105000,
        harga_grosir: 100000,
        min_grosir: 10,
        max_grosir: 30,
      },
    })
  }

  const mitraPassword = await bcrypt.hash('mitra123', 12)

  await prisma.mitra.upsert({
    where: { username: 'mitra1' },
    update: {},
    create: {
      username: 'mitra1',
      password: mitraPassword,
      nama: 'Mitra Jombang',
      alamat: 'Jombang, Jawa Timur',
      no_hp: '08123456789',
    },
  })

  console.log('Seed berhasil!')
  console.log('Akun admin: superadmin / admin123, admin / admin123, finance / admin123')
  console.log('Akun mitra: mitra1 / mitra123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
