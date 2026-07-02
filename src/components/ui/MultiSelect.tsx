import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import type { SelectOption } from './Select'
import { ChevronDown } from './icons'

interface MultiSelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  disabled?: boolean
  emptyText?: string
}

export function MultiSelect({
  label,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  emptyText = 'No options available',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const selected = options.filter((o) => value.includes(o.value))

  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  return (
    <div className="w-full" ref={ref}>
      {label && <label className="label-base">{label}</label>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'input-base flex min-h-12 flex-wrap items-center gap-1.5 pr-10 text-left',
            error && 'border-red-400',
            disabled && 'cursor-not-allowed bg-gray-50',
          )}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selected.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
              >
                {o.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggle(o.value)
                  }}
                  className="cursor-pointer text-primary-400 hover:text-primary-700"
                >
                  ×
                </span>
              </span>
            ))
          )}
          <ChevronDown
            width={18}
            height={18}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </button>

        {open && !disabled && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {options.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">{emptyText}</p>
            ) : (
              options.map((o) => {
                const checked = value.includes(o.value)
                return (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => toggle(o.value)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        checked
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300',
                      )}
                    >
                      {checked && '✓'}
                    </span>
                    {o.label}
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
