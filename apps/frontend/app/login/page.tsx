'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.user.role === 'SELLER') router.push('/dashboard')
      else router.push('/')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="Pullverse TCG" className="w-9 h-9 object-contain" />
        <span className="font-semibold text-gray-900 dark:text-white text-lg">
          Pullverse <span className="text-blue-500">TCG</span>
        </span>
      </Link>

      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Welcome back</h1>
        <p className="text-xs text-gray-400 mb-5">Sign in to your Pullverse TCG account</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-1">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-600">Register</Link>
        </p>
      </div>
    </main>
  )
}