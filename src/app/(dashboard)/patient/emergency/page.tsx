'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { PhoneCall, ShieldAlert, Phone, ArrowLeft, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PatientEmergencyPage() {
  const [user, setUser] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [demoNotice, setDemoNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'PATIENT') {
          window.location.href = '/login?role=PATIENT';
          return;
        }
        setUser(data.user);
        loadContacts();
      });
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch('/api/emergency');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TRIGGER_SOS',
          message: `EMERGENCY ALERT: ${user.name} activated immediate assistance button!`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSosTriggered(true);
        setDemoNotice(data.demoNotice || 'Alert created successfully.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/40 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-center">
        
        <div className="flex items-center justify-between">
          <Link
            href="/patient"
            className="p-3 rounded-2xl bg-white border border-rose-200 text-teal-900 font-bold hover:bg-rose-100/50 transition-all flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full">
            Emergency Care Portal
          </span>
        </div>

        {/* Big Assistance Button Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-rose-200 shadow-xl flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-black text-rose-950">
            Do You Need Help Right Now?
          </h1>
          <p className="text-base text-slate-600 font-medium max-w-md mt-2 mb-8">
            Pressing the big red button will instantly notify Dr. Sarah Jenkins and Marcus Vance.
          </p>

          {!sosTriggered ? (
            <button
              onClick={handleTriggerSOS}
              disabled={loading}
              className="w-64 h-64 rounded-full bg-gradient-to-tr from-rose-600 via-red-500 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-2xl shadow-2xl shadow-rose-600/50 ring-8 ring-rose-200 flex flex-col items-center justify-center gap-3 transition-transform active:scale-90 cursor-pointer"
            >
              <PhoneCall className="w-16 h-16 animate-bounce" />
              <span>PRESS FOR HELP</span>
            </button>
          ) : (
            <div className="p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-3 animate-scale-up">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h2 className="text-2xl font-black">Help Request Sent!</h2>
              <p className="text-sm font-semibold text-emerald-900">
                Your caregiver has been alerted and is responding right now. Stay calm and comfortable.
              </p>

              {/* DEMO NOTICE DISCLOSURE */}
              <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-200 text-xs text-slate-600 text-left flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{demoNotice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contacts List */}
        <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm text-left space-y-4">
          <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <Phone className="w-5 h-5 text-rose-600" /> Direct Emergency Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100">
                <h3 className="font-extrabold text-teal-950 text-base">{c.name}</h3>
                <p className="text-xs text-slate-500">{c.relationship}</p>
                <div className="mt-3 pt-2 border-t border-rose-100 font-black text-sm text-rose-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" /> {c.phone}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
