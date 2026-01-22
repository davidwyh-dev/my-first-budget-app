import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Percent, DollarSign, TrendingUp, Info, PiggyBank } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Tooltip from '../ui/Tooltip';
import { formatCurrency } from '../../lib/taxCalculator';
import type { TaxSavingsByCategory } from './IncomePanel';

interface Category {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  order: number;
}

interface BudgetPanelProps {
  categories: Category[];
  afterTaxIncome: number;
  taxSavingsByCategory: TaxSavingsByCategory[];
  totalTaxSavings: number;
  onAdd: (name: string, type: 'percentage' | 'fixed', value: number) => void;
  onUpdate: (id: string, name: string, type: 'percentage' | 'fixed', value: number) => void;
  onDelete: (id: string) => void;
}

export default function BudgetPanel({ 
  categories, 
  afterTaxIncome, 
  taxSavingsByCategory,
  totalTaxSavings,
  onAdd, 
  onUpdate, 
  onDelete 
}: BudgetPanelProps) {
  // Helper to get tax savings for a category
  const getTaxSavingsForCategory = (categoryId: string): number => {
    const savings = taxSavingsByCategory.find(s => s.categoryId === categoryId);
    return savings?.taxSavings || 0;
  };
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState('');
  
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'percentage' | 'fixed'>('percentage');
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (newName.trim() && newValue) {
      onAdd(newName.trim(), newType, parseFloat(newValue));
      setNewName('');
      setNewType('percentage');
      setNewValue('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditType(category.type);
    setEditValue(category.value.toString());
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() && editValue) {
      onUpdate(id, editName.trim(), editType, parseFloat(editValue));
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditType('percentage');
    setEditValue('');
  };

  const calculateAmount = (type: 'percentage' | 'fixed', value: number) => {
    if (type === 'percentage') {
      return (value / 100) * afterTaxIncome;
    }
    return value;
  };

  const totalBudgeted = categories.reduce((sum, cat) => 
    sum + calculateAmount(cat.type, cat.value), 0
  );
  const remaining = afterTaxIncome - totalBudgeted;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {afterTaxIncome > 0 && (
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-text-secondary font-body mb-1">After-Tax Income</p>
              <p className="font-mono text-lg text-text-primary">{formatCurrency(afterTaxIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary font-body mb-1">Budgeted</p>
              <p className="font-mono text-lg text-accent">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary font-body mb-1">Unallocated</p>
              <p className={`font-mono text-lg ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Before-Tax Deduction Savings - Virtual Category */}
      {totalTaxSavings > 0 && (
        <div className="bg-success/10 rounded-xl p-4 border border-success/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <PiggyBank className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-body font-medium text-text-primary">Before-Tax Deduction Savings</p>
                <Tooltip
                  content={
                    <div className="space-y-2 min-w-[220px]">
                      <div className="text-text-primary font-medium border-b border-border pb-2">
                        Tax Savings from Pre-Tax Deductions
                      </div>
                      <div className="text-xs text-text-secondary">
                        This is the total amount you save on taxes by making pre-tax contributions (like 401k, HSA, etc.). 
                        This money stays in your pocket instead of going to taxes!
                      </div>
                      <div className="border-t border-border pt-2">
                        <div className="text-xs text-text-secondary">
                          Breakdown by category:
                        </div>
                        {taxSavingsByCategory.map((s, idx) => (
                          <div key={idx} className="flex justify-between text-xs mt-1">
                            <span className="text-text-secondary truncate max-w-[140px]">
                              {categories.find(c => c._id === s.categoryId)?.name || 'Uncategorized'}
                            </span>
                            <span className="font-mono text-success">{formatCurrency(s.taxSavings)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                  position="right"
                >
                  <div className="text-sm text-success font-mono flex items-center gap-1.5 cursor-help hover:text-success/80 transition-colors">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{formatCurrency(totalTaxSavings)}
                    <Info className="w-3.5 h-3.5 text-success/60" />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category._id}
            className="bg-background rounded-xl p-4 border border-border"
          >
            {editingId === category._id ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Category name"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as 'percentage' | 'fixed')}
                    options={[
                      { value: 'percentage', label: 'Percentage (%)' },
                      { value: 'fixed', label: 'Fixed ($)' },
                    ]}
                  />
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder={editType === 'percentage' ? '10' : '500'}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSaveEdit(category._id)}>
                    <Check className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              (() => {
                const taxSavings = getTaxSavingsForCategory(category._id);
                const budgetAmount = calculateAmount(category.type, category.value);
                const effectiveCost = budgetAmount - taxSavings;
                
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.type === 'percentage' ? 'bg-accent/10' : 'bg-success/10'}`}>
                        {category.type === 'percentage' 
                          ? <Percent className="w-4 h-4 text-accent" />
                          : <DollarSign className="w-4 h-4 text-success" />
                        }
                      </div>
                      <div>
                        <p className="font-body font-medium text-text-primary">{category.name}</p>
                        <div className="text-sm text-text-secondary font-mono">
                          {category.type === 'percentage' 
                            ? `${category.value}% = ${formatCurrency(budgetAmount)}`
                            : formatCurrency(category.value)
                          }
                          {taxSavings > 0 && (
                            <Tooltip
                              content={
                                <div className="space-y-2 min-w-[180px]">
                                  <div className="text-text-primary font-medium border-b border-border pb-2">
                                    Tax Savings Offset
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-text-secondary">Budget Amount:</span>
                                      <span className="font-mono">{formatCurrency(budgetAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-success">Tax Savings:</span>
                                      <span className="font-mono text-success">-{formatCurrency(taxSavings)}</span>
                                    </div>
                                    <div className="border-t border-border pt-1 flex justify-between font-medium">
                                      <span className="text-text-primary">Effective Cost:</span>
                                      <span className="font-mono text-text-primary">{formatCurrency(effectiveCost)}</span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-text-secondary pt-1 border-t border-border">
                                    Pre-tax contributions reduce your taxable income, saving you money on taxes.
                                  </div>
                                </div>
                              }
                              position="right"
                            >
                              <span className="inline-flex items-center gap-1 ml-2 text-success cursor-help hover:text-success/80 transition-colors">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">-{formatCurrency(taxSavings)} tax savings</span>
                                <Info className="w-3 h-3 text-success/60" />
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(category)}
                        className="p-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(category._id)}
                        className="p-2 text-danger hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        ))}
      </div>

      {/* Add New Category */}
      {isAdding ? (
        <div className="bg-background rounded-xl p-4 border border-accent/50">
          <h4 className="font-heading font-medium text-text-primary mb-3">New Category</h4>
          <div className="space-y-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name (e.g., Housing, Food)"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'percentage' | 'fixed')}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed ($)' },
                ]}
              />
              <Input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === 'percentage' ? '10' : '500'}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Check className="w-4 h-4 mr-1" /> Add Category
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      )}
    </div>
  );
}
