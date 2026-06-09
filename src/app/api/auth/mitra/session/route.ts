import { getMitraSession } from '@/lib/mitra-auth'
import { successResponse, errorResponse } from '@/lib/response'

export async function GET() {
  const session = await getMitraSession()
  if (!session) return errorResponse('Unauthorized', 401)

  return successResponse(session)
}
