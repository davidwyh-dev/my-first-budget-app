import { useState, useEffect } from 'react';
import { DollarSign, MapPin, Calculator } from 'lucide-react';
import Input from '../ui/Input';
import { calculateTax, formatCurrency, formatPercent, TaxBreakdown } from '../../lib/taxCalculator';

interface IncomePanelProps {
  beforeTaxIncome: number | undefined;
  zipCode: string | undefined;
  onUpdate: (beforeTaxIncome: number, zipCode: string, afterTaxIncome: number) => void;
}

export default function IncomePanel({ beforeTaxIncome, zipCode, onUpdate }: IncomePanelProps) {
  const [income, setIncome] = useState(beforeTaxIncome?.toString() || '');
  const [zip, setZip] = useState(zipCode || '');
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown | null>(null);

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
    
    if (incomeNum > 0 && zipClean.length === 5) {
      const breakdown = calculateTax(incomeNum, zipClean);
      setTaxBreakdown(breakdown);
      onUpdate(incomeNum, zipClean, breakdown.netIncome);
    } else if (incomeNum > 0) {
      // Calculate without state/local taxes if no valid zip
      const breakdown = calculateTax(incomeNum, '00000');
      setTaxBreakdown(breakdown);
      onUpdate(incomeNum, zipClean, breakdown.netIncome);
    } else {
      setTaxBreakdown(null);
    }
  }, [income, zip, onUpdate]);

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

      {taxBreakdown && taxBreakdown.grossIncome > 0 && (
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
            
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">Federal Tax</span>
                <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.federalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">State Tax</span>
                <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.stateTax)}</span>
              </div>
              {taxBreakdown.localTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary font-body">Local Tax</span>
                  <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.localTax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">Social Security</span>
                <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.socialSecurity)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">Medicare</span>
                <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.medicare)}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary font-body">Total Tax</span>
                <span className="font-mono text-danger">-{formatCurrency(taxBreakdown.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary font-body">Effective Rate</span>
                <span className="font-mono text-text-secondary">{formatPercent(taxBreakdown.effectiveRate)}</span>
              </div>
            </div>
            
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <span className="font-heading font-semibold text-text-primary">Net Income</span>
                <span className="font-mono text-lg font-semibold text-success">{formatCurrency(taxBreakdown.netIncome)}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {formatCurrency(taxBreakdown.netIncome / 12)}/month • {formatCurrency(taxBreakdown.netIncome / 52)}/week
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
