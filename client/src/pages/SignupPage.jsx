import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight, Check, KeyRound, RotateCw, Edit2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [simulatedNotice, setSimulatedNotice] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const { signup, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/resources';

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(name, email, password);
      if (res && res.requireOtp) {
        setStep('otp');
        setCountdown(60);
        setSimulatedNotice(res.simulatedNotice || '');
        setDevOtp(res.devOtp || '');
        setSuccessMessage(`Verification code sent to ${email}`);
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(email, cleanOtp);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setResending(true);

    try {
      const res = await resendOtp(email);
      setCountdown(60);
      setSuccessMessage('A fresh verification code has been dispatched.');
      if (res.simulatedNotice) setSimulatedNotice(res.simulatedNotice);
      if (res.devOtp) setDevOtp(res.devOtp);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleAutofillDevCode = () => {
    if (devOtp) {
      setOtp(devOtp);
      setError('');
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
            {step === 'form' ? 'Create Free Account' : 'Verify Your Email'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {step === 'form' 
              ? 'Unlock unlimited cybersecurity study note downloads' 
              : `Enter the 6-digit code dispatched to ${email}`}
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

          {successMessage && !error && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#1FA8A0] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#1FA8A0] transition-colors"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1.5 h-1.5">
                      <div className={`flex-1 rounded-full ${strength >= 1 ? 'bg-amber-400' : 'bg-slate-700'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 2 ? 'bg-amber-400' : 'bg-slate-700'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 3 ? 'bg-[#1FA8A0]' : 'bg-slate-700'}`} />
                      <div className={`flex-1 rounded-full ${strength >= 4 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {strength <= 1 && 'Weak password'}
                      {strength === 2 && 'Fair password'}
                      {strength === 3 && 'Good password'}
                      {strength >= 4 && 'Strong password!'}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                A 6-digit verification code will be sent to your email to confirm ownership and protect against automated bot registrations.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Create Account &amp; Send Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* Target Email Indicator */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate text-slate-300">
                  <Mail className="w-4 h-4 text-[#1FA8A0] shrink-0" />
                  <span className="truncate font-medium">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-[#1FA8A0] hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
              </div>

              {/* Dev Simulation Notice (if active) */}
              {simulatedNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                  <div className="font-semibold mb-1">Testing Mode (SMTP Not Configured):</div>
                  <div>Your 6-digit code is: <span className="font-mono font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded">{devOtp}</span></div>
                  <button
                    type="button"
                    onClick={handleAutofillDevCode}
                    className="mt-2 text-[11px] text-amber-300 hover:text-white underline font-semibold block"
                  >
                    Click to autofill code: {devOtp}
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-slate-600 focus:outline-none focus:border-[#1FA8A0] transition-colors"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2 block text-center">
                  Code expires in 10 minutes (maximum 5 attempts)
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Confirm Code &amp; Complete Signup
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Didn't receive the email?</span>
                {countdown > 0 ? (
                  <span className="text-slate-500 font-mono">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#1FA8A0] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[#1FA8A0] hover:underline font-semibold">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

