import Link from 'next/link'
import { Card } from './types/card'
import CardItem from './components/CardItem'

async function getCards(): Promise<Card[]> {
  try {
    const res = await fetch('http://localhost:4000/api/cards', {
      cache: 'no-store'
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function Home() {
  const cards = await getCards()

  return (
    <main className="min-h-screen bg-gray-950">

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">🃏 CardMarket PH</h1>
            <p className="text-gray-500 text-xs">Buy & sell trading cards</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cart"
              className="text-gray-400 hover:text-white text-sm transition-colors">
              🛒 Cart
            </Link>
            <Link href="/login"
              className="text-gray-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-900/40 to-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            Buy & Sell Trading Cards
          </h2>
          <p className="text-gray-400 text-sm">
            Pokemon, MTG, Yu-Gi-Oh and more — from verified sellers across the Philippines
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">
            All Cards
            <span className="ml-2 text-gray-500 text-sm font-normal">
              {cards.length} {cards.length === 1 ? 'listing' : 'listings'}
            </span>
          </h3>
        </div>

        {/* Card Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🃏</p>
            <p className="text-gray-400 text-lg font-medium">No cards listed yet</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">Be the first seller to list a card!</p>
            <Link href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2.5 rounded-lg transition-colors">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map(card => (
              <Link key={card.id} href={`/cards/${card.id}`}>
                <CardItem card={card} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}