import Link from 'next/link'
import Image from 'next/image'
import { Card } from '../../types/card'
import AddToCartButton from '../../components/AddToCartButton'

async function getCard(id: string): Promise<Card | null> {
  try {
    const res = await fetch(`http://localhost:4000/api/cards/${id}`, {
      cache: 'no-store'
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function CardDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const card = await getCard(id)

  if (!card) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Card not found</p>
          <Link href="/" className="text-blue-400 text-sm mt-2 block">← Back to shop</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Back to shop
          </Link>
          <h1 className="text-sm font-bold text-white">🃏 CardMarket PH</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card Image */}
          <div className="flex justify-center">
            <div className="relative w-64 aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-contain p-3"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Card Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{card.name}</h2>
            <p className="text-gray-400 text-sm mb-1">{card.set} · #{card.number}</p>
            <span className="inline-block bg-blue-900/40 text-blue-400 text-xs px-3 py-1 rounded-full mb-6">
              {card.rarity}
            </span>

            {/* Listings from sellers */}
            <h3 className="text-white font-semibold mb-3">
              Available Listings
              <span className="ml-2 text-gray-500 text-sm font-normal">
                {card.listings?.length ?? 0} sellers
              </span>
            </h3>

            {!card.listings || card.listings.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-500 text-sm">No listings available for this card.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {card.listings.map((listing: any) => (
                  <div key={listing.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-lg">
                        ₱{parseFloat(listing.price).toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {listing.condition.replace(/_/g, ' ')} · {listing.stock} in stock
                      </p>
                      {listing.seller && (
                        <p className="text-blue-400 text-xs mt-1">
                          🏪 {listing.seller.shopName}
                        </p>
                      )}
                      {listing.description && (
                        <p className="text-gray-500 text-xs mt-1">{listing.description}</p>
                      )}
                    </div>
                    <AddToCartButton listing={listing} card={card} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}