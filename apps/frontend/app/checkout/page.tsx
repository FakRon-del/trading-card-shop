'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { getToken, getUser } from '../lib/auth'

type CartItem = {
  listingId: string
  cardName: string
  price: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    if (!getUser()) { router.push('/login'); return }
    const stored = localStorage.getItem('cart')
    if (!stored || JSON.parse(stored).length === 0) return
    setCart(JSON.parse(stored))
  }, [])

  const total = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)

  const handleOrder = async () => {
    if (!address.trim()) { setError('Please enter your delivery address'); return }
    if (!contact.trim()) { setError('Please enter your contact number'); return }

    for (const item of cart) {
      if (item.quantity < 1) {
        setError('Invalid quantity detected. Please update your cart.')
        return
      }
    }

    const cartSnapshot = [...cart]
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          items: cart.map(i => ({ listingId: i.listingId, quantity: i.quantity })),
          address,
          contactNumber: contact
        })
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to place order'); return }

      localStorage.removeItem('cart')
      setCart(cartSnapshot)
      setOrderId(data.id)
      setSuccess(true)

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              🎉
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Order Placed!
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Your order has been confirmed. The seller will prepare your cards shortly.
            </p>

            {/* Order details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Order ID</span>
                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                  #{orderId.slice(-10).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Status</span>
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  ⏳ Pending
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Payment</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">Cash on Delivery</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                  ₱{total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Date</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Items summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Items ordered
              </p>
              <div className="space-y-1.5">
                {cartSnapshot.map(item => (
                  <div key={item.listingId} className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 truncate mr-2">
                      {item.cardName} x{item.quantity}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 flex-shrink-0">
                      ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href="/orders"
                className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg text-center transition-colors">
                View Orders
              </Link>
              <Link href="/"
                className="flex-1 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Keep Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

        {/* Back */}
        <Link href="/cart"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to cart
        </Link>

        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Checkout</h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        {/* Delivery details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Delivery Details</h3>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Delivery Address</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors resize-none"
              placeholder="House/Unit, Street, Barangay, City, Province"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Contact Number</label>
            <input
              type="text"
              value={contact}
              onChange={e => setContact(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none transition-colors"
              placeholder="09XX XXX XXXX"
            />
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h3>
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Cash on Delivery (COD)</p>
              <p className="text-xs text-gray-400">Pay when your cards arrive</p>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
          <div className="space-y-1.5 mb-3">
            {cart.map(item => (
              <div key={item.listingId} className="flex justify-between text-xs">
                <span className="text-gray-400 truncate mr-2">
                  {item.cardName} x{item.quantity}
                </span>
                <span className="text-gray-600 dark:text-gray-300 flex-shrink-0">
                  ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800 mb-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="text-base font-bold text-green-600 dark:text-green-400">
              ₱{total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleOrder}
            disabled={loading || cart.length === 0}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors text-sm">
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            By ordering you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  )
}