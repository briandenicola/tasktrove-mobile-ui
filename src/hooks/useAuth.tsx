import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import {
  getBaseUrl,
  getToken,
  setBaseUrl,
  setToken,
  clearCredentials,
  hasCredentials as checkCredentials,
} from '@/lib/config'
import { createApiClient, type ApiClient } from '@/api/client'

interface AuthState {
  baseUrl: string | null
  token: string | null
  isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
  login: (baseUrl: string, token: string) => void
  logout: () => void
  client: ApiClient | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildInitialState(): AuthState {
  return {
    baseUrl: getBaseUrl(),
    token: getToken(),
    isAuthenticated: checkCredentials(),
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(buildInitialState)

  const login = useCallback((baseUrl: string, token: string) => {
    setBaseUrl(baseUrl)
    setToken(token)
    setState({ baseUrl: getBaseUrl(), token, isAuthenticated: true })
  }, [])

  const logout = useCallback(() => {
    clearCredentials()
    setState({ baseUrl: null, token: null, isAuthenticated: false })
  }, [])

  const client = useMemo(() => {
    if (!state.baseUrl || !state.token) return null
    return createApiClient({ baseUrl: state.baseUrl, token: state.token })
  }, [state.baseUrl, state.token])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, client }),
    [state, login, logout, client],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
