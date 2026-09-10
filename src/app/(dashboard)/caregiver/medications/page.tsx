'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Modal } from '@/components/ui/Modal';
import { Pill, Plus, Edit2, Trash2, CheckCircle2, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

export default function CaregiverMedicationsPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once Daily');
  const [timesOfDay, setTimesOfDay] = useState('08:00');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
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
        loadMedications(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medications?patientId=${patientId}`);
      const data = await res.json();
      setMedications(data.medications || []);
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
    setEditingMed(null);
    setName('');
    setDosage('');
    setFrequency('Once Daily');
    setTimesOfDay('08:00');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (med: any) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setTimesOfDay(med.timesOfDay);
    setStartDate(med.startDate);
    setEndDate(med.endDate || '');
    setNotes(med.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !dosage || !frequency || !timesOfDay || !startDate) {
      setFormError('Please complete all required fields.');
      return;
    }

    try {
      const method = editingMed ? 'PUT' : 'POST';
      const res = await fetch('/api/medications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMed?.id,
          patientId: selectedPatientId,
          name,
          dosage,
          frequency,
          timesOfDay,
          startDate,
          endDate: endDate || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save medication');

      setIsModalOpen(false);
      loadMedications(selectedPatientId);
      showToast(editingMed ? 'Medication updated successfully.' : 'New medication created successfully.');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication schedule?')) return;
    try {
      const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadMedications(selectedPatientId);
        showToast('Medication deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkTaken = async (medId: string, logId?: string) => {
    try {
      const res = await fetch('/api/medications/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId,
          patientId: selectedPatientId,
          logId,
          status: 'TAKEN',
        }),
      });
      if (res.ok) {
        loadMedications(selectedPatientId);
        showToast('Medication marked as taken.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  let takenCount = 0;
  medications.forEach((m) => {
    const todayLog = m.logs?.find((l: any) => l.scheduledFor?.startsWith(todayStr));
    if (todayLog?.status === 'TAKEN') takenCount++;
  });
  const totalMeds = medications.length;
  const progressPercent = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={(id) => {
          setSelectedPatientId(id);
          loadMedications(id);
        }}
        patientsList={patients}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-4 rounded-2xl bg-teal-900 text-white text-xs font-bold shadow-lg animate-fade-in flex items-center justify-between">
            <span>{toastMsg}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Page Title & Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-950 flex items-center gap-2">
              <Pill className="w-7 h-7 text-teal-600" /> Medication Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add, update, or remove prescription schedules and track daily adherence.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Medication
          </button>
        </div>

        {/* Adherence Progress Banner */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Today's Calculated Adherence Progress
            </span>
            <span className="text-sm font-extrabold text-teal-950">
              {takenCount} of {totalMeds} completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Medications List */}
        {medications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-teal-200 text-center">
            <Pill className="w-12 h-12 text-teal-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-teal-950">No medications scheduled yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click "Add Medication" to create a new prescription plan.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Medication
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medications.map((m) => {
              const todayLog = m.logs?.find((l: any) => l.scheduledFor?.startsWith(todayStr));
              const isTaken = todayLog?.status === 'TAKEN';
              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                    isTaken ? 'border-emerald-200 bg-emerald-50/20' : 'border-teal-100 hover:border-teal-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                          {m.dosage}
                        </span>
                        <h3 className="text-lg font-bold text-teal-950 mt-1.5">{m.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(m.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Frequency: <strong>{m.frequency}</strong> ({m.timesOfDay})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Start Date: <strong>{m.startDate}</strong> {m.endDate ? `to ${m.endDate}` : ''}</span>
                      </div>
                      {m.notes && (
                        <p className="p-3 rounded-2xl bg-teal-50/50 text-slate-700 text-xs italic border border-teal-100 mt-3">
                          "{m.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isTaken ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {isTaken ? '✓ Taken Today' : 'Pending Action'}
                    </span>
                    <button
                      onClick={() => handleMarkTaken(m.id, todayLog?.id)}
                      disabled={isTaken}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                      }`}
                    >
                      {isTaken ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recorded Taken
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Mark as Taken
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMed ? 'Edit Medication' : 'Add New Medication'}
        >
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveMedication} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Donepezil (Aricept)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 10 mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Frequency *
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none bg-white"
                >
                  <option value="Once Daily">Once Daily</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Thrice Daily">Thrice Daily</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Scheduled Time(s) *
              </label>
              <input
                type="text"
                required
                value={timesOfDay}
                onChange={(e) => setTimesOfDay(e.target.value)}
                placeholder="e.g. 08:00 or 08:00, 20:00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Care Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Take with morning breakfast water."
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
                Save Medication
              </button>
            </div>
          </form>
        </Modal>

      </main>
    </div>
  );
}
