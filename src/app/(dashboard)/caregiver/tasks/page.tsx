'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Modal } from '@/components/ui/Modal';
import { CheckSquare, Plus, Edit2, Trash2, CheckCircle2, Clock, Check } from 'lucide-react';

export default function CaregiverTasksPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hydration');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [recurring, setRecurring] = useState('Daily');
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
        loadTasks(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?patientId=${patientId}`);
      const data = await res.json();
      setTasks(data.tasks || []);
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
    setEditingTask(null);
    setTitle('');
    setCategory('Hydration');
    setScheduledTime('09:00');
    setRecurring('Daily');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setScheduledTime(task.scheduledTime);
    setRecurring(task.recurring);
    setNotes(task.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title || !category || !scheduledTime) {
      setFormError('Please complete required task fields.');
      return;
    }

    try {
      const method = editingTask ? 'PUT' : 'POST';
      const res = await fetch('/api/tasks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTask?.id,
          patientId: selectedPatientId,
          title,
          category,
          scheduledTime,
          recurring,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save task');

      setIsModalOpen(false);
      loadTasks(selectedPatientId);
      showToast(editingTask ? 'Care task updated.' : 'New care task created.');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this care task?')) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadTasks(selectedPatientId);
        showToast('Task removed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleComplete = async (taskId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch('/api/tasks/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          patientId: selectedPatientId,
          completed: !currentCompleted,
        }),
      });
      if (res.ok) {
        loadTasks(selectedPatientId);
        showToast(!currentCompleted ? 'Task marked as completed.' : 'Task status updated.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  let doneCount = 0;
  tasks.forEach((t) => {
    const todayLog = t.logs?.find((l: any) => l.date === todayStr);
    if (todayLog?.completed) doneCount++;
  });
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={(id) => {
          setSelectedPatientId(id);
          loadTasks(id);
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
              <CheckSquare className="w-7 h-7 text-emerald-600" /> Daily Care Routine Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize daily routines including meals, hydration, walks, and cognitive memory exercises.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Add Routine Task
          </button>
        </div>

        {/* Routine Task Progress */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Today's Routine Completion Rate
            </span>
            <span className="text-sm font-extrabold text-teal-950">
              {doneCount} of {totalTasks} tasks finished ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-teal-200 text-center">
            <CheckSquare className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-teal-950">No daily tasks created</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Add routines to help maintain structured daily care.</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((t) => {
              const todayLog = t.logs?.find((l: any) => l.date === todayStr);
              const isDone = !!todayLog?.completed;
              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between transition-all ${
                    isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-teal-100 hover:border-teal-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                          {t.category}
                        </span>
                        <h3 className="text-lg font-bold text-teal-950 mt-1.5">{t.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mt-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Scheduled: <strong>{t.scheduledTime}</strong> ({t.recurring})</span>
                      </div>
                      {t.notes && (
                        <p className="p-3 rounded-2xl bg-teal-50/50 text-slate-700 text-xs italic border border-teal-100 mt-2">
                          "{t.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDone ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {isDone ? '✓ Completed Today' : 'Pending Routine'}
                    </span>
                    <button
                      onClick={() => handleToggleComplete(t.id, isDone)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isDone
                          ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> {isDone ? 'Mark Incomplete' : 'Complete Task'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Task Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTask ? 'Edit Care Task' : 'Add Routine Care Task'}
        >
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Memory Album Review or Courtyard Walk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none bg-white"
                >
                  <option value="Hydration">Hydration</option>
                  <option value="Breakfast">Breakfast / Meal</option>
                  <option value="Walk">Outdoor Walk</option>
                  <option value="Exercise">Physical Exercise</option>
                  <option value="Memory activity">Memory activity</option>
                  <option value="Rest">Rest & Music</option>
                  <option value="Medication">Medication Check</option>
                  <option value="Custom">Custom Activity</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Scheduled Time *
                </label>
                <input
                  type="text"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="e.g. 10:30"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Care Notes / Guidance
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Chamomile tea with honey; gentle guidance."
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Save Care Task
              </button>
            </div>
          </form>
        </Modal>

      </main>
    </div>
  );
}
