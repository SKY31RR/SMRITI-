'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/branding/Logo';
import { UserCheck, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'CAREGIVER') {
        router.push('/caregiver');
      } else {
        router.push('/patient');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCaregiver = () => {
    setEmail('caregiver@smriti.care');
    setPassword('password123');
  };

  const fillDemoPatient = () => {
    setEmail('eleanor@smriti.care');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#140E10] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-[#E08B98]/30 shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" />
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-4">Welcome to SMRITI</h2>
          <p className="text-xs text-slate-600 mt-1">Please sign in to access your care dashboard.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smriti.care"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 text-sm outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500 text-sm outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Account Selector */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <span className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center mb-3">
            ⚡ Quick Demo Auto-Fill Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCaregiver}
              className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-700" /> Caregiver
            </button>
            <button
              type="button"
              onClick={fillDemoPatient}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Patient
            </button>
          </div>
        </div>

        {/* Register Redirect */}
        <div className="mt-6 text-center text-xs text-slate-600 font-semibold">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-bold text-teal-800 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading SMRITI Login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
