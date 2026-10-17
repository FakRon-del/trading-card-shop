'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    if (!sessionId) { setStatus('failed'); return }

    fetch(`http://localhost:4000/api/payments/verify?session_id=${sessionId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'paid') {
          setStatus('success')
          setAmount(data.amount)
          localStorage.removeItem('cart')
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Verifying your payment...</p>
        </div>
      </main>
    )
  }

  if (status === 'failed') {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">❌</div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Payment Failed</h2>
          <p className="text-xs text-gray-400 mb-5">Something went wrong with your payment.</p>
          <Link href="/checkout"
            className="text-xs bg-[#2563EB] text-white px-5 py-2 rounded-lg inline-block">
            Try Again
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
          <div className="w-14 h-14 bg-[#DCFCE7] dark:bg-green-900/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
            🎉
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Payment Successful!
          </h2>
          <p className="text-xs text-gray-400 mb-2">
            Your payment has been confirmed.
          </p>
          {amount && (
            <p className="text-lg font-bold text-[#16A34A] mb-4">
              ₱{(amount / 100).toLocaleString()}
            </p>
          )}
          <p className="text-xs text-gray-400 mb-6">
            The seller will prepare your cards shortly.
          </p>
          <div className="flex gap-2">
            <Link href="/orders"
              className="flex-1 text-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg text-center transition-colors">
              View Orders
            </Link>
            <Link href="/"
              className="flex-1 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-center">
              Keep Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}