'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import BottomNav from '../components/BottomNav'

const DOWNGRADE_TERMS = [
  'All your active listings will remain visible until you manually remove them.',
  'Any pending, paid, or in-transit orders must be completed or cancelled before downgrading.',
  'Your shop page will remain accessible but you will lose seller dashboard access.',
  'You cannot undo this action immediately — a 30-day cooldown applies before re-upgrading.',
  'Pullverse TCG is not responsible for any disputes arising from incomplete transactions.',
  'By confirming, you agree to fulfil all outstanding obligations to your buyers.',
]

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [upgraded, setUpgraded] = useState(false)
  const [showDowngradeModal, setShowDowngradeModal] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [downgradeError, setDowngradeError] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [confirmText, setConfirmText] = useState('')

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

    const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('http://localhost:4000/api/seller/upgrade', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (res.ok) {
        // Save new token with updated role
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        setUpgraded(true)
      }
    } finally { setUpgrading(false) }
  }

  const handleDowngrade = async () => {
    if (confirmText !== 'CONFIRM') {
      setDowngradeError('Please type CONFIRM to proceed.')
      return
    }
    if (!termsAgreed) {
      setDowngradeError('You must agree to the terms.')
      return
    }
    setDowngrading(true)
    setDowngradeError('')
    try {
      const res = await fetch('http://localhost:4000/api/seller/downgrade', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (!res.ok) {
        setDowngradeError(data.error)
        return
      }
      // Save new token with updated role
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      setShowDowngradeModal(false)
      setTermsAgreed(false)
      setConfirmText('')
    } finally { setDowngrading(false) }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
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

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">

        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                user.role === 'SELLER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : user.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {user.role === 'SELLER' ? 'Seller' : user.role === 'ADMIN' ? 'Admin' : 'Buyer'}
              </span>
            </div>
          </div>
        </div>

        {/* Account role switcher */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Account Type
          </p>

          <div className="grid grid-cols-2 gap-2">
            {/* Buyer option */}
            <div className={`rounded-xl border p-3 transition-all ${
              user.role === 'BUYER'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Buyer</p>
                {user.role === 'BUYER' && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                Browse and purchase cards from sellers.
              </p>
              {user.role === 'SELLER' && (
                <button
                  onClick={() => setShowDowngradeModal(true)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Switch to Buyer
                </button>
              )}
            </div>

            {/* Seller option */}
            <div className={`rounded-xl border p-3 transition-all ${
              user.role === 'SELLER'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Seller</p>
                {user.role === 'SELLER' && (
                  <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Active</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                List cards and accessories for sale.
              </p>
              {user.role === 'BUYER' && !upgraded && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-1.5 rounded-lg transition-colors">
                  {upgrading ? 'Upgrading...' : 'Become a Seller'}
                </button>
              )}
              {user.role === 'BUYER' && upgraded && (
                <Link href="/dashboard/setup"
                  className="block w-full text-xs bg-green-500 text-white py-1.5 rounded-lg text-center">
                  Set Up Shop
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {[
            { href: '/orders',    label: 'My Orders',         sub: 'Track your purchases' },
            { href: '/cart',      label: 'My Cart',           sub: 'Items ready to checkout' },
            ...(user.role === 'SELLER' ? [
              { href: '/dashboard',         label: 'Seller Dashboard', sub: 'Manage your shop and listings' },
              { href: '/dashboard/orders',  label: 'Incoming Orders',  sub: 'Orders from buyers' },
            ] : []),
            ...(user.role === 'ADMIN' ? [
              { href: '/admin', label: 'Admin Dashboard', sub: 'Platform management' },
            ] : []),
          ].map((item, i, arr) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {[
            { label: 'Help & Support',  sub: 'FAQs and contact us' },
            { label: 'Terms of Service', sub: 'Rules and regulations' },
            { label: 'Privacy Policy',   sub: 'How we handle your data' },
          ].map((item, i, arr) => (
            <button key={item.label}
              className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                i < arr.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 transition-colors group text-left">
          <span className="text-sm font-medium text-red-500 group-hover:text-red-600">Sign Out</span>
        </button>

        <p className="text-center text-xs text-gray-400">
          Pullverse TCG v1.0 · Made in the Philippines
        </p>
      </div>

      {/* Downgrade Modal */}
      {showDowngradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">

            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Switch to Buyer Account
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Please read the terms carefully before proceeding.
              </p>
            </div>

            <div className="p-5 space-y-4">

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Warning — This action has consequences
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  Switching to a buyer account will affect your seller privileges and active listings.
                </p>
              </div>

              {/* Terms list */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Terms & Conditions
                </p>
                {DOWNGRADE_TERMS.map((term, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{term}</p>
                  </div>
                ))}
              </div>

              {/* Agree checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={e => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 flex-shrink-0 accent-blue-500"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  I have read and agree to all the terms and consequences listed above.
                </span>
              </label>

              {/* Confirm input */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Type <span className="font-mono font-bold text-gray-900 dark:text-white">CONFIRM</span> to proceed
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="Type CONFIRM"
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs outline-none font-mono"
                />
              </div>

              {/* Error */}
              {downgradeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs text-red-600 dark:text-red-400">{downgradeError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setShowDowngradeModal(false)
                    setTermsAgreed(false)
                    setConfirmText('')
                    setDowngradeError('')
                  }}
                  className="flex-1 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleDowngrade}
                  disabled={downgrading || !termsAgreed || confirmText !== 'CONFIRM'}
                  className="flex-1 text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-2.5 rounded-xl transition-colors font-medium">
                  {downgrading ? 'Processing...' : 'Confirm Switch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}