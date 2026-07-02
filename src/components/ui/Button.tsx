import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-200 disabled:bg-primary-300',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200 disabled:opacity-60',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200 disabled:opacity-60',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 disabled:bg-red-300',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-200 disabled:opacity-60',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
