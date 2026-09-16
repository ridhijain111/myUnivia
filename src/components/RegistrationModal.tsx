import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Laptop,
  Utensils,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Download,
  Trash2,
} from 'lucide-react';
import { CampusEvent, EventRegistrationData, UserProfile } from '../types';

interface RegistrationModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterSubmit: (eventId: string, regData: EventRegistrationData) => void;
  onCancelRegistration: (eventId: string) => void;
  currentUser?: UserProfile;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterSubmit,
  onCancelRegistration,
  currentUser,
}) => {
  const [studentName, setStudentName] = useState(currentUser?.name || '');
  const [rollNo, setRollNo] = useState(currentUser?.campusCardId || currentUser?.studentId || '');
  const [branchYear, setBranchYear] = useState(
    currentUser?.classYear && currentUser?.major
      ? `${currentUser.classYear} • ${currentUser.major}`
      : (currentUser?.classYear || currentUser?.major || '')
  );
  const [dietary, setDietary] = useState<'Vegetarian' | 'Non-Vegetarian' | 'Jain' | 'No Preference'>('Vegetarian');
  const [needsLaptopLoan, setNeedsLaptopLoan] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStudentName(currentUser?.name || '');
      setRollNo(currentUser?.campusCardId || currentUser?.studentId || '');
      setBranchYear(
        currentUser?.classYear && currentUser?.major
          ? `${currentUser.classYear} • ${currentUser.major}`
          : (currentUser?.classYear || currentUser?.major || '')
      );
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !event) return null;

  const isAlreadyRegistered = Boolean(event.isRsvpd || event.userRegistration);
  const spotsLeft = event.maxAttendees ? Math.max(0, event.maxAttendees - event.attendeesCount) : 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticketNumber = `UNIVIA-TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const regData: EventRegistrationData = {
      ticketId: event.userRegistration?.ticketId || ticketNumber,
      registeredAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      studentName: studentName.trim() || currentUser?.name || 'Student',
      rollNo: rollNo.trim() || currentUser?.campusCardId || currentUser?.studentId || '',
      branchYear: branchYear.trim() || currentUser?.classYear || '',
      dietaryPreference: dietary,
      needsLaptopLoan,
      additionalNotes: notes.trim(),
    };

    setTimeout(() => {
      onRegisterSubmit(event.id, regData);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div
      id="event-registration-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="event-registration-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-[#EDE5F6] shadow-2xl animate-in zoom-in-95 duration-150 my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EFE7F8] bg-gradient-to-r from-[#FAF8FE] via-[#F4EFFD] to-[#EDE3FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7033F5] text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#211B33]">
                {isAlreadyRegistered ? 'Your Event Entry Pass' : 'Event Registration'}
              </h3>
              <p className="text-[11px] text-[#786F8A]">
                {isAlreadyRegistered
                  ? 'Confirmed Univia Digital Student Pass'
                  : 'Complete your registration to secure your seat'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7A728A] hover:text-[#211B33] hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Event Mini Details */}
          <div className="p-4 bg-[#FAF8FE] rounded-2xl border border-[#ECE2F6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7033F5] flex items-center gap-1.5">
                <span>{event.societyAvatar || '⚡'}</span>
                <span>{event.society}</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#DDD1F3] text-[#5527B8]">
                {spotsLeft} seats remaining
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#211B33] leading-snug">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#635A77] pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#7033F5]" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7033F5]" />
                {event.location}
              </span>
            </div>
          </div>

          {/* If External Registration */}
          {event.registrationType === 'external' && !isAlreadyRegistered && (
            <div className="p-4 rounded-2xl bg-[#F6F1FE] border border-[#DCBFFB] space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#7033F5]/10 text-[#7033F5] mx-auto flex items-center justify-center">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-extrabold text-[#211B33]">External Portal Registration</h5>
                <p className="text-[11px] text-[#6E6482] mt-0.5">
                  This flagship event registration is handled via the partner portal (Devfolio/Unstop).
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={event.registrationUrl || 'https://devfolio.co'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Open Registration Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8C7F3] text-[#5527B8] hover:bg-[#FAF8FE]"
                >
                  Mark as Registered on Univia
                </button>
              </div>
            </div>
          )}

          {/* Already registered state: Show Digital Student Ticket / Pass */}
          {isAlreadyRegistered ? (
            <div className="space-y-4">
              {/* Digital Pass Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#FAF7FE] via-[#F3ECFD] to-[#E9DCFA] p-5 border border-[#DCBFFB] shadow-md space-y-4 overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#7033F5]/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-[#E0D0F7] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#7033F5]" />
                    <span className="text-xs font-black text-[#5527B8] uppercase tracking-wider">
                      Confirmed Student Pass
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-[#7033F5] border border-[#D5C1F5] shadow-2xs">
                    {event.userRegistration?.ticketId || 'UNIVIA-TKT-8842'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#7E7492] uppercase block">Attendee</span>
                    <p className="font-bold text-[#211B33]">
                      {event.userRegistration?.studentName || currentUser?.name || 'Student'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7E7492] uppercase block">Student ID</span>
                    <p className="font-mono font-bold text-[#211B33]">
                      {event.userRegistration?.rollNo || currentUser?.campusCardId || currentUser?.studentId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7E7492] uppercase block">Branch & Class</span>
                    <p className="font-medium text-[#443D55] truncate">
                      {event.userRegistration?.branchYear || currentUser?.classYear || currentUser?.major || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7E7492] uppercase block">Dietary Choice</span>
                    <p className="font-medium text-[#443D55]">
                      {event.userRegistration?.dietaryPreference || 'Vegetarian'}
                    </p>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div className="p-3 bg-white rounded-2xl border border-[#E1D2F6] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F6F2FD] rounded-xl border border-[#E3D4F8]">
                      <QrCode className="w-9 h-9 text-[#7033F5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#211B33]">Scan at Venue Gate</p>
                      <p className="text-[10px] text-[#7B718F]">Present this QR code on arrival</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid Pass</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    window.print?.();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F4EFFC] text-[#5527B8] hover:bg-[#EAE1F9] border border-[#DDD1F3] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pass</span>
                </button>

                <button
                  onClick={() => {
                    onCancelRegistration(event.id);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Registration</span>
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            event.registrationType !== 'external' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3B344D] block">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3B344D] block">
                      Roll Number / ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B344D] block">
                    Branch & Year
                  </label>
                  <input
                    type="text"
                    value={branchYear}
                    onChange={(e) => setBranchYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                  />
                </div>

                {/* Dietary Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#7033F5]" />
                    <span>Dietary Preference (Refreshments)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Vegetarian', 'Non-Vegetarian', 'Jain', 'No Preference'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDietary(opt)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          dietary === opt
                            ? 'bg-[#7033F5] text-white border-[#7033F5]'
                            : 'bg-[#FAF8FE] text-[#554D66] border-[#E5DBF5] hover:bg-[#F3EDFB]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Laptop needed toggle */}
                {event.requireLaptop && (
                  <div className="p-3 bg-[#FAF8FE] rounded-xl border border-[#EDE4F6] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-[#7033F5]" />
                      <div>
                        <p className="text-xs font-bold text-[#211B33]">Need Lab Laptop Loan?</p>
                        <p className="text-[10px] text-[#7A718C]">Device will be reserved at the venue lab</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={needsLaptopLoan}
                      onChange={(e) => setNeedsLaptopLoan(e.target.checked)}
                      className="w-4 h-4 accent-[#7033F5] rounded"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3B344D] block">
                    Special Inquiries or Questions for Speakers (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Any prerequisites or software to install?"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                  />
                </div>

                {/* Notice */}
                <div className="flex items-start gap-2 text-[11px] text-[#786F8A] bg-[#F7F4FD] p-2.5 rounded-xl border border-[#EDE4F6]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#7033F5] shrink-0 mt-0.5" />
                  <span>By registering, you commit to attending. If your schedule changes, you can cancel anytime to free up the seat for waitlisted freshers.</span>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F0FB] text-[#5527B8] hover:bg-[#EFE7F8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white shadow-md shadow-[#7033F5]/25 transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Generating Pass...</span>
                    ) : (
                      <>
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Confirm Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};
