import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Shield, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RetentionOption = ({ 
  label, 
  selected, 
  onClick 
}: { 
  label: string; 
  selected: boolean; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col p-4 border-2 rounded-xl text-left transition-all duration-200",
      selected 
        ? "border-teal-500 bg-teal-50/50 shadow-sm" 
        : "border-slate-100 bg-white hover:border-slate-200"
    )}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={cn(
        "font-medium",
        selected ? "text-teal-900" : "text-slate-600"
      )}>{label}</span>
      {selected && (
        <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  </button>
);

const SignupPage = () => {
  const [retention, setRetention] = useState('7');
  const [customRetention, setCustomRetention] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    let days = parseInt(retention);
    if (retention === 'custom') {
      days = parseInt(customRetention);
      if (isNaN(days) || days < 1) {
        setError('Please enter a valid custom retention period in days.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const data = await api.auth.signup({ 
        email, 
        password, 
        retention_days: days || 7 
      });
      
      if (data.error) {
        setError(data.error);
      } else {
        login(data.user, data.token);
        navigate('/inbox');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    { label: '1 Day', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/app_logo.png" alt="Klyp Logo" className="h-48 w-auto mx-auto mb-4 mix-blend-multiply" />
          <p className="text-slate-500">Your cross-device clipboard inbox</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Choose how long items stay in your inbox
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt) => (
                <RetentionOption
                  key={opt.value}
                  label={opt.label}
                  selected={retention === opt.value}
                  onClick={() => setRetention(opt.value)}
                />
              ))}
            </div>
            {retention === 'custom' && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                <input
                  type="number"
                  min="1"
                  placeholder="Enter number of days"
                  value={customRetention}
                  onChange={(e) => setCustomRetention(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-teal-200 bg-teal-50/30 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800"
                />
              </div>
            )}
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Items auto-delete. You can change this later.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-slate-600 hover:text-teal-600 text-sm font-medium transition-colors">
            I already have an account
          </Link>
        </div>
        
        <div className="flex justify-center items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="w-3 h-3" />
            Privacy-first
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3 h-3" />
            Auto-expiring
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
