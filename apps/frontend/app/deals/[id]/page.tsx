'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import BottomNav from '../../components/BottomNav'
import dynamic from 'next/dynamic'

const MapPicker = dynamic(() => import('../../components/MapPicker'), { ssr: false })

const API = 'https://pullverse-backend.onrender.com'

const STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Pending', ACCEPTED: '✅ Active', DECLINED: '❌ Declined',
  COMPLETED: '🏁 Completed', CANCELLED: '🚫 Cancelled'
}

export default function DealRoomPage() {
  const { id } = useParams()
  const router = useRouter()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [me, setMe] = useState<any>(null)
  const [showMap, setShowMap] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<any>(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) { router.push('/login'); return }
    setMe(JSON.parse(user))
    loadDeal()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [deal?.messages])

  useEffect(() => {
    if (deal?.status === 'ACCEPTED') {
      pollRef.current = setInterval(loadDeal, 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [deal?.status])

  async function loadDeal() {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/api/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setDeal(await res.json())
    } catch {}
    finally { setLoading(false) }
  }

  async function handleStatus(status: 'ACCEPTED' | 'DECLINED') {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API}/api/deals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    if (res.ok) loadDeal()
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    const token = localStorage.getItem('token')
    setSending(true)
    try {
      const res = await fetch(`${API}/api/deals/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: message.trim() })
      })
      if (res.ok) {
        const msg = await res.json()
        setDeal((prev: any) => ({ ...prev, messages: [...(prev.messages || []), msg] }))
        setMessage('')
      }
    } catch {}
    finally { setSending(false) }
  }

  async function handleSetMeetup(lat: number, lng: number, note: string) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API}/api/deals/${id}/meetup`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ meetupLat: lat, meetupLng: lng, meetupNote: note })
    })
    if (res.ok) { loadDeal(); setShowMap(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading deal room...</p>
    </div>
  )

  if (!deal) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Deal not found.</p>
    </div>
  )

  const isSeller = me?.id === deal.sellerId
  const isBuyer = me?.id === deal.buyerId

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {deal.listing?.card?.name ?? 'Deal Room'}
            </h1>
            <p className="text-xs text-gray-400">
              {isSeller ? `Buyer: ${deal.buyerName}` : `Seller: ${deal.sellerName}`} · {STATUS_LABELS[deal.status] ?? deal.status}
            </p>
          </div>
        </div>

        {/* Listing preview */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 mb-4 flex items-center gap-3">
          {deal.listing?.card?.imageUrl && (
            <img src={deal.listing.card.imageUrl} alt="" className="w-12 h-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-800" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{deal.listing?.card?.name}</p>
            <p className="text-xs text-blue-500 font-semibold">₱{parseFloat(deal.listing?.price || '0').toLocaleString()}</p>
            <p className="text-xs text-gray-400">{deal.listing?.condition?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Seller: accept/decline if pending */}
        {isSeller && deal.status === 'PENDING' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">
              {deal.buyerName} wants to deal for this item. Accept?
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleStatus('ACCEPTED')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                ✅ Accept
              </button>
              <button onClick={() => handleStatus('DECLINED')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                ❌ Decline
              </button>
            </div>
          </div>
        )}

        {/* Buyer: waiting if pending */}
        {isBuyer && deal.status === 'PENDING' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">⏳ Waiting for seller to accept your deal request...</p>
          </div>
        )}

        {/* Declined */}
        {deal.status === 'DECLINED' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">This deal was declined.</p>
          </div>
        )}

        {/* Meetup location */}
        {deal.status === 'ACCEPTED' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">📍 Meetup Location</p>
              <button onClick={() => setShowMap(!showMap)}
                className="text-xs text-blue-500 hover:text-blue-600">
                {deal.meetupLat ? 'Update' : 'Set location'}
              </button>
            </div>
            {deal.meetupLat ? (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{deal.meetupNote || 'Location set'}</p>
                <MapPicker lat={deal.meetupLat} lng={deal.meetupLng} readOnly onConfirm={() => {}} />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No meetup location set yet.</p>
            )}
            {showMap && (
              <div className="mt-3">
                <MapPicker onConfirm={handleSetMeetup} />
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {deal.status === 'ACCEPTED' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">💬 Private Chat</p>
            </div>
            <div className="h-72 overflow-y-auto p-3 space-y-2">
              {deal.messages?.length === 0 && (
                <p className="text-xs text-gray-400 text-center mt-8">No messages yet. Say hi!</p>
              )}
              {deal.messages?.map((msg: any) => {
                const isMe = msg.senderId === me?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMe
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                      {!isMe && <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName}</p>}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-0.5 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" disabled={sending}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
