'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

const API = 'https://pullverse-backend.onrender.com'
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-500', ACCEPTED: 'text-green-500',
  DECLINED: 'text-red-500', COMPLETED: 'text-blue-500', CANCELLED: 'text-gray-400'
}

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch(`${API}/api/deals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setDeals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Deals</h1>
        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {!loading && deals.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🤝</p>
            <p className="text-sm text-gray-400">No deals yet. Find a card and request a deal!</p>
            <Link href="/" className="text-xs text-blue-500 mt-2 inline-block">Browse cards →</Link>
          </div>
        )}
        <div className="space-y-3">
          {deals.map((deal: any) => (
            <Link key={deal.id} href={`/deals/${deal.id}`}
              className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                {deal.listing?.card?.imageUrl && (
                  <img src={deal.listing.card.imageUrl} alt="" className="w-12 h-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{deal.listing?.card?.name}</p>
                  <p className="text-xs text-blue-500">₱{parseFloat(deal.listing?.price || '0').toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    with {deal.buyerName === localStorage.getItem('user') ? deal.sellerName : deal.sellerName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-semibold ${STATUS_COLORS[deal.status] ?? 'text-gray-400'}`}>{deal.status}</p>
                  {deal.messages?.[0] && (
                    <p className="text-xs text-gray-400 mt-1 max-w-[120px] truncate">{deal.messages[0].content}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
