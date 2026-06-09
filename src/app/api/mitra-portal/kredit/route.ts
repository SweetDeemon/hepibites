import { getMitraSession } from '@/lib/mitra-auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET() {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const kredit = await prisma.kredit.findMany({
      where: { mitra_id: session.id },
      include: { transaksi: { include: { produk: true } } },
      orderBy: { created_at: 'desc' },
    })

    const totalHutang = kredit
      .filter((k) => k.status === 'aktif')
      .reduce((sum, k) => sum + k.sisa_hutang, 0)

    return successResponse({
      kredit,
      total_hutang_aktif: totalHutang,
    })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data kredit',
      500
    )
  }
}
