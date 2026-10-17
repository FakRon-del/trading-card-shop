import Link from 'next/link'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import HomeSearch from './components/HomeSearch'
import WelcomeRedirect from './components/WelcomeRedirect'
import AvailabilityBadge from './components/AvailabilityBadge'

async function getCards(): Promise<any[]> {
  try {
    const res = await fetch('http://localhost:4000/api/cards', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const RARITY_STYLES: Record<string, string> = {
  'Holo Rare':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Ultra Rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Rare':       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Common':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Uncommon':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export default async function Home() {
  const cards = await getCards()
  const listed = cards.filter((c: any) => c.listings && c.listings.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <WelcomeRedirect />
      <Navbar />

      <HomeSearch cards={cards} />

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">

        {/* Featured cards */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Featured listings
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                {listed.length} available
              </span>
            </h3>
          </div>

          {listed.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
              <p className="text-2xl mb-2">🃏</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No cards listed yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">Be the first seller!</p>
              <Link href="/register"
                className="text-xsbg-[#2563EB] text-white px-4 py-1.5 rounded-lg inline-block">
                Start selling
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {listed.map((card: any) => {
                const lowestPrice = card.listings?.length > 0
                  ? Math.min(...card.listings.map((l: any) => parseFloat(l.price)))
                  : null
                const rarityStyle = RARITY_STYLES[card.rarity]
                  ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                const cheapest = card.listings?.length > 0
                  ? card.listings.reduce((a: any, b: any) =>
                      parseFloat(a.price) < parseFloat(b.price) ? a : b)
                  : null

                return (
                  <Link key={card.id} href={`/cards/${card.id}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-[#2563EB] dark:hover:border-blue-500 hover:shadow-sm transition-all">

                      {/* Card image */}
                      <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🃏</div>
                        )}
                      </div>

                      {/* Card info */}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {card.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mb-1.5">{card.set}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${rarityStyle}`}>
                          {card.rarity}
                        </span>

                        {/* Availability badge */}
                        {cheapest && (
                          <div className="mt-1">
                            <AvailabilityBadge availability={cheapest.availability} size="xs" />
                          </div>
                        )}

                        <div className="mt-1.5 flex items-center justify-between">
                          {lowestPrice ? (
                            <span className="text-xs font-semibold text-[#16A34A] dark:text-[#4ADE80]">
                              ₱{lowestPrice.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No price</span>
                          )}
                          <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-md">
                            View
                          </span>
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