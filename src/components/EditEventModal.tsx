import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Save,
  FileText,
  Laptop,
  Utensils,
  Globe,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { CampusEvent } from '../types';

interface EditEventModalProps {
  event: CampusEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (updatedEvent: CampusEvent) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSaveEvent,
}) => {
  const [title, setTitle] = useState('');
  const [society, setSociety] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CampusEvent['category']>('Tech & Innovation');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [maxAttendees, setMaxAttendees] = useState(100);
  const [registrationType, setRegistrationType] = useState<CampusEvent['registrationType']>('open_rsvp');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [requireLaptop, setRequireLaptop] = useState(false);
  const [dietaryProvided, setDietaryProvided] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setSociety(event.society || '');
      setDate(event.date || '');
      setTime(event.time || '');
      setLocation(event.location || '');
      setCategory(event.category || 'Tech & Innovation');
      setDescription(event.description || '');
      setTagsInput((event.tags || []).join(', '));
      setMaxAttendees(event.maxAttendees || 100);
      setRegistrationType(event.registrationType || 'open_rsvp');
      setRegistrationUrl(event.registrationUrl || '');
      setRegistrationDeadline(event.registrationDeadline || '');
      setRequireLaptop(Boolean(event.requireLaptop));
      setDietaryProvided(Boolean(event.dietaryProvided));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: CampusEvent = {
      ...event,
      title: title.trim(),
      society: society.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      category,
      description: description.trim(),
      tags: parsedTags.length > 0 ? parsedTags : event.tags,
      maxAttendees: Number(maxAttendees) || 100,
      registrationType,
      registrationUrl: registrationUrl.trim() || undefined,
      registrationDeadline: registrationDeadline.trim() || undefined,
      requireLaptop,
      dietaryProvided,
      isHost: true,
    };

    onSaveEvent(updated);
    onClose();
  };

  return (
    <div
      id="edit-event-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        id="edit-event-modal"
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden border border-[#ECE4F6] shadow-2xl animate-in zoom-in-95 duration-150 my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F0EAF8] bg-gradient-to-r from-[#FAF8FE] via-[#F4EFFD] to-[#EDE3FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7033F5] text-white flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#211B33]">Edit Hosted Event</h3>
              <p className="text-[11px] text-[#766E87]">
                Update details, registration rules, or venue for your campus event
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E768E] hover:text-[#211B33] hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B344D] block">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Campus Hackathon & Demo Day"
              className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
            />
          </div>

          {/* Society / Host Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] block">
                Hosting Society / Club <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={society}
                onChange={(e) => setSociety(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CampusEvent['category'])}
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              >
                <option value="Tech & Innovation">Tech & Innovation</option>
                <option value="Social">Social</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Academic & Career">Academic & Career</option>
                <option value="Wellness & Sports">Wellness & Sports</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#7033F5]" />
                <span>Date</span>
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., Friday, Oct 24 or Today, Oct 21"
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                <span>Time</span>
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 4:00 PM - 6:30 PM"
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              />
            </div>
          </div>

          {/* Location & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#7033F5]" />
                <span>Venue / Room / Link</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Auditorium Hall 2 or Discord"
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#7033F5]" />
                <span>Max Capacity (Seats)</span>
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
              />
            </div>
          </div>

          {/* REGISTRATION OPTIONS SECTION */}
          <div className="p-4 bg-[#FAF8FE] rounded-2xl border border-[#EDE4F6] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#211B33]">
                Event Registration Options
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#7033F5] border border-[#DCBFFB]">
                Host Controls
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRegistrationType('open_rsvp')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  registrationType === 'open_rsvp'
                    ? 'bg-[#7033F5] text-white border-[#7033F5] shadow-xs'
                    : 'bg-white text-[#4A4259] border-[#E5DBF5] hover:bg-[#F6F2FD]'
                }`}
              >
                <p className="text-xs font-bold">1-Click RSVP</p>
                <p className={`text-[10px] ${registrationType === 'open_rsvp' ? 'text-white/80' : 'text-[#7F7690]'}`}>
                  Open campus entry
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRegistrationType('form')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  registrationType === 'form'
                    ? 'bg-[#7033F5] text-white border-[#7033F5] shadow-xs'
                    : 'bg-white text-[#4A4259] border-[#E5DBF5] hover:bg-[#F6F2FD]'
                }`}
              >
                <p className="text-xs font-bold">In-App Pass Form</p>
                <p className={`text-[10px] ${registrationType === 'form' ? 'text-white/80' : 'text-[#7F7690]'}`}>
                  Generates QR student pass
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRegistrationType('external')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  registrationType === 'external'
                    ? 'bg-[#7033F5] text-white border-[#7033F5] shadow-xs'
                    : 'bg-white text-[#4A4259] border-[#E5DBF5] hover:bg-[#F6F2FD]'
                }`}
              >
                <p className="text-xs font-bold">External Portal</p>
                <p className={`text-[10px] ${registrationType === 'external' ? 'text-white/80' : 'text-[#7F7690]'}`}>
                  Devfolio, Unstop, etc.
                </p>
              </button>
            </div>

            {registrationType === 'external' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#3B344D]">
                  External Registration Link (URL)
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://devfolio.co/your-event or Google Form"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#3B344D]">
                  Registration Deadline (Optional)
                </label>
                <input
                  type="text"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  placeholder="e.g., Oct 23 at 11:59 PM"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
                />
              </div>

              {/* Requirement Checkboxes */}
              <div className="flex flex-col justify-center space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#3E374F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireLaptop}
                    onChange={(e) => setRequireLaptop(e.target.checked)}
                    className="w-4 h-4 accent-[#7033F5] rounded"
                  />
                  <span>Attendees must bring laptop</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#3E374F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dietaryProvided}
                    onChange={(e) => setDietaryProvided(e.target.checked)}
                    className="w-4 h-4 accent-[#7033F5] rounded"
                  />
                  <span>Snacks / Refreshments Provided</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B344D] block">
              Event Description & Agenda
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will freshers and students learn? Any speaker announcements?"
              className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3B344D] flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#7033F5]" />
              <span>Tags (comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., Web3, Python, Keynote, Swags"
              className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E2D8F2] rounded-xl text-[#211B33] focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#F0EAF8] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F5F0FB] text-[#5527B8] hover:bg-[#EFE7F8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white shadow-md shadow-[#7033F5]/25 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
