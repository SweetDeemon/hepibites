'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

type Transaksi = { id: string; jumlah_karton: number; total_harga: number; metode_bayar: string; status_bayar: string; created_at: string; mitra: { nama: string }; produk: { varian: string } }
type Produk = { id: string; varian: string; stok: number; harga_satuan: number; harga_grosir: number; min_grosir: number; max_grosir: number }
type Mitra = { id: string; nama: string; status: string }

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

export default function TransaksiPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [list, setList] = useState<Transaksi[]>([])
  const [loading, setLoading] = useState(true)
  const [mitraList, setMitraList] = useState<Mitra[]>([])
  const [produkList, setProdukList] = useState<Produk[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [form, setForm] = useState({ mitra_id: '', produk_id: '', jumlah_karton: 1, metode_bayar: 'cash', tanggal_jatuh_tempo: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (!d?.user) { router.push('/login'); return }; setSession(d.user) }).catch(() => router.push('/login'))
  }, [router])

  useEffect(() => {
    Promise.all([fetch('/api/mitra').then(r => r.json()), fetch('/api/produk').then(r => r.json())]).then(([md, pd]) => { if (md.success) setMitraList(md.data); if (pd.success) setProdukList(pd.data) })
  }, [])

  const fetchTrans = useCallback(async () => {
    const params = new URLSearchParams()
    if (startDate) params.set('start_date', startDate)
    if (endDate) params.set('end_date', endDate)
    const res = await fetch(`/api/transaksi?${params}`); const d = await res.json()
    if (d.success) setList(d.data.data); setLoading(false)
  }, [startDate, endDate])

  useEffect(() => { fetchTrans() }, [fetchTrans])

  const sp = produkList.find(p => p.id === form.produk_id)
  const hpk = form.jumlah_karton === 1 ? sp?.harga_satuan ?? 105000 : (form.jumlah_karton >= (sp?.min_grosir ?? 10) && form.jumlah_karton <= (sp?.max_grosir ?? 30) ? sp?.harga_grosir ?? 100000 : null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg({ type: '', text: '' })
    try {
      const body: Record<string, unknown> = { mitra_id: form.mitra_id, produk_id: form.produk_id, jumlah_karton: form.jumlah_karton, metode_bayar: form.metode_bayar }
      if (form.metode_bayar === 'kredit') body.tanggal_jatuh_tempo = form.tanggal_jatuh_tempo
      const res = await fetch('/api/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setShowForm(false); setForm({ mitra_id: '', produk_id: '', jumlah_karton: 1, metode_bayar: 'cash', tanggal_jatuh_tempo: '' })
      setMsg({ type: 'success', text: 'Transaksi berhasil!' }); fetchTrans()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
    finally { setSubmitting(false) }
  }

  if (!session) return null

  return (
    <AdminLayout title="Transaksi Penjualan" session={session}>
      {msg.text && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{msg.text}</div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setLoading(true) }} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        <span className="text-xs text-stone-400">s/d</span>
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setLoading(true) }} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        <button onClick={() => { setShowForm(true); setForm(p => ({ ...p, produk_id: produkList[0]?.id || '' })) }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Transaksi Baru
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-stone-900">Transaksi Baru</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Mitra">
              <select required value={form.mitra_id} onChange={(e) => setForm(p => ({ ...p, mitra_id: e.target.value }))} className={selCls}>
                <option value="">Pilih mitra</option>
                {mitraList.filter(m => m.status === 'aktif').map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
              </select>
            </FormField>
            <FormField label="Produk">
              <select required value={form.produk_id} onChange={(e) => setForm(p => ({ ...p, produk_id: e.target.value }))} className={selCls}>
                <option value="">Pilih produk</option>
                {produkList.map(p => <option key={p.id} value={p.id}>{p.varian} (stok: {p.stok})</option>)}
              </select>
            </FormField>
            <FormField label="Jumlah (karton)">
              <input type="number" required min={1} max={sp?.stok ?? 1} value={form.jumlah_karton} onChange={(e) => setForm(p => ({ ...p, jumlah_karton: Number(e.target.value) }))} className={inpCls} />
              {sp && <p className="mt-1 text-xs text-stone-400">Maks: {sp.stok} karton</p>}
            </FormField>
            <FormField label="Metode Bayar">
              <select value={form.metode_bayar} onChange={(e) => setForm(p => ({ ...p, metode_bayar: e.target.value }))} className={selCls}>
                <option value="cash">Cash</option>
                <option value="kredit">Kredit</option>
              </select>
            </FormField>
            {form.metode_bayar === 'kredit' && (
              <FormField label="Jatuh Tempo (maks 5 hari)">
                <input type="date" required value={form.tanggal_jatuh_tempo} onChange={(e) => setForm(p => ({ ...p, tanggal_jatuh_tempo: e.target.value }))} className={inpCls} />
              </FormField>
            )}
          </div>
          {hpk !== null && (
            <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4">
              <div className="flex items-center justify-between text-sm"><span className="text-stone-600">Harga per karton</span><span className="font-medium text-stone-900">{rupiah(hpk)}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-violet-200 pt-2 text-lg font-bold"><span className="text-stone-900">Total</span><span className="text-violet-700">{rupiah(form.jumlah_karton * hpk)}</span></div>
            </div>
          )}
          {form.jumlah_karton !== 1 && hpk === null && <p className="text-sm text-amber-600">Jumlah karton harus 1 atau antara {sp?.min_grosir}-{sp?.max_grosir}.</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
            <button type="submit" disabled={submitting || hpk === null} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 transition-all">{submitting ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center"><p className="text-stone-500">Belum ada transaksi.</p></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="px-5 py-3.5 text-left font-medium text-stone-500 whitespace-nowrap">Tanggal</th>
                  <th className="px-5 py-3.5 text-left font-medium text-stone-500">Mitra</th>
                  <th className="hidden px-5 py-3.5 text-left font-medium text-stone-500 sm:table-cell">Produk</th>
                  <th className="px-5 py-3.5 text-left font-medium text-stone-500">Karton</th>
                  <th className="px-5 py-3.5 text-left font-medium text-stone-500">Total</th>
                  <th className="hidden px-5 py-3.5 text-left font-medium text-stone-500 md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map(t => (
                  <tr key={t.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50/50">
                    <td className="whitespace-nowrap px-5 py-3.5 text-stone-500">{formatDate(t.created_at)}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{t.mitra.nama}</td>
                    <td className="hidden px-5 py-3.5 capitalize text-stone-600 sm:table-cell">{t.produk.varian}</td>
                    <td className="px-5 py-3.5 text-stone-600">{t.jumlah_karton}</td>
                    <td className="px-5 py-3.5 font-medium text-stone-900">{rupiah(t.total_harga)}</td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${t.status_bayar === 'lunas' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>{t.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const inpCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'
const selCls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div> }
