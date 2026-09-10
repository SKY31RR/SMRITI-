import Link from 'next/link';
import { Logo } from '@/components/branding/Logo';
import { HeartPulse, ShieldAlert, Lock, Brain, Users, ArrowRight, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#140E10] text-[#FAF5EF]">
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-2xl font-semibold text-[#D4C3B5] hover:text-white transition-all text-xs"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-2xl font-bold bg-[#C46473] hover:bg-[#B85363] text-white shadow-lg shadow-[#C46473]/30 transition-all text-xs flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-16 flex flex-col items-center text-center">
        
        {/* Initiative Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D98877]/15 border border-[#E08B98]/30 text-[#E5AA7E] text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#E5AA7E]" />
          SMRITI Sanctuary • "Beyond Memoria, Belonging"
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-[#FAF5EF] max-w-4xl leading-tight tracking-wide">
          Empathetic & Secure Digital Sanctuary for <br />
          <span className="text-gradient">Alzheimer's Patients & Families</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#D4C3B5] max-w-2xl font-light leading-relaxed">
          Guided by the core philosophy <em>"Beyond Memoria, Belonging,"</em> SMRITI combines low-cognitive-load memory recall with real-time caregiver telemetry, emergency SOS response, and privacy-by-design standards.
        </p>

        {/* Portal Access Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/patient"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#B85363] to-[#D98877] text-white font-bold text-sm shadow-xl shadow-[#C46473]/30 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <HeartPulse className="w-5 h-5 text-amber-100" /> Launch Patient Companion
          </Link>
          <Link
            href="/caregiver"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2B1D22] border border-[#E08B98]/30 hover:bg-[#352329] text-[#FAF5EF] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3"
          >
            <Users className="w-5 h-5 text-[#E5AA7E]" /> Open Caregiver Portal
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl text-left">
          
          <div className="p-8 rounded-3xl bg-glass shadow-xl hover:border-[#E08B98]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#C46473]/20 border border-[#C46473]/40 text-[#E5AA7E] flex items-center justify-center mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mb-2">Cognitive Memory Recall</h3>
            <p className="text-xs text-[#D4C3B5] leading-relaxed">
              Tailored photo memory recall, family voice prompts, and gentle daily routine guides designed to minimize cognitive friction for Alzheimer's patients.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-glass shadow-xl hover:border-[#E63946]/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E63946]/20 border border-[#E63946]/40 text-[#E63946] flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mb-2">Emergency SOS Network</h3>
            <p className="text-xs text-[#D4C3B5] leading-relaxed">
              One-touch emergency dispatch visible across all screens, transmitting real-time GPS telemetry to family caregivers and nearby medical networks.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-glass shadow-xl hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mb-2">Cyber Security & RBAC</h3>
            <p className="text-xs text-[#D4C3B5] leading-relaxed">
              Role-Based Access Control enforcing strict isolation between patient simplified views and caregiver monitoring controls with encrypted health data.
            </p>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div className="mt-16 w-full max-w-4xl p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20 text-xs text-[#D4C3B5] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#E5AA7E] shrink-0" />
          <span>
            SMRITI Digital Sanctuary • Department of Cyber Security • JD College of Engineering & Management, Nagpur
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#9E8B80] border-t border-[#E08B98]/10">
        © 2026 SMRITI Project — “Beyond Memoria, Belonging.” All rights reserved.
      </footer>
    </div>
  );
}
