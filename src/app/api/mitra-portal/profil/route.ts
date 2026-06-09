import { getMitraSession } from '@/lib/mitra-auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { geocodeAlamat, shouldGeocode } from '@/lib/geocoding'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const profilSelect = {
  id: true,
  username: true,
  nama: true,
  alamat: true,
  no_hp: true,
  email: true,
  lat: true,
  lng: true,
  status: true,
  created_at: true,
}

export async function GET() {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const mitra = await prisma.mitra.findUnique({
      where: { id: session.id },
      select: profilSelect,
    })

    if (!mitra) return errorResponse('Mitra tidak ditemukan', 404)

    return successResponse(mitra)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil profil',
      500
    )
  }
}

export async function PUT(request: NextRequest) {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const { alamat, no_hp, email, password, password_lama } = body

    const existing = await prisma.mitra.findUnique({ where: { id: session.id } })
    if (!existing) return errorResponse('Mitra tidak ditemukan', 404)

    const data: Record<string, unknown> = {}

    if (alamat !== undefined) {
      data.alamat = alamat
      if (shouldGeocode(alamat, existing.lat, existing.lng)) {
        const result = await geocodeAlamat(alamat)
        if (result) {
          data.lat = result.lat
          data.lng = result.lng
        }
      }
    }

    if (no_hp !== undefined) data.no_hp = no_hp
    if (email !== undefined) data.email = email

    if (password) {
      if (!password_lama) {
        return errorResponse('Password lama wajib diisi untuk mengganti password', 400)
      }
      const valid = await bcrypt.compare(password_lama, existing.password)
      if (!valid) {
        return errorResponse('Password lama salah', 400)
      }
      data.password = await bcrypt.hash(password, 12)
    }

    const mitra = await prisma.mitra.update({
      where: { id: session.id },
      data,
      select: profilSelect,
    })

    return successResponse(mitra, 'Profil berhasil diperbarui')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal memperbarui profil',
      500
    )
  }
}
