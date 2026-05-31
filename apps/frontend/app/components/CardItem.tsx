import { Card } from '../types/card'
import Image from 'next/image'

export default function CardItem({ card }: { card: Card }) {
  const lowestPrice = card.skus.length > 0
    ? Math.min(...card.skus.map(s => parseFloat(s.price)))
    : null

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
      
      {/* Card Image */}
      <div className="relative w-full aspect-[3/4] bg-gray-800">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h3 className="text-white font-bold text-sm truncate">{card.name}</h3>
        <p className="text-gray-400 text-xs mt-1">{card.set} · #{card.number}</p>
        <p className="text-blue-400 text-xs mt-1">{card.rarity}</p>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          {lowestPrice ? (
            <span className="text-green-400 font-bold text-sm">
              ${lowestPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">No listings</span>
          )}
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg transition-colors">
            View
          </button>
        </div>
      </div>
    </div>
  )
}