import { useSyncExternalStore } from 'react';
import { Id } from '../../convex/_generated/dataModel';

export interface GuestDashboard {
  _id: Id<'dashboards'>;
  name: string;
  beforeTaxIncome?: number;
  zipCode?: string;
  afterTaxIncome?: number;
  createdAt: number;
  updatedAt: number;
}

export interface GuestCategory {
  _id: Id<'categories'>;
  dashboardId: Id<'dashboards'>;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  order: number;
}

export interface GuestTransaction {
  _id: Id<'transactions'>;
  dashboardId: Id<'dashboards'>;
  categoryId?: Id<'categories'>;
  description: string;
  amount: number;
  date: number;
  isPreTax?: boolean;
}

interface GuestState {
  dashboards: GuestDashboard[];
  categories: GuestCategory[];
  transactions: GuestTransaction[];
}

const EMPTY: GuestState = { dashboards: [], categories: [], transactions: [] };

let state: GuestState = EMPTY;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(next: GuestState) {
  state = next;
  listeners.forEach((l) => l());
}

function getState() {
  return state;
}

type GuestTable = 'dashboards' | 'categories' | 'transactions';

function genId<T extends GuestTable>(prefix: string): Id<T> {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${uuid}` as unknown as Id<T>;
}

export const guestStore = {
  subscribe,
  getState,

  reset() {
    setState(EMPTY);
  },

  hasData() {
    return (
      state.dashboards.length > 0 ||
      state.categories.length > 0 ||
      state.transactions.length > 0
    );
  },

  snapshot() {
    return {
      dashboards: state.dashboards.map((d) => ({ ...d })),
      categories: state.categories.map((c) => ({ ...c })),
      transactions: state.transactions.map((t) => ({ ...t })),
    };
  },

  createDashboard(name: string): Id<'dashboards'> {
    const now = Date.now();
    const dashboard: GuestDashboard = {
      _id: genId<'dashboards'>('guest_d'),
      name,
      createdAt: now,
      updatedAt: now,
    };
    setState({ ...state, dashboards: [dashboard, ...state.dashboards] });
    return dashboard._id;
  },

  updateDashboard(
    id: Id<'dashboards'>,
    patch: Partial<Pick<GuestDashboard, 'name' | 'beforeTaxIncome' | 'zipCode' | 'afterTaxIncome'>>
  ) {
    const now = Date.now();
    setState({
      ...state,
      dashboards: state.dashboards.map((d) =>
        d._id === id ? { ...d, ...patch, updatedAt: now } : d
      ),
    });
  },

  renameDashboard(id: Id<'dashboards'>, name: string) {
    this.updateDashboard(id, { name });
  },

  removeDashboard(id: Id<'dashboards'>) {
    setState({
      dashboards: state.dashboards.filter((d) => d._id !== id),
      categories: state.categories.filter((c) => c.dashboardId !== id),
      transactions: state.transactions.filter((t) => t.dashboardId !== id),
    });
  },

  createCategory(args: {
    dashboardId: Id<'dashboards'>;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
  }): Id<'categories'> {
    const maxOrder = state.categories
      .filter((c) => c.dashboardId === args.dashboardId)
      .reduce((m, c) => Math.max(m, c.order), -1);
    const category: GuestCategory = {
      _id: genId<'categories'>('guest_c'),
      dashboardId: args.dashboardId,
      name: args.name,
      type: args.type,
      value: args.value,
      order: maxOrder + 1,
    };
    setState({ ...state, categories: [...state.categories, category] });
    return category._id;
  },

  updateCategory(
    id: Id<'categories'>,
    patch: Partial<Pick<GuestCategory, 'name' | 'type' | 'value'>>
  ) {
    setState({
      ...state,
      categories: state.categories.map((c) => (c._id === id ? { ...c, ...patch } : c)),
    });
  },

  removeCategory(id: Id<'categories'>) {
    setState({
      ...state,
      categories: state.categories.filter((c) => c._id !== id),
      transactions: state.transactions.map((t) =>
        t.categoryId === id ? { ...t, categoryId: undefined } : t
      ),
    });
  },

  createTransaction(args: {
    dashboardId: Id<'dashboards'>;
    categoryId?: Id<'categories'>;
    description: string;
    amount: number;
    date: number;
    isPreTax?: boolean;
  }): Id<'transactions'> {
    const transaction: GuestTransaction = {
      _id: genId<'transactions'>('guest_t'),
      ...args,
    };
    setState({ ...state, transactions: [...state.transactions, transaction] });
    return transaction._id;
  },

  updateTransaction(
    id: Id<'transactions'>,
    patch: Partial<Pick<GuestTransaction, 'description' | 'amount' | 'date' | 'categoryId' | 'isPreTax'>>
  ) {
    setState({
      ...state,
      transactions: state.transactions.map((t) => (t._id === id ? { ...t, ...patch } : t)),
    });
  },

  removeTransaction(id: Id<'transactions'>) {
    setState({
      ...state,
      transactions: state.transactions.filter((t) => t._id !== id),
    });
  },
};

export function useGuestState(): GuestState {
  return useSyncExternalStore(subscribe, getState, getState);
}
