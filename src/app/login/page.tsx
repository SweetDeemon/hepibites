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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-60 w-60 -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/20 to-rose-200/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white shadow-xl shadow-violet-200/50 ring-4 ring-white">
            H
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-stone-900">HepiBites</h1>
          <p className="mt-1 text-sm text-stone-500">Masuk ke akun Anda</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-700 mb-1.5">Username</label>
              <input
                id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoFocus placeholder="Masukkan username"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="Masukkan password"
                className="block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-400">
            Admin & Mitra — satu halaman login
          </p>
        </div>
      </div>
    </div>
  )
}
