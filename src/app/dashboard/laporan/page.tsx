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

  return (
    <AdminLayout title="Laporan Penjualan" session={session}>
      <div className="mb-6 flex gap-1 rounded-xl bg-stone-100 p-1 w-fit">
        {(['harian', 'bulanan'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{t === 'harian' ? 'Harian' : 'Bulanan'}</button>
        ))}
      </div>

      {tab === 'harian' && (
        <div className="space-y-6">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
          ) : harian ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                  { label: 'Transaksi', value: harian.total_transaksi, color: 'text-stone-900' },
                  { label: 'Pendapatan', value: rupiah(harian.total_pendapatan), color: 'text-violet-700' },
                  { label: 'Cash', value: rupiah(harian.total_cash), color: 'text-emerald-700' },
                  { label: 'Kredit', value: rupiah(harian.total_kredit), color: 'text-amber-700' },
                  { label: 'Karton', value: harian.total_karton, color: 'text-stone-900' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-xs text-stone-500">{item.label}</p>
                    <p className={`mt-1.5 text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              {harian.transaksi.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-stone-100 bg-stone-50/50">
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Mitra</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Karton</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Total</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Bayar</th>
                      </tr></thead>
                      <tbody>{harian.transaksi.map(t => (
                        <tr key={t.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50/50">
                          <td className="px-5 py-3.5 font-medium text-stone-900">{t.mitra.nama}</td>
                          <td className="px-5 py-3.5 text-stone-600">{t.jumlah_karton}</td>
                          <td className="px-5 py-3.5 font-medium text-stone-900">{rupiah(t.total_harga)}</td>
                          <td className="px-5 py-3.5"><span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${t.metode_bayar === 'cash' ? 'bg-blue-50 text-blue-700 ring-blue-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{t.metode_bayar === 'cash' ? 'Cash' : 'Kredit'}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-stone-500">Tidak ada data.</p>}
        </div>
      )}

      {tab === 'bulanan' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
              {bulan.map((n, i) => <option key={i + 1} value={i + 1}>{n}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
          ) : bulanan ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {[
                  { label: 'Transaksi', value: bulanan.total_transaksi, color: 'text-stone-900' },
                  { label: 'Pendapatan', value: rupiah(bulanan.total_pendapatan), color: 'text-violet-700' },
                  { label: 'Cash', value: rupiah(bulanan.total_cash), color: 'text-emerald-700' },
                  { label: 'Kredit', value: rupiah(bulanan.total_kredit), color: 'text-amber-700' },
                  { label: 'Karton', value: bulanan.total_karton, color: 'text-stone-900' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <p className="text-xs text-stone-500">{item.label}</p>
                    <p className={`mt-1.5 text-xl font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              {bulanan.per_hari.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-stone-100 bg-stone-50/50">
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Tanggal</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Transaksi</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Karton</th>
                        <th className="px-5 py-3.5 text-left font-medium text-stone-500">Pendapatan</th>
                      </tr></thead>
                      <tbody>{bulanan.per_hari.map(h => (
                        <tr key={h.tanggal} className="border-b border-stone-100 transition-colors hover:bg-stone-50/50">
                          <td className="px-5 py-3.5 font-medium text-stone-900">{h.tanggal}</td>
                          <td className="px-5 py-3.5 text-stone-600">{h.total_transaksi}</td>
                          <td className="px-5 py-3.5 text-stone-600">{h.total_karton}</td>
                          <td className="px-5 py-3.5 font-medium text-stone-900">{rupiah(h.total_pendapatan)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-stone-500">Tidak ada data.</p>}
        </div>
      )}
    </AdminLayout>
  )
}
