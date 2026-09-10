'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Modal } from '@/components/ui/Modal';
import { BookOpen, Plus, Trash2, Smile, Frown, Meh, AlertCircle, Sparkles, Check } from 'lucide-react';

export default function CaregiverObservationsPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [careNotes, setCareNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mood, setMood] = useState('Peaceful');
  const [activity, setActivity] = useState('Family Visit & Tea');
  const [tags, setTags] = useState('Peaceful, Family');
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
        loadCareNotes(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCareNotes = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/care-notes?patientId=${patientId}`);
      const data = await res.json();
      setCareNotes(data.careNotes || []);
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

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!mood || !activity || !notes) {
      setFormError('Please enter mood, activity, and observation details.');
      return;
    }

    try {
      const res = await fetch('/api/care-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          mood,
          activity,
          tags: tags || `${mood}, ${activity}`,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record care note');

      setIsModalOpen(false);
      setNotes('');
      loadCareNotes(selectedPatientId);
      showToast('New observation recorded.');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Delete this observation note?')) return;
    try {
      const res = await fetch(`/api/care-notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCareNotes(selectedPatientId);
        showToast('Observation deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const moodColors: Record<string, string> = {
    Peaceful: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    Happy: 'bg-amber-100 text-amber-900 border-amber-200',
    Anxious: 'bg-rose-100 text-rose-900 border-rose-200',
    Confused: 'bg-purple-100 text-purple-900 border-purple-200',
    Restless: 'bg-orange-100 text-orange-900 border-orange-200',
    Sad: 'bg-blue-100 text-blue-900 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={(id) => {
          setSelectedPatientId(id);
          loadCareNotes(id);
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
              <BookOpen className="w-7 h-7 text-teal-600" /> Care Observations & Notes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Document daily mood, behavioral observations, and memory responses for clinical review.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Log New Observation
          </button>
        </div>

        {/* Observations Feed */}
        {careNotes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-teal-200 text-center">
            <BookOpen className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-teal-950">No observations logged yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Record mood changes or family visit notes to build a care history.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Log Observation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {careNotes.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${moodColors[n.mood] || 'bg-teal-100 text-teal-900 border-teal-200'}`}>
                        Mood: {n.mood}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        {n.activity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-800 text-sm leading-relaxed mt-3 whitespace-pre-line">
                    {n.notes}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Logged by <strong>{n.caregiver?.name || 'Caregiver'}</strong></span>
                  <div className="flex items-center gap-1 text-[11px] text-teal-700">
                    <Sparkles className="w-3.5 h-3.5" /> Ready for SMRITI AI Summary
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
          title="Record Care Observation"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveObservation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-2">
                Observed Mood *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Peaceful', 'Happy', 'Anxious', 'Confused', 'Restless', 'Sad'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      mood === m
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Activity Context *
              </label>
              <input
                type="text"
                required
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. Family Visit, Morning Routine, Courtyard Walk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Detailed Observation Notes *
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe behavioral response, recognition of family, appetite, or speech patterns..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none resize-none"
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
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm"
              >
                Save Observation
              </button>
            </div>
          </form>
        </Modal>

      </main>
    </div>
  );
}
