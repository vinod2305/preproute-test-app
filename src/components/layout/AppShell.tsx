import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import {
  BellIcon,
  ChevronDown,
  CreateIcon,
  DashboardIcon,
  TrackingIcon,
} from '../ui/icons'

interface NavItem {
  label: string
  to: string
  icon: typeof DashboardIcon
  match: (path: string) => boolean
}

const NAV: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: DashboardIcon,
    match: (p) => p === '/dashboard',
  },
  {
    label: 'Test Creation',
    to: '/tests/new',
    icon: CreateIcon,
    match: (p) => p.startsWith('/tests'),
  },
  {
    label: 'Test Tracking',
    to: '/dashboard',
    icon: TrackingIcon,
    match: () => false,
  },
]

function initials(name?: string) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="flex h-[72px] flex-shrink-0 items-center justify-end gap-5 border-b border-gray-100 bg-white px-6">
      <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
        <BellIcon width={18} height={18} />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
      </button>
      <button
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
        className="flex items-center gap-2.5"
        title="Log out"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {initials(user?.name || user?.userId)}
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-semibold text-gray-800">
            {user?.name || user?.userId}
          </span>
          <span className="block text-xs capitalize text-gray-400">
            {user?.role || 'admin'}
          </span>
        </span>
        <ChevronDown width={16} height={16} className="text-gray-400" />
      </button>
    </header>
  )
}

export function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="flex w-[240px] flex-shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="px-6 py-6">
        <Link to="/dashboard">
          <img src="/logo.png" alt="PrepRoute" className="h-8" />
        </Link>
      </div>
      <nav className="flex flex-col gap-1 px-4">
        {NAV.map((item) => {
          const active = item.match(pathname)
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              )}
            >
              <Icon width={20} height={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
