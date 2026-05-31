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
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">🃏 Trading Card Shop</h1>
            <p className="text-gray-400 text-xs">Buy & sell trading cards</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Sell Cards
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">
            All Cards
            <span className="ml-2 text-gray-400 text-sm font-normal">
              {cards.length} listings
            </span>
          </h2>
        </div>

        {/* Card Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">No cards listed yet.</p>
            <p className="text-gray-600 text-sm mt-2">Be the first to sell one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}