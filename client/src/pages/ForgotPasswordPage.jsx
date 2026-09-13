import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, ArrowRight, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process password reset.');
      }

      setMessage(data.message);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      if (data.simulatedNotice) {
        setNotice(data.simulatedNotice);
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex items-center justify-center p-4 sm:p-6 py-16">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1FA8A0] to-[#0f5b57] flex items-center justify-center shadow-lg shadow-[#1FA8A0]/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Reset Your Password
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            We will generate a time-limited secure link to reset your account password.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm space-y-3">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
              {notice && (
                <p className="text-slate-300 text-xs leading-relaxed border-t border-emerald-500/20 pt-2">
                  {notice}
                </p>
              )}
              {resetUrl && (
                <div className="pt-2">
                  <Link
                    to={resetUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1FA8A0] text-white font-semibold text-xs hover:bg-[#26C7BD] transition-all"
                  >
                    Proceed to Reset Password
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#1FA8A0] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25 flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Request...' : 'Send Secure Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-[#1FA8A0] hover:underline font-semibold">
              Return to Login
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
