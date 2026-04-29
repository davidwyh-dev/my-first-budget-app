import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { Id } from '../../convex/_generated/dataModel';
import { DollarSign, Tag, CreditCard, Save, Loader2 } from 'lucide-react';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import BudgetChart from '../components/dashboard/BudgetChart';
import IncomePanel, { TaxSavingsByCategory } from '../components/dashboard/IncomePanel';
import BudgetPanel from '../components/dashboard/BudgetPanel';
import SpendPanel from '../components/dashboard/SpendPanel';
import {
  useDashboardsList,
  useDashboard,
  useCategories,
  useTransactions,
  useUpdateDashboard,
  useCreateCategory,
  useUpdateCategory,
  useRemoveCategory,
  useCreateTransaction,
  useUpdateTransaction,
  useRemoveTransaction,
} from '../hooks/useBudgetData';

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
    // Listen for both popstate (back/forward) and custom navigation events
    window.addEventListener('popstate', callback);
    // Also poll for URL changes since pushState doesn't fire popstate
    const interval = setInterval(callback, 100);
    return () => {
      window.removeEventListener('popstate', callback);
      clearInterval(interval);
    };
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Use URL-synced dashboardId - this always reflects the current browser URL
  // This bypasses React Router's stale state issues caused by rapid Convex re-renders
  const dashboardId = useUrlDashboardId();
  
  const dashboards = useDashboardsList();
  const dashboard = useDashboard(dashboardId as Id<'dashboards'> | undefined);
  const categories = useCategories(dashboardId as Id<'dashboards'> | undefined);
  const transactions = useTransactions(dashboardId as Id<'dashboards'> | undefined);

  const updateDashboard = useUpdateDashboard();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const removeCategory = useRemoveCategory();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const removeTransaction = useRemoveTransaction();

  const [isSaving, setIsSaving] = useState(false);
  const [pendingIncomeUpdate, setPendingIncomeUpdate] = useState<{
    beforeTaxIncome: number;
    zipCode: string;
    afterTaxIncome: number;
  } | null>(null);
  const [taxSavingsByCategory, setTaxSavingsByCategory] = useState<TaxSavingsByCategory[]>([]);

  // Clear pending income update when switching dashboards
  // This prevents income from one dashboard "leaking" to another
  useEffect(() => {
    setPendingIncomeUpdate(null);
    setTaxSavingsByCategory([]);
  }, [dashboardId]);

  // Navigate to first dashboard if none selected
  useEffect(() => {
    if (!dashboardId && dashboards && dashboards.length > 0) {
      navigate(`/app/${dashboards[0]._id}`);
    }
  }, [dashboardId, dashboards, navigate]);

  const handleIncomeUpdate = useCallback((beforeTaxIncome: number, zipCode: string, afterTaxIncome: number, taxSavings: TaxSavingsByCategory[]) => {
    setPendingIncomeUpdate({ beforeTaxIncome, zipCode, afterTaxIncome });
    setTaxSavingsByCategory(taxSavings);
  }, []);

  const handleSave = async () => {
    if (!dashboardId || !pendingIncomeUpdate) return;
    
    setIsSaving(true);
    try {
      await updateDashboard({
        id: dashboardId as Id<'dashboards'>,
        beforeTaxIncome: pendingIncomeUpdate.beforeTaxIncome,
        zipCode: pendingIncomeUpdate.zipCode,
        afterTaxIncome: pendingIncomeUpdate.afterTaxIncome,
      });
      setPendingIncomeUpdate(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async (name: string, type: 'percentage' | 'fixed', value: number) => {
    if (!dashboardId) return;
    await createCategory({
      dashboardId: dashboardId as Id<'dashboards'>,
      name,
      type,
      value,
    });
  };

  const handleUpdateCategory = async (id: string, name: string, type: 'percentage' | 'fixed', value: number) => {
    await updateCategory({
      id: id as Id<'categories'>,
      name,
      type,
      value,
    });
  };

  const handleDeleteCategory = async (id: string) => {
    await removeCategory({ id: id as Id<'categories'> });
  };

  const handleAddTransaction = async (description: string, amount: number, date: number, categoryId?: string, isPreTax?: boolean) => {
    if (!dashboardId) return;
    await createTransaction({
      dashboardId: dashboardId as Id<'dashboards'>,
      description,
      amount,
      date,
      categoryId: categoryId as Id<'categories'> | undefined,
      isPreTax,
    });
  };

  const handleUpdateTransaction = async (id: string, description: string, amount: number, date: number, categoryId?: string, isPreTax?: boolean) => {
    await updateTransaction({
      id: id as Id<'transactions'>,
      description,
      amount,
      date,
      categoryId: categoryId as Id<'categories'> | undefined,
      isPreTax,
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    await removeTransaction({ id: id as Id<'transactions'> });
  };

  // No dashboard selected state
  if (!dashboardId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">
            Welcome to BudgetWise
          </h2>
          <p className="text-text-secondary font-body">
            Select a dashboard from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (dashboard === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Dashboard not found
  if (dashboard === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-semibold text-text-primary mb-2">
            Dashboard Not Found
          </h2>
          <p className="text-text-secondary font-body">
            This dashboard may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  const afterTaxIncome = pendingIncomeUpdate?.afterTaxIncome ?? dashboard.afterTaxIncome ?? 0;
  const hasUnsavedChanges = pendingIncomeUpdate !== null;

  // Filter pre-tax transactions
  const preTaxTransactions = transactions.filter(tx => tx.isPreTax === true);

  // Calculate total tax savings
  const totalTaxSavings = taxSavingsByCategory.reduce((sum, s) => sum + s.taxSavings, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            {dashboard.name}
          </h1>
          <p className="text-text-secondary font-body mt-1">
            Track your income, budget, and spending in one place.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          loading={isSaving}
          disabled={!hasUnsavedChanges}
          className={!hasUnsavedChanges ? 'opacity-50' : ''}
        >
          <Save className="w-4 h-4 mr-2" />
          {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
        </Button>
      </div>

      {/* Budget Overview Chart */}
      <Card className="mb-8">
        <CardTitle className="mb-6">Budget Overview</CardTitle>
        <BudgetChart 
          categories={categories}
          transactions={transactions}
          afterTaxIncome={afterTaxIncome}
          totalTaxSavings={totalTaxSavings}
        />
      </Card>

      {/* Accordion Panels */}
      <Accordion type="multiple" defaultValue={['income']}>
        {/* Income Panel */}
        <AccordionItem value="income">
          <AccordionTrigger value="income" icon={<DollarSign className="w-5 h-5" />}>
            Income & Taxes
          </AccordionTrigger>
          <AccordionContent value="income">
            <IncomePanel
              beforeTaxIncome={pendingIncomeUpdate?.beforeTaxIncome ?? dashboard.beforeTaxIncome}
              zipCode={pendingIncomeUpdate?.zipCode ?? dashboard.zipCode}
              preTaxTransactions={preTaxTransactions}
              onUpdate={handleIncomeUpdate}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Budget Panel */}
        <AccordionItem value="budget">
          <AccordionTrigger value="budget" icon={<Tag className="w-5 h-5" />}>
            Budget Categories
          </AccordionTrigger>
          <AccordionContent value="budget">
            <BudgetPanel
              categories={categories}
              afterTaxIncome={afterTaxIncome}
              taxSavingsByCategory={taxSavingsByCategory}
              totalTaxSavings={totalTaxSavings}
              onAdd={handleAddCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Spend Panel */}
        <AccordionItem value="spend">
          <AccordionTrigger value="spend" icon={<CreditCard className="w-5 h-5" />}>
            Transactions
          </AccordionTrigger>
          <AccordionContent value="spend">
            <SpendPanel
              transactions={transactions}
              categories={categories}
              onAdd={handleAddTransaction}
              onUpdate={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
