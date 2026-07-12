'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      if (data.user.role === 'SELLER') router.push('/dashboard/setup')
      else router.push('/')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-8">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <img src="/logo.png" alt="Booster Hunt TCG" className="w-9 h-9 object-contain" />
        <span className="font-semibold text-gray-900 dark:text-white text-lg">
          Booster Hunt <span className="text-blue-500">TCG</span>
        </span>
      </Link>

      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Create account</h1>
        <p className="text-xs text-gray-400 mb-5">Join Booster Hunt TCG — free forever</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              placeholder="Juan Santos"
            />
          </div>
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
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
              placeholder="Min. 6 characters"
            />
          </div>

          {/* Role picker */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">I want to...</label>
            <div className="grid grid-cols-2 gap-2">
              {([['BUYER', '🛒', 'Buy Cards'], ['SELLER', '🏪', 'Sell Cards']] as const).map(([r, icon, label]) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-3 rounded-xl border text-sm transition-colors flex flex-col items-center gap-1 ${
                    role === r
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-1">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600">Sign in</Link>
        </p>
      </div>
    </main>
  )
}