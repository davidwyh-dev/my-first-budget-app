import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { DollarSign, Tag, CreditCard, Save, Loader2 } from 'lucide-react';
import Card, { CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import BudgetChart from '../components/dashboard/BudgetChart';
import IncomePanel from '../components/dashboard/IncomePanel';
import BudgetPanel from '../components/dashboard/BudgetPanel';
import SpendPanel from '../components/dashboard/SpendPanel';

export default function Dashboard() {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  
  const dashboards = useQuery(api.dashboards.list);
  const dashboard = useQuery(
    api.dashboards.get,
    dashboardId ? { id: dashboardId as Id<'dashboards'> } : 'skip'
  );
  const categories = useQuery(
    api.categories.list,
    dashboardId ? { dashboardId: dashboardId as Id<'dashboards'> } : 'skip'
  ) || [];
  const transactions = useQuery(
    api.transactions.list,
    dashboardId ? { dashboardId: dashboardId as Id<'dashboards'> } : 'skip'
  ) || [];

  const updateDashboard = useMutation(api.dashboards.update);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);
  const createTransaction = useMutation(api.transactions.create);
  const updateTransaction = useMutation(api.transactions.update);
  const removeTransaction = useMutation(api.transactions.remove);

  const [isSaving, setIsSaving] = useState(false);
  const [pendingIncomeUpdate, setPendingIncomeUpdate] = useState<{
    beforeTaxIncome: number;
    zipCode: string;
    afterTaxIncome: number;
  } | null>(null);

  // Navigate to first dashboard if none selected
  useEffect(() => {
    if (!dashboardId && dashboards && dashboards.length > 0) {
      navigate(`/app/${dashboards[0]._id}`);
    }
  }, [dashboardId, dashboards, navigate]);

  const handleIncomeUpdate = useCallback((beforeTaxIncome: number, zipCode: string, afterTaxIncome: number) => {
    setPendingIncomeUpdate({ beforeTaxIncome, zipCode, afterTaxIncome });
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

  const handleAddTransaction = async (description: string, amount: number, date: number, categoryId?: string) => {
    if (!dashboardId) return;
    await createTransaction({
      dashboardId: dashboardId as Id<'dashboards'>,
      description,
      amount,
      date,
      categoryId: categoryId as Id<'categories'> | undefined,
    });
  };

  const handleUpdateTransaction = async (id: string, description: string, amount: number, date: number, categoryId?: string) => {
    await updateTransaction({
      id: id as Id<'transactions'>,
      description,
      amount,
      date,
      categoryId: categoryId as Id<'categories'> | undefined,
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
