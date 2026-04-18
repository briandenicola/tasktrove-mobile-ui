import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useSyncManager } from '@/hooks/useSyncManager'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const { syncStatus } = useSyncManager()

  // Show syncing status (only if there are pending items)
  if (isOnline && syncStatus.isSyncing && syncStatus.pendingCount > 0) {
    return (
      <div
        role="status"
        className="bg-blue-500 px-4 py-1.5 text-center text-xs font-medium text-white"
      >
        Syncing {syncStatus.pendingCount} pending {syncStatus.pendingCount === 1 ? 'change' : 'changes'}...
      </div>
    )
  }

  // Show offline status with pending count
  if (!isOnline) {
    return (
      <div
        role="status"
        className="bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white"
      >
        You're offline
        {syncStatus.pendingCount > 0 && ` — ${syncStatus.pendingCount} pending ${syncStatus.pendingCount === 1 ? 'change' : 'changes'}`}
      </div>
    )
  }

  // Show error if sync failed
  if (syncStatus.error) {
    return (
      <div
        role="alert"
        className="bg-red-500 px-4 py-1.5 text-center text-xs font-medium text-white"
      >
        Sync failed: {syncStatus.error}
      </div>
    )
  }

  return null
}
