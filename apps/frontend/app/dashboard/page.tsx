'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'
import { getToken, getUser } from '../lib/auth'
import Link from 'next/link'

type Listing = {
  id: string
  condition: string
  price: string
  stock: number
  description: string | null
  card: { name: string; set: string; number: string; rarity: string; imageUrl: string | null }
}

type Shop = {
  id: string
  shopName: string
  description: string | null
  listings: Listing[]
}

const CONDITIONS = [
  { value: 'NEAR_MINT', label: 'Near Mint' },
  { value: 'LIGHTLY_PLAYED', label: 'Lightly Played' },
  { value: 'MODERATELY_PLAYED', label: 'Moderately Played' },
  { value: 'HEAVILY_PLAYED', label: 'Heavily Played' },
  { value: 'DAMAGED', label: 'Damaged' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    cardName: '', set: '', number: '', rarity: '',
    imageUrl: '', condition: 'NEAR_MINT',
    price: '', stock: '1', description: ''
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }
    if (user.role !== 'SELLER') { router.push('/'); return }
    fetchShop()
  }, [])

  const fetchShop = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/seller/me', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.status === 404) { router.push('/dashboard/setup'); return }
      setShop(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')
    try {
      const res = await fetch('http://localhost:4000/api/seller/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) })
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed'); return }
      setForm({ cardName: '', set: '', number: '', rarity: '', imageUrl: '', condition: 'NEAR_MINT', price: '', stock: '1', description: '' })
      setShowForm(false)
      fetchShop()
    } catch { setAddError('Something went wrong.') }
    finally { setAddLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this listing?')) return
    await fetch(`http://localhost:4000/api/seller/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    fetchShop()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading your shop...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Shop header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {shop?.shopName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{shop?.shopName}</p>
              <p className="text-xs text-gray-400">Seller Dashboard</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Listings</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{shop?.listings.length ?? 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-0.5">Total Stock</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {shop?.listings.reduce((s, l) => s + l.stock, 0) ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/dashboard/orders"
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-2 hover:border-blue-400 transition-colors">
            <span className="text-lg">📦</span>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Orders</p>
              <p className="text-xs text-gray-400">Manage incoming</p>
            </div>
          </Link>
          <Link href={`/shops/${shop?.shopName}`}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-2 hover:border-blue-400 transition-colors">
            <span className="text-lg">🏪</span>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">My Shop</p>
              <p className="text-xs text-gray-400">Public page</p>
            </div>
          </Link>
        </div>

        {/* Listings header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Listings</h3>
          <button onClick={() => setShowForm(!showForm)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              showForm
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
            {showForm ? 'Cancel' : '+ Add Listing'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">New Listing</h3>
            {addError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-lg mb-3">
                {addError}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'cardName', label: 'Card Name', placeholder: 'Charizard' },
                  { key: 'set', label: 'Set', placeholder: 'Base Set' },
                  { key: 'number', label: 'Card Number', placeholder: '4/102' },
                  { key: 'rarity', label: 'Rarity', placeholder: 'Holo Rare' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 block mb-1">{f.label}</label>
                    <input
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      required
                      className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Image URL (optional)</label>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-3 sm:col-span-1">
                  <label className="text-xs text-gray-400 block mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none">
                    {CONDITIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Price (₱)</label>
                  <input
                    type="number" min="0" step="0.01" required
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Stock</label>
                  <input
                    type="number" min="1" required
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none"
                  placeholder="Card condition details..."
                />
              </div>

              <button type="submit" disabled={addLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-xs transition-colors">
                {addLoading ? 'Adding...' : 'Add Listing'}
              </button>
            </form>
          </div>
        )}

        {/* Listings list */}
        {shop?.listings.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
            <p className="text-2xl mb-2">🃏</p>
            <p className="text-sm text-gray-400">No listings yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "+ Add Listing" to get started</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {shop?.listings.map(listing => (
              <div key={listing.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
                <div className="w-10 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  🃏
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{listing.card.name}</p>
                  <p className="text-xs text-gray-400 truncate">{listing.card.set} · #{listing.card.number}</p>
                  <p className="text-xs text-gray-400">{listing.condition.replace(/_/g, ' ')} · {listing.stock} in stock</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-1">
                    ₱{parseFloat(listing.price).toLocaleString()}
                  </p>
                  <button onClick={() => handleDelete(listing.id)}
                    className="text-xs text-red-400 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}