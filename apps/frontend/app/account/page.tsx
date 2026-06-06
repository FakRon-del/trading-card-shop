'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-4xl mb-4">👤</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            You're not signed in
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Sign in to view your account, orders and more.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login"
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Register
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                user.role === 'SELLER'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {user.role === 'SELLER' ? '🏪 Seller' : '🛒 Buyer'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {[
            { href: '/orders', icon: '📦', label: 'My Orders', sub: 'Track your purchases' },
            { href: '/cart', icon: '🛒', label: 'My Cart', sub: 'Items ready to checkout' },
            ...(user.role === 'SELLER' ? [
              { href: '/dashboard', icon: '🏪', label: 'Seller Dashboard', sub: 'Manage your shop & listings' },
            ] : [
              { href: '/register?upgrade=true', icon: '🚀', label: 'Become a Seller', sub: 'List your own cards' },
            ]),
          ].map((item, i, arr) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}>
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {[
            { icon: '❓', label: 'Help & Support', sub: 'FAQs and contact us' },
            { icon: '📋', label: 'Terms of Service', sub: 'Rules and regulations' },
            { icon: '🔒', label: 'Privacy Policy', sub: 'How we handle your data' },
          ].map((item, i, arr) => (
            <button key={item.label}
              className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}>
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-5 py-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 transition-colors group">
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium text-red-500 group-hover:text-red-600">Sign Out</span>
        </button>

        <p className="text-center text-xs text-gray-400">
          TradingPlus v1.0 · Made in the Philippines 🇵🇭
        </p>
      </div>

      <BottomNav />
    </div>
  )
}