import { getMitraSession } from '@/lib/mitra-auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { hitungHarga } from '@/lib/harga'
import { NextRequest } from 'next/server'

export async function GET() {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const transaksi = await prisma.transaksi.findMany({
      where: { mitra_id: session.id, is_cancelled: false },
      include: { produk: true, kredit: true },
      orderBy: { created_at: 'desc' },
    })

    return successResponse(transaksi)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil riwayat transaksi',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const { produk_id, jumlah_karton, metode_bayar, tanggal_jatuh_tempo } = body

    if (!produk_id || !jumlah_karton || !metode_bayar) {
      return errorResponse('produk_id, jumlah_karton, dan metode_bayar wajib diisi', 400)
    }

    if (metode_bayar !== 'cash' && metode_bayar !== 'kredit') {
      return errorResponse('Metode bayar harus cash atau kredit', 400)
    }

    const produk = await prisma.produk.findUnique({ where: { id: produk_id } })
    if (!produk) {
      return errorResponse('Produk tidak ditemukan', 400)
    }

    if (produk.stok < jumlah_karton) {
      return errorResponse(
        `Stok tidak mencukupi. Stok ${produk.varian} saat ini: ${produk.stok} karton`,
        400
      )
    }

    const { hargaPerKarton, totalHarga } = hitungHarga(jumlah_karton)
    const statusBayar = metode_bayar === 'cash' ? 'lunas' : 'belum_lunas'

    await prisma.$transaction(async (tx) => {
      const adminUser = await tx.user.findFirst({ where: { role: 'admin' } })

      const transaksi = await tx.transaksi.create({
        data: {
          mitra_id: session.id,
          produk_id,
          jumlah_karton,
          harga_per_karton: hargaPerKarton,
          total_harga: totalHarga,
          metode_bayar,
          status_bayar: statusBayar,
          created_by: adminUser?.id ?? 'system',
        },
      })

      await tx.produk.update({
        where: { id: produk_id },
        data: { stok: produk.stok - jumlah_karton },
      })

      await tx.stokLog.create({
        data: {
          produk_id,
          tipe: 'keluar',
          jumlah: jumlah_karton,
          referensi_id: transaksi.id,
          keterangan: `Pembelian oleh mitra ${session.nama}`,
        },
      })

      if (metode_bayar === 'kredit') {
        if (!tanggal_jatuh_tempo) {
          throw new Error('Tanggal jatuh tempo wajib diisi untuk pembayaran kredit')
        }
        const maxDue = new Date()
        maxDue.setDate(maxDue.getDate() + 5)
        if (new Date(tanggal_jatuh_tempo) > maxDue) {
          throw new Error('Jatuh tempo maksimal 5 hari dari sekarang')
        }

        await tx.kredit.create({
          data: {
            transaksi_id: transaksi.id,
            mitra_id: session.id,
            jumlah_hutang: totalHarga,
            sisa_hutang: totalHarga,
            tanggal_jatuh_tempo: new Date(tanggal_jatuh_tempo),
          },
        })
      }
    })

    return successResponse(null, 'Pembelian berhasil', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal memproses pembelian',
      500
    )
  }
}
