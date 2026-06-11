'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import dynamic from 'next/dynamic'

const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false })

export default function MitraMapPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (!d?.user) { router.push('/login'); return }
      setSession(d.user)
    }).catch(() => router.push('/login'))
  }, [router])

  if (!session) return null

  return (
    <AdminLayout title="Peta Mitra" session={session}>
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <p className="text-sm text-[#6d28d9]/70">Lokasi mitra HepiBites di area <strong className="text-[#2e1065]">Jombang, Jawa Timur</strong></p>
      </div>
      <div className="h-[600px] rounded-2xl border border-violet-100 bg-white shadow-lg shadow-violet-200/10 overflow-hidden">
        <MapClient />
      </div>
    </AdminLayout>
  )
}
