import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { id } = await params

    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        mitra: true,
        user: true,
        produk: true,
        kredit: true,
      },
    })

    if (!transaksi) {
      return errorResponse('Transaksi tidak ditemukan', 404)
    }

    return successResponse(transaksi)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil detail transaksi',
      500
    )
  }
}
