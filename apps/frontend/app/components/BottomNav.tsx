'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()

  const items = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/search', label: 'Search', icon: '🔍' },
    { href: '/cart', label: 'Cart', icon: '🛒' },
    { href: '/orders', label: 'Orders', icon: '📦' },
    { href: '/account', label: 'Account', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
        {items.map(item => {
          const active = path === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                active
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}