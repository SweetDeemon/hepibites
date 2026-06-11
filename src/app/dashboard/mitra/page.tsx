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
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${msg.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={msg.type === 'success' ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
          {msg.text}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Cari mitra..." value={search} onChange={(e) => { setSearch(e.target.value); setLoading(true) }} className="w-full rounded-xl border border-violet-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-[#2e1065] placeholder-[#a78bfa]/50 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setLoading(true) }} className="rounded-xl border border-violet-200 bg-white/70 px-4 py-2.5 text-sm text-[#2e1065] outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
          <option value="">Semua</option>
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <button onClick={() => { resetForm(); setModal('tambah') }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl cursor-pointer">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Tambah Mitra
        </button>
        <span className="text-sm text-[#6d28d9]/50">{list.length} mitra</span>
      </div>

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
            <svg className="h-8 w-8 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
          </div>
          <p className="text-[#6d28d9]/60">Belum ada mitra.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white/80 shadow-sm backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-violet-100 bg-gradient-to-r from-violet-50/50 to-fuchsia-50/50">
                  <th className="px-3 py-3.5 sm:px-5 text-left font-medium text-[#6d28d9]/60 text-xs sm:text-sm">Nama</th>
                  <th className="px-3 py-3.5 sm:px-5 text-left font-medium text-[#6d28d9]/60 text-xs sm:text-sm">Username</th>
                  <th className="hidden px-3 py-3.5 sm:px-5 text-left font-medium text-[#6d28d9]/60 text-xs sm:text-sm sm:table-cell">No. HP</th>
                  <th className="px-3 py-3.5 sm:px-5 text-left font-medium text-[#6d28d9]/60 text-xs sm:text-sm">Status</th>
                  <th className="hidden px-3 py-3.5 sm:px-5 text-left font-medium text-[#6d28d9]/60 text-xs sm:text-sm md:table-cell">Dibuat</th>
                  <th className="px-3 py-3.5 sm:px-5" />
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-b border-violet-50 transition-colors hover:bg-violet-50/30">
                    <td className="px-3 py-3.5 sm:px-5 font-medium text-[#2e1065] text-xs sm:text-sm">{m.nama}</td>
                    <td className="px-3 py-3.5 sm:px-5 text-[#6d28d9]/70 text-xs sm:text-sm">{m.username}</td>
                    <td className="hidden px-3 py-3.5 sm:px-5 text-[#6d28d9]/50 text-xs sm:text-sm sm:table-cell">{m.no_hp || '—'}</td>
                    <td className="px-3 py-3.5 sm:px-5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium ${m.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-violet-100 text-[#6d28d9]/60 ring-1 ring-violet-200'}`}>{m.status}</span>
                    </td>
                    <td className="hidden px-3 py-3.5 sm:px-5 text-[#6d28d9]/50 text-xs sm:text-sm md:table-cell">{formatDate(m.created_at)}</td>
                    <td className="px-3 py-3.5 sm:px-5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditTarget(m); resetForm(m); setModal('edit') }} className="rounded-lg px-2 py-1.5 sm:px-3 text-xs font-medium text-[#6d28d9]/60 hover:bg-violet-100 hover:text-[#5b21b6] transition-colors cursor-pointer">Edit</button>
                        <button onClick={() => setHapusId(m.id)} className="rounded-lg px-2 py-1.5 sm:px-3 text-xs font-medium text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer">Hapus</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm animate-slide-up" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-200/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm font-bold">+</div>
              <h3 className="text-lg font-semibold text-[#2e1065]">Tambah Mitra</h3>
            </div>
            <form onSubmit={handleTambah} className="space-y-4">
              <FormField label="Nama *"><input {...formProps} required value={form.nama} onChange={(e) => setForm(p => ({ ...p, nama: e.target.value }))} /></FormField>
              <FormField label="Username *"><input {...formProps} required value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))} /></FormField>
              <FormField label="Password"><input {...formProps} type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Kosongkan untuk default mitra123" /></FormField>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#6d28d9]/60 hover:bg-violet-50 transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 transition-all cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {modal === 'edit' && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm animate-slide-up" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-200/20" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-bold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-[#2e1065]">Edit Mitra</h3>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
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
                <button type="button" onClick={() => setModal(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#6d28d9]/60 hover:bg-violet-50 transition-colors cursor-pointer">Batal</button>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-200/50 hover:from-violet-700 hover:to-fuchsia-700 transition-all cursor-pointer">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {hapusId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-sm animate-slide-up" onClick={() => setHapusId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl shadow-violet-200/20" onClick={e => e.stopPropagation()}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 mb-4">
              <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-[#2e1065]">Hapus Mitra?</h3>
            <p className="mt-2 text-sm text-[#6d28d9]/60">Data mitra akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setHapusId(null)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#6d28d9]/60 hover:bg-violet-50 transition-colors cursor-pointer">Batal</button>
              <button onClick={() => handleHapus(hapusId)} className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-200/50 hover:from-rose-700 hover:to-pink-700 transition-all cursor-pointer">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

const formProps = { className: 'w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-[#2e1065] placeholder-[#a78bfa]/50 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100' }
const selectClass = 'w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-[#2e1065] outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-[#2e1065] mb-1.5">{label}</label>{children}</div>
}
