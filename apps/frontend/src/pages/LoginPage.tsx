import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      const endpoint = mode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
      const body = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user, data.organization, data.organizations);
      navigate('/pipeline');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Saleduct</h1>
          <p className="text-slate-600 mt-2">AI-Native Sales Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setMode('login')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                mode === 'login'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                mode === 'register'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              Create Account
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <label htmlFor="email">Email address</label>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#DC2626] text-sm"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full btn btn-primary py-3',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="input-group">
                  <input
                    type="text"
                    id="name"
                    placeholder=" "
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <label htmlFor="name">Full name</label>
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <label htmlFor="email">Email address</label>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    id="organizationName"
                    placeholder=" "
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    required
                  />
                  <label htmlFor="organizationName">Company name</label>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <label htmlFor="password">Password (min 8 characters)</label>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#DC2626] text-sm"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    'w-full btn btn-primary py-3',
                    loading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {mode === 'login' && (
            <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
              <p className="text-xs text-slate-500 text-center">
                Super Admin: admin@saleduct.com / Saleduct@2026!SecureAdmin
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
