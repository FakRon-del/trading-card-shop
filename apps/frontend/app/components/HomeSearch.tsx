'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['All','Pokemon','MTG','Yu-Gi-Oh','One Piece','Vanguard','Digimon']

export default function HomeSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('All')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleCategory = (cat: string) => {
    setActive(cat)
    if (cat === 'All') {
      router.push('/search')
    } else {
      router.push(`/search?category=${encodeURIComponent(cat)}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
      <div className="max-w-5xl mx-auto space-y-2">

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
              className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-md flex-shrink-0">
              Search
            </button>
          )}
        </form>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{scrollbarWidth:'none'}}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => handleCategory(cat)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap border flex-shrink-0 transition-colors ${
                active === cat
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 bg-transparent'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}