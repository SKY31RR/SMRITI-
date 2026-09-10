'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Modal } from '@/components/ui/Modal';
import { Users, Heart, Plus, Trash2, Image, Phone, Calendar, Sparkles, Check } from 'lucide-react';

export default function CaregiverPeoplePage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [people, setPeople] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Person Modal State
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personRelationship, setPersonRelationship] = useState('');
  const [personPhotoUrl, setPersonPhotoUrl] = useState('');
  const [personDescription, setPersonDescription] = useState('');
  const [personPhone, setPersonPhone] = useState('');

  // Memory Modal State
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [memoryImageUrl, setMemoryImageUrl] = useState('');
  const [associatedPersonId, setAssociatedPersonId] = useState('');

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
        loadPeopleAndMemories(defaultId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPeopleAndMemories = async (patientId: string) => {
    setLoading(true);
    try {
      const [peopleRes, memRes] = await Promise.all([
        fetch(`/api/people?patientId=${patientId}`),
        fetch(`/api/memories?patientId=${patientId}`),
      ]);
      const peopleData = await peopleRes.json();
      const memData = await memRes.json();
      setPeople(peopleData.people || []);
      setMemories(memData.memories || []);
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

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          name: personName,
          relationship: personRelationship,
          photoUrl: personPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          description: personDescription,
          contactPhone: personPhone || null,
        }),
      });
      if (res.ok) {
        setIsPersonModalOpen(false);
        setPersonName('');
        setPersonRelationship('');
        setPersonDescription('');
        setPersonPhotoUrl('');
        setPersonPhone('');
        loadPeopleAndMemories(selectedPatientId);
        showToast('New important person added.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          memoryPersonId: associatedPersonId || null,
          title: memoryTitle,
          description: memoryDescription,
          memoryDate: memoryDate || null,
          imageUrl: memoryImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
        }),
      });
      if (res.ok) {
        setIsMemoryModalOpen(false);
        setMemoryTitle('');
        setMemoryDescription('');
        setMemoryDate('');
        setMemoryImageUrl('');
        setAssociatedPersonId('');
        loadPeopleAndMemories(selectedPatientId);
        showToast('New memory story added.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm('Remove this person profile?')) return;
    try {
      const res = await fetch(`/api/people?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadPeopleAndMemories(selectedPatientId);
        showToast('Person profile removed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Remove this memory story?')) return;
    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadPeopleAndMemories(selectedPatientId);
        showToast('Memory story removed.');
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
          loadPeopleAndMemories(id);
        }}
        patientsList={patients}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {toastMsg && (
          <div className="p-4 rounded-2xl bg-teal-900 text-white text-xs font-bold shadow-lg flex items-center justify-between">
            <span>{toastMsg}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-teal-950 flex items-center gap-2">
              <Users className="w-7 h-7 text-teal-600" /> My People & Memories
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              SMRITI signature cognitive feature: preserve face recognition cards and cherished family memory stories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPersonModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Person Card
            </button>
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Heart className="w-4 h-4" /> Add Memory Story
            </button>
          </div>
        </div>

        {/* Section 1: My People Face Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> Important People ({people.length})
          </h2>

          {people.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-teal-200 text-center text-xs text-slate-500">
              No family members or important people added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {people.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-teal-100 overflow-hidden border-2 border-teal-200 shrink-0">
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                            {p.relationship}
                          </span>
                          <h3 className="text-lg font-bold text-teal-950 mt-1">{p.name}</h3>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePerson(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{p.description}</p>
                    {p.contactPhone && (
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold mt-2">
                        <Phone className="w-3.5 h-3.5" /> {p.contactPhone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Memory Stories Gallery */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-teal-950 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600" /> Memory Stories Album ({memories.length})
          </h2>

          {memories.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-emerald-200 text-center text-xs text-slate-500">
              No memory stories recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="h-48 w-full bg-slate-100 relative">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                    {m.memoryDate && (
                      <span className="absolute top-3 right-3 bg-teal-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                        {m.memoryDate}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-teal-950">{m.title}</h3>
                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {m.memoryPerson && (
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md inline-block mt-1 mb-2">
                        With {m.memoryPerson.name} ({m.memoryPerson.relationship})
                      </span>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Add Person */}
        <Modal
          isOpen={isPersonModalOpen}
          onClose={() => setIsPersonModalOpen(false)}
          title="Add Person Card"
        >
          <form onSubmit={handleSavePerson} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Relationship *
                </label>
                <input
                  type="text"
                  required
                  value={personRelationship}
                  onChange={(e) => setPersonRelationship(e.target.value)}
                  placeholder="e.g. Son, Daughter, Spouse"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Photo URL
              </label>
              <input
                type="url"
                value={personPhotoUrl}
                onChange={(e) => setPersonPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Reassuring Memory Description *
              </label>
              <textarea
                rows={3}
                required
                value={personDescription}
                onChange={(e) => setPersonDescription(e.target.value)}
                placeholder="e.g. Your beloved son who visits every weekend. He loves architecture and garden design."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-teal-500 text-sm outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPersonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 shadow-sm"
              >
                Save Person Card
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Add Memory Story */}
        <Modal
          isOpen={isMemoryModalOpen}
          onClose={() => setIsMemoryModalOpen(false)}
          title="Add Memory Story"
        >
          <form onSubmit={handleSaveMemory} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Memory Title *
              </label>
              <input
                type="text"
                required
                value={memoryTitle}
                onChange={(e) => setMemoryTitle(e.target.value)}
                placeholder="e.g. Cape Cod Family Summer Trip"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Associated Person
                </label>
                <select
                  value={associatedPersonId}
                  onChange={(e) => setAssociatedPersonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm outline-none bg-white"
                >
                  <option value="">None / General Family</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.relationship})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                  Date / Season
                </label>
                <input
                  type="text"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  placeholder="e.g. Summer 1984"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={memoryImageUrl}
                onChange={(e) => setMemoryImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-950 uppercase tracking-wider mb-1">
                Story Description *
              </label>
              <textarea
                rows={3}
                required
                value={memoryDescription}
                onChange={(e) => setMemoryDescription(e.target.value)}
                placeholder="Describe the sunny afternoon, waves on the beach, and laughing together..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 text-sm outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMemoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Save Memory Story
              </button>
            </div>
          </form>
        </Modal>

      </main>
    </div>
  );
}
