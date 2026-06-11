'use client'

import { useState, FormEvent } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login gagal'); return }
      window.location.href = data.data.redirect
    } catch { setError('Terjadi kesalahan.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#faf5ff] via-white to-[#fdf4ff] p-4">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-violet-300/30 to-fuchsia-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-amber-300/20 to-orange-300/20 blur-3xl" style={{ animationDelay: '-3s' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-bold text-white shadow-xl shadow-violet-200/50 ring-4 ring-white/50">
            H
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#2e1065]">HepiBites</h1>
          <p className="mt-1 text-[#6d28d9]/60">Masuk ke dashboard Anda</p>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-white/80 p-8 shadow-xl shadow-violet-200/20 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#2e1065] mb-1.5">Username</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <input
                  id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  required autoFocus placeholder="Masukkan username"
                  className="block w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 pl-11 text-sm text-[#2e1065] placeholder-[#a78bfa]/50 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2e1065] mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Masukkan password"
                  className="block w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-3 pl-11 text-sm text-[#2e1065] placeholder-[#a78bfa]/50 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="flex h-13 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-200/50 transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 p-4">
            <p className="text-center text-xs text-[#6d28d9]/60">
              Admin & Mitra login di halaman yang sama — sistem akan mengenali akun Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
