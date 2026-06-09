import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('tahun') ?? String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('bulan') ?? String(new Date().getMonth() + 1))

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const transaksi = await prisma.transaksi.findMany({
      where: {
        tanggal: { gte: startOfMonth, lte: endOfMonth },
        is_cancelled: false,
      },
      include: { mitra: true },
      orderBy: { tanggal: 'asc' },
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

    const perHari: Record<
      string,
      { tanggal: string; total_transaksi: number; total_pendapatan: number; total_karton: number }
    > = {}
    transaksi.forEach((t) => {
      const hari = t.tanggal.toISOString().split('T')[0]
      if (!perHari[hari]) {
        perHari[hari] = {
          tanggal: hari,
          total_transaksi: 0,
          total_pendapatan: 0,
          total_karton: 0,
        }
      }
      perHari[hari].total_transaksi++
      perHari[hari].total_pendapatan += t.total_harga
      perHari[hari].total_karton += t.jumlah_karton
    })

    return successResponse({
      tahun: year,
      bulan: month,
      total_transaksi: totalTransaksi,
      total_pendapatan: totalPendapatan,
      total_cash: totalCash,
      total_kredit: totalKredit,
      total_karton: totalKarton,
      per_hari: Object.values(perHari),
      transaksi,
    })
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : 'Gagal mengambil laporan bulanan',
      500
    )
  }
}
