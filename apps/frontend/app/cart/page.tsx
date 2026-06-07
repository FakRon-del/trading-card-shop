'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

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

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setCart(JSON.parse(stored))
  }, [])

  const update = (listingId: string, delta: number) => {
    const updated = cart.map(item =>
      item.listingId === listingId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    )
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const remove = (listingId: string) => {
    const updated = cart.filter(item => item.listingId !== listingId)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const total = cart.reduce((sum, item) =>
    sum + parseFloat(item.price) * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          My Cart
          {cart.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </h2>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your cart is empty</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">Add cards to get started</p>
            <Link href="/"
              className="text-xs bg-blue-500 text-white px-5 py-2 rounded-lg inline-block">
              Browse cards
            </Link>
          </div>
        ) : (
          <div className="space-y-3">

            {/* Items */}
            {cart.map(item => (
              <div key={item.listingId}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">

                {/* Image */}
                <div className="relative w-12 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.cardName} fill className="object-contain p-0.5" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🃏</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.cardName}</p>
                  <p className="text-xs text-gray-400 mb-1">{item.condition.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400">
                    ₱{parseFloat(item.price).toLocaleString()}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button onClick={() => remove(item.listingId)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update(item.listingId, -1)}
                      className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      −
                    </button>
                    <span className="text-xs font-medium text-gray-900 dark:text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button onClick={() => update(item.listingId, 1)}
                      className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      +
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    ₱{(parseFloat(item.price) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Order summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mt-2">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
              <div className="space-y-1.5 mb-3">
                {cart.map(item => (
                  <div key={item.listingId} className="flex justify-between text-xs">
                    <span className="text-gray-400 truncate mr-2">{item.cardName} x{item.quantity}</span>
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
                onClick={() => {
                  const user = localStorage.getItem('user')
                  if (!user) router.push('/login')
                  else router.push('/checkout')
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors text-sm">
                Proceed to Checkout
              </button>
              <Link href="/"
                className="block text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}