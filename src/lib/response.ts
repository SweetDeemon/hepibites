import { NextResponse } from 'next/server'

export function successResponse(data: unknown, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message: message ?? 'Success' },
    { status }
  )
}

export function errorResponse(error: string, code = 400, status?: number) {
  return NextResponse.json(
    { success: false, error, code },
    { status: status ?? code }
  )
}
