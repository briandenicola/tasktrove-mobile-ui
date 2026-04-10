import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
  secondary:
    'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 disabled:bg-gray-50 disabled:text-gray-400',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', loading = false, disabled, children, className, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          variantStyles[variant],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  },
)
