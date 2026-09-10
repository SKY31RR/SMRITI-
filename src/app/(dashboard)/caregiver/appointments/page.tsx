'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Modal } from '@/components/ui/Modal';
import { Calendar, Plus, Edit2, Trash2, Clock, MapPin, UserCheck, Check } from 'lucide-react';

export default function CaregiverAppointmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [provider, setProvider] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
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
        loadAppointments(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?patientId=${patientId}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
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

  const openAddModal = () => {
    setEditingAppt(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('10:00');
    setProvider('');
    setLocation('');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (appt: any) => {
    setEditingAppt(appt);
    setTitle(appt.title);
    setDate(appt.date);
    setTime(appt.time);
    setProvider(appt.provider);
    setLocation(appt.location);
    setNotes(appt.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title || !date || !time || !provider || !location) {
      setFormError('Please complete all required fields.');
      return;
    }

    try {
      const method = editingAppt ? 'PUT' : 'POST';
      const res = await fetch('/api/appointments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAppt?.id,
          patientId: selectedPatientId,
          title,
          date,
          time,
          provider,
          location,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save appointment');

      setIsModalOpen(false);
      loadAppointments(selectedPatientId);
      showToast(editingAppt ? 'Appointment updated.' : 'New appointment scheduled.');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadAppointments(selectedPatientId);
        showToast('Appointment removed.');
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
          loadAppointments(id);
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
              <Calendar className="w-7 h-7 text-amber-600" /> Appointment Scheduler
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Schedule medical visits, therapy sessions, and care evaluations.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Schedule Appointment
          </button>
        </div>

        {/* Appointments Feed */}
        {appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-teal-200 text-center">
            <Calendar className="w-12 h-12 text-amber-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-teal-950">No appointments scheduled</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Keep track of medical checkups and therapy sessions here.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                        {a.date}
                      </span>
                      <h3 className="text-lg font-bold text-teal-950 mt-1.5">{a.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(a.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 mt-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Provider: <strong>{a.provider}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Time: <strong>{a.time}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Location: <strong>{a.location}</strong></span>
                    </div>
                    {a.notes && (
                      <p className="p-3 rounded-2xl bg-amber-50/50 text-slate-700 text-xs italic border border-amber-100 mt-3">
                        "{a.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAppt ? 'Edit Appointment' : 'Schedule Appointment'}
        >
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Appointment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neurology Cognitive Assessment"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Doctor / Provider Name *
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Dr. Robert Evans, MD"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Clinic Location / Address *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Memory Wellness Center, Suite 302"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Preparation Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Bring medication list and recent care observations."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-amber-500 text-sm outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </Modal>

      </main>
    </div>
  );
}
