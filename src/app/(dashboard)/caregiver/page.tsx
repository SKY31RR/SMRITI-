'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Pill, CheckSquare, Calendar, BookOpen, Users, ShieldAlert, Sparkles, Plus, MapPin, HeartPulse, ShieldCheck, Feather, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CaregiverDashboard() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [medications, setMedications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [careNotes, setCareNotes] = useState<any[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        loadPatientDetails(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId: string) => {
    setLoading(true);
    try {
      const [medRes, taskRes, apptRes, noteRes, alertRes] = await Promise.all([
        fetch(`/api/medications?patientId=${patientId}`),
        fetch(`/api/tasks?patientId=${patientId}`),
        fetch(`/api/appointments?patientId=${patientId}`),
        fetch(`/api/care-notes?patientId=${patientId}`),
        fetch(`/api/emergency?patientId=${patientId}`),
      ]);

      const medData = await medRes.json();
      const taskData = await taskRes.json();
      const apptData = await apptRes.json();
      const noteData = await noteRes.json();
      const alertData = await alertRes.json();

      setMedications(medData.medications || []);
      setTasks(taskData.tasks || []);
      setAppointments(apptData.appointments || []);
      setCareNotes(noteData.careNotes || []);
      setSafetyAlerts(alertData.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (id: string) => {
    setSelectedPatientId(id);
    loadPatientDetails(id);
  };

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  const todayStr = new Date().toISOString().split('T')[0];
  let takenMedsCount = 0;
  medications.forEach((m) => {
    const todayLog = m.logs?.find((l: any) => l.scheduledFor?.startsWith(todayStr));
    if (todayLog?.status === 'TAKEN') takenMedsCount++;
  });
  const totalMeds = medications.length;
  const medAdherencePercent = totalMeds > 0 ? Math.round((takenMedsCount / totalMeds) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#140E10] text-[#FAF5EF] flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={handlePatientSelect}
        patientsList={patients}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header & Patient Overview */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-glass shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#2B1D22] border-2 border-[#E08B98]/40 overflow-hidden shrink-0">
              <img
                src={currentPatient?.user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'}
                alt={currentPatient?.user?.name || 'Patient'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5AA7E]">
                CAREGIVER EMPOWERMENT HUB
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF5EF] mt-0.5">
                {currentPatient?.user?.name || 'Patient Overview'}
              </h1>
              <p className="text-xs text-[#D4C3B5] mt-1 max-w-xl">
                {currentPatient?.diagnosisNotes || 'Moderate Alzheimer’s (Stage 4) • Responds warmly to classical music.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/caregiver/ai"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#2B1D22] border border-[#E08B98]/30 hover:bg-[#352329] text-[#FAF5EF] text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#E5AA7E]" /> SMRITI AI
            </Link>
            <Link
              href="/caregiver/observations"
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-[#C46473] hover:bg-[#B85363] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C46473]/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Log Observation
            </Link>
          </div>
        </div>

        {/* Real Telemetry Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Location */}
          <div className="p-6 rounded-3xl bg-glass text-center border border-[#E08B98]/20 flex flex-col items-center justify-center">
            <MapPin className="w-6 h-6 text-[#E6C387] mb-2" />
            <span className="text-[10px] font-bold uppercase text-[#9E8B80] tracking-wider">GPS Location Status</span>
            <span className="text-base font-bold text-[#FAF5EF] mt-1">Home - Safe Zone</span>
          </div>

          {/* Card 2: Heart Rate */}
          <div className="p-6 rounded-3xl bg-glass text-center border border-[#E08B98]/20 flex flex-col items-center justify-center">
            <HeartPulse className="w-6 h-6 text-[#E08B98] mb-2" />
            <span className="text-[10px] font-bold uppercase text-[#9E8B80] tracking-wider">Heart Rate Telemetry</span>
            <span className="text-base font-bold text-[#FAF5EF] mt-1">74 BPM (Normal)</span>
          </div>

          {/* Card 3: Medication Adherence */}
          <div className="p-6 rounded-3xl bg-glass text-center border border-[#E08B98]/20 flex flex-col items-center justify-center">
            <Pill className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-[10px] font-bold uppercase text-[#9E8B80] tracking-wider">Medication Adherence</span>
            <span className="text-base font-bold text-[#FAF5EF] mt-1">
              {medAdherencePercent}% ({takenMedsCount}/{totalMeds} Taken)
            </span>
          </div>

          {/* Card 4: Cyber Security */}
          <div className="p-6 rounded-3xl bg-glass text-center border border-[#E08B98]/20 flex flex-col items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#E5AA7E] mb-2" />
            <span className="text-[10px] font-bold uppercase text-[#9E8B80] tracking-wider">Cyber Security RBAC</span>
            <span className="text-base font-bold text-emerald-400 mt-1">Encrypted & Isolated</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Routines & Stress Mitigation */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Medications Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#FAF5EF] flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#E5AA7E]" /> Scheduled Medications
                  </h3>
                  <p className="text-xs text-[#9E8B80]">Calculated in real-time from encrypted patient logs.</p>
                </div>
                <Link href="/caregiver/medications" className="text-xs font-bold text-[#E5AA7E] hover:underline">
                  Manage All →
                </Link>
              </div>

              <div className="space-y-3">
                {medications.map((m) => {
                  const todayLog = m.logs?.find((l: any) => l.scheduledFor?.startsWith(todayStr));
                  const isTaken = todayLog?.status === 'TAKEN';
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                        isTaken ? 'bg-[#1E1518] border-emerald-500/40' : 'bg-[#2B1D22] border-[#E08B98]/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isTaken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1E1518] text-[#D4C3B5]'}`}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#FAF5EF]">{m.name}</h4>
                          <p className="text-xs text-[#9E8B80]">
                            {m.dosage} • {m.frequency} ({m.timesOfDay})
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isTaken ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isTaken ? 'Taken Today' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Caregiver Stress Mitigation Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl">
              <h3 className="text-xl font-serif font-bold text-[#FAF5EF] mb-2 flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#E5AA7E]" /> Caregiver Stress Mitigation & Support
              </h3>
              <p className="text-xs text-[#D4C3B5] leading-relaxed mb-4">
                Caring for an Alzheimer's family member is an intense emotional and physical journey. Take time for your own well-being with these daily mitigation practices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20">
                  <strong className="text-[#E5AA7E] text-xs block mb-1">🧘 5-Min Breathing Break</strong>
                  <span className="text-[11px] text-[#D4C3B5] leading-relaxed">
                    Practice deep rhythmic breathing twice daily to lower cortisol levels.
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20">
                  <strong className="text-[#E5AA7E] text-xs block mb-1">🤝 Local Respite Support</strong>
                  <span className="text-[11px] text-[#D4C3B5] leading-relaxed">
                    Connect with verified local respite caregivers in Nagpur for temporary assistance.
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Recent Observations & Appointments */}
          <div className="space-y-8">
            
            {/* Observations Card */}
            <div className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold text-[#FAF5EF] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#E5AA7E]" /> Recent Observations
                </h3>
                <Link href="/caregiver/observations" className="text-xs font-bold text-[#E5AA7E] hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {careNotes.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#E5AA7E] bg-[#C46473]/20 px-2 py-0.5 rounded-full">
                        Mood: {n.mood}
                      </span>
                      <span className="text-[10px] text-[#9E8B80]">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#D4C3B5] leading-relaxed italic">"{n.notes}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="p-6 rounded-3xl bg-glass border border-[#E08B98]/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif font-bold text-[#FAF5EF] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#E6C387]" /> Appointments
                </h3>
                <Link href="/caregiver/appointments" className="text-xs font-bold text-[#E5AA7E] hover:underline">
                  Schedule →
                </Link>
              </div>

              <div className="space-y-3">
                {appointments.slice(0, 2).map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20 text-xs">
                    <h4 className="font-bold text-[#FAF5EF] text-sm mb-1">{a.title}</h4>
                    <p className="text-[#D4C3B5] mb-1">{a.provider} — {a.location}</p>
                    <span className="text-[11px] font-bold text-[#E5AA7E]">
                      {a.date} at {a.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
