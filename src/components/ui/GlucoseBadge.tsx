import type { GlucoseStatus } from '../../types/glucose'
import { STATUS_COLORS } from '../../types/glucose'

interface BadgeProps {
  status: GlucoseStatus
  size?: 'sm' | 'md'
}

export function GlucoseBadge({ status, size = 'md' }: BadgeProps) {
  const colors = STATUS_COLORS[status]
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 font-semibold tracking-wide'
    : 'text-xs px-2.5 py-1 font-semibold'
  return (
    <span className={`inline-flex items-center rounded-full ${colors.bg} ${colors.text} ${sizeClass}`}>
      {colors.label}
    </span>
  )
}
