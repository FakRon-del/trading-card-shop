'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { key: 'All',          label: 'All',           db: null },
  { key: 'Cards',        label: 'Single Cards',  db: 'SINGLE_CARD' },
  { key: 'Booster Box',  label: 'Booster Box',   db: 'BOOSTER_BOX' },
  { key: 'Sleeves',      label: 'Sleeves',        db: 'SLEEVES' },
  { key: 'Top Loader',   label: 'Top Loader',     db: 'TOPLOADER' },
  { key: 'Acrylic Case', label: 'Acrylic Case',   db: 'ACRYLIC_CASE' },
  { key: 'Frame',        label: 'Frame',          db: 'FRAME' },
  { key: 'Display Frame',label: 'Display Frame',  db: 'DISPLAY_FRAME' },
]

export default function HomeSearch({ cards }: { cards: any[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('All')

  // Count listings per category
  const counts: Record<string, number> = { All: cards.length }
  for (const cat of CATEGORIES) {
    if (cat.db) {
      counts[cat.key] = cards.filter(c => c.category === cat.db && c.listings?.length > 0).length
    }
  }

  // Find top selling category (most listings)
  const topCat = CATEGORIES.filter(c => c.db)
    .sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0))[0]?.key

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleCategory = (cat: string) => {
    setActive(cat)
    if (cat === 'All') router.push('/search')
    else router.push(`/search?category=${encodeURIComponent(cat)}`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="max-w-5xl mx-auto space-y-3">

        {/* Search input */}
        <form onSubmit={handleSearch}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-gray-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cards, sets, sellers..."
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
          {query && (
            <button type="submit"
              className="text-xs bg-[#2563EB] text-white px-2.5 py-1 rounded-md flex-shrink-0">
              Search
            </button>
          )}
        </form>

        {/* Category grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {CATEGORIES.map(cat => {
            const count = counts[cat.key] ?? 0
            const isTop = cat.key === topCat
            const isActive = active === cat.key
            const isEmpty = cat.db && count === 0

            return (
              <button
                key={cat.key}
                onClick={() => !isEmpty && handleCategory(cat.key)}
                disabled={!!isEmpty}
                className={`relative flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                  isActive
                    ? 'bg-blue-500 border-[#2563EB]0 text-white'
                    : isEmpty
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-[#2563EB'
                }`}
              >
                {/* Top sale badge */}
                {isTop && !isActive && !isEmpty && (
                  <span className="absolute -top-1.5 -right-1 text-xs bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold leading-none"
                    style={{ fontSize: 9 }}>
                    TOP
                  </span>
                )}

                <span className="text-xs font-medium leading-tight">{cat.label}</span>

                {/* Count badge */}
                {cat.db && (
                  <span className={`text-xs font-bold leading-none ${
                    isActive ? 'text-blue-100' : isEmpty ? 'text-gray-300 dark:text-gray-600' : 'text-blue-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}