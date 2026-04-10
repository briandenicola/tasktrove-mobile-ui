import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      role="status"
      className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white"
    >
      You're offline — changes will sync when reconnected
    </div>
  )
}
