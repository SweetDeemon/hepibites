'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'

type Mitra = { id: string; username: string; nama: string; alamat: string | null; no_hp: string | null; email: string | null; status: string; created_at: string }

function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function MitraPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ name: string; role: string } | null>(null)
  const [list, setList] = useState<Mitra[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState<'tambah' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Mitra | null>(null)
  const [hapusId, setHapusId] = useState<string | null>(null)
  const [form, setForm] = useState({ nama: '', username: '', password: '', alamat: '', no_hp: '', email: '', status: 'aktif' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => { if (!d?.user) { router.push('/login'); return }; setSession(d.user) }).catch(() => router.push('/login'))
  }, [router])

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/mitra?${params}`); const d = await res.json()
    if (d.success) setList(d.data); setLoading(false)
  }, [search, filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm(m?: Mitra) { setForm({ nama: m?.nama ?? '', username: m?.username ?? '', password: '', alamat: m?.alamat ?? '', no_hp: m?.no_hp ?? '', email: m?.email ?? '', status: m?.status ?? 'aktif' }) }

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault(); setMsg({ type: '', text: '' })
    try {
      const res = await fetch('/api/mitra', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: form.nama, username: form.username, password: form.password || undefined }) })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setModal(null); resetForm(); setMsg({ type: 'success', text: 'Mitra berhasil ditambahkan!' }); fetchData()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!editTarget) return; setMsg({ type: '', text: '' })
    try {
      const body: Record<string, unknown> = { nama: form.nama, username: form.username, alamat: form.alamat || null, no_hp: form.no_hp || null, email: form.email || null, status: form.status }
      if (form.password) body.password = form.password
      const res = await fetch(`/api/mitra/${editTarget.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setModal(null); setEditTarget(null); setMsg({ type: 'success', text: 'Mitra berhasil diperbarui!' }); fetchData()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
  }

  async function handleHapus(id: string) {
    setMsg({ type: '', text: '' })
    try {
      const res = await fetch(`/api/mitra/${id}`, { method: 'DELETE' }); const d = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: d.error }); return }
      setHapusId(null); setMsg({ type: 'success', text: 'Mitra berhasil dihapus!' }); fetchData()
    } catch { setMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
  }

  if (!session) return null

  return (
    <AdminLayout title="Kelola Mitra" session={session}>
      {msg.text && (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{msg.text}</div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari mitra..." value={search} onChange={(e) => { setSearch(e.target.value); setLoading(true) }} className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setLoading(true) }} className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
          <option value="">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <button onClick={() => { resetForm(); setModal('tambah') }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Mitra
        </button>
        <span className="text-sm text-stone-400">{list.length} mitra</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center"><p className="text-stone-500">Belum ada mitra.</p></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 text-left font-medium text-stone-500 text-xs sm:text-sm">Nama</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 text-left font-medium text-stone-500 text-xs sm:text-sm">Username</th>
                  <th className="hidden px-3 py-3 sm:px-5 sm:py-3.5 text-left font-medium text-stone-500 text-xs sm:text-sm sm:table-cell">No. HP</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5 text-left font-medium text-stone-500 text-xs sm:text-sm">Status</th>
                  <th className="hidden px-3 py-3 sm:px-5 sm:py-3.5 text-left font-medium text-stone-500 text-xs sm:text-sm md:table-cell">Dibuat</th>
                  <th className="px-3 py-3 sm:px-5 sm:py-3.5" />
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-b border-stone-100 transition-colors hover:bg-stone-50/50">
                    <td className="px-3 py-3 sm:px-5 sm:py-3.5 font-medium text-stone-900 text-xs sm:text-sm">{m.nama}</td>
                    <td className="px-3 py-3 sm:px-5 sm:py-3.5 text-stone-600 text-xs sm:text-sm">{m.username}</td>
                    <td className="hidden px-3 py-3 sm:px-5 sm:py-3.5 text-stone-500 text-xs sm:text-sm sm:table-cell">{m.no_hp || '—'}</td>
                    <td className="px-3 py-3 sm:px-5 sm:py-3.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium ${m.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200'}`}>{m.status}</span>
                    </td>
                    <td className="hidden px-3 py-3 sm:px-5 sm:py-3.5 text-stone-500 text-xs sm:text-sm md:table-cell">{formatDate(m.created_at)}</td>
                    <td className="px-3 py-3 sm:px-5 sm:py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditTarget(m); resetForm(m); setModal('edit') }} className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors">Edit</button>
                        <button onClick={() => setHapusId(m.id)} className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah */}
      {modal === 'tambah' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900">Tambah Mitra</h3>
            <form onSubmit={handleTambah} className="mt-4 space-y-4">
              <FormField label="Nama *"><input {...formProps} required value={form.nama} onChange={(e) => setForm(p => ({ ...p, nama: e.target.value }))} /></FormField>
              <FormField label="Username *"><input {...formProps} required value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} /></FormField>
              <FormField label="Password"><input {...formProps} type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Kosongkan untuk default mitra123" /></FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modal === 'edit' && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stone-900">Edit Mitra</h3>
            <form onSubmit={handleEdit} className="mt-4 space-y-4">
              <FormField label="Nama *"><input {...formProps} required value={form.nama} onChange={(e) => setForm(p => ({ ...p, nama: e.target.value }))} /></FormField>
              <FormField label="Username *"><input {...formProps} required value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} /></FormField>
              <FormField label="Password Baru"><input {...formProps} type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Kosongkan jika tidak diganti" /></FormField>
              <FormField label="Alamat"><input {...formProps} value={form.alamat} onChange={(e) => setForm(p => ({ ...p, alamat: e.target.value }))} /></FormField>
              <FormField label="No. HP"><input {...formProps} value={form.no_hp} onChange={(e) => setForm(p => ({ ...p, no_hp: e.target.value }))} /></FormField>
              <FormField label="Email"><input {...formProps} type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} /></FormField>
              <FormField label="Status">
                <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className={selectClass}>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {hapusId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm" onClick={() => setHapusId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-stone-900">Hapus Mitra?</h3>
            <p className="mt-2 text-sm text-stone-500">Data mitra akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setHapusId(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Batal</button>
              <button onClick={() => handleHapus(hapusId)} className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-200 hover:from-rose-700 hover:to-pink-700 transition-all">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const formProps = { className: 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100' }
const selectClass = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>{children}</div>
}
