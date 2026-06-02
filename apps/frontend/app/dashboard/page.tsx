'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, getUser, logout } from '../lib/auth'

type Listing = {
  id: string
  condition: string
  price: string
  stock: number
  description: string | null
  card: {
    name: string
    set: string
    number: string
    rarity: string
    imageUrl: string | null
  }
}

type Shop = {
  id: string
  shopName: string
  description: string | null
  listings: Listing[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // Add listing form state
  const [cardName, setCardName] = useState('')
  const [set, setSet] = useState('')
  const [number, setNumber] = useState('')
  const [rarity, setRarity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [condition, setCondition] = useState('NEAR_MINT')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('1')
  const [description, setDescription] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

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
      if (res.status === 404) {
        router.push('/dashboard/setup')
        return
      }
      const data = await res.json()
      setShop(data)
    } catch {
      console.error('Failed to fetch shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')

    try {
      const res = await fetch('http://localhost:4000/api/seller/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          cardName, set, number, rarity, imageUrl,
          condition, price: parseFloat(price),
          stock: parseInt(stock), description
        })
      })

      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed'); return }

      // Reset form and refresh
      setCardName(''); setSet(''); setNumber(''); setRarity('')
      setImageUrl(''); setPrice(''); setStock('1'); setDescription('')
      setShowAddForm(false)
      fetchShop()
    } catch {
      setAddError('Something went wrong.')
    } finally {
      setAddLoading(false)
    }
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
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading your shop...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🏪 {shop?.shopName}</h1>
            <p className="text-gray-400 text-xs">Seller Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-gray-400 hover:text-white text-sm">View Shop</a>
            <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Total Listings</p>
            <p className="text-white text-2xl font-bold">{shop?.listings.length ?? 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Total Stock</p>
            <p className="text-white text-2xl font-bold">
              {shop?.listings.reduce((sum, l) => sum + l.stock, 0) ?? 0}
            </p>
          </div>
        </div>

        {/* Listings header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Your Listings</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Listing'}
          </button>
        </div>

        {/* Add listing form */}
        {showAddForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">New Listing</h3>
            {addError && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddListing} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Card Name</label>
                <input value={cardName} onChange={e => setCardName(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Charizard" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Set</label>
                <input value={set} onChange={e => setSet(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Base Set" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Card Number</label>
                <input value={number} onChange={e => setNumber(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="4/102" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Rarity</label>
                <input value={rarity} onChange={e => setRarity(e.target.value)} required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Holo Rare" />
              </div>
              <div className="col-span-2">
                <label className="text-gray-400 text-xs block mb-1">Image URL <span className="text-gray-600">(optional)</span></label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="https://..." />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="NEAR_MINT">Near Mint</option>
                  <option value="LIGHTLY_PLAYED">Lightly Played</option>
                  <option value="MODERATELY_PLAYED">Moderately Played</option>
                  <option value="HEAVILY_PLAYED">Heavily Played</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Price (₱)</label>
                <input value={price} onChange={e => setPrice(e.target.value)} required type="number" min="0" step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="500.00" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Stock</label>
                <input value={stock} onChange={e => setStock(e.target.value)} required type="number" min="1"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="1" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Description <span className="text-gray-600">(optional)</span></label>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Card condition details..." />
              </div>
              <div className="col-span-2">
                <button type="submit" disabled={addLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                  {addLoading ? 'Adding...' : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings table */}
        {shop?.listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-500">No listings yet.</p>
            <p className="text-gray-600 text-sm mt-1">Click "+ Add Listing" to list your first card!</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Card</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Condition</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Price</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Stock</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {shop?.listings.map((listing, i) => (
                  <tr key={listing.id} className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{listing.card.name}</p>
                      <p className="text-gray-500 text-xs">{listing.card.set} · #{listing.card.number}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {listing.condition.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-green-400 font-semibold">
                      ₱{parseFloat(listing.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{listing.stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}