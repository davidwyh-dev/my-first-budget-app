import { formatCurrency } from '../../lib/taxCalculator';

interface Category {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
}

interface Transaction {
  _id: string;
  categoryId?: string;
  amount: number;
}

interface BudgetChartProps {
  categories: Category[];
  transactions: Transaction[];
  afterTaxIncome: number;
}

// Distinct colors for categories that work well on dark backgrounds
const CATEGORY_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f43f5e', // rose
  '#84cc16', // lime
];

interface CategorySpend {
  id: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
}

export default function BudgetChart({ categories, transactions, afterTaxIncome }: BudgetChartProps) {
  // Calculate spending by category
  const spendingByCategory = transactions.reduce((acc, tx) => {
    if (tx.categoryId) {
      acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate uncategorized spending
  const uncategorizedSpent = transactions
    .filter(tx => !tx.categoryId)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Prepare category data with colors
  const categoryData: CategorySpend[] = categories.map((cat, index) => {
    const budget = cat.type === 'percentage' 
      ? (cat.value / 100) * afterTaxIncome 
      : cat.value;
    const spent = spendingByCategory[cat._id] || 0;
    
    return {
      id: cat._id,
      name: cat.name,
      budget,
      spent,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });

  // Add uncategorized if there's spending without a category
  if (uncategorizedSpent > 0) {
    categoryData.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      budget: 0,
      spent: uncategorizedSpent,
      color: '#71717a', // gray
    });
  }

  // Calculate totals
  const totalBudget = categoryData.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;
  const isOverBudget = totalSpent > totalBudget;
  const spentPercentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const overflowPercentage = isOverBudget ? ((totalSpent - totalBudget) / totalBudget) * 100 : 0;

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-secondary font-body">
        <p className="text-lg mb-2">No budget categories yet</p>
        <p className="text-sm">Add categories in the Budget section below</p>
      </div>
    );
  }

  // Calculate segment widths for the bar
  const getSegmentWidth = (spent: number) => {
    if (totalBudget <= 0) return 0;
    return (spent / totalBudget) * 100;
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-text-secondary font-body mb-1">Total Budget</p>
          <p className="font-mono text-xl text-text-primary">{formatCurrency(totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary font-body mb-1">Total Spent</p>
          <p className={`font-mono text-xl ${isOverBudget ? 'text-danger' : 'text-text-primary'}`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary font-body mb-1">
            {isOverBudget ? 'Over Budget' : 'Remaining'}
          </p>
          <p className={`font-mono text-xl ${isOverBudget ? 'text-danger' : 'text-success'}`}>
            {isOverBudget ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative">
        {/* Budget Container (background) */}
        <div className="h-12 bg-[#2a2a2a] rounded-xl overflow-hidden relative">
          {/* Stacked spend segments */}
          <div className="absolute inset-y-0 left-0 flex h-full" style={{ width: `${Math.min(spentPercentage, 100)}%` }}>
            {categoryData.map((cat, index) => {
              const segmentWidth = getSegmentWidth(cat.spent);
              if (segmentWidth <= 0) return null;
              
              // Calculate the relative width within the spent portion
              const relativeWidth = (cat.spent / totalSpent) * 100;
              
              return (
                <div
                  key={cat.id}
                  className="h-full relative group"
                  style={{ 
                    width: `${relativeWidth}%`,
                    backgroundColor: cat.color,
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface border border-border rounded-lg text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {cat.name}: {formatCurrency(cat.spent)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overflow indicator (red stripe) if over budget */}
          {isOverBudget && (
            <div 
              className="absolute inset-y-0 right-0 bg-danger/30"
              style={{ width: `${Math.min(overflowPercentage, 100)}%` }}
            >
              <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(248,113,113,0.3)_4px,rgba(248,113,113,0.3)_8px)]" />
            </div>
          )}

          {/* Percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm font-semibold text-text-primary drop-shadow-lg">
              {spentPercentage.toFixed(0)}% used
            </span>
          </div>
        </div>

        {/* Budget marker line at 100% */}
        {isOverBudget && (
          <div className="absolute top-0 bottom-0 left-[100%] w-0.5 -translate-x-1/2">
            <div className="w-full h-full bg-text-secondary" />
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-text-secondary font-mono">
              Budget
            </div>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {categoryData.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-sm text-text-secondary font-body">
              {cat.name}
            </span>
            <span className="text-xs text-text-secondary font-mono">
              {formatCurrency(cat.spent)}
            </span>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs text-text-secondary font-body mb-3">Category Breakdown</p>
        {categoryData.filter(cat => cat.id !== 'uncategorized').map((cat) => {
          const catPercentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
          const isOver = cat.spent > cat.budget;
          
          return (
            <div key={cat.id} className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm text-text-primary font-body w-28 truncate">
                {cat.name}
              </span>
              <div className="flex-1 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(catPercentage, 100)}%`,
                    backgroundColor: isOver ? '#f87171' : cat.color,
                  }}
                />
              </div>
              <span className={`text-xs font-mono w-20 text-right ${isOver ? 'text-danger' : 'text-text-secondary'}`}>
                {formatCurrency(cat.spent)} / {formatCurrency(cat.budget)}
              </span>
            </div>
          );
        })}
        
        {/* Uncategorized spending */}
        {uncategorizedSpent > 0 && (
          <div className="flex items-center gap-3 opacity-70">
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#71717a]" />
            <span className="text-sm text-text-secondary font-body w-28 truncate italic">
              Uncategorized
            </span>
            <div className="flex-1" />
            <span className="text-xs font-mono w-20 text-right text-text-secondary">
              {formatCurrency(uncategorizedSpent)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
