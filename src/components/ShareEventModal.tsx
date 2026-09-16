import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
  Mail,
  ExternalLink,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { CampusEvent } from '../types';

interface ShareEventModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBlurb, setCopiedBlurb] = useState(false);

  if (!isOpen || !event) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://univia.campus';
  const shareableUrl = `${origin}/#events?id=${event.id}`;

  const whatsappBlurb = `📢 *${event.title}*
🏛️ Organized by: ${event.society}
📅 Date & Time: ${event.date} • ${event.time}
📍 Venue: ${event.location}
🏷️ Category: ${event.category}

${event.description}

👉 Check details and RSVP on Univia:
${shareableUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyBlurb = async () => {
    try {
      await navigator.clipboard.writeText(whatsappBlurb);
      setCopiedBlurb(true);
      setTimeout(() => setCopiedBlurb(false), 2500);
    } catch {
      setCopiedBlurb(true);
      setTimeout(() => setCopiedBlurb(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappBlurb);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Campus Event: ${event.title}`);
    const body = encodeURIComponent(whatsappBlurb);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Attending "${event.title}" hosted by ${event.society} on Univia! 🎓\n${shareableUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="share-event-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="share-event-modal"
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-[#ECE4F6] shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F0EAF8] bg-gradient-to-r from-[#FAF8FE] via-[#F4EFFD] to-[#EAE0FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#7033F5] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#211B33]">Share Campus Event</h3>
              <p className="text-[11px] text-[#766E87]">Send invitation link to friends or student groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E768E] hover:text-[#211B33] hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Event Preview Card */}
          <div className="p-3.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE5F6] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7033F5]">
              <span>{event.societyAvatar || '🎓'}</span>
              <span>{event.society}</span>
            </div>
            <h4 className="text-sm font-bold text-[#211B33] leading-snug">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#625A75] pt-1">
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

          {/* Copy Link Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3B344D] block">Event Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-[#F9F7FD] border border-[#E3D9F3] rounded-xl text-[#4A435C] focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#7033F5] text-white hover:bg-[#5E22E2]'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Social Channels */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[#3B344D] block">Share via Apps</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs border border-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareEmail}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#7033F5]/10 hover:bg-[#7033F5]/20 text-[#7033F5] font-bold text-xs border border-[#7033F5]/30 transition-colors"
              >
                <Mail className="w-4 h-4 text-[#7033F5]" />
                <span>Email</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] font-bold text-xs border border-[#1DA1F2]/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#1DA1F2]" />
                <span>X / Twitter</span>
              </button>
            </div>
          </div>

          {/* Formatted WhatsApp Group Announcement Copy */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3B344D]">WhatsApp / Batch Group Message</label>
              <button
                onClick={handleCopyBlurb}
                className="text-[11px] font-bold text-[#7033F5] hover:underline flex items-center gap-1"
              >
                {copiedBlurb ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied text!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={3}
              value={whatsappBlurb}
              className="w-full p-2.5 text-[11px] font-mono bg-[#F9F7FD] border border-[#E3D9F3] rounded-xl text-[#524B63] focus:outline-none select-all leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8FD] border-t border-[#EDE7F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#F3EEFA] text-[#5527B8] border border-[#DDD0F4] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
