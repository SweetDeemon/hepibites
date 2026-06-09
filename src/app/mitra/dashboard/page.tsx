'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Produk = { id: string; nama: string; varian: string; stok: number; isi_per_karton: number; harga_satuan: number; harga_grosir: number; min_grosir: number; max_grosir: number }
type Transaksi = { id: string; jumlah_karton: number; harga_per_karton: number; total_harga: number; metode_bayar: string; status_bayar: string; created_at: string; produk: { nama: string; varian: string }; kredit?: { sisa_hutang: number; status: string } | null }

function rupiah(n: number) { return `Rp ${n.toLocaleString('id-ID')}` }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }

const tabs = [
  { key: 'produk', label: 'Produk & Beli' },
  { key: 'riwayat', label: 'Riwayat' },
  { key: 'kredit', label: 'Kredit' },
  { key: 'profil', label: 'Profil' },
] as const

export default function MitraDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<{ id: string; nama: string } | null>(null)
  const [produkList, setProdukList] = useState<Produk[]>([])
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([])
  const [kreditData, setKreditData] = useState<{ kredit: Array<{ id: string; sisa_hutang: number; status: string; tanggal_jatuh_tempo: string }>; total_hutang_aktif: number } | null>(null)
  const [nearDue, setNearDue] = useState<Array<{ sisa_hutang: number; jatuh_tempo: Date }>>([])
  const [tab, setTab] = useState<'produk' | 'riwayat' | 'kredit' | 'profil'>('produk')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [qty, setQty] = useState(1)
  const [payment, setPayment] = useState<'cash' | 'kredit'>('cash')
  const [jatuhTempo, setJatuhTempo] = useState('')
  const [buyError, setBuyError] = useState('')
  const [buyLoading, setBuyLoading] = useState(false)
  const [buySuccess, setBuySuccess] = useState('')
  const [profil, setProfil] = useState({ nama: '', username: '', alamat: '', no_hp: '', email: '' })
  const [profilForm, setProfilForm] = useState({ alamat: '', no_hp: '', email: '', password: '', password_lama: '' })
  const [profilMsg, setProfilMsg] = useState({ type: '', text: '' })
  const [profilLoading, setProfilLoading] = useState(false)

  useEffect(() => {
    async function init() {
      const sesRes = await fetch('/api/auth/mitra/session')
      if (!sesRes.ok) { router.push('/login'); return }
      const sesData = await sesRes.json()
      if (!sesData.success) { router.push('/login'); return }
      setSession(sesData.data)

      const [prodRes, transRes, kreditRes, profilRes] = await Promise.all([
        fetch('/api/mitra-portal/produk'), fetch('/api/mitra-portal/transaksi'), fetch('/api/mitra-portal/kredit'), fetch('/api/mitra-portal/profil'),
      ])

      const prodData = await prodRes.json()
      if (prodData.success) { setProdukList(prodData.data); if (prodData.data.length > 0) setSelected(prodData.data[0].id) }
      const transData = await transRes.json()
      if (transData.success) setTransaksiList(transData.data)
      const kreditData = await kreditRes.json()
      if (kreditData.success) {
        setKreditData(kreditData.data)
        const now = new Date()
        const near = kreditData.data.kredit.filter((k: { status: string; tanggal_jatuh_tempo: string }) => {
          if (k.status !== 'aktif') return false
          return (new Date(k.tanggal_jatuh_tempo).getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 3
        }).map((k: { sisa_hutang: number; tanggal_jatuh_tempo: string }) => ({ sisa_hutang: k.sisa_hutang, jatuh_tempo: new Date(k.tanggal_jatuh_tempo) }))
        setNearDue(near)
      }
      const profilData = await profilRes.json()
      if (profilData.success) { setProfil(profilData.data); setProfilForm({ alamat: profilData.data.alamat || '', no_hp: profilData.data.no_hp || '', email: profilData.data.email || '', password: '', password_lama: '' }) }
      setLoading(false)
    }
    init()
  }, [router])

  const sp = produkList.find(p => p.id === selected)
  const hpk = qty === 1 ? sp?.harga_satuan ?? 105000 : (qty >= (sp?.min_grosir ?? 10) && qty <= (sp?.max_grosir ?? 30) ? sp?.harga_grosir ?? 100000 : null)

  async function handleBuy() {
    setBuyError(''); setBuySuccess(''); setBuyLoading(true)
    try {
      const body: Record<string, unknown> = { produk_id: selected, jumlah_karton: qty, metode_bayar: payment }
      if (payment === 'kredit') body.tanggal_jatuh_tempo = jatuhTempo
      const res = await fetch('/api/mitra-portal/transaksi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setBuyError(data.error); return }
      setBuySuccess('Pembelian berhasil!'); setQty(1); setPayment('cash'); setJatuhTempo('')
      fetch('/api/mitra-portal/produk').then(r => r.json()).then(d => { if (d.success) setProdukList(d.data) })
      fetch('/api/mitra-portal/transaksi').then(r => r.json()).then(d => { if (d.success) setTransaksiList(d.data) })
      fetch('/api/mitra-portal/kredit').then(r => r.json()).then(d => { if (d.success) setKreditData(d.data) })
    } catch { setBuyError('Terjadi kesalahan') }
    finally { setBuyLoading(false) }
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-stone-200 bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-200">H</div>
          <span className="text-lg font-bold text-stone-900">HepiBites</span>
        </div>
        <nav className="space-y-1 p-4">
          {tabs.map((item) => {
            const active = tab === item.key
            return (
              <button key={item.key} onClick={() => { setTab(item.key as typeof tab); setSidebarOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span className={active ? 'text-emerald-600' : 'text-stone-400'}>
                  {item.key === 'produk' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                  {item.key === 'riwayat' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  {item.key === 'kredit' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  {item.key === 'profil' && <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-xs font-bold text-white">{session?.nama.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-stone-900">{session?.nama}</p>
              <p className="text-xs text-stone-500">Mitra</p>
            </div>
            <button onClick={async () => { await fetch('/api/auth/mitra/logout', { method: 'POST' }); window.location.href = '/login' }} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600" title="Keluar">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-lg lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 text-stone-500 hover:bg-stone-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white">H</div>
              <span className="font-bold text-stone-900">HepiBites</span>
            </div>
            <button onClick={async () => { await fetch('/api/auth/mitra/logout', { method: 'POST' }); window.location.href = '/login' }} className="rounded-xl p-2 text-stone-500 hover:bg-stone-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
          {/* Mobile tab bar */}
          <div className="flex gap-1 overflow-x-auto border-t border-stone-100 px-2 py-1.5">
            {tabs.map((item) => {
              const active = tab === item.key
              return (
                <button key={item.key} onClick={() => setTab(item.key as typeof tab)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active ? 'bg-emerald-100 text-emerald-700' : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        {/* Desktop tab bar */}
        <div className="hidden border-b border-stone-200 bg-white lg:block">
          <div className="mx-auto max-w-6xl px-8">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tabs.map((item) => {
                  const active = tab === item.key
                  return (
                    <button key={item.key} onClick={() => setTab(item.key as typeof tab)}
                      className={`relative px-5 py-4 text-sm font-medium transition-colors ${
                        active ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {item.label}
                      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />}
                    </button>
                  )
                })}
              </div>
              <p className="text-sm text-stone-500">Halo, {session?.nama}</p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Overdue banner */}
            {nearDue.length > 0 && (
              <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm">
                <p className="flex items-center gap-2 text-sm font-medium text-rose-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-xs">!</span>
                  Tagihan Mendekati Jatuh Tempo
                </p>
                <ul className="mt-2 space-y-1">
                  {nearDue.map((n, i) => {
                    const overdue = n.jatuh_tempo < new Date()
                    const hari = Math.ceil((n.jatuh_tempo.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return <li key={i} className="ml-7 text-sm text-rose-700">{rupiah(n.sisa_hutang)} — {overdue ? `Terlambat ${Math.abs(hari)} hari` : `Jatuh tempo ${hari} hari lagi`}</li>
                  })}
                </ul>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" /></div>
            ) : (
              <>
                {/* Tab: Produk & Beli */}
                {tab === 'produk' && (
                  <>
                    {buySuccess && <div className="rounded-2xl border border-emerald-200 bg-green-50 p-4 text-sm text-emerald-700 shadow-sm">{buySuccess}</div>}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {produkList.map(p => (
                        <button key={p.id} onClick={() => setSelected(p.id)} className={`group relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                          selected === p.id ? 'border-emerald-500 bg-white ring-2 ring-emerald-200' : 'border-stone-200 bg-white'
                        }`}>
                          <div className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br ${selected === p.id ? 'from-emerald-500 to-teal-600' : 'from-emerald-500 to-teal-600'} opacity-5`} />
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-stone-900 capitalize">{p.varian}</span>
                            <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{p.stok} karton</span>
                          </div>
                          <p className="text-xs text-stone-500">{p.nama}</p>
                          <div className="mt-3 flex items-baseline gap-2"><span className="text-xl font-bold text-stone-900">{rupiah(p.harga_satuan)}</span><span className="text-xs text-stone-400">/ karton</span></div>
                          <p className="mt-1 text-xs text-stone-400">{p.isi_per_karton} pcs/karton</p>
                          <p className="mt-0.5 text-xs text-emerald-700">Grosir {p.min_grosir}-{p.max_grosir}: {rupiah(p.harga_grosir)}/karton</p>
                        </button>
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                      <div className="border-b border-stone-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                        <h2 className="font-semibold text-stone-900">Beli Produk</h2>
                      </div>
                      <div className="p-6">
                        {sp && (
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-stone-500">Varian</label>
                              <p className="mt-1 text-sm font-medium text-stone-900 capitalize">{sp.varian}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-500 mb-1">Jumlah (karton)</label>
                              <input type="number" min={1} max={sp.stok} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-500 mb-1">Metode Bayar</label>
                              <select value={payment} onChange={(e) => setPayment(e.target.value as 'cash' | 'kredit')} className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
                                <option value="cash">Cash — Langsung Lunas</option>
                                <option value="kredit">Kredit — Bayar Nanti</option>
                              </select>
                            </div>
                            {payment === 'kredit' && (
                              <div>
                                <label className="block text-sm font-medium text-stone-500 mb-1">Jatuh Tempo (maks 5 hari)</label>
                                <input type="date" required value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
                              </div>
                            )}
                          </div>
                        )}
                        {qty !== 1 && hpk === null && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">Jumlah karton harus 1 atau antara {sp?.min_grosir}-{sp?.max_grosir}.</p>}
                        {hpk !== null && (
                          <div className="mt-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm"><span className="text-stone-500">Harga per karton</span><span className="font-medium text-stone-900">{rupiah(hpk)}</span></div>
                              <div className="flex justify-between text-sm"><span className="text-stone-500">Jumlah karton</span><span className="font-medium text-stone-900">{qty}</span></div>
                              <div className="flex justify-between border-t border-emerald-200 pt-3 text-base font-bold"><span className="text-stone-900">Total</span><span className="text-emerald-700">{rupiah(qty * hpk)}</span></div>
                            </div>
                          </div>
                        )}
                        {buyError && <p className="mt-3 text-sm text-rose-600">{buyError}</p>}
                        <button onClick={handleBuy} disabled={buyLoading || hpk === null} className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:opacity-50">
                          {buyLoading ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Memproses...</> : 'Beli Sekarang'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Tab: Riwayat */}
                {tab === 'riwayat' && (
                  <div className="space-y-3">
                    {transaksiList.length === 0 ? (
                      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-stone-500">Belum ada transaksi.</p>
                      </div>
                    ) : transaksiList.map(t => (
                      <div key={t.id} className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                              <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div>
                              <p className="font-medium text-stone-900 capitalize">{t.produk.varian} — {t.jumlah_karton} karton</p>
                              <p className="text-xs text-stone-400">{formatDate(t.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:text-right">
                            <p className="font-bold text-stone-900">{rupiah(t.total_harga)}</p>
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                              t.status_bayar === 'lunas' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                            }`}>{t.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Kredit */}
                {tab === 'kredit' && (
                  <div className="space-y-4">
                    {kreditData && (
                      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-stone-500">Total Hutang Aktif</p>
                        <p className="text-3xl font-bold text-rose-600">{rupiah(kreditData.total_hutang_aktif)}</p>
                      </div>
                    )}
                    {kreditData?.kredit.length === 0 && (
                      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-stone-500">Tidak ada kredit.</p>
                      </div>
                    )}
                    {kreditData?.kredit.map(k => (
                      <div key={k.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-stone-900">Sisa: <span className="font-bold">{rupiah(k.sisa_hutang)}</span></p>
                            {k.tanggal_jatuh_tempo && <p className="mt-0.5 text-xs text-stone-400">Jatuh tempo: {formatDate(k.tanggal_jatuh_tempo)}</p>}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                            k.status === 'lunas' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                          }`}>{k.status === 'lunas' ? 'Lunas' : 'Aktif'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: Profil */}
                {tab === 'profil' && (
                  <div className="max-w-2xl space-y-6">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-xl font-bold text-white shadow-lg">{session?.nama.charAt(0).toUpperCase()}</div>
                        <div>
                          <h2 className="text-lg font-bold text-stone-900">{profil.nama}</h2>
                          <p className="text-sm text-stone-500">@{profil.username}</p>
                        </div>
                      </div>
                    </div>

                    {profilMsg.text && (
                      <div className={`rounded-2xl px-5 py-3 text-sm shadow-sm ${
                        profilMsg.type === 'success' ? 'border border-emerald-200 bg-green-50 text-emerald-700' : 'border border-rose-200 bg-rose-50 text-rose-700'
                      }`}>{profilMsg.text}</div>
                    )}

                    <form onSubmit={async (e) => {
                      e.preventDefault(); setProfilLoading(true); setProfilMsg({ type: '', text: '' })
                      try {
                        const body: Record<string, string> = {}
                        if (profilForm.alamat !== (profil.alamat || '')) body.alamat = profilForm.alamat
                        if (profilForm.no_hp !== (profil.no_hp || '')) body.no_hp = profilForm.no_hp
                        if (profilForm.email !== (profil.email || '')) body.email = profilForm.email
                        if (profilForm.password) { body.password = profilForm.password; body.password_lama = profilForm.password_lama }
                        if (Object.keys(body).length === 0) { setProfilMsg({ type: 'error', text: 'Tidak ada data yang diubah' }); setProfilLoading(false); return }
                        const res = await fetch('/api/mitra-portal/profil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                        const data = await res.json()
                        if (!res.ok) { setProfilMsg({ type: 'error', text: data.error }); return }
                        setProfil(data.data); setProfilForm(p => ({ ...p, password: '', password_lama: '' }))
                        setProfilMsg({ type: 'success', text: 'Profil berhasil diperbarui!' })
                      } catch { setProfilMsg({ type: 'error', text: 'Terjadi kesalahan' }) }
                      finally { setProfilLoading(false) }
                    }} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                      <h2 className="font-semibold text-stone-900">Edit Profil</h2>
                      <div>
                        <label className="block text-sm font-medium text-stone-500 mb-1">Alamat</label>
                        <textarea value={profilForm.alamat} onChange={(e) => setProfilForm(p => ({ ...p, alamat: e.target.value }))} rows={3} className="block w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
                        <p className="mt-1.5 text-xs text-stone-400">Alamat akan otomatis dipetakan saat disimpan.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div><label className="block text-sm font-medium text-stone-500 mb-1">No. HP</label><input type="text" value={profilForm.no_hp} onChange={(e) => setProfilForm(p => ({ ...p, no_hp: e.target.value }))} className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></div>
                        <div><label className="block text-sm font-medium text-stone-500 mb-1">Email</label><input type="email" value={profilForm.email} onChange={(e) => setProfilForm(p => ({ ...p, email: e.target.value }))} className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></div>
                      </div>
                      <hr className="border-stone-200" />
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div><label className="block text-sm font-medium text-stone-500 mb-1">Password Baru</label><input type="password" value={profilForm.password} onChange={(e) => setProfilForm(p => ({ ...p, password: e.target.value }))} placeholder="Kosongkan jika tidak diganti" className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></div>
                        {profilForm.password && <div><label className="block text-sm font-medium text-stone-500 mb-1">Password Lama</label><input type="password" value={profilForm.password_lama} onChange={(e) => setProfilForm(p => ({ ...p, password_lama: e.target.value }))} className="block w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" /></div>}
                      </div>
                      <button type="submit" disabled={profilLoading} className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:opacity-50">
                        {profilLoading ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Menyimpan...</> : 'Simpan Profil'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
