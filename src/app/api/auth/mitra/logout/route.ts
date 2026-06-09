import { mitraClearCookieHeader } from '@/lib/mitra-auth'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, data: null, message: 'Logout berhasil' },
    { status: 200 }
  )
  response.headers.set('Set-Cookie', mitraClearCookieHeader())
  return response
}
