import { useState, useSyncExternalStore } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Trash2, Edit2, Check, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import Button from '../ui/Button';
import { formatRelativeTime } from '../../lib/utils';

// Custom hook to sync with browser URL - bypasses React Router's state issues
function useUrlDashboardId(): string | undefined {
  const getSnapshot = () => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/app/')) {
      return pathname.split('/app/')[1]?.split('/')[0] || undefined;
    }
    return undefined;
  };
  
  const subscribe = (callback: () => void) => {
    window.addEventListener('popstate', callback);
    const interval = setInterval(callback, 100);
    return () => {
      window.removeEventListener('popstate', callback);
      clearInterval(interval);
    };
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

interface Dashboard {
  _id: Id<'dashboards'>;
  name: string;
  updatedAt: number;
}

export default function Sidebar() {
  const navigate = useNavigate();
  // Use URL-synced dashboardId - always reflects current browser URL
  const dashboardId = useUrlDashboardId();
  const { signOut } = useAuthActions();
  
  const dashboards = (useQuery(api.dashboards.list) || []) as Dashboard[];
  const createDashboard = useMutation(api.dashboards.create);
  const renameDashboard = useMutation(api.dashboards.rename);
  const removeDashboard = useMutation(api.dashboards.remove);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const id = await createDashboard({ name: 'New Budget' });
      navigate(`/app/${id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveRename = async (id: Id<'dashboards'>) => {
    if (editName.trim()) {
      await renameDashboard({ id, name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: Id<'dashboards'>) => {
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      await removeDashboard({ id });
      if (dashboardId === id) {
        navigate('/app');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="w-72 bg-surface border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <h1 className="font-heading text-2xl font-bold text-accent">BudgetWise</h1>
      </div>

      {/* Dashboard List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
            Dashboards
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreate}
            disabled={isCreating}
            className="p-1.5"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {dashboards.map((dashboard) => {
            const isActive = dashboardId === dashboard._id;
            const isEditing = editingId === dashboard._id;

            return (
              <div
                key={dashboard._id}
                className={`group rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-accent/10 border border-accent/30' 
                    : 'hover:bg-surface-hover border border-transparent'
                }`}
              >
                {isEditing ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(dashboard._id);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                    />
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveRename(dashboard._id)}
                        className="p-1"
                      >
                        <Check className="w-4 h-4 text-success" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelRename}
                        className="p-1"
                      >
                        <X className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={`/app/${dashboard._id}`}
                    className="block p-3 cursor-pointer no-underline"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                        <span className={`font-body truncate ${isActive ? 'text-accent font-medium' : 'text-text-primary'}`}>
                          {dashboard.name}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleStartRename(dashboard._id, dashboard.name);
                          }}
                          className="p-1 hover:bg-background rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-text-secondary" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDelete(dashboard._id);
                          }}
                          className="p-1 hover:bg-background rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 ml-6">
                      {formatRelativeTime(dashboard.updatedAt)}
                    </p>
                  </Link>
                )}
              </div>
            );
          })}

          {dashboards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-text-secondary font-body text-sm mb-4">No budgets yet</p>
              <Button onClick={handleCreate} disabled={isCreating} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
