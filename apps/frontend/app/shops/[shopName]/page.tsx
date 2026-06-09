import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'

async function getShop(shopName: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/shops/${shopName}`, {
      cache: 'no-store'
    })
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
  NEAR_MINT:         'Near Mint',
  LIGHTLY_PLAYED:    'Lightly Played',
  MODERATELY_PLAYED: 'Moderately Played',
  HEAVILY_PLAYED:    'Heavily Played',
  DAMAGED:           'Damaged',
}

export default async function ShopPage({
  params
}: {
  params: Promise<{ shopName: string }>
}) {
  const { shopName } = await params
  const shop = await getShop(shopName)

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Shop not found</p>
          <Link href="/" className="text-xs text-blue-500">← Back to shop</Link>
        </div>
      </div>
    )
  }

  const totalStock = shop.listings?.reduce((s: number, l: any) => s + l.stock, 0) ?? 0
  const lowestPrice = shop.listings?.length > 0
    ? Math.min(...shop.listings.map((l: any) => parseFloat(l.price)))
    : null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Back */}
        <Link href="/"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to marketplace
        </Link>

        {/* Shop header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {shop.shopName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  {shop.shopName}
                </h1>
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              {shop.description && (
                <p className="text-xs text-gray-400">{shop.description}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {shop.listings?.length ?? 0}
              </p>
              <p className="text-xs text-gray-400">Listings</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {totalStock}
              </p>
              <p className="text-xs text-gray-400">In Stock</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {lowestPrice ? `₱${lowestPrice.toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-400">From</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Cards for Sale
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              {shop.listings?.length ?? 0} listings
            </span>
          </h2>

          {!shop.listings || shop.listings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
              <p className="text-2xl mb-2">🃏</p>
              <p className="text-sm text-gray-400">No listings yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shop.listings.map((listing: any) => {
                const rarityStyle = RARITY_STYLES[listing.card?.rarity]
                  ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

                return (
                  <Link key={listing.id} href={`/cards/${listing.card?.id}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all">

                      {/* Image */}
                      <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                        {listing.card?.imageUrl ? (
                          <Image
                            src={listing.card.imageUrl}
                            alt={listing.card.name}
                            fill
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🃏</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                          {listing.card?.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mb-1.5">
                          {listing.card?.set}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${rarityStyle}`}>
                          {listing.card?.rarity}
                        </span>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400">
                              ₱{parseFloat(listing.price).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {listing.stock} left
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {CONDITION_LABELS[listing.condition] ?? listing.condition}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}