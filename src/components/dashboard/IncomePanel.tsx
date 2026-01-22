import { useState, useEffect } from 'react';
import { DollarSign, MapPin, Calculator, Info, TrendingDown } from 'lucide-react';
import Input from '../ui/Input';
import Tooltip from '../ui/Tooltip';
import { calculateTax, formatCurrency, formatPercent, TaxBreakdown, TaxItemDetail } from '../../lib/taxCalculator';

interface PreTaxTransaction {
  _id: string;
  categoryId?: string;
  description: string;
  amount: number;
  date: number;
  isPreTax?: boolean;
}

export interface TaxSavingsByCategory {
  categoryId: string;
  amount: number;
  taxSavings: number;
}

interface IncomePanelProps {
  beforeTaxIncome: number | undefined;
  zipCode: string | undefined;
  preTaxTransactions: PreTaxTransaction[];
  onUpdate: (beforeTaxIncome: number, zipCode: string, afterTaxIncome: number, taxSavingsByCategory: TaxSavingsByCategory[]) => void;
}

function TaxTooltipContent({ details }: { details: TaxItemDetail }) {
  return (
    <div className="space-y-2 min-w-[200px]">
      <div className="text-text-primary font-medium border-b border-border pb-2">
        {details.description}
      </div>
      
      {details.brackets && details.brackets.length > 0 ? (
        <div className="space-y-1.5">
          {details.brackets.map((bracket, index) => (
            <div key={index} className="flex justify-between items-start gap-4 text-xs">
              <div className="text-text-secondary">
                {formatPercent(bracket.rate)} on{' '}
                {bracket.max === Infinity || bracket.max >= 1000000000
                  ? `above ${formatCurrency(bracket.min)}`
                  : `${formatCurrency(bracket.min)} - ${formatCurrency(bracket.max)}`}
              </div>
              <div className="font-mono text-text-primary whitespace-nowrap">
                {formatCurrency(bracket.taxAmount)}
              </div>
            </div>
          ))}
        </div>
      ) : details.flatRate !== undefined && details.flatRate > 0 ? (
        <div className="text-xs text-text-secondary">
          Flat rate: {formatPercent(details.flatRate)}
        </div>
      ) : null}
      
      <div className="border-t border-border pt-2 flex justify-between text-xs">
        <span className="text-text-secondary">Effective rate:</span>
        <span className="font-mono text-text-primary font-medium">{formatPercent(details.effectiveRate)}</span>
      </div>
    </div>
  );
}

interface TaxLineItemProps {
  label: string;
  amount: number;
  details: TaxItemDetail;
}

function TaxLineItem({ label, amount, details }: TaxLineItemProps) {
  return (
    <div className="flex justify-between text-sm items-center">
      <Tooltip content={<TaxTooltipContent details={details} />} position="right">
        <span className="text-text-secondary font-body flex items-center gap-1.5 cursor-help hover:text-text-primary transition-colors">
          {label}
          <Info className="w-3.5 h-3.5 text-text-secondary/60" />
        </span>
      </Tooltip>
      <span className="font-mono text-danger">-{formatCurrency(amount)}</span>
    </div>
  );
}

export default function IncomePanel({ beforeTaxIncome, zipCode, preTaxTransactions, onUpdate }: IncomePanelProps) {
  const [income, setIncome] = useState(beforeTaxIncome?.toString() || '');
  const [zip, setZip] = useState(zipCode || '');
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);
  const [agiBreakdown, setAgiBreakdown] = useState<TaxBreakdown | null>(null);
  const [totalPreTaxDeductions, setTotalPreTaxDeductions] = useState(0);
  const [taxSavings, setTaxSavings] = useState(0);

  useEffect(() => {
    if (beforeTaxIncome !== undefined) {
      setIncome(beforeTaxIncome.toString());
    }
    if (zipCode !== undefined) {
      setZip(zipCode);
    }
  }, [beforeTaxIncome, zipCode]);

  useEffect(() => {
    const incomeNum = parseFloat(income) || 0;
    const zipClean = zip.replace(/\D/g, '').substring(0, 5);
    
    // Calculate total pre-tax deductions
    const preTaxTotal = preTaxTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    setTotalPreTaxDeductions(preTaxTotal);
    
    // AGI = Gross Income - Pre-Tax Deductions
    const agi = Math.max(0, incomeNum - preTaxTotal);
    
    if (incomeNum > 0 && zipClean.length === 5) {
      // Tax on gross income (for comparison)
      const grossBreakdown = calculateTax(incomeNum, zipClean);
      setTaxBreakdown(grossBreakdown);
      
      // Tax on AGI (what we'll actually pay)
      const agiTaxBreakdown = calculateTax(agi, zipClean);
      setAgiBreakdown(agiTaxBreakdown);
      
      // Calculate tax savings (difference between tax on gross and tax on AGI)
      const savings = grossBreakdown.totalTax - agiTaxBreakdown.totalTax;
      setTaxSavings(savings);
      
      // Calculate tax savings per category
      const taxSavingsByCategory = calculateTaxSavingsByCategory(
        preTaxTransactions,
        incomeNum,
        zipClean
      );
      
      onUpdate(incomeNum, zipClean, agiTaxBreakdown.netIncome, taxSavingsByCategory);
    } else if (incomeNum > 0) {
      // Calculate without state/local taxes if no valid zip
      const grossBreakdown = calculateTax(incomeNum, '00000');
      setTaxBreakdown(grossBreakdown);
      
      const agiTaxBreakdown = calculateTax(agi, '00000');
      setAgiBreakdown(agiTaxBreakdown);
      
      const savings = grossBreakdown.totalTax - agiTaxBreakdown.totalTax;
      setTaxSavings(savings);
      
      const taxSavingsByCategory = calculateTaxSavingsByCategory(
        preTaxTransactions,
        incomeNum,
        '00000'
      );
      
      onUpdate(incomeNum, zipClean, agiTaxBreakdown.netIncome, taxSavingsByCategory);
    } else {
      setTaxBreakdown(null);
      setAgiBreakdown(null);
      setTaxSavings(0);
    }
  }, [income, zip, preTaxTransactions, onUpdate]);

  // Calculate tax savings for each category based on its pre-tax transactions
  const calculateTaxSavingsByCategory = (
    transactions: PreTaxTransaction[],
    grossIncome: number,
    zipCode: string
  ): TaxSavingsByCategory[] => {
    // Group transactions by category
    const byCategory: Record<string, number> = {};
    transactions.forEach(tx => {
      const catId = tx.categoryId || 'uncategorized';
      byCategory[catId] = (byCategory[catId] || 0) + tx.amount;
    });
    
    // Calculate marginal tax savings for each category
    // We use the marginal rate at AGI level for simplicity
    const totalDeductions = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const agi = Math.max(0, grossIncome - totalDeductions);
    
    const taxOnGross = calculateTax(grossIncome, zipCode).totalTax;
    const taxOnAgi = calculateTax(agi, zipCode).totalTax;
    const totalSavings = taxOnGross - taxOnAgi;
    
    // Distribute savings proportionally to each category based on its deduction amount
    return Object.entries(byCategory).map(([categoryId, amount]) => ({
      categoryId,
      amount,
      taxSavings: totalDeductions > 0 ? (amount / totalDeductions) * totalSavings : 0,
    }));
  };

  const formatIncomeInput = (value: string) => {
    // Remove non-numeric characters except decimal
    return value.replace(/[^0-9.]/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Annual Income (Before Tax)"
          type="text"
          value={income}
          onChange={(e) => setIncome(formatIncomeInput(e.target.value))}
          placeholder="75000"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <Input
          label="Zip Code"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').substring(0, 5))}
          placeholder="10001"
          icon={<MapPin className="w-5 h-5" />}
          maxLength={5}
        />
      </div>

      {taxBreakdown && taxBreakdown.grossIncome > 0 && agiBreakdown && (
        <div className="bg-background rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-accent" />
            <h4 className="font-heading text-lg font-medium text-text-primary">
              Tax Breakdown
              {taxBreakdown.stateName && (
                <span className="text-sm font-normal text-text-secondary ml-2">
                  ({taxBreakdown.stateName})
                </span>
              )}
            </h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary font-body">Gross Income</span>
              <span className="font-mono text-text-primary">{formatCurrency(taxBreakdown.grossIncome)}</span>
            </div>
            
            {/* Pre-Tax Deductions Section */}
            {totalPreTaxDeductions > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-text-primary">Pre-Tax Deductions</span>
                </div>
                {preTaxTransactions.map(tx => (
                  <div key={tx._id} className="flex justify-between text-sm pl-6">
                    <span className="text-text-secondary font-body truncate max-w-[200px]">{tx.description}</span>
                    <span className="font-mono text-success">-{formatCurrency(tx.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pl-6 pt-1 border-t border-border/50">
                  <span className="text-text-secondary font-body font-medium">Total Pre-Tax Deductions</span>
                  <span className="font-mono text-success font-medium">-{formatCurrency(totalPreTaxDeductions)}</span>
                </div>
              </div>
            )}
            
            {/* AGI */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <Tooltip 
                  content={
                    <div className="space-y-2 min-w-[200px]">
                      <div className="text-text-primary font-medium border-b border-border pb-2">
                        Adjusted Gross Income (AGI)
                      </div>
                      <div className="text-xs text-text-secondary">
                        Your gross income minus pre-tax deductions. Taxes are calculated on this amount.
                      </div>
                      {taxSavings > 0 && (
                        <>
                          <div className="border-t border-border pt-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-text-secondary">Tax on Gross Income:</span>
                              <span className="font-mono text-text-primary">{formatCurrency(taxBreakdown.totalTax)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-text-secondary">Tax on AGI:</span>
                              <span className="font-mono text-text-primary">{formatCurrency(agiBreakdown.totalTax)}</span>
                            </div>
                          </div>
                          <div className="border-t border-border pt-2 flex justify-between text-xs">
                            <span className="text-success font-medium">Tax Savings:</span>
                            <span className="font-mono text-success font-medium">{formatCurrency(taxSavings)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  } 
                  position="right"
                >
                  <span className="text-text-primary font-body font-medium flex items-center gap-1.5 cursor-help hover:text-accent transition-colors">
                    Adjusted Gross Income (AGI)
                    <Info className="w-3.5 h-3.5 text-text-secondary/60" />
                  </span>
                </Tooltip>
                <span className="font-mono text-text-primary font-medium">{formatCurrency(agiBreakdown.grossIncome)}</span>
              </div>
            </div>
            
            {/* Tax breakdown based on AGI */}
            <div className="border-t border-border pt-3 space-y-2">
              <TaxLineItem 
                label="Federal Tax" 
                amount={agiBreakdown.federalTax} 
                details={agiBreakdown.federalTaxDetails} 
              />
              <TaxLineItem 
                label="State Tax" 
                amount={agiBreakdown.stateTax} 
                details={agiBreakdown.stateTaxDetails} 
              />
              {agiBreakdown.localTax > 0 && (
                <TaxLineItem 
                  label="Local Tax" 
                  amount={agiBreakdown.localTax} 
                  details={agiBreakdown.localTaxDetails} 
                />
              )}
              <TaxLineItem 
                label="Social Security" 
                amount={agiBreakdown.socialSecurity} 
                details={agiBreakdown.socialSecurityDetails} 
              />
              <TaxLineItem 
                label="Medicare" 
                amount={agiBreakdown.medicare} 
                details={agiBreakdown.medicareDetails} 
              />
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary font-body">Total Tax</span>
                <span className="font-mono text-danger">-{formatCurrency(agiBreakdown.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">Effective Rate</span>
                <span className="font-mono text-text-secondary">{formatPercent(agiBreakdown.effectiveRate)}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="font-heading font-semibold text-text-primary">Net Income</span>
                <span className="font-mono text-lg font-semibold text-success">{formatCurrency(agiBreakdown.netIncome)}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {formatCurrency(agiBreakdown.netIncome / 12)}/month • {formatCurrency(agiBreakdown.netIncome / 52)}/week
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
