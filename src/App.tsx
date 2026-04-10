import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { SetupPage } from '@/pages/SetupPage'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/setup" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <TasksPage />
          </AuthGuard>
        }
      />
      <Route
        path="/task/:id"
        element={
          <AuthGuard>
            <TaskDetailPage />
          </AuthGuard>
        }
      />
      <Route
        path="/project/:id"
        element={
          <AuthGuard>
            <ProjectPage />
          </AuthGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}


