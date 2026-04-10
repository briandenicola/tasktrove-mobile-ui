export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg
        className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="12"
          y="8"
          width="40"
          height="48"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M22 24h20M22 32h20M22 40h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="48" cy="48" r="12" className="fill-white dark:fill-gray-900" />
        <circle
          cx="48"
          cy="48"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M44 48h8M48 44v8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tasks yet</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Tap the + button to add your first task
      </p>
    </div>
  )
}
