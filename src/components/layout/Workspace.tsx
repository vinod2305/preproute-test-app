import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { TopBar } from './AppShell'
import {
  BellIcon,
  CreateIcon,
  DashboardIcon,
  DocIcon,
  MarksIcon,
  TrackingIcon,
} from '../ui/icons'

const RAIL_ICONS = [
  { icon: DashboardIcon, active: false },
  { icon: CreateIcon, active: true },
  { icon: DocIcon, active: false },
  { icon: TrackingIcon, active: false },
  { icon: MarksIcon, active: false },
  { icon: BellIcon, active: false },
]

function IconRail() {
  return (
    <aside className="flex w-16 flex-shrink-0 flex-col items-center border-r border-gray-100 bg-white py-5">
      <Link to="/dashboard" className="mb-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          P
        </span>
      </Link>
      <nav className="flex flex-col items-center gap-6">
        {RAIL_ICONS.map(({ icon: Icon, active }, i) => (
          <span
            key={i}
            className={cn(active ? 'text-primary-600' : 'text-gray-300')}
          >
            <Icon width={20} height={20} />
          </span>
        ))}
      </nav>
    </aside>
  )
}

// Chip states for the question-navigation panel.
export interface QuestionNavItem {
  label: string
  done: boolean
  active?: boolean
  onClick?: () => void
}

export function QuestionPanel({
  total,
  items,
}: {
  total: number
  items: QuestionNavItem[]
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <img src="/logo.png" alt="PrepRoute" className="h-7" />
      </div>
      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-sm font-medium text-gray-700">Question creation</span>
        <span className="text-gray-300">«</span>
      </div>
      <p className="px-5 pb-4 text-xs text-gray-400">Total Questions . {total}</p>
      <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-6">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className={cn(
              'flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
              item.done
                ? 'border-primary-200 text-gray-700'
                : 'border-gray-200 text-gray-400',
              item.active && 'ring-2 ring-primary-100',
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  item.done
                    ? 'bg-green-500 text-white'
                    : 'border border-gray-300 text-transparent',
                )}
              >
                ✓
              </span>
              {item.label}
            </span>
            <span className="text-gray-300">»</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function Workspace({
  panel,
  children,
}: {
  panel: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <IconRail />
      <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-gray-100 bg-white">
        {panel}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
