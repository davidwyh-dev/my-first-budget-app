import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';

export default function MainLayout() {
  const location = useLocation();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/58e1b280-2e34-4934-9947-55117da72a3e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MainLayout.tsx',message:'MainLayout rendered',data:{pathname:location.pathname,locationKey:location.key},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
