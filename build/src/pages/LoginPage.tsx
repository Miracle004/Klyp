import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Mail } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await api.auth.login({ email, password });
      
      if (data.error) {
        setError(data.error);
      } else {
        login(data.user, data.token);
        navigate('/inbox');
      }
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/app_logo.png" alt="Klyp Logo" className="h-48 w-auto mx-auto mb-4 mix-blend-multiply" />
          <p className="text-slate-500">Welcome back to your inbox</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs text-teal-600 hover:underline">Forgot password?</button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                required
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
              {isLoading ? 'Logging in...' : 'Log in'}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Mail className="w-4 h-4" />
            Magic link
          </button>

          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" />
            Privacy-first. Items expire automatically.
          </p>
        </form>

        <div className="text-center">
          <Link to="/signup" className="text-slate-600 hover:text-teal-600 text-sm font-medium transition-colors">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
