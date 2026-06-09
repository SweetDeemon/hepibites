'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

type Kredit = { id: string; jumlah_hutang: number; jumlah_terbayar: number; sisa_hutang: number; tanggal_jatuh_tempo: string; status: string; mitra: { nama: string; no_hp: string | null } }

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function PembayaranPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [list, setList] = useState<Kredit[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'aktif' | 'lunas'>('aktif')
  const [bayarId, setBayarId] = useState<string | null>(null)
  const [bayarJumlah, setBayarJumlah] = useState(0)
  const [bayarLoading, setBayarLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (!d?.user) { router.push('/login'); return }; setSession(d.user) }).catch(() => router.push('/login'))
  }, [router])

  const fetchK = useCallback(async () => {
    const res = await fetch(`/api/kredit?status=${tab}`); const d = await res.json()
    if (d.success) setList(d.data); setLoading(false)
  }, [tab])

  useEffect(() => { fetchK() }, [fetchK])

  const tk = list.find(k => k.id === bayarId)

  async function handleBayar(e: React.FormEvent) {
    e.preventDefault(); if (!bayarId) return
    setBayarLoading(true); setMsg({ type: '', text: '' })
    try {
      const res = await fetch(`/api/kredit/${bayarId}/bayar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jumlah_bayar: bayarJumlah }) })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setBayarId(null); setBayarJumlah(0); setMsg({ type: 'success', text: 'Pembayaran berhasil!' }); fetchK()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
    finally { setBayarLoading(false) }
  }

  if (!session) return null

  return (
    <AdminLayout title="Pembayaran Kredit" session={session}>
      {msg.text && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{msg.text}</div>
      )}

      <div className="mb-6 flex gap-1 rounded-xl bg-stone-100 p-1 w-fit">
        {(['aktif', 'lunas'] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setLoading(true) }} className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>{t === 'aktif' ? 'Belum Lunas' : 'Riwayat Lunas'}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center"><p className="text-stone-500">{tab === 'aktif' ? 'Tidak ada kredit aktif.' : 'Belum ada riwayat.'}</p></div>
      ) : (
        <div className="space-y-4">
          {list.map(k => {
            const overdue = k.status === 'aktif' && new Date(k.tanggal_jatuh_tempo) < new Date()
            return (
              <div key={k.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ${overdue ? 'bg-gradient-to-br from-rose-500 to-pink-600' : k.status === 'lunas' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                      {k.mitra.nama.charAt(0).toUpperCase()}
                    </div>
                    <div><h3 className="font-semibold text-stone-900">{k.mitra.nama}</h3>{k.mitra.no_hp && <p className="text-xs text-stone-400">{k.mitra.no_hp}</p>}</div>
                  </div>
                  {k.status === 'aktif' && (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${overdue ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{overdue ? 'Terlambat' : 'Aktif'}</span>
                  )}
                  {k.status === 'lunas' && <span className="rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs font-medium">Lunas</span>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div><p className="text-xs text-stone-500">Total Hutang</p><p className="font-semibold text-stone-900">{rupiah(k.jumlah_hutang)}</p></div>
                  <div><p className="text-xs text-stone-500">Terbayar</p><p className="font-semibold text-stone-900">{rupiah(k.jumlah_terbayar)}</p></div>
                  <div><p className="text-xs text-stone-500">Sisa Hutang</p><p className={`font-bold ${k.sisa_hutang > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{rupiah(k.sisa_hutang)}</p></div>
                  <div><p className="text-xs text-stone-500">Jatuh Tempo</p><p className="font-semibold text-stone-900">{formatDate(k.tanggal_jatuh_tempo)}</p></div>
                </div>
                {k.status === 'aktif' && (
                  <button onClick={() => { setBayarId(k.id); setBayarJumlah(k.sisa_hutang) }} className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all">Bayar</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {bayarId && tk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm" onClick={() => setBayarId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900">Catat Pembayaran</h3>
            <p className="mt-1 text-sm text-stone-500">{tk.mitra.nama}</p>
            <form onSubmit={handleBayar} className="mt-4 space-y-4">
              <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                <div className="flex items-center justify-between"><span className="text-sm text-stone-600">Sisa hutang</span><span className="font-bold text-rose-600">{rupiah(tk.sisa_hutang)}</span></div>
              </div>
              <FormField label="Jumlah Bayar">
                <input type="number" required min={1} max={tk.sisa_hutang} value={bayarJumlah} onChange={(e) => setBayarJumlah(Number(e.target.value))} className={inpCls} />
                {bayarJumlah > 0 && bayarJumlah < tk.sisa_hutang && <p className="mt-1 text-xs text-amber-600">Pembayaran parsial — sisa {rupiah(tk.sisa_hutang - bayarJumlah)}</p>}
                {bayarJumlah === tk.sisa_hutang && <p className="mt-1 text-xs text-emerald-600">Lunas!</p>}
              </FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setBayarId(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
                <button type="submit" disabled={bayarLoading} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all">{bayarLoading ? 'Memproses...' : 'Bayar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const inpCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div> }
