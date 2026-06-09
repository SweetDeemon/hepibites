import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/response'
import { hitungHarga } from '@/lib/harga'
import { NextRequest } from 'next/server'
import type { Prisma } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)

  try {
    const { searchParams } = new URL(request.url)
    const mitraId = searchParams.get('mitra_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const where: Prisma.TransaksiWhereInput = {
      is_cancelled: false,
    }

    if (mitraId) where.mitra_id = mitraId
    if (startDate || endDate) {
      const tanggalFilter: Prisma.DateTimeFilter = {}
      if (startDate) tanggalFilter.gte = new Date(startDate)
      if (endDate) tanggalFilter.lte = new Date(endDate)
      where.tanggal = tanggalFilter
    }

    const [transaksi, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: { mitra: true, user: true, produk: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaksi.count({ where }),
    ])

    return successResponse({
      data: transaksi,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal mengambil data transaksi',
      500
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return errorResponse('Unauthorized', 401)
  if (session.user.role === 'finance') {
    return errorResponse('Finance tidak boleh membuat transaksi', 403)
  }

  try {
    const body = await request.json()
    const { mitra_id, produk_id, jumlah_karton, metode_bayar, tanggal_jatuh_tempo } = body

    if (!mitra_id || !produk_id || !jumlah_karton || !metode_bayar) {
      return errorResponse(
        'mitra_id, produk_id, jumlah_karton, dan metode_bayar wajib diisi',
        400
      )
    }

    if (metode_bayar !== 'cash' && metode_bayar !== 'kredit') {
      return errorResponse('Metode bayar harus cash atau kredit', 400)
    }

    const { hargaPerKarton, totalHarga } = hitungHarga(jumlah_karton)

    const mitra = await prisma.mitra.findUnique({ where: { id: mitra_id } })
    if (!mitra || mitra.status === 'nonaktif') {
      return errorResponse('Mitra tidak ditemukan atau tidak aktif', 400)
    }

    const produk = await prisma.produk.findUnique({ where: { id: produk_id } })
    if (!produk) {
      return errorResponse('Produk tidak ditemukan', 400)
    }

    if (produk.stok < jumlah_karton) {
      return errorResponse(
        `Stok tidak mencukupi. Stok saat ini: ${produk.stok} karton`,
        400
      )
    }

    const statusBayar = metode_bayar === 'cash' ? 'lunas' : 'belum_lunas'

    await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksi.create({
        data: {
          mitra_id,
          produk_id,
          jumlah_karton,
          harga_per_karton: hargaPerKarton,
          total_harga: totalHarga,
          metode_bayar,
          status_bayar: statusBayar,
          created_by: session.user.id,
        },
      })

      await tx.produk.update({
        where: { id: produk_id },
        data: { stok: produk.stok - jumlah_karton },
      })

      await tx.stokLog.create({
        data: {
          produk_id,
          tipe: 'keluar',
          jumlah: jumlah_karton,
          referensi_id: transaksi.id,
          keterangan: `Transaksi #${transaksi.id}`,
        },
      })

      if (metode_bayar === 'kredit') {
        if (!tanggal_jatuh_tempo) {
          throw new Error(
            'Tanggal jatuh tempo wajib diisi untuk pembayaran kredit'
          )
        }
        const maxDue = new Date()
        maxDue.setDate(maxDue.getDate() + 5)
        if (new Date(tanggal_jatuh_tempo) > maxDue) {
          throw new Error('Jatuh tempo maksimal 5 hari dari sekarang')
        }

        await tx.kredit.create({
          data: {
            transaksi_id: transaksi.id,
            mitra_id,
            jumlah_hutang: totalHarga,
            sisa_hutang: totalHarga,
            tanggal_jatuh_tempo: new Date(tanggal_jatuh_tempo),
          },
        })
      }
    })

    return successResponse(null, 'Transaksi berhasil disimpan', 201)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Gagal menyimpan transaksi',
      500
    )
  }
}
