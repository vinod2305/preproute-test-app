import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { ChevronDown } from './icons'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, id, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="label-base">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={cn(
              'input-base h-12 appearance-none pr-10',
              error && 'border-red-400',
              className,
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            width={18}
            height={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Select.displayName = 'Select'
