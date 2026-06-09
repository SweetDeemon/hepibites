import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { geocodeAlamat, shouldGeocode } from '@/lib/geocoding'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status && (status === 'aktif' || status === 'nonaktif')) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { no_hp: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const mitra = await prisma.mitra.findMany({
      where,
      select: {
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
      },
      orderBy: { created_at: 'desc' },
    })

    return successResponse(mitra)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data mitra',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const { nama, username, password, alamat, no_hp, email, lat, lng } = body

    if (!nama) {
      return errorResponse('Nama mitra wajib diisi', 400)
    }

    if (!username) {
      return errorResponse('Username mitra wajib diisi', 400)
    }

    const existing = await prisma.mitra.findUnique({ where: { username } })
    if (existing) {
      return errorResponse('Username sudah digunakan', 400)
    }

    const mitraPassword = password
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash('mitra123', 12)

    let finalLat = lat ?? null
    let finalLng = lng ?? null

    if (shouldGeocode(alamat, finalLat, finalLng)) {
      const result = await geocodeAlamat(alamat)
      if (result) {
        finalLat = result.lat
        finalLng = result.lng
      }
    }

    const mitra = await prisma.mitra.create({
      data: {
        username,
        password: mitraPassword,
        nama,
        alamat: alamat ?? null,
        no_hp: no_hp ?? null,
        email: email ?? null,
        lat: finalLat,
        lng: finalLng,
      },
      select: {
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
      },
    })

    return successResponse(mitra, 'Mitra berhasil ditambahkan', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal menambah mitra',
      500
    )
  }
}
