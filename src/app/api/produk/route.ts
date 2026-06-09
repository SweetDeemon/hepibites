import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET() {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const produk = await prisma.produk.findMany({
      orderBy: { created_at: 'desc' },
    })

    return successResponse(produk)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data produk',
      500
    )
  }
}
