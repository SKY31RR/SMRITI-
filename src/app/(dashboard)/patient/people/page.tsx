'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Users, Heart, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientPeoplePage() {
  const [user, setUser] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
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
        loadPeopleAndMemories();
      });
  }, []);

  const loadPeopleAndMemories = async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([fetch('/api/people'), fetch('/api/memories')]);
      const pData = await pRes.json();
      const mData = await mRes.json();
      setPeople(pData.people || []);
      setMemories(mData.memories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex items-center gap-4">
          <Link
            href="/patient"
            className="p-3 rounded-2xl bg-white border border-emerald-100 text-teal-900 font-bold hover:bg-emerald-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-teal-950 flex items-center gap-2">
              <Users className="w-8 h-8 text-teal-600" /> My Family & Loved Ones
            </h1>
            <p className="text-sm font-semibold text-emerald-800">
              People who love you and cherish memories with you.
            </p>
          </div>
        </div>

        {/* Section 1: People Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {people.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-md flex items-start gap-5"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-300 shrink-0 shadow">
                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-black uppercase bg-teal-100 text-teal-900 px-3 py-1 rounded-full">
                  {p.relationship}
                </span>
                <h3 className="text-2xl font-black text-teal-950 mt-2">{p.name}</h3>
                <p className="text-sm text-slate-700 font-medium leading-relaxed mt-2">{p.description}</p>
                {p.contactPhone && (
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-800 mt-3">
                    <Phone className="w-4 h-4 text-teal-600" /> {p.contactPhone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Memory Stories */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-black text-teal-950 flex items-center gap-3">
            <Heart className="w-8 h-8 text-emerald-600" /> Our Memory Album
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {memories.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-md"
              >
                <div className="h-56 w-full bg-slate-100 relative">
                  <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                  {m.memoryDate && (
                    <span className="absolute top-3 right-3 bg-teal-950/80 text-white font-bold text-xs px-3 py-1 rounded-full">
                      {m.memoryDate}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-teal-950">{m.title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed mt-2">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
