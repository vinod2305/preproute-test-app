import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { TestStatus } from '../../types'

const statusStyles: Record<string, string> = {
  live: 'bg-green-50 text-green-700 ring-green-600/20',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  default: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        statusStyles[tone ?? 'default'] ?? statusStyles.default,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: TestStatus }) {
  const label = status ?? 'draft'
  return <Badge tone={label}>{label}</Badge>
}
