import { useState, createContext, useContext, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  className?: string;
}

export function Accordion({ 
  children, 
  type = 'single', 
  defaultValue = [],
  className 
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);

  const toggleItem = (value: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(value) ? [] : [value]);
    } else {
      setOpenItems(
        openItems.includes(value)
          ? openItems.filter((item) => item !== value)
          : [...openItems, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('space-y-3', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionItem must be used within Accordion');

  const isOpen = context.openItems.includes(value);

  return (
    <div 
      className={cn(
        'bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-200',
        isOpen && 'shadow-soft',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  children: ReactNode;
  value: string;
  icon?: ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, value, icon, className }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');

  const isOpen = context.openItems.includes(value);

  return (
    <button
      onClick={() => context.toggleItem(value)}
      className={cn(
        'w-full flex items-center justify-between p-5 text-left font-heading text-lg font-medium text-text-primary hover:bg-surface-hover transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-accent">{icon}</span>}
        {children}
      </div>
      <ChevronDown 
        className={cn(
          'w-5 h-5 text-text-secondary transition-transform duration-200',
          isOpen && 'rotate-180'
        )} 
      />
    </button>
  );
}

interface AccordionContentProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export function AccordionContent({ children, value, className }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('AccordionContent must be used within Accordion');

  const isOpen = context.openItems.includes(value);

  return (
    <div
      className={cn(
        'grid transition-all duration-200 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className={cn('px-5 pb-5 pt-0', className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
