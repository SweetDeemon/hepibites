import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/40 blur-3xl" />
      </div>
      <div className="relative text-center px-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-violet-200/50 ring-4 ring-white/50">
          H
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900">HepiBites</h1>
        <p className="mt-3 text-lg text-stone-500">Sistem Manajemen Penjualan Snack</p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          Masuk
        </Link>
      </div>
    </div>
  )
}
