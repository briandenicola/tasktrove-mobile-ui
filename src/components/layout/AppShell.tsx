import { OfflineBanner } from './OfflineBanner'
import { HamburgerMenu } from './HamburgerMenu'
import type { ReactNode } from 'react'

interface AppShellProps {
  title?: string
  children: ReactNode
  fab?: ReactNode
  headerRight?: ReactNode
}

export function AppShell({
  title = 'TaskTrove',
  children,
  fab,
  headerRight,
}: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <OfflineBanner />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-semibold">{title}</h1>
        {headerRight ?? <HamburgerMenu />}
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      {fab && (
        <div className="fixed bottom-6 right-4 z-20">{fab}</div>
      )}
    </div>
  )
}
