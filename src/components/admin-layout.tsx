'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { href: '/dashboard/mitra', label: 'Mitra', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
  )},
  { href: '/dashboard/transaksi', label: 'Transaksi', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
  )},
  { href: '/dashboard/stok', label: 'Stok', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  )},
  { href: '/dashboard/pembayaran', label: 'Pembayaran', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
  { href: '/dashboard/laporan', label: 'Laporan', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  )},
  { href: '/dashboard/mitra-map', label: 'Peta', icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
]

export function AdminLayout({
  children,
  title,
  session,
}: {
  children: React.ReactNode
  title: string
  session: { name: string; role: string }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-stone-200 bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-200">
            H
          </div>
          <span className="text-lg font-bold text-stone-900">HepiBites</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span className={active ? 'text-violet-600' : 'text-stone-400'}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-stone-900">{session.name}</p>
              <p className="text-xs text-stone-500">{session.role}</p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
              title="Keluar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col lg:pl-0">
        {/* Top header (mobile) */}
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-lg lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-stone-500 hover:bg-stone-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">H</div>
              <span className="font-bold text-stone-900">HepiBites</span>
            </div>
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="rounded-xl p-2 text-stone-500 hover:bg-stone-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>

            {mobileNavOpen && (
              <div className="absolute right-4 top-16 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                <div className="border-b border-stone-100 px-3 py-2">
                  <p className="text-sm font-medium text-stone-900">{session.name}</p>
                  <p className="text-xs text-stone-500">{session.role}</p>
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Keluar
                </button>
              </div>
            )}
          </div>

          {/* Mobile bottom nav */}
          <div className="flex gap-1 overflow-x-auto border-t border-stone-100 px-2 py-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active ? 'bg-violet-100 text-violet-700' : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <span className={active ? 'text-violet-600' : 'text-stone-400'}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
