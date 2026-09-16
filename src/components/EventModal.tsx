import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Tag,
  Share2,
  Check,
  Edit3,
  Ticket,
  ExternalLink,
  Laptop,
  Utensils,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { CampusEvent } from '../types';

interface EventModalProps {
  event: CampusEvent | null;
  onClose: () => void;
  onToggleRsvp: (id: string) => void;
  onShareEvent?: (event: CampusEvent) => void;
  onEditEvent?: (event: CampusEvent) => void;
  onOpenRegister?: (event: CampusEvent) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onToggleRsvp,
  onShareEvent,
  onEditEvent,
  onOpenRegister,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-[#1E1929]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto">
      <div
        id="event-detail-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-[#ECE4F6] shadow-2xl shadow-purple-950/15 my-6 max-h-[90vh] flex flex-col"
      >
        {/* Top Banner */}
        <div className="p-6 pb-5 bg-gradient-to-br from-[#F5F0FD] via-[#F0E8FC] to-[#E8DCF9] border-b border-[#E3D9F3] relative shrink-0">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#524B62] hover:text-[#211B33] flex items-center justify-center transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-[#7033F5] shadow-xs">
              {event.societyAvatar || '🎓'} {event.society}
            </span>
            <span className="text-xs font-medium text-[#655E75] bg-white/70 px-2 py-0.5 rounded-full border border-purple-100">
              {event.category}
            </span>
            {event.isHost && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Crown className="w-3 h-3 text-amber-700" />
                <span>You are the Host</span>
              </span>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-[#211B33] leading-snug">
            {event.title}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Schedule & Location */}
          <div className="grid grid-cols-2 gap-3 bg-[#F9F7FD] p-3.5 rounded-2xl border border-[#EDE7F5]">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#7033F5] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-[#7A728B] font-medium">Date & Time</p>
                <p className="text-xs font-bold text-[#211B33]">{event.date}</p>
                <p className="text-[11px] text-[#554D66]">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#7033F5] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-[#7A728B] font-medium">Location</p>
                <p className="text-xs font-bold text-[#211B33] leading-tight">
                  {event.location}
                </p>
              </div>
            </div>
          </div>

          {/* RSVP STATUS SECTION - EXPLICIT GOING / NOT GOING */}
          <div className="p-4 rounded-2xl border border-[#E3D4F8] bg-gradient-to-r from-[#FAF8FE] to-[#F3ECFC] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#2F2644]">Your Attendance Status</span>
              {event.isRsvpd ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Going</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-[#706880] border border-[#DDD3F0]">
                  <span>Not Going</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#69607B]">
              {event.isRsvpd
                ? "You're registered for this event. You can change your status anytime without losing the event from your dashboard."
                : 'Click Going to reserve your place and add this session to your schedule.'}
            </p>

            {/* Going vs Not Going Segmented Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="modal-rsvp-going-btn"
                onClick={() => {
                  if (!event.isRsvpd) onToggleRsvp(event.id);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  event.isRsvpd
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-emerald-50 text-[#3F3750] border border-[#DDD3F0]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Going {event.isRsvpd ? '✓' : ''}</span>
              </button>

              <button
                id="modal-rsvp-notgoing-btn"
                onClick={() => {
                  if (event.isRsvpd) onToggleRsvp(event.id);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !event.isRsvpd
                    ? 'bg-[#605773] text-white shadow-sm'
                    : 'bg-white hover:bg-rose-50 text-[#6B617E] border border-[#DDD3F0]'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Not Going {!event.isRsvpd ? '✓' : ''}</span>
              </button>
            </div>
          </div>

          {/* Registration pass or external links */}
          {event.registrationType === 'form' && (
            <div className="p-3 bg-[#FAF8FE] border border-[#EDE4F6] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#7033F5]" />
                <div>
                  <p className="text-xs font-bold text-[#211B33]">Student Entry Ticket</p>
                  <p className="text-[10px] text-[#7A718D]">
                    {event.isRsvpd
                      ? `Ticket: ${event.userRegistration?.ticketId || 'UNIVIA-TKT-8842'}`
                      : 'Requires form registration'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenRegister) onOpenRegister(event);
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white shadow-xs"
              >
                {event.isRsvpd ? 'View Pass' : 'Register Now'}
              </button>
            </div>
          )}

          {event.registrationType === 'external' && event.registrationUrl && (
            <div className="p-3 bg-[#FAF8FE] border border-[#EDE4F6] rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#7033F5]" />
                <div>
                  <p className="text-xs font-bold text-[#211B33]">External Portal Registration</p>
                  <p className="text-[10px] text-[#7A718D]">Registration managed on external platform</p>
                </div>
              </div>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white flex items-center gap-1 shadow-xs"
              >
                <span>Portal Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* About This Event */}
          <div>
            <h4 className="text-xs font-bold text-[#3B344D] uppercase tracking-wider mb-1.5">
              About This Event
            </h4>
            <p className="text-xs sm:text-sm text-[#4A425B] leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Amenities & Highlights */}
          <div className="flex flex-wrap gap-2">
            {event.dietaryProvided && (
              <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                <span>Refreshments / Snacks Provided</span>
              </span>
            )}
            {event.requireLaptop && (
              <span className="text-xs px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-medium flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Bring Your Own Laptop</span>
              </span>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#3B344D] uppercase tracking-wider mb-2">
                Tags & Highlights
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F2EDFB] text-[#5A2FB5] font-medium border border-[#E3D9F5]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Stats */}
          <div className="p-3 bg-[#FCFBFE] border border-[#EDE7F5] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7033F5]" />
              <span className="text-xs font-semibold text-[#251F33]">
                {event.attendeesCount} Students Attending
              </span>
            </div>
            <span className="text-xs text-[#7A728B]">
              {event.maxAttendees ? `${event.maxAttendees - event.attendeesCount} spots remaining` : 'Open Entry'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF8FD] border-t border-[#EDE7F5] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Share Event Button */}
            <button
              onClick={() => {
                if (onShareEvent) onShareEvent(event);
              }}
              className="flex items-center gap-1.5 text-xs text-[#5527B8] bg-[#F3EEFA] hover:bg-[#EAE0F8] font-bold px-3 py-2 rounded-xl transition-colors border border-[#DDD0F4]"
            >
              <Share2 className="w-3.5 h-3.5 text-[#7033F5]" />
              <span>Share Event</span>
            </button>

            {/* Host Edit Option */}
            {event.isHost && onEditEvent && (
              <button
                onClick={() => onEditEvent(event)}
                className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100 hover:bg-amber-200 font-bold px-3 py-2 rounded-xl transition-colors border border-amber-300"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                <span>Edit as Host</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-[#5B536F] hover:text-[#211B33] font-semibold px-4 py-2 rounded-xl hover:bg-[#EFE8F9] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
