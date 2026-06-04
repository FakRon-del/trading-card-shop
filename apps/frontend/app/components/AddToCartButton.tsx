'use client'

import { useState } from 'react'

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
}

export default function AddToCartButton({ listing, card }: Props) {
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const existing = localStorage.getItem('cart')
    const cart = existing ? JSON.parse(existing) : []

    // Check if already in cart
    const index = cart.findIndex((item: any) => item.listingId === listing.id)

    if (index > -1) {
      // Increase quantity
      cart[index].quantity += 1
    } else {
      // Add new item
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

    // Show feedback
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={listing.stock === 0}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        added
          ? 'bg-green-600 text-white'
          : listing.stock === 0
          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}
    >
      {added ? '✓ Added!' : listing.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
    </button>
  )
}