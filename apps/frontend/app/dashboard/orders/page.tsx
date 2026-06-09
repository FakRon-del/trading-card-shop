'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import { getToken, getUser } from '../../lib/auth'

const STATUS_OPTIONS = ['PENDING','PAID','SHIPPED','DELIVERED','CANCELLED']

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  PAID:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  SHIPPED:   'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const STATUS_ICONS: Record<string, string> = {
  PENDING: '⏳', PAID: '✅', SHIPPED: '🚚', DELIVERED: '📦', CANCELLED: '❌'
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }
    if (user.role !== 'SELLER') { router.push('/'); return }
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/orders/seller', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      setOrders(await res.json())
    } catch {} finally { setLoading(false) }
  }

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      })
      fetchOrders()
    } catch {} finally { setUpdating(null) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Incoming Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Manage and update order status</p>
          </div>
          <Link href="/dashboard"
            className="text-xs text-blue-500 hover:text-blue-600">
            ← Dashboard
          </Link>
        </div>

        {/* Loading */}
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

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-16 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm text-gray-400">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Orders from buyers will appear here</p>
          </div>
        )}

        {/* Orders */}
        {!loading && orders.map(order => (
          <div key={order.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

            {/* Order header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-400">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                {STATUS_ICONS[order.status]} {order.status}
              </span>
            </div>

            {/* Buyer info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">👤</span>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{order.user?.name}</p>
              </div>
              {order.address && (
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-sm flex-shrink-0">📍</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.address}</p>
                </div>
              )}
              {order.contactNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">📱</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.contactNumber}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1.5 mb-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300 truncate mr-2">
                    {item.listing?.card?.name} x{item.quantity}
                    <span className="text-gray-400 ml-1">
                      · {item.listing?.condition?.replace(/_/g, ' ')}
                    </span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 flex-shrink-0">
                    ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total + status update */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ₱{parseFloat(order.total).toLocaleString()}
              </span>

              {/* Status selector */}
              <select
                value={order.status}
                disabled={updating === order.id || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                onChange={e => updateStatus(order.id, e.target.value)}
                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 outline-none disabled:opacity-50 cursor-pointer">
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_ICONS[s]} {s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}