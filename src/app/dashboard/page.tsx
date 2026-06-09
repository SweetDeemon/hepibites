'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

const cards = [
  { href: '/dashboard/mitra', label: 'Mitra', desc: 'Kelola data mitra', gradient: 'from-violet-500 to-purple-600', icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  )},
  { href: '/dashboard/transaksi', label: 'Transaksi', desc: 'Catat penjualan snack', gradient: 'from-emerald-500 to-teal-600', icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  )},
  { href: '/dashboard/stok', label: 'Stok', desc: 'Monitor & restock produk', gradient: 'from-amber-500 to-orange-600', icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  )},
  { href: '/dashboard/pembayaran', label: 'Pembayaran', desc: 'Catat pelunasan kredit', gradient: 'from-rose-500 to-pink-600', icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  )},
  { href: '/dashboard/laporan', label: 'Laporan', desc: 'Rekap penjualan', gradient: 'from-sky-500 to-blue-600', icon: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  )},
  { href: '/dashboard/mitra-map', label: 'Peta Mitra', desc: 'Lihat lokasi mitra', gradient: 'from-cyan-500 to-teal-600', icon: (
    <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>
  )},
]

export default function DashboardPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [overdue, setOverdue] = useState<Array<{ sisa_hutang: number; mitra: { nama: string } }>>([])

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (!d?.user) { router.push('/login'); return }
      setSession(d.user)
    }).catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    fetch('/api/kredit?status=aktif').then(r => r.json()).then(d => {
      if (d.success) setOverdue(d.data.filter((k: { tanggal_jatuh_tempo: string }) => new Date(k.tanggal_jatuh_tempo) <= new Date()))
    }).catch(() => {})
  }, [])

  if (!session) return null

  return (
    <AdminLayout title={`Selamat datang, ${session.name}`} session={session}>
      {overdue.length > 0 && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs">⚠️</span>
            <p className="font-medium text-rose-800">Kredit Lewat Jatuh Tempo</p>
          </div>
          <ul className="mt-2 space-y-1">
            {overdue.map((k, i) => (
              <li key={i} className="ml-8 text-sm text-rose-700">{k.mitra.nama} — {rupiah(k.sisa_hutang)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.href}
            onClick={() => router.push(card.href)}
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 transition-all group-hover:opacity-10`} />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg shadow-${card.gradient.split(' ')[0].replace('from-', '')}/20`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{card.icon}</svg>
            </div>
            <h3 className="mt-4 font-semibold text-stone-900 group-hover:text-violet-700 transition-colors">{card.label}</h3>
            <p className="mt-1 text-sm text-stone-500">{card.desc}</p>
          </button>
        ))}
      </div>
    </AdminLayout>
  )
}
