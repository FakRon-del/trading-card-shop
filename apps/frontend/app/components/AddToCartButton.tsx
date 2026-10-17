'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  listing: {
    id: string
    price: string
    condition: string
    stock: number
  }
  card: {
    id: string
    name: string
    imageUrl: string | null
  }
  ownerId?: string
}

export default function AddToCartButton({ listing, card }: Props) {
  const router = useRouter()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.push('/register'); return }

    // Block seller from buying own listing
    if (ownerId && JSON.parse(userStr).id === ownerId) {
      alert('You cannot add your own listing to cart.')
      return
    }

    // Get existing cart
    const existing = localStorage.getItem('cart')
    const cart = existing ? JSON.parse(existing) : []

    const index = cart.findIndex((item: any) => item.listingId === listing.id)
    if (index > -1) {
      cart[index].quantity += 1
    } else {
      cart.push({
        listingId: listing.id,
        cardName: card.name,
        imageUrl: card.imageUrl,
        condition: listing.condition,
        price: listing.price,
        quantity: 1
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={listing.stock === 0}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
        added
          ? 'bg-green-500 text-white'
          : listing.stock === 0
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}>
      {added ? '✓ Added!' : listing.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  )
}