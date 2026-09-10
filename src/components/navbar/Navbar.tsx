'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from '@/components/branding/Logo';
import { Bell, LogOut, HeartHandshake, ShieldAlert, Sparkles, Calendar, Pill, CheckSquare, BookOpen, Users, PhoneCall, AlertTriangle } from 'lucide-react';
import { UserSession, NotificationItem } from '@/types';

interface NavbarProps {
  user: UserSession | null;
  selectedPatientId?: string;
  onPatientChange?: (patientId: string) => void;
  patientsList?: Array<{ id: string; user: { name: string } }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedPatientId,
  onPatientChange,
  patientsList = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) setNotifications(data.notifications);
          if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        })
        .catch((e) => console.error(e));
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const markNotificationsRead = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_ALL_READ' }),
      });
      setUnreadCount(0);
    }
  };

  const isCaregiver = user?.role === 'CAREGIVER';

  const caregiverLinks = [
    { href: '/caregiver', label: 'Caregiver Hub', icon: HeartHandshake },
    { href: '/caregiver/medications', label: 'Medications', icon: Pill },
    { href: '/caregiver/tasks', label: 'Routines', icon: CheckSquare },
    { href: '/caregiver/appointments', label: 'Appointments', icon: Calendar },
    { href: '/caregiver/observations', label: 'Observations', icon: BookOpen },
    { href: '/caregiver/people', label: 'Memory Vault', icon: Users },
    { href: '/caregiver/safety', label: 'Safety & Alerts', icon: ShieldAlert },
    { href: '/caregiver/ai', label: 'SMRITI AI', icon: Sparkles },
  ];

  const patientLinks = [
    { href: '/patient', label: 'Daily Companion', icon: Calendar },
    { href: '/patient/people', label: 'My Family', icon: Users },
    { href: '/patient/emergency', label: 'Emergency Help', icon: PhoneCall },
  ];

  const currentLinks = isCaregiver ? caregiverLinks : patientLinks;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[rgba(26,18,21,0.92)] backdrop-blur-md border-b border-[#E08B98]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <Link href={isCaregiver ? '/caregiver' : '/patient'} className="flex items-center gap-2">
              <Logo size="md" />
            </Link>

            {/* Navigation Links */}
            {user && (
              <nav className="hidden lg:flex items-center space-x-1">
                {currentLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#C46473] text-white shadow-md shadow-[#C46473]/30'
                          : 'text-[#D4C3B5] hover:bg-[#2B1D22] hover:text-[#FAF5EF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E5AA7E]'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Actions & Patient Selector */}
            <div className="flex items-center gap-3">
              {isCaregiver && patientsList.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 bg-[#2B1D22] border border-[#E08B98]/30 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] font-bold text-[#E5AA7E] uppercase tracking-wider">PATIENT:</span>
                  <select
                    value={selectedPatientId || ''}
                    onChange={(e) => onPatientChange?.(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#FAF5EF] focus:outline-none cursor-pointer"
                  >
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#2B1D22] text-[#FAF5EF]">
                        {p.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Emergency SOS Header Button */}
              <button
                onClick={() => setShowSosModal(true)}
                className="btn-sos px-4 py-2 text-xs font-extrabold flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">EMERGENCY SOS</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={markNotificationsRead}
                      className="p-2.5 rounded-xl text-[#D4C3B5] hover:bg-[#2B1D22] hover:text-[#FAF5EF] transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#E63946] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-[#2B1D22] rounded-2xl shadow-2xl border border-[#E08B98]/30 p-4 z-50 animate-scale-up text-left">
                        <div className="flex items-center justify-between border-b border-[#E08B98]/20 pb-2 mb-3">
                          <h4 className="font-bold text-[#FAF5EF] text-xs">Notifications</h4>
                          <span className="text-[10px] text-[#E5AA7E]">{notifications.length} recent</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-[#9E8B80] py-4 text-center">No notifications right now.</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`p-3 rounded-xl text-xs border ${
                                  n.isRead ? 'bg-[#1E1518] border-[#E08B98]/10' : 'bg-[#C46473]/20 border-[#C46473]/40'
                                }`}
                              >
                                <div className="font-bold text-[#FAF5EF] mb-0.5">{n.title}</div>
                                <div className="text-[#D4C3B5] text-[11px]">{n.message}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Pill */}
                  <div className="flex items-center gap-2 bg-[#2B1D22] px-3 py-1.5 rounded-xl border border-[#E08B98]/20">
                    <div className="w-6 h-6 rounded-full bg-[#C46473] text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-[#FAF5EF]">{user.name}</span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-[#9E8B80] hover:text-[#E63946] hover:bg-[#2B1D22] transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-3 py-2 text-xs font-semibold text-[#D4C3B5] hover:text-white">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-xs font-bold bg-[#C46473] hover:bg-[#B85363] text-white rounded-xl shadow-md"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Emergency SOS Overlay Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#2B1D22] rounded-3xl p-6 border-2 border-[#E63946] shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E63946]/20 border border-[#E63946] text-[#E63946] flex items-center justify-center mx-auto text-2xl animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#FAF5EF]">EMERGENCY SOS DISPATCHED</h3>
            <p className="text-xs text-[#D4C3B5] leading-relaxed">
              An immediate priority alert and live GPS location ping have been routed to primary caregivers and emergency contacts.
            </p>

            <div className="p-4 rounded-2xl bg-[#1E1518] border border-[#E08B98]/20 text-left text-xs space-y-2">
              <p><strong className="text-[#E5AA7E]">Dispatched To:</strong> Dr. Sarah Jenkins & Marcus Vance</p>
              <p><strong className="text-[#E5AA7E]">Location:</strong> Home - Living Room (Safe Zone)</p>
              <p><strong className="text-[#E5AA7E]">Status:</strong> <span className="text-emerald-400 font-bold">Signal Transmitted (256-Bit Encrypted)</span></p>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full py-3 rounded-2xl bg-[#1E1518] border border-[#E08B98]/30 hover:bg-[#352329] text-[#FAF5EF] font-bold text-xs transition-all"
            >
              Dismiss Alert Confirmation
            </button>
          </div>
        </div>
      )}
    </>
  );
};
