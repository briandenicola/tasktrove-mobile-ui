import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router'

export function SetupPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">TaskTrove</h1>
        <p className="mb-8 text-gray-500">
          Connect to your TaskTrove server to get started.
        </p>
        <p className="text-sm text-gray-400">Setup form coming in Phase 3…</p>
      </div>
    </div>
  )
}
