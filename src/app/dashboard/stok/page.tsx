'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

type Produk = { id: string; nama: string; varian: string; stok: number; isi_per_karton: number; harga_satuan: number; harga_grosir: number; min_grosir: number; max_grosir: number }

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }

export default function StokPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [list, setList] = useState<Produk[]>([])
  const [loading, setLoading] = useState(true)
  const [restockId, setRestockId] = useState<string | null>(null)
  const [restockJumlah, setRestockJumlah] = useState(1)
  const [restockKet, setRestockKet] = useState('')
  const [restockLoading, setRestockLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (!d?.user) { router.push('/login'); return }; setSession(d.user) }).catch(() => router.push('/login'))
  }, [router])

  const fetchP = useCallback(async () => {
    const res = await fetch('/api/produk'); const d = await res.json()
    if (d.success) setList(d.data); setLoading(false)
  }, [])

  useEffect(() => { fetchP() }, [fetchP])

  async function handleRestock(e: React.FormEvent) {
    e.preventDefault(); if (!restockId) return
    setRestockLoading(true); setMsg({ type: '', text: '' })
    try {
      const res = await fetch(`/api/produk/${restockId}/restock`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jumlah: restockJumlah, keterangan: restockKet || undefined }) })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setRestockId(null); setRestockJumlah(1); setRestockKet('')
      setMsg({ type: 'success', text: d.message }); fetchP()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
    finally { setRestockLoading(false) }
  }

  if (!session) return null

  return (
    <AdminLayout title="Manajemen Stok" session={session}>
      {msg.text && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={msg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600" />
            <p className="text-sm text-[#6d28d9]/50">Memuat data...</p>
          </div>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-violet-100 bg-white/70 p-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 mb-4">
            <svg className="h-8 w-8 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
          </div>
          <p className="text-[#6d28d9]/60">Tidak ada produk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(p => {
            const rendah = p.stok <= 5
            return (
              <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-violet-200">
                <div className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${rendah ? 'from-rose-500 to-pink-600' : 'from-emerald-500 to-teal-600'} opacity-[0.04]`} />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`flex h-3 w-3 rounded-full ${rendah ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <h3 className="font-semibold text-[#2e1065] capitalize">{p.varian}</h3>
                    </div>
                    <p className="text-xs text-[#6d28d9]/50 mt-0.5">{p.nama}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ${rendah ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>{p.stok}</span>
                </div>
                <div className="mt-5 space-y-2 text-sm text-[#6d28d9]/60">
                  <div className="flex justify-between"><span>Isi per karton</span><span className="font-medium text-[#2e1065]">{p.isi_per_karton} pcs</span></div>
                  <div className="flex justify-between"><span>Harga 1 karton</span><span className="font-medium text-[#2e1065]">{rupiah(p.harga_satuan)}</span></div>
                  <div className="flex justify-between"><span>Grosir ({p.min_grosir}-{p.max_grosir})</span><span className="font-medium text-[#2e1065]">{rupiah(p.harga_grosir)}/karton</span></div>
                </div>
                {rendah && (
                  <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-xs font-medium text-rose-700 flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    Stok menipis! Segera restok.
                  </div>
                )}
                <button onClick={() => { setRestockId(p.id); setRestockJumlah(1); setRestockKet('') }} className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-medium text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl cursor-pointer">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Restok
                </button>
              </div>
            )
          })}
        </div>
      )}

      {restockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm animate-slide-up" onClick={() => setRestockId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-200/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-bold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2e1065]">Restok Produk</h3>
                <p className="text-xs text-[#6d28d9]/50">{list.find(p => p.id === restockId)?.varian} — {list.find(p => p.id === restockId)?.nama}</p>
              </div>
            </div>
            <form onSubmit={handleRestock} className="space-y-4">
              <FormField label="Jumlah tambahan (karton)">
                <input type="number" required min={1} value={restockJumlah} onChange={(e) => setRestockJumlah(Number(e.target.value))} className={inpCls} />
              </FormField>
              <FormField label="Keterangan (opsional)">
                <input type="text" value={restockKet} onChange={(e) => setRestockKet(e.target.value)} placeholder="Misal: Restok dari supplier" className={inpCls} />
              </FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRestockId(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#6d28d9]/60 hover:bg-violet-50 transition-colors cursor-pointer">Batal</button>
                <button type="submit" disabled={restockLoading} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 transition-all cursor-pointer">{restockLoading ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const inpCls = 'w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-[#2e1065] placeholder-[#a78bfa]/50 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-sm font-medium text-[#2e1065] mb-1.5">{label}</label>{children}</div> }
