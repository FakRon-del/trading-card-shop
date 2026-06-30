'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

const CATEGORIES = ['All', 'Cards', 'Booster Box', 'Sleeves', 'Top Loader', 'Acrylic Case', 'Frame']

const CATEGORY_MAP: Record<string, string> = {
  'Cards': 'SINGLE_CARD',
  'Booster Box': 'BOOSTER_BOX',
  'Sleeves': 'SLEEVES',
  'Top Loader': 'TOPLOADER',
  'Acrylic Case': 'ACRYLIC_CASE',
  'Frame': 'FRAME',
}
const RARITY_STYLES: Record<string, string> = {
  'Holo Rare':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Ultra Rare': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Rare':       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Common':     'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Uncommon':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const BRAND_KEYWORDS: Record<string, string[]> = {
  'pokemon':   ['pokemon', 'poke', 'base set', 'scarlet', 'violet', 'sword', 'shield'],
  'mtg':       ['magic', 'mtg', 'gathering', 'commander', 'alpha', 'beta'],
  'yu-gi-oh':  ['yugioh', 'yu-gi-oh', 'ygo', 'duel', 'lob', 'mrd'],
  'one piece': ['one piece', 'luffy', 'op-'],
  'vanguard':  ['vanguard', 'cardfight'],
  'digimon':   ['digimon', 'digi'],
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cards, setCards] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load cards once on mount
  useEffect(() => {
    // Read URL params
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q') || ''
    const cat = params.get('category') || 'All'
    if (q) { setQuery(q); setDebouncedQuery(q) }
    if (cat !== 'All') setCategory(cat)

    fetch('http://localhost:4000/api/cards')
      .then(r => r.json())
      .then(data => {
        const withListings = data.filter((c: any) => c.listings?.length > 0)
        setCards(withListings)
        setFiltered(withListings)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Debounce query — wait 200ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  // Filter whenever debounced query or category changes
  const filterCards = useCallback(() => {
    let results = [...cards]

    // Category filter — match against product category
    if (category !== 'All') {
      const dbCategory = CATEGORY_MAP[category]
      if (dbCategory) {
        results = results.filter((c: any) => c.category === dbCategory)
      }
    }
    // Text search
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      results = results.filter((c: any) => {
        const inCard =
          c.name?.toLowerCase().includes(q) ||
          c.set?.toLowerCase().includes(q) ||
          c.rarity?.toLowerCase().includes(q) ||
          c.number?.toLowerCase().includes(q)
        const inSeller = c.listings?.some((l: any) =>
          l.seller?.shopName?.toLowerCase().includes(q)
        )
        return inCard || inSeller
      })
    }

    setFiltered(results)
  }, [cards, category, debouncedQuery])

  useEffect(() => {
    filterCards()
  }, [filterCards])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      {/* Sticky search bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-14 z-40">
        <div className="max-w-5xl mx-auto space-y-2">

          {/* Search input */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cards, sets, sellers, games..."
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs flex-shrink-0">
                ✕
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{scrollbarWidth:'none'}}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border flex-shrink-0 transition-colors ${
                  category === cat
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 bg-transparent'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">

        {/* Results count */}
        <p className="text-xs text-gray-400 mb-3">
          {loading
            ? 'Loading cards...'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}${debouncedQuery ? ` for "${debouncedQuery}"` : ''}`
          }
        </p>

        {/* Skeleton loader */}
        {loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {[...Array(12)].map((_, i) => (
              <div key={i}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
                <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-800" />
                <div className="p-2 space-y-1.5">
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No cards found{debouncedQuery ? ` for "${debouncedQuery}"` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try searching by card name, set, or game (e.g. "Pokemon")
            </p>
            {(debouncedQuery || category !== 'All') && (
              <button
                onClick={() => { setQuery(''); setCategory('All') }}
                className="mt-4 text-xs text-blue-500 hover:text-blue-600">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {filtered.map((card: any) => {
              const lowestPrice = card.listings?.length > 0
                ? Math.min(...card.listings.map((l: any) => parseFloat(l.price)))
                : null
              const rarityStyle = RARITY_STYLES[card.rarity]
                ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

              return (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all">
                    <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full object-contain p-1.5"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🃏</div>
                      )}
                    </div>
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

      <BottomNav />
    </div>
  )
}