'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getToken, getUser } from '../lib/auth'

type CartItem = {
  listingId: string
  cardName: string
  imageUrl: string | null
  condition: string
  price: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [address, setAddress] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) { router.push('/login'); return }

    const stored = localStorage.getItem('cart')
    if (!stored || JSON.parse(stored).length === 0) {
      router.push('/cart')
      return
    }
    setCart(JSON.parse(stored))
  }, [])

  const total = cart.reduce((sum, item) =>
    sum + parseFloat(item.price) * item.quantity, 0
  )

  const handlePlaceOrder = async () => {
    if (!address.trim()) { setError('Please enter your delivery address'); return }
    if (!contactNumber.trim()) { setError('Please enter your contact number'); return }

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
          items: cart.map(item => ({
            listingId: item.listingId,
            quantity: item.quantity
          })),
          address,
          contactNumber
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to place order')
        return
      }

      // Clear cart
      localStorage.removeItem('cart')
      setSuccess(true)

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-2">Your order has been confirmed.</p>
          <p className="text-gray-500 text-sm mb-8">
            The seller will prepare your cards for shipping.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/orders"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm">
              View My Orders
            </Link>
            <Link href="/"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/cart" className="text-gray-400 hover:text-white text-sm">
            ← Back to cart
          </Link>
          <h1 className="text-sm font-bold text-white">🃏 CardMarket PH</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-white mb-6">Checkout</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Delivery details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Delivery Details</h3>

              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Delivery Address</label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="House/Unit No., Street, Barangay, City, Province"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm block mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="09XX XXX XXXX"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Payment Method</h3>
              <div className="bg-gray-800 border border-blue-500 rounded-lg p-4 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Cash on Delivery (COD)</p>
                  <p className="text-gray-400 text-xs mt-0.5">Pay when your cards arrive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-20">
              <h3 className="text-white font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                {cart.map(item => (
                  <div key={item.listingId} className="flex justify-between text-sm">
                    <span className="text-gray-400 truncate mr-2">
                      {item.cardName} x{item.quantity}
                    </span>
                    <span className="text-gray-300 flex-shrink-0">
                      ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-300">₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-gray-300">Arranged with seller</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-green-400 font-bold text-lg">
                    ₱{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors mt-4">
                {loading ? 'Placing order...' : 'Place Order'}
              </button>

              <p className="text-gray-600 text-xs text-center mt-3">
                By placing your order you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}