import Link from 'next/link'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import AddToCartButton from '../../components/AddToCartButton'

async function getCard(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/cards/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

const RARITY_STYLES: Record<string, string> = {
  'Holo Rare':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Ultra Rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Rare':       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Common':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Uncommon':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const CONDITION_LABELS: Record<string, string> = {
  NEAR_MINT:        'Near Mint',
  LIGHTLY_PLAYED:   'Lightly Played',
  MODERATELY_PLAYED:'Moderately Played',
  HEAVILY_PLAYED:   'Heavily Played',
  DAMAGED:          'Damaged',
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-3">🃏</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Card not found</p>
          <Link href="/" className="text-xs text-blue-500">← Back to shop</Link>
        </div>
      </div>
    )
  }

  const rarityStyle = RARITY_STYLES[card.rarity] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  const lowestPrice = card.listings?.length > 0
    ? Math.min(...card.listings.map((l: any) => parseFloat(l.price)))
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-4">

        {/* Back */}
        <Link href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        {/* Card header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-4">
          <div className="flex gap-4 p-4">

            {/* Image */}
              <div className="relative w-32 flex-shrink-0 aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🃏</div>
                )}
              </div>

            {/* Info */}
            <div className="flex-1 min-w-0 py-1">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{card.name}</h1>
              <p className="text-xs text-gray-400 mb-2">{card.set} · #{card.number}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rarityStyle}`}>
                {card.rarity}
              </span>
              {lowestPrice && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400">Starting from</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₱{lowestPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listings */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Available from sellers
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {card.listings?.length ?? 0} listings
            </span>
          </h2>

          {!card.listings || card.listings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-10 text-center">
              <p className="text-sm text-gray-400">No sellers listing this card yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {card.listings.map((listing: any) => (
                <div key={listing.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-bold text-green-600 dark:text-green-400">
                        ₱{parseFloat(listing.price).toLocaleString()}
                      </p>
                      <span className="text-xs text-gray-400">
                        · {listing.stock} left
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">
                      {CONDITION_LABELS[listing.condition] ?? listing.condition}
                    </p>
                    {listing.seller && (
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                          {listing.seller.shopName?.charAt(0)}
                        </div>
                        <span className="text-xs text-blue-500">{listing.seller.shopName}</span>
                      </div>
                    )}
                    {listing.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{listing.description}</p>
                    )}
                  </div>
                  <AddToCartButton listing={listing} card={card} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}