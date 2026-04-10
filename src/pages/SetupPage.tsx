import { useAuth } from '@/hooks/useAuth'
import { Navigate, useNavigate } from 'react-router'
import { SetupScreen } from '@/components/auth/SetupScreen'

export function SetupPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">TaskTrove</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Connect to your TaskTrove server to get started.
          </p>
        </div>
        <SetupScreen onConnected={() => navigate('/', { replace: true })} />
      </div>
    </div>
  )
}
