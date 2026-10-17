'use client'

import { useState } from 'react'

type Props = {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const [hovered, setHovered] = useState(0)

  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${sizes[size]} transition-transform ${
            !readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
        >
          <span className={
            star <= (hovered || value)
              ? 'text-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}