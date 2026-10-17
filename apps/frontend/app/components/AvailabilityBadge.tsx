type Props = {
  availability: string
  size?: 'sm' | 'xs'
}

const AVAILABILITY_CONFIG: Record<string, { label: string; icon: string; style: string }> = {
  ON_HAND:   { label: 'On Hand',   icon: '✅', style: 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]' },
  PRE_ORDER: { label: 'Pre-order', icon: '⏳', style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
  DELIVERED: { label: 'Delivered', icon: '📦', style: 'bg-[#EFF4FF] text-[#2563EB] border border-[#DBEAFE]' },
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