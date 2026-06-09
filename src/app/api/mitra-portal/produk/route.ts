import { getMitraSession } from '@/lib/mitra-auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET() {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const produk = await prisma.produk.findMany({
      orderBy: [{ nama: 'asc' }, { varian: 'asc' }],
    })

    return successResponse(produk)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data produk',
      500
    )
  }
}
