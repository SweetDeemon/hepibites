import { signIn } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { errorResponse } from '@/lib/response'
import { createMitraToken, mitraCookieHeader } from '@/lib/mitra-auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return errorResponse('Format request tidak valid', 400)
  }

  const { username, password } = body
  if (!username || !password) {
    return errorResponse('Username dan password wajib diisi', 400)
  }

  // Try admin login first
  try {
    const redirectUrl = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (redirectUrl && !redirectUrl.includes('/api/auth/error')) {
      return NextResponse.json(
        { success: true, data: { type: 'admin', redirect: '/dashboard' }, message: 'Login berhasil' },
        { status: 200 }
      )
    }
  } catch {
    // Not an admin — fall through to mitra check
  }

  // Try mitra login
  try {
    const mitra = await prisma.mitra.findUnique({ where: { username } })

    if (!mitra || mitra.status === 'nonaktif') {
      return errorResponse('Username atau password salah', 401)
    }

    const isValid = await bcrypt.compare(password, mitra.password)
    if (!isValid) {
      return errorResponse('Username atau password salah', 401)
    }

    const token = await createMitraToken({
      id: mitra.id,
      username: mitra.username,
      nama: mitra.nama,
    })

    const response = NextResponse.json(
      {
        success: true,
        data: { type: 'mitra', redirect: '/mitra/dashboard' },
        message: 'Login berhasil',
      },
      { status: 200 }
    )

    response.headers.set('Set-Cookie', mitraCookieHeader(token))

    return response
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Login gagal',
      500
    )
  }
}
