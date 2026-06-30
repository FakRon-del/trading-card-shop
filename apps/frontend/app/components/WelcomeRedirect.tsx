'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    const visited = localStorage.getItem('visited')
    if (!visited) {
      localStorage.setItem('visited', 'true')
      router.push('/welcome')
    }
  }, [])

  return null
}