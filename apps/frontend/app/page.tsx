import Link from 'next/link'
import Image from 'next/image'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import { Card } from './types/card'

async function getCards(): Promise<Card[]> {
  try {
    const res = await fetch('http://localhost:4000/api/cards', { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const ACCESSORIES = [
  { emoji: '🗂️', label: 'Sleeves' },
  { emoji: '📚', label: 'Binders' },
  { emoji: '📦', label: 'Booster Boxes' },
  { emoji: '🏆', label: 'Graded Cards' },
  { emoji: '🛡️', label: 'Top Loaders' },
  { emoji: '🎁', label: 'Gift Sets' },
  { emoji: '🖼️', label: 'Frames' },
  { emoji: '🧰', label: 'Supplies' },
]

const RARITY_STYLES: Record<string, string> = {
  'Holo Rare':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Ultra Rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Rare':       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Common':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Uncommon':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const CATEGORIES = ['All','Pokemon','MTG','Yu-Gi-Oh','One Piece','Vanguard','Digimon']

export default async function Home() {
  const cards = await getCards()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      {/* Search + categories bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto space-y-2">

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs text-gray-400">Search cards, sets, sellers...</span>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{scrollbarWidth:'none'}}>
            {CATEGORIES.map((cat, i) => (
              <button key={cat}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border flex-shrink-0 transition-colors ${
                  i === 0
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">

        {/* Hero banner */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1">
              Buy & sell cards.<br />Fast & trusted.
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Verified sellers across the Philippines
            </p>
            <Link href="/register"
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors inline-block">
              Start selling →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
            {['🔥','⚡','🌑','💧'].map(e => (
              <div key={e}
                className="w-9 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-base border border-gray-200 dark:border-gray-700">
                {e}
              </div>
            ))}
          </div>
        </div>

        {/* Featured cards */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Featured cards
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                {cards.length} listings
              </span>
            </h3>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
              <p className="text-2xl mb-2">🃏</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">No cards listed yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">Be the first seller!</p>
              <Link href="/register"
                className="text-xs bg-blue-500 text-white px-4 py-1.5 rounded-lg inline-block">
                Start selling
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {cards.map((card: any) => {
                const lowestPrice = card.listings?.length > 0
                  ? Math.min(...card.listings.map((l: any) => parseFloat(l.price)))
                  : null
                const rarityStyle = RARITY_STYLES[card.rarity]
                  ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

                return (
                  <Link key={card.id} href={`/cards/${card.id}`}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all">

                      {/* Card image */}
                      <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-contain p-1.5"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                        )}
                      </div>

                      {/* Card info */}
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{card.name}</p>
                        <p className="text-xs text-gray-400 truncate mb-1.5">{card.set}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${rarityStyle}`}>
                          {card.rarity}
                        </span>
                        <div className="mt-1.5 flex items-center justify-between">
                          {lowestPrice ? (
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
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

        {/* Accessories */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Accessories</h3>
            <span className="text-xs text-blue-500">Browse all →</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {ACCESSORIES.map(acc => (
              <button key={acc.label}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 flex flex-col items-center gap-1.5 hover:border-blue-400 transition-colors">
                <span className="text-xl">{acc.emoji}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}