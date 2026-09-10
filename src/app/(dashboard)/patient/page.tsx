'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Pill, CheckSquare, Calendar, Users, PhoneCall, CheckCircle2, Heart, Music, Images, Sun, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== 'PATIENT') {
          window.location.href = '/login?role=PATIENT';
          return;
        }
        setUser(data.user);
        loadPatientData();
      });
  }, []);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const [medRes, taskRes, apptRes, peopleRes] = await Promise.all([
        fetch('/api/medications'),
        fetch('/api/tasks'),
        fetch('/api/appointments'),
        fetch('/api/people'),
      ]);

      const medData = await medRes.json();
      const taskData = await taskRes.json();
      const apptData = await apptRes.json();
      const peopleData = await peopleRes.json();

      setMedications(medData.medications || []);
      setTasks(taskData.tasks || []);
      setAppointments(apptData.appointments || []);
      setPeople(peopleData.people || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMedicationTaken = async (medId: string, logId?: string) => {
    try {
      const res = await fetch('/api/medications/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId,
          patientId: user.patientProfileId,
          logId,
          status: 'TAKEN',
        }),
      });
      if (res.ok) loadPatientData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTaskComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch('/api/tasks/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          patientId: user.patientProfileId,
          completed: !currentCompleted,
        }),
      });
      if (res.ok) loadPatientData();
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#140E10] text-[#FAF5EF] flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Patient Welcome Header */}
        <div className="p-8 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#2B1D22] border-4 border-[#E5AA7E]/40 overflow-hidden shrink-0 shadow-md">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'}
                alt={user?.name || 'Patient'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5AA7E] flex items-center gap-1">
                <Sun className="w-4 h-4 text-[#E6C387]" /> Good Day
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#FAF5EF] mt-0.5">
                Hello, {user?.name?.split(' ')[0] || 'Eleanor'}
              </h1>
              <p className="text-sm text-[#D4C3B5] mt-1">Welcome to your safe daily companion.</p>
            </div>
          </div>

          {/* Huge Prominent Emergency SOS Button */}
          <Link
            href="/patient/emergency"
            className="btn-sos px-8 py-4 rounded-full text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            <AlertTriangle className="w-6 h-6 animate-pulse" /> EMERGENCY SOS
          </Link>
        </div>

        {/* Big Touch Target Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Family Memories */}
          <Link
            href="/patient/people"
            className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 hover:border-[#E5AA7E] transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#C46473]/20 border border-[#C46473]/40 text-[#E5AA7E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Images className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FAF5EF]">Family Memories</h3>
            <p className="text-xs text-[#D4C3B5] mt-1">Look at photos & listen to voice notes from family</p>
          </Link>

          {/* Card 2: Daily Schedule */}
          <div
            onClick={() => document.getElementById('scheduleSection')?.scrollIntoView({ behavior: 'smooth' })}
            className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 hover:border-emerald-500 transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FAF5EF]">My Daily Schedule</h3>
            <p className="text-xs text-[#D4C3B5] mt-1">Check medications, meals & evening walks</p>
          </div>

          {/* Card 3: Call Daughter */}
          <div
            onClick={() => alert('Connecting one-touch call to Marcus Vance (Son)...')}
            className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 hover:border-[#E5AA7E] transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E5AA7E]/20 border border-[#E5AA7E]/40 text-[#E5AA7E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FAF5EF]">Call Family</h3>
            <p className="text-xs text-[#D4C3B5] mt-1">Touch to speak with your primary caregiver</p>
          </div>

          {/* Card 4: Calming Music */}
          <div
            onClick={() => alert('Playing calming Chopin & Mozart piano melodies...')}
            className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 hover:border-[#E6C387] transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E6C387]/20 border border-[#E6C387]/40 text-[#E6C387] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#FAF5EF]">Calming Music</h3>
            <p className="text-xs text-[#D4C3B5] mt-1">Listen to peaceful melodies & soothing sounds</p>
          </div>
        </div>

        {/* Schedule & Routine Section */}
        <div id="scheduleSection" className="p-8 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#E08B98]/20 pb-4">
            <h2 className="text-2xl font-serif font-bold text-[#FAF5EF] flex items-center gap-3">
              <CheckSquare className="w-7 h-7 text-[#E5AA7E]" /> Today's Schedule & Routine
            </h2>
            <span className="text-xs font-bold text-[#E5AA7E]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-4">
            {medications.map((m) => {
              const todayLog = m.logs?.find((l: any) => l.scheduledFor?.startsWith(todayStr));
              const isTaken = todayLog?.status === 'TAKEN';
              return (
                <div
                  key={m.id}
                  className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                    isTaken ? 'bg-[#1E1518] border-emerald-500/40' : 'bg-[#2B1D22] border-[#E08B98]/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C46473]/30 text-[#E5AA7E] px-3 py-1 rounded-full">
                      Medication ({m.timesOfDay})
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mt-2">{m.name}</h3>
                    <p className="text-xs text-[#D4C3B5] mt-0.5">{m.dosage} • Take with water</p>
                  </div>

                  <button
                    onClick={() => handleMarkMedicationTaken(m.id, todayLog?.id)}
                    disabled={isTaken}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isTaken
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#C46473] hover:bg-[#B85363] text-white shadow-lg active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {isTaken ? '✓ Taken Today' : 'Touch to Mark Taken'}
                  </button>
                </div>
              );
            })}

            {tasks.map((t) => {
              const todayLog = t.logs?.find((l: any) => l.date === todayStr);
              const isDone = !!todayLog?.completed;
              return (
                <div
                  key={t.id}
                  className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                    isDone ? 'bg-[#1E1518] border-emerald-500/40' : 'bg-[#2B1D22] border-[#E08B98]/30'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                      {t.category} ({t.scheduledTime})
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mt-2">{t.title}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleTaskComplete(t.id, isDone)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#D98877] hover:bg-[#C46473] text-white shadow-lg active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {isDone ? '✓ Completed' : 'Touch to Complete'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
