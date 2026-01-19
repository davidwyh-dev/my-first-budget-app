import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('flow', mode === 'signin' ? 'signIn' : 'signUp');
      if (mode === 'signup' && name) {
        formData.append('name', name);
      }
      
      await signIn('password', formData);
      
      // Redirect to dashboard after successful sign-in
      navigate('/app');
    } catch (err: unknown) {
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
    } finally {
      setLoading(false);
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
