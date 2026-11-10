'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (sessionId) {
      localStorage.removeItem('cart')
      setDone(true)
    }
  }, [sessionId])

  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Your payment has been confirmed. The seller will prepare your cards shortly.
        </p>
        <div className="flex gap-2">
          <Link href="/orders"
            className="flex-1 text-xs bg-[#2563EB] text-white py-2.5 rounded-lg text-center">
            View Orders
          </Link>
          <Link href="/"
            className="flex-1 text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg text-center">
            Keep Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-gray-400">Loading...</p>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
