import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked: boolean
  loading?: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export function Checkbox({ checked, loading, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? (checked ? 'Mark incomplete' : 'Mark complete')}
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-150',
          loading && 'animate-pulse',
          checked
            ? 'border-green-500 bg-green-500'
            : 'border-gray-400 bg-white hover:border-gray-500',
        )}
      >
        {checked && (
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  )
}
