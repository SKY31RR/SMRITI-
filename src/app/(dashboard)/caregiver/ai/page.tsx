'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar/Navbar';
import { Sparkles, Shield, Send, User, Bot, RefreshCw, FileText, Heart, Calendar } from 'lucide-react';
import { MEDICAL_DISCLAIMER } from '@/lib/ai';

export default function CaregiverAIPage() {
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; disclaimer?: string; isFallback?: boolean }>>([]);
  const [loading, setLoading] = useState(false);

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
        setSelectedPatientId(data.patients[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentPatient = patients.find((p) => p.id === selectedPatientId);

  const suggestedPrompts = [
    { label: "Summarize today's care status", type: 'care_summary', icon: FileText },
    { label: 'Prepare doctor-visit summary', type: 'doctor_visit', icon: Calendar },
    { label: 'Suggest a calming memory activity', type: 'activity_suggestion', icon: Heart },
    { label: 'Explain cognitive routine best practices', type: 'care_concept', icon: Sparkles },
  ];

  const handleSend = async (customPrompt?: string, contextType?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const newHistory = [...chatHistory, { role: 'user' as const, text: textToSend }];
    setChatHistory(newHistory);
    if (!customPrompt) setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          contextType,
          patientName: currentPatient?.user?.name || 'Eleanor Vance',
          recentObservations: ['Calm mood in morning', 'Responds brightly to Cape Cod photo album'],
          medicationsSummary: ['Donepezil 10mg', 'Memantine 10mg'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setChatHistory([
          ...newHistory,
          {
            role: 'assistant',
            text: data.response,
            disclaimer: data.disclaimer,
            isFallback: data.isDemoFallback,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        user={user}
        selectedPatientId={selectedPatientId}
        onPatientChange={setSelectedPatientId}
        patientsList={patients}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title & Medical Disclaimer */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-teal-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-100 text-teal-700">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-teal-950">SMRITI AI Care Assistant</h1>
              <p className="text-xs text-slate-500">
                Supportive care organizer and doctor-visit summary generator.
              </p>
            </div>
          </div>

          {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5 text-teal-950">Medical Notice:</strong>
              {MEDICAL_DISCLAIMER}
            </div>
          </div>
        </div>

        {/* Suggested Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestedPrompts.map((sp) => {
            const Icon = sp.icon;
            return (
              <button
                key={sp.label}
                onClick={() => handleSend(sp.label, sp.type)}
                className="p-4 rounded-2xl bg-white border border-teal-100 hover:border-teal-300 text-left transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <Icon className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-teal-950">{sp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Stream Window */}
        <div className="bg-white rounded-3xl border border-teal-100 shadow-sm flex flex-col h-[500px] overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Sparkles className="w-12 h-12 text-teal-200 mb-3" />
                <h3 className="font-bold text-teal-950 text-sm">Ask SMRITI AI anything about care organization</h3>
                <p className="text-xs max-w-sm mt-1">
                  Click a suggested action above or type a custom question below.
                </p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl max-w-2xl ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white font-medium'
                      : 'bg-teal-50/70 border border-teal-100 text-slate-800'
                  }`}>
                    <div className="whitespace-pre-line">{msg.text}</div>
                    
                    {msg.disclaimer && (
                      <div className="mt-3 pt-2 border-t border-teal-200/50 text-[10px] text-teal-800 font-semibold italic flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {msg.disclaimer}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              ))
            )}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-teal-700 font-bold p-3 bg-teal-50 rounded-2xl w-fit animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" /> SMRITI AI is drafting care response...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-teal-100 bg-slate-50/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask SMRITI AI for care assistance, activities, or summaries..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:border-teal-500 text-xs outline-none bg-white"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="p-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
