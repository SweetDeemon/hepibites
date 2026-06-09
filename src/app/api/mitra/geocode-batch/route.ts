import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { geocodeAlamat } from '@/lib/geocoding'

export async function POST() {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const mitraList = await prisma.mitra.findMany({
      where: {
        alamat: { not: null },
        lat: null,
        lng: null,
        status: 'aktif',
      },
    })

    if (mitraList.length === 0) {
      return successResponse({ processed: 0, updated: 0 }, 'Tidak ada mitra yang perlu di-geocode')
    }

    let updated = 0

    for (let i = 0; i < mitraList.length; i++) {
      const m = mitraList[i]
      const result = await geocodeAlamat(m.alamat!)

      if (result) {
        await prisma.mitra.update({
          where: { id: m.id },
          data: { lat: result.lat, lng: result.lng },
        })
        updated++
      }

      if (i < mitraList.length - 1) {
        await new Promise((r) => setTimeout(r, 1100))
      }
    }

    return successResponse(
      { processed: mitraList.length, updated },
      `Berhasil memproses ${mitraList.length} mitra, ${updated} terupdate`
    )
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal geocode batch',
      500
    )
  }
}
