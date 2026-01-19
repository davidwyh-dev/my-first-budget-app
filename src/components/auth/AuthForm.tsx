import { useState, useEffect } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  
  // Debug: log auth state on every render
  console.log('[AuthForm] Render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect when authenticated
  useEffect(() => {
    console.log('[AuthForm] Auth state effect - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (isAuthenticated) {
      console.log('[AuthForm] Redirecting to /app');
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('[AuthForm] Starting sign in...');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('flow', mode === 'signin' ? 'signIn' : 'signUp');
      if (mode === 'signup' && name) {
        formData.append('name', name);
      }
      
      console.log('[AuthForm] Calling signIn...');
      const result = await signIn('password', formData);
      console.log('[AuthForm] signIn completed successfully, result:', result);
      
      // Workaround: If auth state doesn't update within 2 seconds, reload the page
      // This forces the auth provider to re-check the session
      setTimeout(() => {
        console.log('[AuthForm] Timeout - checking if still on auth page...');
        // If we're still here after 2s, the auth state didn't update - force reload
        window.location.href = '/app';
      }, 2000);
    } catch (err: unknown) {
      setLoading(false);
      console.error('Auth error:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        
        if (errorMessage.includes('invalidsecret')) {
          if (mode === 'signin') {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else {
            setError('An error occurred during sign up. Please try again.');
          }
        } else if (errorMessage.includes('account already exists')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(err.message);
        }
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(String((err as { message: unknown }).message));
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-2">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-text-secondary font-body">
          {mode === 'signin' 
            ? 'Sign in to manage your budgets' 
            : 'Start your journey to financial clarity'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'signup' && (
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={<User className="w-5 h-5" />}
          />
        )}
        
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<Mail className="w-5 h-5" />}
          required
        />
        
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          required
        />

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl">
            <p className="text-sm text-danger font-body">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          loading={loading}
        >
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-text-secondary font-body">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            onClick={onToggleMode}
            className="ml-2 text-accent hover:text-accent-hover font-medium transition-colors"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </Card>
  );
}
