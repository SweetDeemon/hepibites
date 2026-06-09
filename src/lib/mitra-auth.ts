import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? 'hepibites-mitra-secret'
)

export const COOKIE_NAME = 'mitra.session-token'

export type MitraJWT = {
  id: string
  username: string
  nama: string
}

export async function createMitraToken(mitra: MitraJWT) {
  return new SignJWT(mitra)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyMitraToken(token: string): Promise<MitraJWT | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as MitraJWT
  } catch {
    return null
  }
}

export async function getMitraSession(): Promise<MitraJWT | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyMitraToken(token)
}

export function mitraCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === 'production'
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function mitraClearCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
}
