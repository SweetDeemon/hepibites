import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { id } = await params
    const body = await request.json()
    const { jumlah_bayar } = body

    if (!jumlah_bayar || jumlah_bayar <= 0) {
      return errorResponse('Jumlah bayar harus lebih dari 0', 400)
    }

    const kredit = await prisma.kredit.findUnique({ where: { id } })
    if (!kredit) {
      return errorResponse('Data kredit tidak ditemukan', 404)
    }

    if (kredit.status === 'lunas') {
      return errorResponse('Kredit sudah lunas', 400)
    }

    if (jumlah_bayar > kredit.sisa_hutang) {
      return errorResponse(
        `Jumlah bayar melebihi sisa hutang (Rp ${kredit.sisa_hutang.toLocaleString('id-ID')})`,
        400
      )
    }

    const sisaBaru = kredit.sisa_hutang - jumlah_bayar
    const statusBaru = sisaBaru === 0 ? 'lunas' : 'aktif'
    const jumlahTerbayarBaru = kredit.jumlah_terbayar + jumlah_bayar

    await prisma.kredit.update({
      where: { id },
      data: {
        jumlah_terbayar: jumlahTerbayarBaru,
        sisa_hutang: sisaBaru,
        status: statusBaru,
      },
    })

    if (statusBaru === 'lunas') {
      await prisma.transaksi.update({
        where: { id: kredit.transaksi_id },
        data: { status_bayar: 'lunas' },
      })
    }

    return successResponse(null, 'Pembayaran berhasil dicatat')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mencatat pembayaran',
      500
    )
  }
}
