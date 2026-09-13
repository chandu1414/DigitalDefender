import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@digitaldefender.io');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('This account does not have administrator privileges.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center p-4 sm:p-6 py-16">
      <div className="max-w-md w-full">
        
        {/* Admin Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 mx-auto mb-4 text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Restricted Access
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Administrator Console
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Platform Administrator: <span className="text-amber-300 font-medium">Bharath Chandu</span>
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#0F172A] border border-amber-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@digitaldefender.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Admin Token...' : 'Enter Admin Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              Return to Public Site
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
