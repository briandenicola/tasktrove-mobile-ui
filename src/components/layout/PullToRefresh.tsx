import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface PullToRefreshProps {
  onRefresh: () => unknown
  children: ReactNode
  className?: string
}

const PULL_THRESHOLD = 80

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]!.clientY
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const el = scrollRef.current
      if (!el || el.scrollTop > 0) return

      const dy = e.touches[0]!.clientY - touchStartY.current
      if (dy > 0) {
        setPullDistance(Math.min(dy * 0.4, PULL_THRESHOLD + 20))
      }
    },
    [refreshing],
  )

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true)
      setPullDistance(40)
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false)
        setPullDistance(0)
      })
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  return (
    <div
      ref={scrollRef}
      className={className ?? 'flex-1 overflow-y-auto'}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center text-sm text-gray-400 transition-all"
          style={{ height: pullDistance }}
        >
          {refreshing
            ? 'Refreshing…'
            : pullDistance >= PULL_THRESHOLD
              ? 'Release to refresh'
              : 'Pull to refresh'}
        </div>
      )}
      {children}
    </div>
  )
}
