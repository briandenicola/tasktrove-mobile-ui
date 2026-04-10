import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { SetupScreen } from '@/components/auth/SetupScreen'
import { useAuth } from '@/hooks/useAuth'

export function SettingsPage() {
  const { baseUrl } = useAuth()
  const navigate = useNavigate()

  return (
    <AppShell title="Settings">
      <div className="flex flex-1 flex-col px-4 pb-8 pt-4">
        <section className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">Connected to</h2>
          <p className="text-sm font-medium text-gray-800 break-all">{baseUrl ?? 'Not connected'}</p>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Update Connection</h2>
          <SetupScreen onConnected={() => navigate('/', { replace: true })} />
        </section>
      </div>
    </AppShell>
  )
}
