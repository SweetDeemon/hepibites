import Link from 'next/link'

const features = [
  {
    title: 'Manajemen Mitra',
    desc: 'Kelola data mitra, tracking aktivitas, dan lokasi dengan peta interaktif.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    ),
  },
  {
    title: 'Transaksi Cepat',
    desc: 'Catat penjualan cash atau kredit. Harga otomatis berdasarkan jumlah karton.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    ),
  },
  {
    title: 'Manajemen Stok',
    desc: 'Monitor stok real-time, notifikasi stok menipis, dan restock mudah.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    ),
  },
  {
    title: 'Kredit & Pembayaran',
    desc: 'Catat hutang mitra, pelunasan parsial, dan status jatuh tempo otomatis.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    title: 'Laporan Lengkap',
    desc: 'Rekap penjualan harian & bulanan dengan visualisasi data yang jelas.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    title: 'Peta Interaktif',
    desc: 'Lihat lokasi mitra di area Jombang dengan Leaflet & OpenStreetMap.',
    icon: (
      <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>
    ),
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#faf5ff] via-white to-[#fdf4ff]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-amber-300/20 to-orange-300/20 blur-3xl" style={{ animationDelay: '-3s' }} />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 animate-pulse-glow rounded-full bg-gradient-to-br from-violet-200/20 to-purple-200/20 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-violet-200/50">H</div>
          <span className="text-xl font-bold text-[#2e1065]">HepiBites</span>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl hover:-translate-y-0.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          Masuk
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-500" />
            Sistem Manajemen Snack Terintegrasi
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#2e1065] sm:text-6xl lg:text-7xl">
            Kelola Bisnis Snack
            <span className="block mt-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">Lebih Mudah & Cepat</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#6d28d9]/70 sm:text-xl max-w-2xl mx-auto">
            Catat transaksi, pantau stok, kelola mitra, dan lihat laporan real-time — 
            semua dalam satu platform yang dirancang untuk bisnis snack Anda.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 text-base font-semibold text-white shadow-xl shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Mulai Sekarang
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center gap-2 rounded-2xl border-2 border-violet-200 bg-white/60 px-8 text-base font-semibold text-[#2e1065] backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-white hover:-translate-y-0.5"
            >
              Login Admin
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-[#6d28d9]/60">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Manajemen Mitra
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Stok Real-time
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Laporan Otomatis
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="text-3xl font-bold text-[#2e1065] sm:text-4xl">Fitur Lengkap untuk Bisnis Anda</h2>
          <p className="mt-4 text-lg text-[#6d28d9]/70">Semua yang Anda butuhkan untuk mengelola penjualan snack HepiBites.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-violet-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-violet-200"
              style={{ animation: `slide-up 0.5s ease-out ${i * 0.1}s both` }}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 transition-all group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200/50">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
              </div>
              <h3 className="mt-5 font-semibold text-[#2e1065] group-hover:text-violet-700 transition-colors">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6d28d9]/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 px-8 py-16 text-center shadow-2xl sm:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Siap Mengelola Bisnis Snack Anda?</h2>
            <p className="mt-4 text-lg text-violet-100">Mulai kelola mitra, transaksi, dan stok dalam satu platform terintegrasi.</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-10 text-base font-semibold text-violet-700 shadow-xl transition-all hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Masuk ke Dashboard
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-violet-100 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-sm text-[#6d28d9]/50">&copy; {new Date().getFullYear()} HepiBites. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
