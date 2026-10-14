import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Award,
  Users,
  Send,
  Plus,
  Download,
  FileCheck,
  Phone,
  UserCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { VolunteerEvent, User, VolunteerRegistration } from '../../types';
import { SpotlightCard, GlassModal } from '../common/ReactBitsComponents';
import confetti from 'canvas-confetti';

interface VolunteerDashboardProps {
  events: VolunteerEvent[];
  currentUser: User;
  registrations: VolunteerRegistration[];
  onRegisterEvent: (eventId: string, volunteerName: string, volunteerEmail: string, volunteerPhone: string) => void;
  onOpenAuth: () => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  events,
  currentUser,
  registrations,
  onRegisterEvent,
  onOpenAuth
}) => {
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [formName, setFormName] = useState(currentUser.name);
  const [formEmail, setFormEmail] = useState(currentUser.email);
  const [formPhone, setFormPhone] = useState(currentUser.phone || '+91 ');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Stats
  const userRegs = registrations.filter((r) => r.volunteerEmail === currentUser.email);
  const totalHours = currentUser.volunteerHours || userRegs.reduce((sum, r) => sum + (r.hoursLogged || 0), 0) || 0;

  const handleRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    onRegisterEvent(selectedEvent.id, formName, formEmail, formPhone);
    setRegisteredSuccess(true);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setRegisteredSuccess(false);
      setSelectedEvent(null);
    }, 2000);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-rose-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Community Volunteer Hub
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
              Help sort winter clothes, teach at Shishu Pathshalas, or assist artisan exhibitions. Log your hours and receive verified certificates.
            </p>
          </div>
        </div>

        {/* Volunteer Profile / Stats Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{currentUser.name}</h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                  {currentUser.role === 'volunteer' ? 'Verified Volunteer' : currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email} • {currentUser.location || 'Kolkata, WB'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-2xl font-black text-amber-900">{totalHours} hrs</span>
              <p className="text-[11px] font-semibold text-slate-500">Logged Impact</p>
            </div>

            <div className="text-center">
              <span className="text-2xl font-black text-emerald-800">{userRegs.length}</span>
              <p className="text-[11px] font-semibold text-slate-500">Events Joined</p>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-800 text-amber-50 hover:bg-amber-900 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Get Volunteer Certificate</span>
            </button>
          </div>
        </div>

        {/* Upcoming Field Drives & Events Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Volunteer Field Events</h2>
              <p className="text-xs text-slate-500">Select an event below to register and receive location coordination</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isFull = event.registeredVolunteers >= event.requiredVolunteers;
              const hasRegistered = userRegs.some((r) => r.eventId === event.id);

              return (
                <SpotlightCard key={event.id} className="flex flex-col h-full bg-white group overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                      {event.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>{event.date} • {event.time}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{event.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{event.description}</p>

                      <div className="pt-2 text-xs text-slate-500 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {event.registeredVolunteers} / {event.requiredVolunteers} Volunteers Signed Up
                          </span>
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {event.skillsNeeded.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEvent(event)}
                      disabled={hasRegistered}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        hasRegistered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isFull
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-800 text-amber-50 hover:bg-amber-900'
                      }`}
                    >
                      {hasRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Already Registered</span>
                        </>
                      ) : (
                        <span>RSVP for Field Event</span>
                      )}
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {selectedEvent && (
        <GlassModal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="max-w-md">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Volunteer RSVP Confirmation</h3>
            <p className="text-xs text-slate-600">
              You are registering for: <strong className="text-amber-900">{selectedEvent.title}</strong>
            </p>

            {registeredSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Registration Confirmed!</h4>
                <p className="text-xs text-emerald-700">
                  Coordinator {selectedEvent.coordinatorName} ({selectedEvent.coordinatorPhone}) will contact you
                  before the event.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRSVP} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs hover:bg-amber-900"
                  >
                    Confirm RSVP
                  </button>
                </div>
              </form>
            )}
          </div>
        </GlassModal>
      )}

      {/* Verified Volunteer Certificate Modal */}
      {showCertificateModal && (
        <GlassModal isOpen={showCertificateModal} onClose={() => setShowCertificateModal(false)} maxWidth="max-w-2xl">
          <div className="p-6 bg-amber-50/50 rounded-2xl border-4 border-amber-300 text-slate-900 space-y-6 relative overflow-hidden">
            {/* Seal Header */}
            <div className="text-center space-y-2 border-b-2 border-amber-200 pb-4">
              <div className="w-12 h-12 bg-amber-800 text-amber-50 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Award className="w-7 h-7 text-amber-300" />
              </div>
              <h2 className="text-xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                Certificate of Volunteer Appreciation
              </h2>
              <p className="text-[11px] text-amber-800 font-semibold uppercase tracking-wider">
                Anandalok Social Welfare Foundation • Regd. Govt. Non-Profit Trust
              </p>
            </div>

            {/* Body */}
            <div className="text-center space-y-3 py-2">
              <p className="text-xs text-slate-600 italic">This is proudly presented to</p>
              <h3 className="text-2xl font-bold text-slate-900 underline decoration-amber-500 decoration-2">
                {currentUser.name}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
                In sincere recognition and appreciation for contributing <strong>{totalHours} Field Volunteer Hours</strong>{' '}
                towards winter cloth sorting, child remedial tutoring, and artisan craft empowerment in West Bengal.
              </p>
            </div>

            {/* Footer Signatures */}
            <div className="flex items-end justify-between pt-6 border-t border-amber-200 text-xs">
              <div className="text-center">
                <p className="font-serif italic font-bold text-amber-900">Suman Roy</p>
                <p className="text-[10px] text-slate-500">Founder & Field Director</p>
              </div>

              <div className="text-center">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded border border-emerald-300">
                  VERIFIED CERT-2026-AL-9842
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Issued Date: August 2026</p>
              </div>

              <div className="text-center">
                <p className="font-serif italic font-bold text-amber-900">Ananya Banerjee</p>
                <p className="text-[10px] text-slate-500">Volunteer Manager</p>
              </div>
            </div>

            <button
              onClick={() => {
                const content = `CERTIFICATE OF VOLUNTEER APPRECIATION\nPresented to: ${currentUser.name}\nFor contributing ${totalHours} Field Volunteer Hours with Anandalok Durgapur.`;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Anandalok_Volunteer_Certificate_${currentUser.name.replace(/\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                setShowCertificateModal(false);
              }}
              className="w-full py-3 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs hover:bg-amber-900 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Printable PDF Certificate</span>
            </button>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
