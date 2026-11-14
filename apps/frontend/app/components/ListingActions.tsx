'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://pullverse-backend.onrender.com'

export default function ListingActions({
  listingId, sellerId, cardId, isCommentSection
}: {
  listingId?: string
  sellerId?: string
  cardId?: string
  isCommentSection?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (isCommentSection && cardId) loadComments()
  }, [cardId])

  async function loadComments() {
    try {
      const res = await fetch(`${API}/api/listings/${cardId}/comments`)
      if (res.ok) setComments(await res.json())
    } catch {}
  }

  async function handleRequestDeal() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (!token || !user) { router.push('/login'); return }
    const me = JSON.parse(user)
    if (me.id === sellerId) { alert('You cannot deal with yourself.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/deals/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listingId })
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/deals/${data.id}`)
      } else if (data.dealRoomId) {
        router.push(`/deals/${data.dealRoomId}`)
      } else {
        alert(data.error || 'Failed to request deal')
      }
    } catch { alert('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    if (!newComment.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`${API}/api/listings/${cardId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() })
      })
      if (res.ok) {
        const comment = await res.json()
        setComments(prev => [...prev, comment])
        setNewComment('')
      }
    } catch {}
    finally { setPosting(false) }
  }

  if (isCommentSection) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Questions & Comments
        </h3>
        <div className="space-y-3 mb-4">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400">No comments yet. Be the first to ask!</p>
          )}
          {comments.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{c.userName}</span>
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{c.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handlePostComment} className="flex gap-2">
          <input
            value={newComment} onChange={e => setNewComment(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={posting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            {posting ? '...' : 'Post'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={handleRequestDeal}
      disabled={loading}
      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
      {loading ? 'Requesting...' : '🤝 Request Deal'}
    </button>
  )
}
