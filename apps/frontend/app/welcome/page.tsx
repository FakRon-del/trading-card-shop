import Link from 'next/link'

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">

      {/* Nav */}
      <nav className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <span className="font-semibold text-gray-900 dark:text-white">
            Trading<span className="text-blue-500">Plus</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link href="/register"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs px-3 py-1.5 rounded-full mb-6">
          🇵🇭 Made for collectors
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          Buy & sell trading cards.<br />
          <span className="text-blue-500">Fast & trusted.</span>
        </h1>

        <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
          TradingPlus is the marketplace for Pokemon, MTG, Yu-Gi-Oh, and more. Buy from verified sellers or start your own shop today.
        </p>

        <div className="flex items-center gap-3 justify-center mb-16">
          <Link href="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm">
            Start now! →
          </Link>
          <Link href="/"
            className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            Search now!
          </Link>
        </div>
      </div>
    </main>
  )
}