import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { geocodeAlamat, shouldGeocode } from '@/lib/geocoding'

const mitraSelect = {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.mitra.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Mitra tidak ditemukan', 404)
    }

    const data: Record<string, unknown> = {
      nama: body.nama ?? existing.nama,
      alamat: body.alamat !== undefined ? body.alamat : existing.alamat,
      no_hp: body.no_hp !== undefined ? body.no_hp : existing.no_hp,
      email: body.email !== undefined ? body.email : existing.email,
      status: body.status ?? existing.status,
      lat: body.lat !== undefined ? body.lat : existing.lat,
      lng: body.lng !== undefined ? body.lng : existing.lng,
    }

    const newAlamat = data.alamat as string | null
    const finalLat = data.lat as number | null
    const finalLng = data.lng as number | null

    if (body.alamat !== undefined && shouldGeocode(newAlamat, finalLat, finalLng)) {
      const result = await geocodeAlamat(newAlamat ?? '')
      if (result) {
        data.lat = result.lat
        data.lng = result.lng
      }
    }

    if (body.username && body.username !== existing.username) {
      const duplicate = await prisma.mitra.findUnique({ where: { username: body.username } })
      if (duplicate) return errorResponse('Username sudah digunakan', 400)
      data.username = body.username
    }

    if (body.password) {
      data.password = await bcrypt.hash(body.password, 12)
    }

    const mitra = await prisma.mitra.update({
      where: { id },
      data,
      select: mitraSelect,
    })

    return successResponse(mitra, 'Mitra berhasil diperbarui')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal memperbarui mitra',
      500
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { id } = await params

    const existing = await prisma.mitra.findUnique({ where: { id } })
    if (!existing) {
      return errorResponse('Mitra tidak ditemukan', 404)
    }

    await prisma.mitra.delete({ where: { id } })

    return successResponse(null, 'Mitra berhasil dihapus')
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal menghapus mitra',
      500
    )
  }
}
