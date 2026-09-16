import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Check,
  X,
  Share2,
  Edit3,
  Ticket,
  ExternalLink,
  Laptop,
  Utensils,
  Crown,
} from 'lucide-react';
import { CampusEvent } from '../types';

interface EventCardProps {
  event: CampusEvent;
  onToggleRsvp: (id: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onShareEvent?: (event: CampusEvent) => void;
  onEditEvent?: (event: CampusEvent) => void;
  onOpenRegister?: (event: CampusEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onToggleRsvp,
  onSelectEvent,
  onShareEvent,
  onEditEvent,
  onOpenRegister,
}) => {
  return (
    <div
      id={`event-card-${event.id}`}
      className="bg-white rounded-2xl border border-[#EDE7F5] overflow-hidden hover:border-[#D9CBEF] transition-all duration-200 hover:shadow-md hover:shadow-purple-900/5 group flex flex-col justify-between"
    >
      <div>
        {/* Card Header Strip */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3EFF9] text-[#7033F5] border border-[#E4DAF3]">
              <span>{event.societyAvatar || '🎓'}</span>
              <span className="truncate max-w-[150px]">{event.society}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Approval Status Badge */}
              {event.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  <span>⏳ Pending Review</span>
                </span>
              )}
              {event.status === 'REJECTED' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300">
                  <span>Declined</span>
                </span>
              )}

              {event.isHost && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Host</span>
                </span>
              )}

              {/* Status Badge: Going vs Not Going */}
              {event.isRsvpd ? (
                <span
                  title="You are marked as Going"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Going</span>
                </span>
              ) : (
                <span
                  title="You have not RSVP'd"
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F6F3FA] text-[#7C748C] border border-[#ECE5F4]"
                >
                  Not Going
                </span>
              )}
            </div>
          </div>

          <h3
            onClick={() => onSelectEvent(event)}
            className="text-base font-bold text-[#211B33] group-hover:text-[#7033F5] transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {event.title}
          </h3>

          <p className="text-xs text-[#5C556D] mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Registration badges & feature chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {event.registrationType === 'form' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE4FA] text-[#5527B8] border border-[#DDD0F4] flex items-center gap-1">
                <Ticket className="w-3 h-3 text-[#7033F5]" />
                <span>Pass Required</span>
              </span>
            )}
            {event.registrationType === 'external' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE4FA] text-[#5527B8] border border-[#DDD0F4] flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-[#7033F5]" />
                <span>External Link</span>
              </span>
            )}
            {event.dietaryProvided && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Utensils className="w-2.5 h-2.5" />
                <span>Refreshments</span>
              </span>
            )}
            {event.requireLaptop && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                <Laptop className="w-2.5 h-2.5" />
                <span>Laptop</span>
              </span>
            )}
          </div>
        </div>

        {/* Metadata section */}
        <div className="px-5 py-2.5 space-y-1.5 text-xs text-[#524B62] border-t border-b border-[#F7F3FC] bg-[#FAFAFE]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#7033F5] shrink-0" />
            <span className="font-semibold text-[#2F293F]">{event.date}</span>
            <span className="text-[#8E869E]">•</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#7033F5] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3.5 px-4 flex flex-wrap items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-1.5 text-xs text-[#6B637B]">
          <Users className="w-3.5 h-3.5 text-[#867D97]" />
          <span className="font-semibold text-[#292338]">
            {event.attendeesCount}
          </span>
          <span className="text-[11px] text-[#7B738C]">
            {event.maxAttendees ? `/ ${event.maxAttendees} going` : 'going'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Share Button */}
          {onShareEvent && (
            <button
              onClick={() => onShareEvent(event)}
              title="Share event link or invitation"
              className="p-1.5 rounded-xl text-[#786F8A] hover:text-[#7033F5] hover:bg-[#F4EFFB] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Host Edit Button */}
          {event.isHost && onEditEvent && (
            <button
              onClick={() => onEditEvent(event)}
              title="Edit hosted event details"
              className="px-2 py-1 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}

          {/* Details / Pass Modal */}
          <button
            onClick={() => onSelectEvent(event)}
            className="text-xs text-[#7033F5] hover:text-[#521FB8] font-semibold px-2 py-1 rounded-xl hover:bg-[#F3EDFB] transition-colors"
          >
            Details
          </button>

          {/* Registration / RSVP Action */}
          {event.registrationType === 'form' ? (
            event.isRsvpd ? (
              <button
                onClick={() => {
                  if (onOpenRegister) onOpenRegister(event);
                  else onSelectEvent(event);
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center gap-1"
              >
                <Ticket className="w-3 h-3 text-emerald-600" />
                <span>Pass ✓</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenRegister) onOpenRegister(event);
                  else onSelectEvent(event);
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] shadow-xs hover:shadow-sm transition-all flex items-center gap-1"
              >
                <Ticket className="w-3 h-3" />
                <span>Register</span>
              </button>
            )
          ) : (
            /* Standard RSVP: Going vs Not Going toggle */
            <div className="inline-flex rounded-xl border border-[#E2D6F5] p-0.5 bg-[#FAF8FE]">
              <button
                id={`rsvp-btn-going-${event.id}`}
                onClick={() => {
                  if (!event.isRsvpd) onToggleRsvp(event.id);
                }}
                title={event.isRsvpd ? 'You are going' : 'Mark as Going'}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  event.isRsvpd
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-[#695F7D] hover:text-emerald-700 hover:bg-white'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Going</span>
              </button>
              <button
                id={`rsvp-btn-notgoing-${event.id}`}
                onClick={() => {
                  if (event.isRsvpd) onToggleRsvp(event.id);
                }}
                title={!event.isRsvpd ? 'You are not going' : 'Mark as Not Going'}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  !event.isRsvpd
                    ? 'bg-[#6D657D] text-white shadow-2xs'
                    : 'text-[#7A718C] hover:text-[#211B33] hover:bg-white'
                }`}
              >
                <X className="w-3 h-3" />
                <span>Not Going</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
