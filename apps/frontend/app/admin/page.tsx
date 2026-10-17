'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, getUser } from '../lib/auth'

type Tab = 'overview' | 'users' | 'sellers' | 'orders' | 'listings'
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year'

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  PAID:      'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED:   'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function filterByDate(items: any[], field: string, range: DateFilter) {
  if (range === 'all') return items
  const now = new Date()
  const from = new Date()
  if (range === 'today') from.setHours(0, 0, 0, 0)
  else if (range === 'week') from.setDate(now.getDate() - 7)
  else if (range === 'month') from.setMonth(now.getMonth() - 1)
  else if (range === 'year') from.setFullYear(now.getFullYear() - 1)
  return items.filter(i => new Date(i[field]) >= from)
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-full sm:w-64">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search..."
        className="bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none flex-1"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
      )}
    </div>
  )
}

function DateFilterBar({ value, onChange }: { value: DateFilter; onChange: (v: DateFilter) => void }) {
  const opts: { v: DateFilter; l: string }[] = [
    { v: 'all', l: 'All time' },
    { v: 'today', l: 'Today' },
    { v: 'week', l: 'This week' },
    { v: 'month', l: 'This month' },
    { v: 'year', l: 'This year' },
  ]
  return (
    <div className="flex gap-1 flex-wrap">
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
            value === o.v
              ? 'bg-blue-500 text-white border-blue-500'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400'
          }`}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [userSearch, setUserSearch] = useState('')
  const [userDate, setUserDate] = useState<DateFilter>('all')
  const [sellerSearch, setSellerSearch] = useState('')
  const [sellerDate, setSellerDate] = useState<DateFilter>('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderDate, setOrderDate] = useState<DateFilter>('all')
  const [listingSearch, setListingSearch] = useState('')
  const [listingDate, setListingDate] = useState<DateFilter>('all')

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'ADMIN') { router.push('/'); return }
    fetchAll()
  }, [])

  const api = (path: string, options?: RequestInit) =>
    fetch(`http://localhost:4000/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        ...options?.headers
      }
    })

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [s, u, sel, o, l] = await Promise.all([
        api('/admin/stats').then(r => r.json()),
        api('/admin/users').then(r => r.json()),
        api('/admin/sellers').then(r => r.json()),
        api('/admin/orders').then(r => r.json()),
        api('/admin/listings').then(r => r.json()),
      ])
      setStats(s); setUsers(u); setSellers(sel); setOrders(o); setListings(l)
    } finally { setLoading(false) }
  }

  const banUser = async (id: string, isBanned: boolean) => {
    await api(`/admin/users/${id}/ban`, { method: 'PATCH', body: JSON.stringify({ isBanned }) })
    fetchAll()
  }

  const verifySeller = async (id: string, isVerified: boolean) => {
    await api(`/admin/sellers/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ isVerified }) })
    fetchAll()
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Remove this listing?')) return
    await api(`/admin/listings/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  // Filtered data
  const filteredUsers = useMemo(() => {
    let r = filterByDate(users, 'createdAt', userDate)
    if (userSearch) r = r.filter(u =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
    )
    return r
  }, [users, userSearch, userDate])

  const filteredSellers = useMemo(() => {
    let r = filterByDate(sellers, 'createdAt', sellerDate)
    if (sellerSearch) r = r.filter(s =>
      s.shopName?.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      s.user?.email?.toLowerCase().includes(sellerSearch.toLowerCase())
    )
    return r
  }, [sellers, sellerSearch, sellerDate])

  const filteredOrders = useMemo(() => {
    let r = filterByDate(orders, 'createdAt', orderDate)
    if (orderSearch) r = r.filter(o =>
      o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.status?.toLowerCase().includes(orderSearch.toLowerCase())
    )
    return r
  }, [orders, orderSearch, orderDate])

  const filteredListings = useMemo(() => {
    let r = filterByDate(listings, 'createdAt', listingDate)
    if (listingSearch) r = r.filter(l =>
      l.card?.name?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.card?.set?.toLowerCase().includes(listingSearch.toLowerCase()) ||
      l.seller?.shopName?.toLowerCase().includes(listingSearch.toLowerCase())
    )
    return r
  }, [listings, listingSearch, listingDate])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users',    label: 'Users' },
    { key: 'sellers',  label: 'Sellers' },
    { key: 'orders',   label: 'Orders' },
    { key: 'listings', label: 'Listings' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-xs text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-xs">

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-5 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="BHT" className="w-6 h-6 object-contain" />
          <span className="font-bold text-gray-900 dark:text-white text-xs">
            Pullverse TCG
          </span>
          <span className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
            Refresh
          </button>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/') }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">

        {/* Tab nav */}
        <div className="flex gap-1 mb-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors font-medium ${
                tab === t.key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Users"    value={stats.stats.users}    />
              <StatCard label="Total Sellers"  value={stats.stats.sellers}  />
              <StatCard label="Total Orders"   value={stats.stats.orders}   />
              <StatCard label="Total Listings" value={stats.stats.listings} />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs text-gray-400 mb-1">Platform Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₱{parseFloat(stats.revenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">From paid, shipped and delivered orders</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Recent Orders</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Order ID</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Buyer</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Total</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2.5 font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-gray-900 dark:text-white">{order.user?.name}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell">{fmt(order.createdAt)}</td>
                      <td className="px-4 py-2.5 text-green-600 dark:text-green-400 font-medium">₱{parseFloat(order.total).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <SearchInput value={userSearch} onChange={setUserSearch} />
              <DateFilterBar value={userDate} onChange={setUserDate} />
            </div>
            <p className="text-gray-400">{filteredUsers.length} users</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Role</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden md:table-cell">Joined</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${user.isBanned ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0" style={{fontSize: 9}}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[100px]">{user.name}</span>
                          {user.isBanned && <span className="text-red-500 text-xs">(banned)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell truncate max-w-[160px]">{user.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN'  ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          user.role === 'SELLER' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{fmt(user.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => banUser(user.id, !user.isBanned)}
                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                              user.isBanned
                                ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100'
                                : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100'
                            }`}>
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sellers */}
        {tab === 'sellers' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <SearchInput value={sellerSearch} onChange={setSellerSearch} />
              <DateFilterBar value={sellerDate} onChange={setSellerDate} />
            </div>
            <p className="text-gray-400">{filteredSellers.length} sellers</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Shop</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden sm:table-cell">Owner</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Listings</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden md:table-cell">Joined</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredSellers.map(seller => (
                    <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{seller.shopName}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell truncate max-w-[160px]">{seller.user?.email}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{seller._count?.listings ?? 0}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{fmt(seller.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        {seller.isVerified
                          ? <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">Verified</span>
                          : <span className="text-xs bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">Unverified</span>
                        }
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => verifySeller(seller.id, !seller.isVerified)}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                            seller.isVerified
                              ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100'
                          }`}>
                          {seller.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <SearchInput value={orderSearch} onChange={setOrderSearch} />
              <DateFilterBar value={orderDate} onChange={setOrderDate} />
            </div>
            <p className="text-gray-400">{filteredOrders.length} orders</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Order ID</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden sm:table-cell">Buyer</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Total</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden lg:table-cell">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2.5 font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-gray-900 dark:text-white hidden sm:table-cell">
                        <div>{order.user?.name}</div>
                        <div className="text-gray-400 text-xs">{order.user?.email}</div>
                      </td>
                      <td className="px-4 py-2.5 text-green-600 dark:text-green-400 font-medium">₱{parseFloat(order.total).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{fmt(order.createdAt)}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden lg:table-cell">
                        {order.items?.map((i: any) => i.listing?.card?.name).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <SearchInput value={listingSearch} onChange={setListingSearch} />
              <DateFilterBar value={listingDate} onChange={setListingDate} />
            </div>
            <p className="text-gray-400">{filteredListings.length} listings</p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Card</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden sm:table-cell">Set</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Seller</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Price</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden sm:table-cell">Stock</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium hidden md:table-cell">Listed</th>
                    <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredListings.map(listing => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{listing.card?.name}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden sm:table-cell">{listing.card?.set}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{listing.seller?.shopName}</td>
                      <td className="px-4 py-2.5 text-green-600 dark:text-green-400 font-medium">₱{parseFloat(listing.price).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{listing.stock}</td>
                      <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{fmt(listing.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => deleteListing(listing.id)}
                          className="text-xs bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}