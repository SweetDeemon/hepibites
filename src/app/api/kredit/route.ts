import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const mitraId = searchParams.get('mitra_id')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (mitraId) where.mitra_id = mitraId
    if (status && (status === 'aktif' || status === 'lunas')) {
      where.status = status
    }

    const kredit = await prisma.kredit.findMany({
      where,
      include: {
        mitra: true,
        transaksi: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return successResponse(kredit)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data kredit',
      500
    )
  }
}
