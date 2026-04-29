import { Outlet } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import GuestBanner from '../GuestBanner';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <GuestBanner />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
