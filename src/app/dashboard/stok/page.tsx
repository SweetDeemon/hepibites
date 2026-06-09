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
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{msg.text}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center"><p className="text-stone-500">Tidak ada produk.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(p => {
            const rendah = p.stok <= 5
            return (
              <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900 capitalize">{p.varian}</h3>
                    <p className="text-xs text-stone-500">{p.nama}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ${rendah ? 'bg-rose-50 text-rose-700 ring-rose-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>{p.stok}</span>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-stone-500">
                  <p>{p.isi_per_karton} pcs / karton</p>
                  <p>1 karton: {rupiah(p.harga_satuan)}</p>
                  <p>Grosir ({p.min_grosir}-{p.max_grosir}): {rupiah(p.harga_grosir)}/karton</p>
                </div>
                {rendah && <p className="mt-3 text-xs font-medium text-rose-600">Stok menipis! Segera restok.</p>}
                <button onClick={() => { setRestockId(p.id); setRestockJumlah(1); setRestockKet('') }} className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Restok
                </button>
              </div>
            )
          })}
        </div>
      )}

      {restockId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm" onClick={() => setRestockId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900">Restok Produk</h3>
            <p className="mt-1 text-sm text-stone-500">{list.find(p => p.id === restockId)?.varian} — {list.find(p => p.id === restockId)?.nama}</p>
            <form onSubmit={handleRestock} className="mt-4 space-y-4">
              <FormField label="Jumlah tambahan (karton)">
                <input type="number" required min={1} value={restockJumlah} onChange={(e) => setRestockJumlah(Number(e.target.value))} className={inpCls} />
              </FormField>
              <FormField label="Keterangan (opsional)">
                <input type="text" value={restockKet} onChange={(e) => setRestockKet(e.target.value)} placeholder="Misal: Restok dari supplier" className={inpCls} />
              </FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRestockId(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
                <button type="submit" disabled={restockLoading} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all">{restockLoading ? 'Menyimpan...' : 'Simpan'}</button>
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
