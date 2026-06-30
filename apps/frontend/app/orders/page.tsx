'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'
import { getToken, getUser } from '../lib/auth'

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  PAID:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  SHIPPED:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  REFUNDED:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_ICONS: Record<string, string> = {
  PENDING:   '⏳',
  PAID:      '✅',
  SHIPPED:   '🚚',
  DELIVERED: '📦',
  CANCELLED: '❌',
  REFUNDED:  '↩️',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)


  useEffect(() => {
    const user = getUser()
    if (!user) { setIsGuest(true); setLoading(false); return }
    fetch('http://localhost:4000/api/orders/my', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Guest view */}
        {isGuest && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Sign in to view your orders
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Track your purchases and order history
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login"
                className="text-xs bg-blue-500 text-white px-5 py-2 rounded-lg inline-block">
                Sign In
              </Link>
              <Link href="/register"
                className="text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2 rounded-lg inline-block">
                Register
              </Link>
            </div>
          </div>
        )}
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">My Orders</h2>

        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">Start browsing to find cards!</p>
            <Link href="/"
              className="text-xs bg-blue-500 text-white px-4 py-2 rounded-lg inline-block">
              Browse cards
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

                {/* Order header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${STATUS_STYLES[order.status] ?? ''}`}>
                    {STATUS_ICONS[order.status]} {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-gray-400 flex-shrink-0">x{item.quantity}</span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">
                          {item.listing?.card?.name ?? 'Card'}
                        </span>
                        <span className="text-gray-400 flex-shrink-0 hidden sm:block">
                          · {item.listing?.condition?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 flex-shrink-0 ml-2">
                        ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">
                    {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₱{parseFloat(order.total).toLocaleString()}
                  </span>
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