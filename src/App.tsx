import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/layout/MainLayout'
import { GuestModeProvider, useGuestMode } from './context/GuestModeContext'
import GuestDataMigrator from './components/GuestDataMigrator'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { isGuestMode } = useGuestMode()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-accent font-heading text-2xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated && !isGuestMode) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-accent font-heading text-2xl">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <GuestModeProvider>
        <GuestDataMigrator />
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />
          <Route path="/auth" element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } />
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path=":dashboardId" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GuestModeProvider>
    </BrowserRouter>
  )
}

export default App
