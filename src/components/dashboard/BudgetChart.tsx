import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
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

interface ChartData {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
}

export default function BudgetChart({ categories, transactions, afterTaxIncome }: BudgetChartProps) {
  // Calculate spending by category
  const spendingByCategory = transactions.reduce((acc, tx) => {
    if (tx.categoryId) {
      acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const chartData: ChartData[] = categories.map((cat) => {
    const budget = cat.type === 'percentage' 
      ? (cat.value / 100) * afterTaxIncome 
      : cat.value;
    const spent = spendingByCategory[cat._id] || 0;
    
    return {
      name: cat.name,
      budget,
      spent,
      remaining: Math.max(0, budget - spent),
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-secondary font-body">
        <p className="text-lg mb-2">No budget categories yet</p>
        <p className="text-sm">Add categories in the Budget section below</p>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => Math.max(d.budget, d.spent)));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
          barCategoryGap={12}
        >
          <XAxis 
            type="number" 
            domain={[0, maxValue * 1.1]}
            hide 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={120}
            tick={{ fill: '#f5f5f5', fontFamily: 'Lora, serif', fontSize: 14 }}
            axisLine={false}
            tickLine={false}
          />
          
          {/* Budget bar (background) */}
          <Bar 
            dataKey="budget" 
            fill="#2a2a2a" 
            radius={[8, 8, 8, 8]}
            barSize={24}
          >
            <LabelList 
              dataKey="budget" 
              position="right" 
              formatter={(value: number) => formatCurrency(value)}
              fill="#a0a0a0"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
            />
          </Bar>
          
          {/* Spent bar (foreground) */}
          <Bar 
            dataKey="spent" 
            radius={[8, 8, 8, 8]}
            barSize={24}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.spent > entry.budget ? '#f87171' : '#4ade80'}
              />
            ))}
            <LabelList 
              dataKey="spent" 
              position="insideRight" 
              formatter={(value: number) => value > 0 ? formatCurrency(value) : ''}
              fill="#0f0f0f"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#2a2a2a]" />
          <span className="text-sm text-text-secondary font-body">Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-sm text-text-secondary font-body">Under Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger" />
          <span className="text-sm text-text-secondary font-body">Over Budget</span>
        </div>
      </div>
    </div>
  );
}
