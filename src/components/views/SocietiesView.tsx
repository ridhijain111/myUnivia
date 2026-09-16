import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Check,
  Plus,
  MessageSquare,
  Calendar,
  MapPin,
  Sparkles,
  X,
  Filter,
  Building,
  Mail,
  Phone,
  Globe,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Society, NavTab } from '../../types';
import { createSocietyApi } from '../../services/societyApiService';

interface SocietiesViewProps {
  societies: Society[];
  onToggleJoinSociety: (id: string) => void;
  onSelectTab: (tab: NavTab) => void;
  onNavigateToCommunity?: (communityId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onCreateSociety?: (newSoc: Society) => void;
}

interface SocietyCardProps {
  society: Society;
  onToggleJoinSociety: (id: string) => void;
  onSelectTab: (tab: NavTab) => void;
  onNavigateToCommunity?: (communityId: string) => void;
}

const SocietyCardItem: React.FC<SocietyCardProps> = ({
  society,
  onToggleJoinSociety,
  onSelectTab,
  onNavigateToCommunity,
}) => {
  return (
    <div
      id={`society-card-${society.id}`}
      className="bg-white rounded-2xl border border-[#EDE7F5] overflow-hidden hover:border-[#D6C5F2] transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/5 flex flex-col justify-between group h-full"
    >
      <div>
        {/* Simple Clean Header without Image */}
        <div className="p-5 pb-4 bg-gradient-to-r from-[#FAF8FD] to-white border-b border-[#F7F3FC]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3EFFB] text-[#7033F5] border border-[#E9DEF7] flex items-center justify-center text-2xl shrink-0 shadow-xs">
              <span>{society.avatar || '🏛️'}</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3EFF9] text-[#7033F5] border border-[#E4DAF3]">
                {society.category}
              </span>
              {society.isJoined && (
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Joined</span>
                </span>
              )}
            </div>
          </div>

          <h3 className="text-base font-extrabold text-[#211B33] group-hover:text-[#7033F5] transition-colors leading-snug line-clamp-1 flex items-center gap-1.5">
            <span className="truncate">{society.name}</span>
            <span title="Verified Campus Society" className="text-[#7033F5] shrink-0">
              <ShieldCheck className="w-4 h-4 fill-[#F3EEFC]" />
            </span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[#7A718C] mt-1.5">
            <Users className="w-3.5 h-3.5 text-[#8A819C]" />
            <span className="font-semibold text-[#292338]">{society.memberCount} members</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 pt-3.5">
          <p className="text-xs text-[#524A63] leading-relaxed line-clamp-2 mb-3.5 min-h-[36px]">
            {society.description}
          </p>

          {/* Recent announcement from lead */}
          {society.recentPost && (
            <div className="p-2.5 bg-[#FAF8FD] rounded-xl border border-[#EDE7F5] mb-3.5 text-xs">
              <p className="text-[10px] font-bold text-[#5527B8] mb-0.5 flex items-center gap-1">
                <span>📢</span>
                <span className="truncate">{society.recentPost.author}</span>
                <span className="text-[#968EA3] font-normal">• {society.recentPost.timeAgo}</span>
              </p>
              <p className="text-[#554D66] line-clamp-2 italic text-[11px]">
                &quot;{society.recentPost.text}&quot;
              </p>
            </div>
          )}

          {/* Meeting info strip */}
          <div className="space-y-1.5 text-xs text-[#6A627B]">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#7033F5] shrink-0" />
              <span className="font-medium text-[#211B33] truncate">
                {society.meetingSchedule}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#7033F5] shrink-0" />
              <span className="truncate">{society.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-5 pt-3 border-t border-[#F5F0FB] flex items-center justify-between gap-2 mt-auto">
        <button
          onClick={() => {
            if (society.communityId && onNavigateToCommunity) {
              onNavigateToCommunity(society.communityId);
            } else {
              onSelectTab('messages');
            }
          }}
          className="text-xs font-bold text-[#7033F5] hover:text-[#521FB8] px-3 py-1.5 rounded-xl hover:bg-[#F3EEFC] transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Open Community</span>
        </button>

        <button
          onClick={() => onToggleJoinSociety(society.id)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            society.isJoined
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-[#7033F5] text-white hover:bg-[#5E22E2] shadow-xs'
          }`}
        >
          {society.isJoined ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Joined</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Join Society</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const SocietiesView: React.FC<SocietiesViewProps> = ({
  societies,
  onToggleJoinSociety,
  onSelectTab,
  onNavigateToCommunity,
  searchQuery = '',
  onSearchQueryChange,
  onCreateSociety,
}) => {
  const [category, setCategory] = useState<string>('All');
  const [filterJoinedOnly, setFilterJoinedOnly] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Society Form States
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Tech & Web3');
  const [newDescription, setNewDescription] = useState('');
  const [newMeetingSchedule, setNewMeetingSchedule] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Local fallback if no external search provided
  const [localSearch, setLocalSearch] = useState<string>('');
  const activeSearch = searchQuery !== undefined && onSearchQueryChange ? searchQuery : localSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Society name is required.');
      return;
    }
    if (!newDescription.trim()) {
      setFormError('Description is required.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const assignedImage = newImageUrl.trim() || '';

      const res = await createSocietyApi({
        name: newName.trim(),
        category: newCategory,
        description: newDescription.trim(),
        meetingSchedule: newMeetingSchedule.trim() || 'TBA',
        location: newLocation.trim() || 'Campus Venue',
        imageUrl: assignedImage,
        coverImage: assignedImage,
        contactInformation: {
          email: newEmail.trim() || undefined,
        },
        socialLinks: {
          instagram: newInstagram.trim() || undefined,
        },
      });

      if (res.success && res.data) {
        const d = res.data;
        const mappedSoc: Society = {
          id: d.societyId || d._id || `soc-${Date.now()}`,
          name: d.name,
          category: d.category,
          memberCount: d.memberCount || 1,
          description: d.description,
          avatar: d.avatar || '🏛️',
          imageUrl: d.imageUrl || assignedImage,
          coverImage: d.coverImage || assignedImage,
          bannerColor: d.bannerColor || 'from-[#7033F5] to-[#8F52FF]',
          tags: [d.category, 'Campus Guild'],
          meetingSchedule: d.meetingSchedule || 'TBA',
          location: d.location || 'Campus Center',
          isJoined: true,
          communityId: d.communityId || `comm-${d.societyId || Date.now()}`,
        };

        if (onCreateSociety) {
          onCreateSociety(mappedSoc);
        }

        // Reset and close
        setNewName('');
        setNewDescription('');
        setNewMeetingSchedule('');
        setNewLocation('');
        setNewEmail('');
        setNewInstagram('');
        setNewImageUrl('');
        setShowCreateModal(false);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create society in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'All',
    'Tech & Web3',
    'Idea & Public Speaking',
    'Social & Assistive',
    'Design & Creative',
    'Open Source',
  ];

  const filtered = useMemo(() => {
    return societies.filter((s) => {
      // Joined only filter
      if (filterJoinedOnly && !s.isJoined) return false;

      // Category filter
      const matchesCat =
        category === 'All' ||
        s.category.toLowerCase().includes(category.toLowerCase().split(' ')[0]);
      if (!matchesCat) return false;

      // Robust search filter
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase().trim();
        const searchPool = [
          s.name,
          s.description,
          s.category,
          s.meetingSchedule,
          s.location,
          s.recentPost?.text || '',
          s.recentPost?.author || '',
        ]
          .join(' ')
          .toLowerCase();

        return searchPool.includes(q);
      }

      return true;
    });
  }, [societies, category, filterJoinedOnly, activeSearch]);

  const joinedCount = societies.filter((s) => s.isJoined).length;

  return (
    <div
      id="univia-societies-view"
      className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#211B33] tracking-tight">
              Student Societies &amp; Campus Guilds
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFEBFA] text-[#7033F5] border border-[#DDD1F5]">
              {societies.length} Guilds
            </span>
          </div>
          <p className="text-xs text-[#766E87] mt-1">
            Discover, join, and collaborate with student clubs, technical chapters, and campus organizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterJoinedOnly(!filterJoinedOnly)}
            className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
              filterJoinedOnly
                ? 'bg-[#7033F5] text-white border-[#7033F5] shadow-xs'
                : 'text-[#5527B8] bg-[#F2EDFB] border-[#DDD0F5] hover:bg-[#EAE1FA]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{joinedCount} Joined Communities</span>
          </button>

          <button
            id="register-society-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Society</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE7F5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#9186A4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="societies-search-input"
              type="text"
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search societies by name, keywords, lead, or room..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8FE] border border-[#E7DDF4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7033F5]/25 focus:border-[#7033F5] text-[#211B33]"
            />
            {activeSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#9186A4] hover:text-[#211B33] hover:bg-[#ECE4F8]"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 ${
                  category === c
                    ? 'bg-[#7033F5] text-white shadow-2xs'
                    : 'bg-[#F4EFFB] text-[#554C68] hover:bg-[#EAE2F7]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info Strip */}
        <div className="flex items-center justify-between text-xs text-[#7A718C] pt-1 border-t border-[#F5EEFB]">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-[#211B33]">{filtered.length}</strong> of {societies.length} societies
            </span>
            {activeSearch && (
              <span className="text-[11px] bg-[#F2EDFB] text-[#7033F5] font-semibold px-2 py-0.5 rounded-md">
                Matching &quot;{activeSearch}&quot;
              </span>
            )}
            {filterJoinedOnly && (
              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md">
                Joined only
              </span>
            )}
          </div>

          {(activeSearch || category !== 'All' || filterJoinedOnly) && (
            <button
              onClick={() => {
                handleSearchChange('');
                setCategory('All');
                setFilterJoinedOnly(false);
              }}
              className="text-[11px] font-bold text-[#7033F5] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Societies Grid */}
      {societies.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E3D6F6] space-y-3">
          <Building className="w-12 h-12 text-[#7033F5] mx-auto p-2.5 bg-[#F4EFFB] rounded-2xl" />
          <h3 className="text-base font-extrabold text-[#261E37]">No Societies Added Yet</h3>
          <p className="text-xs text-[#7B728D] max-w-md mx-auto">
            Welcome to Univia! As a student lead or host, you can register and launch your campus society here.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Society</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E3D6F6] space-y-3">
          <Users className="w-10 h-10 text-[#B0A6C3] mx-auto" />
          <h3 className="text-sm font-extrabold text-[#261E37]">No societies match your search</h3>
          <p className="text-xs text-[#7B728D] max-w-md mx-auto">
            Try searching for terms like &quot;AssetMerkle&quot;, &quot;TEDx&quot;, &quot;TechNeeds&quot;, &quot;Web3&quot;, or click reset to view all.
          </p>
          <button
            onClick={() => {
              handleSearchChange('');
              setCategory('All');
              setFilterJoinedOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs"
          >
            Show All Societies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((society) => (
            <SocietyCardItem
              key={society.id}
              society={society}
              onToggleJoinSociety={onToggleJoinSociety}
              onSelectTab={onSelectTab}
              onNavigateToCommunity={onNavigateToCommunity}
            />
          ))}
        </div>
      )}

      {/* Register New Campus Society Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-[#EDE7F5] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F2ECFA] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0EAFB] text-[#7033F5] flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#211B33]">Register Campus Society</h3>
                  <p className="text-[11px] text-[#766E87]">Creates official guild profile &amp; live chat channel</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-[#766E87] hover:text-[#211B33] hover:bg-[#F2ECFA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                  Society / Club Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Robotics Club, ACM Chapter, Literary Society"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  >
                    <option value="Tech & Web3">Tech &amp; Web3</option>
                    <option value="Idea & Public Speaking">Idea &amp; Public Speaking</option>
                    <option value="Social & Assistive">Social &amp; Assistive</option>
                    <option value="Design & Creative">Design &amp; Creative</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Cultural & Arts">Cultural &amp; Arts</option>
                    <option value="Sports & Wellness">Sports &amp; Wellness</option>
                    <option value="Academic & Career">Academic &amp; Career</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={newMeetingSchedule}
                    onChange={(e) => setNewMeetingSchedule(e.target.value)}
                    placeholder="e.g., Wednesdays 4:30 PM"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                  Primary Location / Room
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., LH-102, Innovation Lab 302, Student Activity Hall"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                  Description &amp; Mission *
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What does this student group do? Who is it for? Share mission statement and activities."
                  className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="society@college.edu"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Social / Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={newInstagram}
                    onChange={(e) => setNewInstagram(e.target.value)}
                    placeholder="@society_handle"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2ECFA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#766E87] hover:bg-[#F2ECFA] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Register Society'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
