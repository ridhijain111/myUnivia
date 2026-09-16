import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Filter,
  Plus,
  Check,
  X,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Ticket,
  Share2,
  Edit3,
  ExternalLink,
  Laptop,
  Utensils,
  Crown,
  ShieldCheck,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Tag,
} from 'lucide-react';
import { CampusEvent, EventRegistrationData, UserProfile } from '../../types';
import { EventCard } from '../EventCard';
import { ShareEventModal } from '../ShareEventModal';
import { RegistrationModal } from '../RegistrationModal';
import { EditEventModal } from '../EditEventModal';

interface EventsViewProps {
  events: CampusEvent[];
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  onToggleRsvp: (id: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
  onAddEvent: (newEvent: Omit<CampusEvent, 'id' | 'attendeesCount' | 'isRsvpd'>) => void;
  onEditEvent?: (updatedEvent: CampusEvent) => void;
  onRegisterSubmit?: (eventId: string, regData: EventRegistrationData) => void;
  onCancelRegistration?: (eventId: string) => void;
  currentUser?: UserProfile;
  onReviewEvent?: (eventId: string, decision: 'APPROVED' | 'REJECTED', feedback?: string) => void;
  onPromptLogin?: () => void;
}

const AVAILABLE_SOCIETIES = [
  'Tech & Innovation Collective',
  'AssetMerkle Tech',
  'TechNeeds Society',
  'TEDx Campus',
  'ACM Student Chapter',
  'CSI Student Branch',
  'Hypnotics Dance Society',
  'Aaveg Dramatics Society',
  'Lean In Circle',
  'Tarannum Music Society',
];

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  searchQuery = '',
  onSearchQueryChange,
  onToggleRsvp,
  onSelectEvent,
  onAddEvent,
  onEditEvent,
  onRegisterSubmit,
  onCancelRegistration,
  currentUser,
  onReviewEvent,
  onPromptLogin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'going' | 'not_going' | 'hosted' | 'admin_queue'>('all');
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [guestPromptModal, setGuestPromptModal] = useState<boolean>(false);

  // Modals state
  const [sharingEvent, setSharingEvent] = useState<CampusEvent | null>(null);
  const [registeringEvent, setRegisteringEvent] = useState<CampusEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);

  // Reject reason modal
  const [rejectingEventId, setRejectingEventId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Sync external search query with local state
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  // New Event Proposal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSociety, setNewSociety] = useState('AssetMerkle Tech');
  const [newTaggedSocieties, setNewTaggedSocieties] = useState<string[]>(['TechNeeds Society']);
  const [newDate, setNewDate] = useState('Friday, Nov 14');
  const [newTime, setNewTime] = useState('4:30 PM - 6:30 PM');
  const [newLocation, setNewLocation] = useState('Auditorium Hall 2');
  const [newCategory, setNewCategory] = useState<CampusEvent['category']>('Tech & Innovation');
  const [newDescription, setNewDescription] = useState('');
  const [newMaxAttendees, setNewMaxAttendees] = useState(120);
  const [newRegType, setNewRegType] = useState<CampusEvent['registrationType']>('form');
  const [newRegUrl, setNewRegUrl] = useState('');
  const [newRegDeadline, setNewRegDeadline] = useState('Nov 13, 11:59 PM');
  const [newRequireLaptop, setNewRequireLaptop] = useState(false);
  const [newDietaryProvided, setNewDietaryProvided] = useState(true);

  const categories = [
    'All',
    'Tech & Innovation',
    'Social',
    'Arts & Culture',
    'Academic & Career',
    'Wellness & Sports',
  ];

  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.email === 'ridhijain235@gmail.com';
  const isGuest = Boolean(currentUser?.isGuest);

  // Count pending events
  const pendingEvents = events.filter((e) => e.status === 'PENDING');
  const pendingCount = pendingEvents.length;

  // Toggle tagged societies
  const toggleTaggedSociety = (soc: string) => {
    if (newTaggedSocieties.includes(soc)) {
      setNewTaggedSocieties(newTaggedSocieties.filter((s) => s !== soc));
    } else {
      setNewTaggedSocieties([...newTaggedSocieties, soc]);
    }
  };

  // Open Create Modal (or Guest Prompt)
  const handleOpenHostModal = () => {
    if (isGuest) {
      if (onPromptLogin) {
        onPromptLogin();
      } else {
        setGuestPromptModal(true);
      }
      return;
    }
    setShowCreateModal(true);
  };

  // RSVP check for guests
  const handleCardToggleRsvp = (id: string) => {
    if (isGuest) {
      if (onPromptLogin) onPromptLogin();
      else setGuestPromptModal(true);
      return;
    }
    onToggleRsvp(id);
  };

  // Filter Logic
  const activeSearch = (localSearch || searchQuery).trim().toLowerCase();

  const filteredEvents = events.filter((e) => {
    // If Guest: only APPROVED events
    if (isGuest && e.status !== 'APPROVED') {
      return false;
    }

    // Admin Queue Filter
    if (rsvpFilter === 'admin_queue') {
      return e.status === 'PENDING';
    }

    // Category match
    const matchesCategory =
      selectedCategory === 'All' || e.category === selectedCategory;

    // RSVP Status filter:
    let matchesRsvp = true;
    if (rsvpFilter === 'going') matchesRsvp = e.isRsvpd;
    else if (rsvpFilter === 'not_going') matchesRsvp = !e.isRsvpd;
    else if (rsvpFilter === 'hosted') {
      matchesRsvp =
        Boolean(e.isHost) ||
        (Boolean(currentUser?.campusCardId) &&
          e.proposedBy?.studentId === currentUser?.campusCardId);
    }

    // Normal non-admin view: hide rejected events, and hide pending events unless student is the host
    if (!isSuperAdmin && rsvpFilter !== 'hosted') {
      if (e.status === 'REJECTED') return false;
      if (e.status === 'PENDING') {
        const isMine =
          Boolean(e.isHost) ||
          (Boolean(currentUser?.campusCardId) &&
            e.proposedBy?.studentId === currentUser?.campusCardId);
        if (!isMine) return false;
      }
    }

    // Search match
    let matchesSearch = true;
    if (activeSearch) {
      matchesSearch =
        e.title.toLowerCase().includes(activeSearch) ||
        e.society.toLowerCase().includes(activeSearch) ||
        e.location.toLowerCase().includes(activeSearch) ||
        e.description.toLowerCase().includes(activeSearch) ||
        (e.tags && e.tags.some((t) => t.toLowerCase().includes(activeSearch)));
    }

    return matchesCategory && matchesRsvp && matchesSearch;
  });

  // Submit New Proposal
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle.trim(),
      society: newSociety.trim(),
      societyAvatar: '⚡',
      date: newDate.trim(),
      time: newTime.trim(),
      location: newLocation.trim(),
      category: newCategory,
      imageColor: 'from-[#7033F5] to-[#9857FF]',
      tags: ['Student Proposed', newSociety.split(' ')[0], ...newTaggedSocieties],
      description:
        newDescription.trim() ||
        'Campus event proposed by student organizers awaiting administrative endorsement.',
      maxAttendees: Number(newMaxAttendees) || 100,
      isHost: true,
      registrationType: newRegType,
      registrationUrl: newRegUrl.trim() || undefined,
      registrationDeadline: newRegDeadline.trim() || undefined,
      requireLaptop: newRequireLaptop,
      dietaryProvided: newDietaryProvided,
      status: 'PENDING',
      taggedSocieties: [newSociety, ...newTaggedSocieties],
      proposedBy: currentUser
        ? {
            name: currentUser.name,
            studentId: currentUser.campusCardId,
            avatar: currentUser.avatar,
          }
        : undefined,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const hostedCount = events.filter(
    (e) =>
      e.isHost ||
      (Boolean(currentUser?.campusCardId) &&
        e.proposedBy?.studentId === currentUser?.campusCardId)
  ).length;
  const goingCount = events.filter((e) => e.isRsvpd).length;

  return (
    <div
      id="univia-events-view"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Super Admin Top Notice / Action Banner */}
      {isSuperAdmin && pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EDE4FA] to-[#FAF6FE] border-2 border-[#7033F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7033F5] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-[#211B33]">
                Super Admin Console • {pendingCount} Event Proposal{pendingCount > 1 ? 's' : ''} Awaiting Endorsement
              </p>
              <p className="text-[11px] text-[#695F7B]">
                Student event submissions have been routed to tagged societies and synced to your review queue.
              </p>
            </div>
          </div>
          <button
            id="btn-admin-review-queue"
            onClick={() => setRsvpFilter('admin_queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              rsvpFilter === 'admin_queue'
                ? 'bg-[#7033F5] text-white shadow-xs'
                : 'bg-white hover:bg-[#F3EDFB] text-[#7033F5] border border-[#D7C7F2]'
            }`}
          >
            <span>Review Proposals ({pendingCount})</span>
          </button>
        </div>
      )}

      {/* Guest Mode Notice */}
      {isGuest && (
        <div className="p-3.5 rounded-2xl bg-[#FAF8FE] border border-[#E4D7F5] flex items-center justify-between text-xs text-[#5D546F]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>
              <strong>Guest Mode Active:</strong> You are viewing approved public workshops and campus events in read-only mode.
            </span>
          </div>
          <button
            onClick={onPromptLogin}
            className="text-[11px] font-bold text-[#7033F5] hover:underline shrink-0"
          >
            Sign In for Full Access & RSVPs →
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#211B33]">Campus Events</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFEBFA] text-[#7033F5] border border-[#DDD0F4]">
              {events.filter((e) => e.status === 'APPROVED').length} Live
            </span>
            {pendingCount > 0 && isSuperAdmin && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#766E87] mt-1">
            Discover workshops, society mixers, hackathons, and guest lectures across the university.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="host-event-btn"
            onClick={handleOpenHostModal}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#7033F5] text-white hover:bg-[#5E22E2] transition-colors shadow-sm shadow-[#7033F5]/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Host or Propose Event</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE7F5] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Integrated Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#9186A4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="events-search-bar"
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title, society, venue, topics..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8FE] border border-[#E7DDF4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7033F5]/20 focus:border-[#7033F5] text-[#211B33]"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E869E] hover:text-[#211B33] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F5F1FB] p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setRsvpFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                rsvpFilter === 'all'
                  ? 'bg-white text-[#7033F5] shadow-2xs'
                  : 'text-[#675F79] hover:text-[#211B33]'
              }`}
            >
              All Events
            </button>

            {!isGuest && (
              <>
                <button
                  onClick={() => setRsvpFilter('going')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    rsvpFilter === 'going'
                      ? 'bg-white text-[#7033F5] shadow-2xs'
                      : 'text-[#675F79] hover:text-[#211B33]'
                  }`}
                >
                  Going ({goingCount})
                </button>
                <button
                  onClick={() => setRsvpFilter('hosted')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    rsvpFilter === 'hosted'
                      ? 'bg-white text-[#7033F5] shadow-2xs'
                      : 'text-[#675F79] hover:text-[#211B33]'
                  }`}
                >
                  My Proposals ({hostedCount})
                </button>
              </>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => setRsvpFilter('admin_queue')}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  rsvpFilter === 'admin_queue'
                    ? 'bg-[#7033F5] text-white shadow-2xs'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Queue ({pendingCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#7033F5] text-white'
                  : 'bg-[#F9F6FD] text-[#69607B] hover:bg-[#F2ECFA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SPECIAL VIEW: ADMIN APPROVAL QUEUE (When active) */}
      {rsvpFilter === 'admin_queue' ? (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#EDE4F6] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#211B33] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7033F5]" />
                <span>Super Admin Endorsement Dashboard</span>
              </h2>
              <p className="text-xs text-[#716885]">
                Review student event submissions. Approving will publish the event to the campus timeline and notify tagged societies.
              </p>
            </div>
            <span className="text-xs font-bold text-[#7033F5] bg-[#F2EDFB] px-3 py-1 rounded-xl">
              {pendingCount} Pending Review
            </span>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EDE4F6] space-y-2">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-[#211B33]">All caught up!</p>
              <p className="text-xs text-[#786F8A]">
                No pending event proposals awaiting administrative review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border-2 border-[#E3D6F5] p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>PENDING REVIEW</span>
                      </span>
                      <span className="text-xs text-[#7B728D] font-medium">
                        ID: {event.id}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#211B33]">
                        {event.title}
                      </h3>
                      <p className="text-xs text-[#69607B] mt-1 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Proposer Info */}
                    {event.proposedBy && (
                      <div className="p-2.5 bg-[#FAF7FE] rounded-xl border border-[#EDE3F8] flex items-center gap-2.5">
                        {event.proposedBy.avatar?.trim() && !event.proposedBy.avatar.includes('unsplash') ? (
                          <img
                            src={event.proposedBy.avatar}
                            alt={event.proposedBy.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#DCCDF4]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#EDE4FA] border border-[#DCCDF4] flex items-center justify-center text-xs font-bold text-[#7033F5]">
                            {event.proposedBy.name ? event.proposedBy.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#211B33] truncate">
                            Proposed by: {event.proposedBy.name}
                          </p>
                          <p className="text-[10px] text-[#716884] truncate">
                            Student ID: {event.proposedBy.studentId}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tagged Societies */}
                    {event.taggedSocieties && event.taggedSocieties.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-[#4B435C] mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#7033F5]" />
                          <span>Tagged Societies (Notified):</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {event.taggedSocieties.map((soc, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EDE4FA] text-[#5527B8]"
                            >
                              {soc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event Logistics */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#524A63] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#7033F5]" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7033F5]" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#7033F5]" />
                        <span>Capacity: {event.maxAttendees}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Actions */}
                  <div className="pt-4 border-t border-[#F0EAF8] flex items-center gap-2">
                    <button
                      onClick={() => onReviewEvent && onReviewEvent(event.id, 'APPROVED')}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Approve & Broadcast Live</span>
                    </button>
                    <button
                      onClick={() => setRejectingEventId(event.id)}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E3D6F6] space-y-3">
          <CalendarDays className="w-12 h-12 text-[#7033F5] mx-auto p-2.5 bg-[#F4EFFB] rounded-2xl" />
          <h3 className="text-base font-extrabold text-[#261E37]">No Campus Events Scheduled Yet</h3>
          <p className="text-xs text-[#7B728D] max-w-md mx-auto">
            Welcome to Univia! As a society lead or student host, you can propose and publish the first campus workshop, hackathon, or meetup.
          </p>
          <button
            onClick={() => {
              if (isGuest) {
                if (onPromptLogin) onPromptLogin();
                else setGuestPromptModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Host / Propose Event</span>
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E3D6F6] space-y-3">
          <CalendarDays className="w-10 h-10 text-[#B0A6C3] mx-auto" />
          <h3 className="text-sm font-extrabold text-[#261E37]">No events match your criteria</h3>
          <p className="text-xs text-[#7B728D] max-w-md mx-auto">
            Try resetting your filters or search keywords to view upcoming events.
          </p>
          <button
            onClick={() => {
              handleSearchChange('');
              setSelectedCategory('All');
              setRsvpFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs"
          >
            Show All Events
          </button>
        </div>
      ) : (
        /* STANDARD EVENTS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggleRsvp={handleCardToggleRsvp}
              onSelectEvent={onSelectEvent}
              onShareEvent={(evt) => setSharingEvent(evt)}
              onEditEvent={(evt) => setEditingEvent(evt)}
              onOpenRegister={(evt) => {
                if (isGuest) {
                  if (onPromptLogin) onPromptLogin();
                  else setGuestPromptModal(true);
                  return;
                }
                setRegisteringEvent(evt);
              }}
            />
          ))}
        </div>
      )}

      {/* PROPOSE / HOST EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto border border-[#EBE1F6] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAF8]">
              <div>
                <h3 className="text-lg font-extrabold text-[#211B33]">
                  Host / Propose Campus Event
                </h3>
                <p className="text-xs text-[#766E87]">
                  Event status will be set to PENDING and automatically routed to tagged societies and the Super Admin.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-[#766E87] hover:bg-[#F2EDFB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ROUTING PROTOCOL NOTICE BANNER */}
            <div className="p-3 bg-[#FAF7FE] rounded-2xl border border-[#E5D7F6] text-xs text-[#524866] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#7033F5]">
                <Sparkles className="w-4 h-4" />
                <span>Automated Society & Super Admin Routing Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                When you submit, this proposal will be created with status <strong>PENDING</strong>. A payload notification will instantly route to the tagged society leads and Super Admin Ridhi Jain for public timeline approval.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#3B344D] mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hands-On Generative AI Workshop 2026"
                  className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Primary Host Society</label>
                  <select
                    value={newSociety}
                    onChange={(e) => setNewSociety(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl text-[#211B33]"
                  >
                    {AVAILABLE_SOCIETIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CampusEvent['category'])}
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl text-[#211B33]"
                  >
                    <option value="Tech & Innovation">Tech & Innovation</option>
                    <option value="Social">Social</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Academic & Career">Academic & Career</option>
                    <option value="Wellness & Sports">Wellness & Sports</option>
                  </select>
                </div>
              </div>

              {/* Tagged Societies Selector */}
              <div>
                <label className="block font-bold text-[#3B344D] mb-1">
                  Tag Co-Host Societies for Review & Routing:
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#FAF8FE] rounded-xl border border-[#E5DBF3]">
                  {AVAILABLE_SOCIETIES.filter((s) => s !== newSociety).map((soc) => (
                    <button
                      key={soc}
                      type="button"
                      onClick={() => toggleTaggedSociety(soc)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        newTaggedSocieties.includes(soc)
                          ? 'bg-[#7033F5] text-white'
                          : 'bg-white text-[#5F5672] border border-[#E3D8F2]'
                      }`}
                    >
                      {newTaggedSocieties.includes(soc) && <Check className="w-3 h-3" />}
                      <span>{soc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="e.g. Friday, Nov 14"
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 4:00 PM - 6:30 PM"
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Venue / Location</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Auditorium Hall 2"
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3B344D] mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={newMaxAttendees}
                    onChange={(e) => setNewMaxAttendees(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3B344D] mb-1">Description & Agenda</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline the event objectives, speaker credentials, and prerequisites..."
                  className="w-full p-2.5 bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0EAF8]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-[#726985] hover:bg-[#F4EFFB] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#7033F5] text-white font-extrabold hover:bg-[#5E22E2] shadow-sm flex items-center gap-2"
                >
                  <span>Propose Event (Status: PENDING)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT PROPOSAL REASON MODAL */}
      {rejectingEventId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EAE0F7] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#211B33]">Decline Event Proposal</h3>
            <p className="text-xs text-[#716885]">
              Provide feedback for the student organizer explaining what needs improvement before resubmission.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please confirm venue availability with Dean of Student Affairs first."
              className="w-full p-2.5 text-xs bg-[#FAF8FE] border border-[#E5DBF3] rounded-xl"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEventId(null)}
                className="px-3 py-2 rounded-xl text-xs text-[#716885] hover:bg-[#F3EDFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onReviewEvent && rejectingEventId) {
                    onReviewEvent(rejectingEventId, 'REJECTED', rejectReason);
                  }
                  setRejectingEventId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GUEST RESTRICTION POPUP */}
      {guestPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#EAE0F7] shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE4FA] text-[#7033F5] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#211B33]">Student Verification Required</h3>
              <p className="text-xs text-[#716885] mt-1">
                You are currently exploring Univia in Guest Mode (Read-Only). Event RSVPs and hosting require signing in with your student credentials.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setGuestPromptModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs text-[#716885] bg-[#F5EFFB] font-bold"
              >
                Continue as Guest
              </button>
              <button
                onClick={() => {
                  setGuestPromptModal(false);
                  if (onPromptLogin) onPromptLogin();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs text-white bg-[#7033F5] font-extrabold shadow-xs"
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      <ShareEventModal
        event={sharingEvent}
        isOpen={Boolean(sharingEvent)}
        onClose={() => setSharingEvent(null)}
      />

      <RegistrationModal
        event={registeringEvent}
        isOpen={Boolean(registeringEvent)}
        onClose={() => setRegisteringEvent(null)}
        onRegisterSubmit={onRegisterSubmit || (() => {})}
        onCancelRegistration={onCancelRegistration || (() => {})}
      />

      <EditEventModal
        event={editingEvent}
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onSaveEvent={onEditEvent || (() => {})}
      />
    </div>
  );
};
