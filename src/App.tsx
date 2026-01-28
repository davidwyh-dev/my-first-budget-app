import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/layout/MainLayout'

// Wrapper component - Dashboard now uses URL sync internally, no prop needed
function DashboardWithKey() {
  const { dashboardId } = useParams();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/58e1b280-2e34-4934-9947-55117da72a3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:DashboardWithKey',message:'DashboardWithKey wrapper rendered',data:{dashboardIdFromWrapper:dashboardId,currentUrl:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  return <Dashboard />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-accent font-heading text-2xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
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
          <Route path=":dashboardId" element={<DashboardWithKey />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
