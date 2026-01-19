import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  PieChart, 
  Wallet, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: 'Smart Tax Calculator',
      description: 'Enter your zip code and see your federal, state, and local tax obligations calculated instantly.'
    },
    {
      icon: PieChart,
      title: 'Visual Budget Tracking',
      description: 'See your spending against your budget with intuitive charts that highlight areas needing attention.'
    },
    {
      icon: Wallet,
      title: 'Flexible Categories',
      description: 'Create custom budget categories using percentages or fixed amounts to match your lifestyle.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data stays yours. Industry-standard encryption keeps your information safe.'
    }
  ];

  const benefits = [
    'Know your true take-home pay after all taxes',
    'Create multiple budgets for different scenarios',
    'Track spending in real-time against your goals',
    'No credit card required to get started'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-accent">BudgetWise</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/auth', { state: { mode: 'signin' } })}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth', { state: { mode: 'signup' } })}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-body text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Smart budgeting made simple</span>
            </div>
            
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              Plan Your Budget
              <br />
              <span className="text-accent">Based on Your Location</span>
            </h1>
            
            <p className="text-xl text-text-secondary font-body mb-8 leading-relaxed">
              Stop guessing your take-home pay. BudgetWise calculates your taxes based on 
              your zip code and helps you create a realistic budget you can actually stick to.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start Planning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
                See Demo
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="bg-surface rounded-2xl border border-border shadow-soft-lg p-8">
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-text-secondary mb-1">Gross Income</p>
                  <p className="font-mono text-2xl text-text-primary">$85,000</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-text-secondary mb-1">Total Taxes</p>
                  <p className="font-mono text-2xl text-danger">-$21,250</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs text-text-secondary mb-1">Take Home</p>
                  <p className="font-mono text-2xl text-success">$63,750</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Housing', 'Food', 'Transportation', 'Savings'].map((cat, i) => (
                  <div key={cat} className="flex items-center gap-4">
                    <span className="w-28 text-sm text-text-secondary">{cat}</span>
                    <div className="flex-1 h-6 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full" 
                        style={{ width: `${[65, 45, 30, 80][i]}%` }} 
                      />
                    </div>
                    <span className="w-16 text-right font-mono text-sm text-text-secondary">
                      {[65, 45, 30, 80][i]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-text-primary mb-4">
              Everything You Need to Budget Smarter
            </h2>
            <p className="text-text-secondary font-body text-lg max-w-2xl mx-auto">
              Built with simplicity in mind, BudgetWise gives you the tools to understand 
              your finances without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-surface rounded-2xl border border-border p-6 hover:border-accent/50 transition-colors"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary font-body">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl font-bold text-text-primary mb-6">
                Why Choose BudgetWise?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-text-secondary font-body text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button size="lg" onClick={() => navigate('/auth')}>
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
            <div className="bg-surface rounded-2xl border border-border p-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-text-secondary mb-2">Your Zip Code</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-background rounded-xl border border-border font-mono text-text-primary">
                      10001
                    </div>
                    <div className="px-4 py-3 bg-accent/10 rounded-xl text-accent font-body">
                      New York
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-text-secondary">Federal Tax</span>
                    <span className="font-mono text-text-primary">$12,580</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-secondary">State Tax (NY)</span>
                    <span className="font-mono text-text-primary">$5,823</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-secondary">NYC Local Tax</span>
                    <span className="font-mono text-text-primary">$3,295</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-secondary">FICA</span>
                    <span className="font-mono text-text-primary">$6,502</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-heading font-semibold text-text-primary">Net Income</span>
                    <span className="font-mono text-xl font-semibold text-success">$56,800</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-surface/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold text-text-primary mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-text-secondary font-body text-lg mb-8">
            Join thousands of users who have discovered their true take-home pay 
            and created budgets that actually work.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Create Your Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-text-secondary font-body text-sm">
            © 2026 BudgetWise. All rights reserved.
          </p>
          <p className="text-text-secondary font-body text-sm">
            Made with care for your financial wellbeing.
          </p>
        </div>
      </footer>
    </div>
  );
}
