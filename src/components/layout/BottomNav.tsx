import { useLocation, useNavigate } from 'react-router'
import { cn } from '@/lib/utils'

interface TabItem {
  path: string
  label: string
  icon: React.ReactNode
  action?: () => void
}

interface BottomNavProps {
  onAddTap?: () => void
}

export function BottomNav({ onAddTap }: BottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs: TabItem[] = [
    {
      path: '/',
      label: 'Today',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      path: '/upcoming',
      label: 'Upcoming',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      path: '#add',
      label: 'Add',
      action: () => onAddTap?.(),
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      path: '/search',
      label: 'Search',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      path: '/completed',
      label: 'Done',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = tab.path !== '#add' && location.pathname === tab.path
          const isAdd = tab.path === '#add'

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => tab.action ? tab.action() : navigate(tab.path)}
              className={cn(
                'flex min-w-[48px] flex-col items-center gap-0.5 rounded-lg px-2 py-1 transition-colors',
                isAdd
                  ? 'text-white'
                  : isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700',
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
            >
              {isAdd ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-md">
                  {tab.icon}
                </span>
              ) : (
                tab.icon
              )}
              <span className={cn(
                'text-[10px] font-medium',
                isAdd && 'text-gray-500',
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
