'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

const cards = [
  { href: '/dashboard/mitra', label: 'Mitra', desc: 'Kelola data mitra', gradient: 'from-violet-500 to-fuchsia-600', icon: (
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

const statsPlaceholder = [
  { label: 'Total Transaksi', value: '—', color: 'text-violet-700' },
  { label: 'Pendapatan', value: '—', color: 'text-emerald-700' },
  { label: 'Mitra Aktif', value: '—', color: 'text-sky-700' },
  { label: 'Kredit Aktif', value: '—', color: 'text-amber-700' },
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
        <div className="mb-6 animate-slide-up rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-sm">
              <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            </span>
            <p className="font-semibold text-rose-800">Kredit Lewat Jatuh Tempo</p>
          </div>
          <ul className="mt-3 space-y-1.5 ml-11">
            {overdue.map((k, i) => (
              <li key={i} className="text-sm text-rose-700 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                {k.mitra.nama} — <span className="font-medium">{rupiah(k.sisa_hutang)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statsPlaceholder.map(s => (
          <div key={s.label} className="rounded-2xl border border-violet-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-violet-200">
            <p className="text-xs font-medium text-[#6d28d9]/50">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.href}
            onClick={() => router.push(card.href)}
            className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white/80 p-6 text-left shadow-sm backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-violet-200 cursor-pointer"
          >
            <div className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.04] transition-all group-hover:opacity-[0.08]`} />
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">{card.icon}</svg>
            </div>
            <h3 className="mt-4 font-semibold text-[#2e1065] group-hover:text-violet-700 transition-colors">{card.label}</h3>
            <p className="mt-1 text-sm text-[#6d28d9]/60">{card.desc}</p>
          </button>
        ))}
      </div>
    </AdminLayout>
  )
}
