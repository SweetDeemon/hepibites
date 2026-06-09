import { auth, signIn } from '@/lib/auth'
import { errorResponse } from '@/lib/response'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (session) {
    return NextResponse.json(
      { success: true, data: session.user, message: 'Already logged in' },
      { status: 200 }
    )
  }

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

  try {
    const redirectUrl = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (!redirectUrl || redirectUrl.includes('/api/auth/error')) {
      return errorResponse('Username atau password salah', 401)
    }

    return NextResponse.json(
      { success: true, data: null, message: 'Login berhasil' },
      { status: 200 }
    )
  } catch {
    return errorResponse('Username atau password salah', 401)
  }
}
