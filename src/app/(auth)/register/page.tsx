'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/branding/Logo';
import { UserCheck, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'CAREGIVER' | 'PATIENT'>('CAREGIVER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          dateOfBirth,
          diagnosisNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#140E10] p-6 my-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-[#E08B98]/30 shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" />
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-4">Create Your Account</h2>
          <p className="text-xs text-slate-600 mt-1">Join SMRITI memory care management network.</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('CAREGIVER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'CAREGIVER'
                ? 'bg-[#0d9488] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Caregiver Account
          </button>
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'PATIENT'
                ? 'bg-[#059669] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient Account
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'CAREGIVER' ? 'Dr. Sarah Jenkins' : 'Eleanor Vance'}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 text-sm outline-none transition-all"
              />
            </div>
          </div>

          {role === 'CAREGIVER' ? (
            <div>
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 focus:bg-white focus:border-teal-600 text-sm outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
                  Care Notes / Preferences
                </label>
                <textarea
                  rows={2}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="e.g. Mild memory impairment, loves classical piano music."
                  className="w-full p-3 rounded-2xl border-2 border-slate-300 bg-slate-50 text-slate-900 font-bold placeholder:text-slate-500 text-sm outline-none transition-all resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'CAREGIVER' ? 'Caregiver' : 'Patient'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600 font-semibold">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-teal-800 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
