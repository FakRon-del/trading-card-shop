import Link from 'next/link'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import AddToCartButton from '../../components/AddToCartButton'
import AvailabilityBadge from '../../components/AvailabilityBadge'

async function getCard(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/cards/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

const CONDITION_LABELS: Record<string, string> = {
  NEAR_MINT:         'Near Mint',
  LIGHTLY_PLAYED:    'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED:    'Heavily Played',
  DAMAGED:           'Damaged',
}

const CATEGORY_LABELS: Record<string, string> = {
  SINGLE_CARD:   'Single Card',
  BOOSTER_BOX:   'Booster Box',
  SLEEVES:       'Sleeves',
  TOPLOADER:     'Top Loader',
  ACRYLIC_CASE:  'Acrylic Case',
  FRAME:         'Frame',
  DISPLAY_FRAME: 'Display Frame',
}

const RARITY_STYLES: Record<string, string> = {
  'Holo Rare':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Ultra Rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Rare':       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Common':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Uncommon':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
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

  const rarityStyle = RARITY_STYLES[card.rarity]
    ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <div className="min-h-screen pb-16 relative"
      style={{
        background: 'radial-gradient(ellipse 80% 40% at 10% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(59,130,246,0.05) 0%, transparent 60%)'
      }}>

      {/* Base background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 -z-10" />

      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-4">

        {/* Back */}
        <Link href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to shop
        </Link>

        {/* Card detail — split layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left — Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-xs aspect-[3/4] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🃏</div>
              )}
            </div>
          </div>

          {/* Right — Info */}
          <div className="space-y-4">

            {/* Category + game tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full uppercase tracking-wide">
                {card.set}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
                {CATEGORY_LABELS[card.category] ?? 'Single Card'}
              </span>
            </div>

            {/* Card name */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {card.name}
            </h1>

            {/* Rarity + number */}
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${rarityStyle}`}>
                {card.rarity}
              </span>
              <span className="text-xs text-gray-400">#{card.number}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Listings from sellers */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Available from sellers
                <span className="ml-1.5 normal-case font-normal text-gray-400">
                  ({card.listings?.length ?? 0} listings)
                </span>
              </p>

              {!card.listings || card.listings.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-8 text-center">
                  <p className="text-sm text-gray-400">No sellers listing this card yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {card.listings.map((listing: any) => (
                    <div key={listing.id}
                      className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 overflow-hidden">

                      {/* Subtle blue corner glows */}
                      <div className="absolute top-0 left-0 w-20 h-20 rounded-br-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 70%)' }} />
                      <div className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle at bottom right, rgba(59,130,246,0.10), transparent 70%)' }} />

                      {/* Price */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">PRICE</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            ₱{parseFloat(listing.price).toLocaleString()}
                          </p>
                          {listing.availability === 'PRE_ORDER' && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Full payment required · No cancellations
                            </p>
                          )}
                        </div>
                        <AvailabilityBadge availability={listing.availability} />
                      </div>

                      {/* ETA for pre-orders */}
                      {listing.availability === 'PRE_ORDER' && listing.description && (
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg px-3 py-2 mb-3">
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">ETA</span>
                          <span className="text-xs text-amber-600 dark:text-amber-300">{listing.description}</span>
                        </div>
                      )}

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-gray-400 mb-0.5">Condition</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {CONDITION_LABELS[listing.condition] ?? listing.condition}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-gray-400 mb-0.5">Stock</p>
                          <p className={`font-medium ${
                            listing.stock > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-500'
                          }`}>
                            {listing.stock > 0 ? `${listing.stock} available` : 'Out of stock'}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-gray-400 mb-0.5">Set</p>
                          <p className="font-medium text-gray-900 dark:text-white truncate">{card.set}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <p className="text-gray-400 mb-0.5">Seller</p>
                          {listing.seller ? (
                            <Link href={`/shops/${listing.seller.shopName}`}
                              className="font-medium text-blue-500 hover:text-blue-600 truncate block">
                              {listing.seller.shopName}
                            </Link>
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-white">—</p>
                          )}
                        </div>
                      </div>

                      {/* Description — always visible */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1 font-medium">Description</p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 min-h-[48px]">
                          {listing.description && listing.availability !== 'PRE_ORDER' ? (
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              {listing.description}
                            </p>
                          ) : listing.availability === 'PRE_ORDER' ? (
                            <p className="text-xs text-gray-400 italic">See ETA above for details.</p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No description provided.</p>
                          )}
                        </div>
                      </div>

                      {/* Display Frame special note */}
                      {card.category === 'DISPLAY_FRAME' && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3 mb-3">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">🎨 Display Frame</p>
                          <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
                            Premium collector display frame. Card not included unless stated. Compatible with raw and graded cards.
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <AddToCartButton
                          listing={listing}
                          card={card}
                          ownerId={listing.seller?.userId}
                        />
                        <Link
                          href={`/checkout?buy=${listing.id}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg text-center transition-colors">
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}