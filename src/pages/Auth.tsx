import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm';
import Button from '../components/ui/Button';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
      <div className="p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-accent mb-2">BudgetWise</h1>
            <p className="text-text-secondary font-body">Your path to financial clarity</p>
          </div>

          {/* Auth Form */}
          <AuthForm 
            mode={mode} 
            onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
          />

          {/* Terms */}
          <p className="text-center text-xs text-text-secondary font-body mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </div>
  );
}
