'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type CartItem = {
  listingId: string
  cardName: string
  imageUrl: string | null
  condition: string
  price: string
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setCart(JSON.parse(stored))
  }, [])

  const updateQuantity = (listingId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.listingId !== listingId) return item
      return { ...item, quantity: Math.max(1, item.quantity + delta) }
    })
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const removeItem = (listingId: string) => {
    const updated = cart.filter(item => item.listingId !== listingId)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const total = cart.reduce((sum, item) =>
    sum + parseFloat(item.price) * item.quantity, 0
  )

  const handleCheckout = () => {
    // Check if logged in
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    router.push('/checkout')
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-6">Thank you for your purchase.</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm">
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to shop
          </Link>
          <h1 className="text-sm font-bold text-white">🃏 CardMarket PH</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-white mb-6">Your Cart</h2>

        {cart.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🛒</p>
            <p className="text-gray-400 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">Add some cards to get started!</p>
            <Link href="/"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2.5 rounded-lg transition-colors">
              Browse Cards
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Cart items */}
            <div className="md:col-span-2 space-y-3">
              {cart.map(item => (
                <div key={item.listingId}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">

                  {/* Image */}
                  <div className="relative w-14 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.cardName} fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{item.cardName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {item.condition.replace(/_/g, ' ')}
                    </p>
                    <p className="text-green-400 font-bold text-sm mt-1">
                      ₱{parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.listingId, -1)}
                      className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center">
                      −
                    </button>
                    <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.listingId, 1)}
                      className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center">
                      +
                    </button>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">
                      ₱{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.listingId)}
                      className="text-red-400 hover:text-red-300 text-xs mt-1">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
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

                <div className="border-t border-gray-800 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-green-400 font-bold text-lg">
                      ₱{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors">
                  Proceed to Checkout
                </button>

                <Link href="/"
                  className="block text-center text-gray-500 hover:text-gray-400 text-sm mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}