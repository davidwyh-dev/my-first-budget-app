import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useGuestMode } from '../context/GuestModeContext';

export default function GuestBanner() {
  const { isGuestMode } = useGuestMode();
  const navigate = useNavigate();

  if (!isGuestMode) return null;

  return (
    <div
      role="status"
      className="bg-accent/10 border-b border-accent/30 text-accent px-6 py-3"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="font-body text-sm">
            <span className="font-semibold">You're trying BudgetWise without an account.</span>{' '}
            Your data is held in memory only and{' '}
            <span className="underline">will be lost when you refresh or close this tab</span>.
          </p>
        </div>
        <button
          onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
          className="text-sm font-medium underline underline-offset-2 hover:text-accent-hover whitespace-nowrap self-start sm:self-auto"
        >
          Sign up to save
        </button>
      </div>
    </div>
  );
}
