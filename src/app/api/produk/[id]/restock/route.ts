import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { id } = await params
    const body = await request.json()
    const jumlah = body.jumlah

    if (!jumlah || jumlah <= 0) {
      return errorResponse('Jumlah restok harus lebih dari 0', 400)
    }

    const produk = await prisma.produk.findUnique({ where: { id } })
    if (!produk) {
      return errorResponse('Produk tidak ditemukan', 404)
    }

    const [updated] = await prisma.$transaction([
      prisma.produk.update({
        where: { id },
        data: { stok: produk.stok + jumlah },
      }),
      prisma.stokLog.create({
        data: {
          produk_id: id,
          tipe: 'masuk',
          jumlah,
          keterangan: body.keterangan ?? 'Restok stok',
        },
      }),
    ])

    return successResponse(updated, `Berhasil menambah stok ${jumlah} karton`)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal restok produk',
      500
    )
  }
}
