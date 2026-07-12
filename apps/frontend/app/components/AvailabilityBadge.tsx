type Props = {
  availability: string
  size?: 'sm' | 'xs'
}

const AVAILABILITY_CONFIG: Record<string, { label: string; icon: string; style: string }> = {
  ON_HAND:   { label: 'On Hand',   icon: '✅', style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800' },
  PRE_ORDER: { label: 'Pre-order', icon: '⏳', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
  DELIVERED: { label: 'Delivered', icon: '📦', style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
}

export default function AvailabilityBadge({ availability, size = 'xs' }: Props) {
  const config = AVAILABILITY_CONFIG[availability] ?? AVAILABILITY_CONFIG['ON_HAND']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
      size === 'xs' ? 'text-xs' : 'text-sm'
    } ${config.style}`}>
      {config.icon} {config.label}
    </span>
  )
}