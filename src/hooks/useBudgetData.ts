import { useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useGuestMode } from '../context/GuestModeContext';
import { guestStore, useGuestState, GuestDashboard, GuestCategory, GuestTransaction } from '../lib/guestStore';

// ---------- Queries ----------

export function useDashboardsList(): GuestDashboard[] | undefined {
  const { isGuestMode } = useGuestMode();
  const guestState = useGuestState();
  const convexResult = useQuery(api.dashboards.list, isGuestMode ? 'skip' : {});

  return useMemo(() => {
    if (isGuestMode) {
      return [...guestState.dashboards].sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return convexResult as GuestDashboard[] | undefined;
  }, [isGuestMode, guestState.dashboards, convexResult]);
}

export function useDashboard(id: Id<'dashboards'> | undefined): GuestDashboard | null | undefined {
  const { isGuestMode } = useGuestMode();
  const guestState = useGuestState();
  const convexResult = useQuery(
    api.dashboards.get,
    !isGuestMode && id ? { id } : 'skip'
  );

  if (isGuestMode) {
    if (!id) return undefined;
    return guestState.dashboards.find((d) => d._id === id) ?? null;
  }
  if (!id) return undefined;
  return convexResult as GuestDashboard | null | undefined;
}

export function useCategories(dashboardId: Id<'dashboards'> | undefined): GuestCategory[] {
  const { isGuestMode } = useGuestMode();
  const guestState = useGuestState();
  const convexResult = useQuery(
    api.categories.list,
    !isGuestMode && dashboardId ? { dashboardId } : 'skip'
  );

  return useMemo(() => {
    if (isGuestMode) {
      if (!dashboardId) return [];
      return guestState.categories
        .filter((c) => c.dashboardId === dashboardId)
        .sort((a, b) => a.order - b.order);
    }
    return (convexResult as GuestCategory[] | undefined) ?? [];
  }, [isGuestMode, guestState.categories, dashboardId, convexResult]);
}

export function useTransactions(dashboardId: Id<'dashboards'> | undefined): GuestTransaction[] {
  const { isGuestMode } = useGuestMode();
  const guestState = useGuestState();
  const convexResult = useQuery(
    api.transactions.list,
    !isGuestMode && dashboardId ? { dashboardId } : 'skip'
  );

  return useMemo(() => {
    if (isGuestMode) {
      if (!dashboardId) return [];
      return guestState.transactions
        .filter((t) => t.dashboardId === dashboardId)
        .sort((a, b) => b.date - a.date);
    }
    return (convexResult as GuestTransaction[] | undefined) ?? [];
  }, [isGuestMode, guestState.transactions, dashboardId, convexResult]);
}

// ---------- Mutations ----------
// Each hook returns a function that mirrors the Convex mutation signature
// so call sites don't change.

export function useCreateDashboard() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.dashboards.create);
  return async (args: { name: string }): Promise<Id<'dashboards'>> => {
    if (isGuestMode) {
      return guestStore.createDashboard(args.name);
    }
    return convexMutation(args);
  };
}

export function useUpdateDashboard() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.dashboards.update);
  return async (args: {
    id: Id<'dashboards'>;
    name?: string;
    beforeTaxIncome?: number;
    zipCode?: string;
    afterTaxIncome?: number;
  }): Promise<void> => {
    if (isGuestMode) {
      const { id, ...patch } = args;
      guestStore.updateDashboard(id, patch);
      return;
    }
    await convexMutation(args);
  };
}

export function useRenameDashboard() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.dashboards.rename);
  return async (args: { id: Id<'dashboards'>; name: string }): Promise<void> => {
    if (isGuestMode) {
      guestStore.renameDashboard(args.id, args.name);
      return;
    }
    await convexMutation(args);
  };
}

export function useRemoveDashboard() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.dashboards.remove);
  return async (args: { id: Id<'dashboards'> }): Promise<void> => {
    if (isGuestMode) {
      guestStore.removeDashboard(args.id);
      return;
    }
    await convexMutation(args);
  };
}

export function useCreateCategory() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.categories.create);
  return async (args: {
    dashboardId: Id<'dashboards'>;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
  }): Promise<Id<'categories'>> => {
    if (isGuestMode) {
      return guestStore.createCategory(args);
    }
    return convexMutation(args);
  };
}

export function useUpdateCategory() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.categories.update);
  return async (args: {
    id: Id<'categories'>;
    name?: string;
    type?: 'percentage' | 'fixed';
    value?: number;
  }): Promise<void> => {
    if (isGuestMode) {
      const { id, ...patch } = args;
      guestStore.updateCategory(id, patch);
      return;
    }
    await convexMutation(args);
  };
}

export function useRemoveCategory() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.categories.remove);
  return async (args: { id: Id<'categories'> }): Promise<void> => {
    if (isGuestMode) {
      guestStore.removeCategory(args.id);
      return;
    }
    await convexMutation(args);
  };
}

export function useCreateTransaction() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.transactions.create);
  return async (args: {
    dashboardId: Id<'dashboards'>;
    categoryId?: Id<'categories'>;
    description: string;
    amount: number;
    date: number;
    isPreTax?: boolean;
  }): Promise<Id<'transactions'>> => {
    if (isGuestMode) {
      return guestStore.createTransaction(args);
    }
    return convexMutation(args);
  };
}

export function useUpdateTransaction() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.transactions.update);
  return async (args: {
    id: Id<'transactions'>;
    categoryId?: Id<'categories'>;
    description?: string;
    amount?: number;
    date?: number;
    isPreTax?: boolean;
  }): Promise<void> => {
    if (isGuestMode) {
      const { id, ...patch } = args;
      guestStore.updateTransaction(id, patch);
      return;
    }
    await convexMutation(args);
  };
}

export function useRemoveTransaction() {
  const { isGuestMode } = useGuestMode();
  const convexMutation = useMutation(api.transactions.remove);
  return async (args: { id: Id<'transactions'> }): Promise<void> => {
    if (isGuestMode) {
      guestStore.removeTransaction(args.id);
      return;
    }
    await convexMutation(args);
  };
}
