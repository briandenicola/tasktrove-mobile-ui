import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { createApiClient, ApiClientError, NetworkError } from '@/api/client'
import { TaskListResponseSchema } from '@/lib/schemas'

type ConnectionStatus = 'idle' | 'connecting' | 'error'

function normalizeUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '')
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }
  return url
}

function describeError(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.isUnauthorized) return 'Invalid token — authentication failed.'
    return err.apiError?.message ?? `Server error (${err.status})`
  }
  if (err instanceof NetworkError) {
    return 'Server unreachable — check the URL and your connection.'
  }
  return 'An unexpected error occurred.'
}

interface SetupScreenProps {
  onConnected: () => void
}

export function SetupScreen({ onConnected }: SetupScreenProps) {
  const { login } = useAuth()

  const [serverUrl, setServerUrl] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [urlError, setUrlError] = useState('')
  const [tokenError, setTokenError] = useState('')

  function validate(): boolean {
    let valid = true

    if (!serverUrl.trim()) {
      setUrlError('Server URL is required.')
      valid = false
    } else {
      setUrlError('')
    }

    if (!token.trim()) {
      setTokenError('API token is required.')
      valid = false
    } else {
      setTokenError('')
    }

    return valid
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!validate()) return

    const baseUrl = normalizeUrl(serverUrl)
    setStatus('connecting')

    try {
      const client = createApiClient({ baseUrl, token: token.trim() })
      await client.apiFetch('/tasks', TaskListResponseSchema)

      login(baseUrl, token.trim())
      onConnected()
    } catch (err) {
      setStatus('error')
      setErrorMessage(describeError(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Server URL"
        type="url"
        placeholder="https://todo.example.com"
        value={serverUrl}
        onChange={(e) => setServerUrl(e.target.value)}
        error={urlError}
        hint="Your self-hosted TaskTrove instance URL"
        autoComplete="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="relative">
        <Input
          label="API Token"
          type={showToken ? 'text' : 'password'}
          placeholder="Enter your auth secret"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={tokenError}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowToken((s) => !s)}
          className="absolute right-3 top-[34px] text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          tabIndex={-1}
        >
          {showToken ? 'Hide' : 'Show'}
        </button>
      </div>

      {status === 'error' && errorMessage && (
        <div
          className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        loading={status === 'connecting'}
        className="w-full"
      >
        {status === 'connecting' ? 'Connecting…' : 'Connect'}
      </Button>
    </form>
  )
}
