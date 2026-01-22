import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../lib/taxCalculator';
import { formatDate } from '../../lib/utils';

interface Category {
  _id: string;
  name: string;
}

interface Transaction {
  _id: string;
  categoryId?: string;
  description: string;
  amount: number;
  date: number;
  isPreTax?: boolean;
}

interface SpendPanelProps {
  transactions: Transaction[];
  categories: Category[];
  onAdd: (description: string, amount: number, date: number, categoryId?: string, isPreTax?: boolean) => void;
  onUpdate: (id: string, description: string, amount: number, date: number, categoryId?: string, isPreTax?: boolean) => void;
  onDelete: (id: string) => void;
}

export default function SpendPanel({ 
  transactions, 
  categories, 
  onAdd, 
  onUpdate,
  onDelete 
}: SpendPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newIsPreTax, setNewIsPreTax] = useState(false);

  const handleAdd = () => {
    if (newDescription.trim() && newAmount) {
      onAdd(
        newDescription.trim(),
        parseFloat(newAmount),
        new Date(newDate).getTime(),
        newCategoryId || undefined,
        newIsPreTax || undefined
      );
      setNewDescription('');
      setNewAmount('');
      setNewDate(new Date().toISOString().split('T')[0]);
      setNewCategoryId('');
      setNewIsPreTax(false);
      setIsAdding(false);
    }
  };

  const handleCategoryChange = (transactionId: string, categoryId: string, tx: Transaction) => {
    onUpdate(
      transactionId,
      tx.description,
      tx.amount,
      tx.date,
      categoryId || undefined,
      tx.isPreTax
    );
  };

  const handlePreTaxChange = (transactionId: string, isPreTax: boolean, tx: Transaction) => {
    onUpdate(
      transactionId,
      tx.description,
      tx.amount,
      tx.date,
      tx.categoryId,
      isPreTax || undefined
    );
  };

  const categoryOptions = [
    { value: '', label: 'Uncategorized' },
    ...categories.map(cat => ({ value: cat._id, label: cat.name }))
  ];

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-background rounded-xl p-4 border border-border">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-text-secondary font-body">Total Spending</p>
            <p className="font-mono text-2xl font-semibold text-text-primary">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary font-body">Transactions</p>
            <p className="font-mono text-2xl font-semibold text-text-primary">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 p-3 border-b border-border bg-surface text-sm font-medium text-text-secondary">
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-center">Pre-Tax</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
          {transactions.length === 0 && !isAdding && (
            <div className="p-8 text-center text-text-secondary font-body">
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Click "Add Transaction" to get started</p>
            </div>
          )}
          
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="grid grid-cols-12 gap-2 p-3 border-b border-border last:border-b-0 hover:bg-surface/50 items-center"
            >
              <div className="col-span-2 text-sm text-text-secondary font-mono">
                {formatDate(tx.date)}
              </div>
              <div className="col-span-3 text-sm text-text-primary font-body truncate">
                {tx.description}
              </div>
              <div className="col-span-2">
                <select
                  value={tx.categoryId || ''}
                  onChange={(e) => handleCategoryChange(tx._id, e.target.value, tx)}
                  className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={tx.isPreTax || false}
                  onChange={(e) => handlePreTaxChange(tx._id, e.target.checked, tx)}
                  className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-danger">
                -{formatCurrency(tx.amount)}
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(tx._id)}
                  className="p-1 text-danger hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Row */}
          {isAdding && (
            <div className="grid grid-cols-12 gap-2 p-3 border-b border-accent/50 bg-accent/5 items-center">
              <div className="col-span-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex justify-center">
                <input
                  type="checkbox"
                  checked={newIsPreTax}
                  onChange={(e) => setNewIsPreTax(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent text-right"
                />
              </div>
              <div className="col-span-1"></div>
            </div>
          )}
        </div>
      </div>

      {/* Add Button */}
      {isAdding ? (
        <div className="flex gap-2">
          <Button onClick={handleAdd} disabled={!newDescription.trim() || !newAmount}>
            Add Transaction
          </Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      )}
    </div>
  );
}
