'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, getUser } from '../../lib/auth'

export default function ShopSetupPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }
    if (user.role !== 'SELLER') { router.push('/'); return }

    // Check if seller already has a shop
    fetch('http://localhost:4000/api/seller/me', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }).then(res => {
      if (res.ok) {
        // Already has a shop — go to dashboard
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }).catch(() => setChecking(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:4000/api/seller/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ shopName, description })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Setup failed')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="BHT" className="w-12 h-12 object-contain mx-auto mb-3" />
          <h1 className="text-base font-bold text-gray-900 dark:text-white">Set Up Your Shop</h1>
          <p className="text-xs text-gray-400 mt-1">This is a one-time setup — choose carefully!</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-medium">
                Shop Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#2563EB] text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                placeholder="e.g. JuanCards"
              />
              <p className="text-gray-400 text-xs mt-1">
                This is your permanent public shop URL — it cannot be changed later.
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-medium">
                Description <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#2563EB] text-gray-900 dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                placeholder="Tell buyers about your shop..."
              />
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-0.5">
                Important
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Your shop name cannot be modified after creation. Make sure it's exactly how you want it.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? 'Creating shop...' : 'Create My Shop'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}