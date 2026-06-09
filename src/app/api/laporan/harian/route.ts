import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('tanggal')
    const tanggal = date ? new Date(date) : new Date()

    const startOfDay = new Date(tanggal)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(tanggal)
    endOfDay.setHours(23, 59, 59, 999)

    const transaksi = await prisma.transaksi.findMany({
      where: {
        tanggal: { gte: startOfDay, lte: endOfDay },
        is_cancelled: false,
      },
      include: { mitra: true },
    })

    const totalTransaksi = transaksi.length
    const totalPendapatan = transaksi.reduce(
      (sum, t) => sum + t.total_harga,
      0
    )
    const totalCash = transaksi
      .filter((t) => t.metode_bayar === 'cash')
      .reduce((sum, t) => sum + t.total_harga, 0)
    const totalKredit = transaksi
      .filter((t) => t.metode_bayar === 'kredit')
      .reduce((sum, t) => sum + t.total_harga, 0)
    const totalKarton = transaksi.reduce(
      (sum, t) => sum + t.jumlah_karton,
      0
    )

    return successResponse({
      tanggal: tanggal.toISOString().split('T')[0],
      total_transaksi: totalTransaksi,
      total_pendapatan: totalPendapatan,
      total_cash: totalCash,
      total_kredit: totalKredit,
      total_karton: totalKarton,
      transaksi,
    })
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil laporan harian',
      500
    )
  }
}
