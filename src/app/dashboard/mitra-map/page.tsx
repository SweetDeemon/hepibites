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
      <p className="mb-6 text-sm text-gray-500">Lokasi mitra HepiBites di area Jombang</p>
      <div className="h-[600px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <MapClient />
      </div>
    </AdminLayout>
  )
}
