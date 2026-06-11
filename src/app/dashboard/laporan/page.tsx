'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

type LaporanHarian = { tanggal: string; total_transaksi: number; total_pendapatan: number; total_cash: number; total_kredit: number; total_karton: number; transaksi: Array<{ id: string; mitra: { nama: string }; jumlah_karton: number; total_harga: number; metode_bayar: string }> }
type LaporanBulanan = { total_transaksi: number; total_pendapatan: number; total_cash: number; total_kredit: number; total_karton: number; per_hari: Array<{ tanggal: string; total_transaksi: number; total_pendapatan: number; total_karton: number }> }

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }
const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function LaporanPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [tab, setTab] = useState<'harian' | 'bulanan'>('harian')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [harian, setHarian] = useState<LaporanHarian | null>(null)
  const [bulanan, setBulanan] = useState<LaporanBulanan | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (!d?.user) { router.push('/login'); return }; setSession(d.user) }).catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    if (tab !== 'harian') return; setLoading(true)
    fetch(`/api/laporan/harian?tanggal=${date}`).then(r => r.json()).then(d => { if (d.success) setHarian(d.data); setLoading(false) }).catch(() => setLoading(false))
  }, [tab, date])

  useEffect(() => {
    if (tab !== 'bulanan') return; setLoading(true)
    fetch(`/api/laporan/bulanan?tahun=${year}&bulan=${month}`).then(r => r.json()).then(d => { if (d.success) setBulanan(d.data); setLoading(false) }).catch(() => setLoading(false))
  }, [tab, month, year])

  if (!session) return null

  const StatCard = ({ label, value, color }: { label: string; value: string | number; color: string }) => (
    <div className="rounded-2xl border border-violet-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-violet-200">
      <p className="text-xs font-medium text-[#6d28d9]/50">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${color}`}>{value}</p>
    </div>
  )

  return (
    <AdminLayout title="Laporan Penjualan" session={session}>
      <div className="mb-6 flex gap-1 rounded-xl bg-violet-50 p-1 w-fit">
        {(['harian', 'bulanan'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${tab === t ? 'bg-white text-[#2e1065] shadow-sm' : 'text-[#6d28d9]/50 hover:text-[#2e1065]'}`}>{t === 'harian' ? 'Harian' : 'Bulanan'}</button>
        ))}
      </div>

      {tab === 'harian' && (
        <div className="space-y-6">
          <div className="relative w-fit">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a78bfa] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-violet-200 bg-white/70 pl-10 pr-4 py-2.5 text-sm text-[#2e1065] outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
                <p className="text-sm text-[#6d28d9]/50">Memuat data...</p>
              </div>
            </div>
          ) : harian ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <StatCard label="Transaksi" value={harian.total_transaksi} color="text-[#2e1065]" />
                <StatCard label="Pendapatan" value={rupiah(harian.total_pendapatan)} color="text-violet-700" />
                <StatCard label="Cash" value={rupiah(harian.total_cash)} color="text-emerald-700" />
                <StatCard label="Kredit" value={rupiah(harian.total_kredit)} color="text-amber-700" />
                <StatCard label="Karton" value={harian.total_karton} color="text-[#2e1065]" />
              </div>
              {harian.transaksi.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white/80 shadow-sm backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-violet-100 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50">
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Mitra</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Karton</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Total</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Bayar</th>
                      </tr></thead>
                      <tbody>{harian.transaksi.map(t => (
                        <tr key={t.id} className="border-b border-violet-50 transition-colors hover:bg-violet-50/30">
                          <td className="px-5 py-3.5 font-medium text-[#2e1065]">{t.mitra.nama}</td>
                          <td className="px-5 py-3.5 text-[#6d28d9]/70">{t.jumlah_karton}</td>
                          <td className="px-5 py-3.5 font-medium text-[#2e1065]">{rupiah(t.total_harga)}</td>
                          <td className="px-5 py-3.5"><span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${t.metode_bayar === 'cash' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{t.metode_bayar === 'cash' ? 'Cash' : 'Kredit'}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : <div className="rounded-2xl border border-violet-100 bg-white/70 p-16 text-center shadow-sm"><p className="text-[#6d28d9]/60">Tidak ada data.</p></div>}
        </div>
      )}

      {tab === 'bulanan' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-violet-200 bg-white/70 px-4 py-2.5 text-sm text-[#2e1065] outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
              {bulan.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-violet-200 bg-white/70 px-4 py-2.5 text-sm text-[#2e1065] outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
                <p className="text-sm text-[#6d28d9]/50">Memuat data...</p>
              </div>
            </div>
          ) : bulanan ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <StatCard label="Transaksi" value={bulanan.total_transaksi} color="text-[#2e1065]" />
                <StatCard label="Pendapatan" value={rupiah(bulanan.total_pendapatan)} color="text-violet-700" />
                <StatCard label="Cash" value={rupiah(bulanan.total_cash)} color="text-emerald-700" />
                <StatCard label="Kredit" value={rupiah(bulanan.total_kredit)} color="text-amber-700" />
                <StatCard label="Karton" value={bulanan.total_karton} color="text-[#2e1065]" />
              </div>
              {bulanan.per_hari.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white/80 shadow-sm backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-violet-100 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50">
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Tanggal</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Transaksi</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Karton</th>
                        <th className="px-5 py-3.5 text-left font-medium text-[#6d28d9]/60">Pendapatan</th>
                      </tr></thead>
                      <tbody>{bulanan.per_hari.map(h => (
                        <tr key={h.tanggal} className="border-b border-violet-50 transition-colors hover:bg-violet-50/30">
                          <td className="px-5 py-3.5 font-medium text-[#2e1065]">{h.tanggal}</td>
                          <td className="px-5 py-3.5 text-[#6d28d9]/70">{h.total_transaksi}</td>
                          <td className="px-5 py-3.5 text-[#6d28d9]/70">{h.total_karton}</td>
                          <td className="px-5 py-3.5 font-medium text-[#2e1065]">{rupiah(h.total_pendapatan)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : <div className="rounded-2xl border border-violet-100 bg-white/70 p-16 text-center shadow-sm"><p className="text-[#6d28d9]/60">Tidak ada data.</p></div>}
        </div>
      )}
    </AdminLayout>
  )
}
