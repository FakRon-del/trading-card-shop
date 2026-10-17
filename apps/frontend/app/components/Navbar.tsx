'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    try {
      const cart = localStorage.getItem('cart')
      if (cart) {
        const items = JSON.parse(cart)
        setCartCount(items.reduce((sum: number, i: any) => sum + i.quantity, 0))
      }
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    } catch {
      // localStorage not available
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Pullverse TCG"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-gray-900 dark:text-white text-base">
            Pullverse <span className="text-[#2563EB]">TCG</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'SELLER' && (
                <Link href="/dashboard"
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors hidden sm:block">
                  Dashboard
                </Link>
              )}
              <button onClick={logout}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/register"
                className="text-sm bg-blue-500 hover:bg-[#1D4ED8]text-white px-3 py-1.5 rounded-lg transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}