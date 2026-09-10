'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { ShieldAlert, Phone, AlertTriangle, CheckCircle2, Shield, Check } from 'lucide-react';

export default function CaregiverSafetyPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'CAREGIVER') {
          window.location.href = '/login?role=CAREGIVER';
          return;
        }
        setUser(data.user);
        loadPatients();
      });
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients);
        const defaultId = data.patients[0].id;
        setSelectedPatientId(defaultId);
        loadEmergencyData(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEmergencyData = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/emergency?patientId=${patientId}`);
      const data = await res.json();
      setContacts(data.contacts || []);
      setAlerts(data.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACKNOWLEDGE_ALERT',
          alertId,
        }),
      });
      if (res.ok) {
        loadEmergencyData(selectedPatientId);
        showToast('Safety alert acknowledged.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={(id) => {
          setSelectedPatientId(id);
          loadEmergencyData(id);
        }}
        patientsList={patients}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {toastMsg && (
          <div className="p-4 rounded-2xl bg-teal-900 text-white text-xs font-bold shadow-lg flex items-center justify-between">
            <span>{toastMsg}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-950 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-rose-600" /> Safety & Emergency Alerts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor real-time patient assistance triggers and manage emergency contact proxies.
            </p>
          </div>
        </div>

        {/* Section 1: Active Safety Alerts */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> Safety Feed ({alerts.length})
          </h2>

          {alerts.length === 0 ? (
            <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 font-medium">
              ✓ All safety statuses clear. No active emergency alerts recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => {
                const isActive = a.status === 'ACTIVE';
                return (
                  <div
                    key={a.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-slate-50 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-300 text-slate-700'}`}>
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {a.severity} SEVERITY
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(a.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-teal-950 mt-1">{a.message}</h4>
                      </div>
                    </div>

                    {isActive ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(a.id)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                      >
                        Acknowledge Alert
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Acknowledged
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Emergency Contact Proxies */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-600" /> Authorized Emergency Contacts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                {c.isPrimary && (
                  <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                    Primary Proxy
                  </span>
                )}
                <h3 className="font-bold text-teal-950 text-base">{c.name}</h3>
                <p className="text-xs text-slate-500">{c.relationship}</p>
                <div className="mt-3 pt-3 border-t border-teal-100 font-extrabold text-sm text-teal-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" /> {c.phone}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
