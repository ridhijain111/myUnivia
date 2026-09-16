import React, { useState } from 'react';
import {
  X,
  Search,
  UserPlus,
  Users,
  MessageSquare,
  Sparkles,
  Check,
  Building,
  Plus,
} from 'lucide-react';
import { ChatChannel } from '../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingChannels: ChatChannel[];
  onCreateDirectChat: (contact: {
    name: string;
    avatar: string;
    role: string;
    phone?: string;
  }) => void;
  onCreateGroup: (group: {
    name: string;
    avatarEmoji: string;
    description: string;
    selectedMembers: string[];
  }) => void;
  onCreateCommunity: (comm: {
    name: string;
    category: string;
    description: string;
    avatarEmoji: string;
  }) => void;
}

export interface SavedContact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  isOnline?: boolean;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  existingChannels,
  onCreateDirectChat,
  onCreateGroup,
  onCreateCommunity,
}) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'group' | 'community' | 'manual'>('contact');
  const [searchQuery, setSearchQuery] = useState('');

  // Group Form
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('🚀');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);

  // Community Form
  const [commName, setCommName] = useState('');
  const [commCategory, setCommCategory] = useState('Tech & Innovation');
  const [commDesc, setCommDesc] = useState('');
  const [commEmoji, setCommEmoji] = useState('🏛️');

  // Manual Contact Add Form
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualRole, setManualRole] = useState('Student • B.Tech CSE');

  const [contacts, setContacts] = useState<SavedContact[]>(() => {
    try {
      const saved = localStorage.getItem('univia_user_contacts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out old pre-seeded default mock contacts
          const cleaned = parsed.filter(
            (c: SavedContact) =>
              c &&
              !['c-1', 'c-2', 'c-3', 'c-4'].includes(c.id) &&
              !['Aarav Mehta', 'Priya Patel', 'Rohan Verma', 'Ananya Deshmukh'].includes(c.name)
          );
          return cleaned;
        }
      }
    } catch {}
    return [];
  });

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  const toggleMemberSelection = (name: string) => {
    setSelectedGroupMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    onCreateGroup({
      name: groupName.trim(),
      avatarEmoji: groupEmoji,
      description: groupDesc.trim() || `${groupName} study & project discussion team.`,
      selectedMembers: selectedGroupMembers,
    });
    onClose();
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim()) return;
    onCreateCommunity({
      name: commName.trim(),
      category: commCategory,
      description: commDesc.trim() || `Official Univia campus community for ${commName}.`,
      avatarEmoji: commEmoji,
    });
    onClose();
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    const newContact: SavedContact = {
      id: `contact-${Date.now()}`,
      name: manualName.trim(),
      phone: manualPhone.trim() || '',
      role: manualRole.trim() || 'Student',
      isOnline: true,
    };
    const updated = [newContact, ...contacts.filter((c) => c.name !== newContact.name)];
    setContacts(updated);
    try {
      localStorage.setItem('univia_user_contacts_v2', JSON.stringify(updated));
    } catch {}
    onCreateDirectChat({
      name: newContact.name,
      phone: newContact.phone || '+91 98000 00000',
      role: newContact.role,
      avatar: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-3xl border border-[#EDE7F5] dark:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF8FE] dark:bg-[#162032] border-b border-[#F0EAF8] dark:border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#211B33] dark:text-[#F8FAFC]">
              New Chat & Campus Connections
            </h2>
            <p className="text-xs text-[#7B738C] dark:text-[#94A3B8]">
              WhatsApp-style messaging for peers, project groups & communities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EDE5F8] dark:hover:bg-[#1E293B] text-[#8C849E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#F0EAF8] dark:border-[#1E293B] bg-[#FAF8FE] dark:bg-[#162032] px-6 gap-2 text-xs font-bold text-[#6D657F] dark:text-[#94A3B8]">
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-[#7033F5] dark:border-[#A78BFA] text-[#7033F5] dark:text-[#A78BFA]'
                : 'border-transparent hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Select Contact</span>
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'group'
                ? 'border-[#7033F5] dark:border-[#A78BFA] text-[#7033F5] dark:text-[#A78BFA]'
                : 'border-transparent hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'border-[#7033F5] dark:border-[#A78BFA] text-[#7033F5] dark:text-[#A78BFA]'
                : 'border-transparent hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>New Community</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-[#7033F5] dark:border-[#A78BFA] text-[#7033F5] dark:text-[#A78BFA]'
                : 'border-transparent hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Number</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-[#111827]">
          {activeTab === 'contact' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#988EA8] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students, faculty, or society leads..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E4D7F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] dark:focus:border-[#A78BFA] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('group')}
                  className="p-3 rounded-2xl bg-[#F6F1FD] dark:bg-[#162032] hover:bg-[#EFE7FB] dark:hover:bg-[#1E293B] border border-[#E7DAF7] dark:border-[#2D3A4F] flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#7033F5] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Users className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">New Campus Group</p>
                    <p className="text-[10px] text-[#766D88] dark:text-[#94A3B8]">Study, sprint or hackathon</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('community')}
                  className="p-3 rounded-2xl bg-[#F6F1FD] dark:bg-[#162032] hover:bg-[#EFE7FB] dark:hover:bg-[#1E293B] border border-[#E7DAF7] dark:border-[#2D3A4F] flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                >
                  <span className="w-8 h-8 rounded-xl bg-[#7033F5] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Building className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">New Community</p>
                    <p className="text-[10px] text-[#766D88] dark:text-[#94A3B8]">Official college society</p>
                  </div>
                </button>
              </div>

              {/* Contacts Directory List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#867E96] dark:text-[#94A3B8] uppercase tracking-wider">
                    My Contacts ({filteredContacts.length})
                  </p>
                  <button
                    onClick={() => setActiveTab('manual')}
                    className="text-xs font-bold text-[#7033F5] dark:text-[#A78BFA] hover:underline cursor-pointer"
                  >
                    + Add New Contact
                  </button>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-[#162032] border border-[#EDE4FA] dark:border-[#2D3A4F] text-center space-y-2">
                    <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">No Contacts Added Yet</p>
                    <p className="text-[11px] text-[#786E8D] dark:text-[#94A3B8]">
                      Add peers directly by student name, roll ID or phone number.
                    </p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E24D9] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Student Contact</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 divide-y divide-[#F5F0FA] dark:divide-[#1E293B]">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          onCreateDirectChat({
                            name: contact.name,
                            avatar: contact.avatar || '',
                            role: contact.role,
                            phone: contact.phone,
                          });
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-[#FAF8FE] dark:hover:bg-[#162032] flex items-center justify-between text-left transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#EDE4FA] dark:bg-[#2D1B4E] border border-[#E2D6F5] dark:border-[#4C2882] flex items-center justify-center text-[#7033F5] dark:text-[#C4B5FD] text-xs font-bold">
                              {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {contact.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111827]"></span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC] group-hover:text-[#7033F5] dark:group-hover:text-[#A78BFA] transition-colors">
                              {contact.name}
                            </h4>
                            <p className="text-[10px] text-[#7A728C] dark:text-[#94A3B8]">
                              {contact.role}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FAF8FE] dark:bg-[#1E293B] group-hover:bg-[#7033F5] group-hover:text-white text-[#7033F5] dark:text-[#C4B5FD] border border-[#E8DEF6] dark:border-[#372E5A] transition-colors">
                          Chat
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'group' && (
            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                {/* Group Emoji Selector */}
                <div>
                  <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                    Icon
                  </label>
                  <select
                    value={groupEmoji}
                    onChange={(e) => setGroupEmoji(e.target.value)}
                    className="w-14 h-12 text-xl bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC] rounded-2xl flex items-center justify-center text-center cursor-pointer focus:outline-none focus:border-[#7033F5]"
                  >
                    <option value="🚀">🚀</option>
                    <option value="⚡">⚡</option>
                    <option value="💻">💻</option>
                    <option value="📚">📚</option>
                    <option value="🎯">🎯</option>
                    <option value="☕">☕</option>
                    <option value="🤖">🤖</option>
                    <option value="🎨">🎨</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                    Group Subject / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., DecentrAI Sprint Team"
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Group Description
                </label>
                <input
                  type="text"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="e.g., Daily standups and GitHub code reviews"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              {/* Member Selection */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1]">
                    Add Participants ({selectedGroupMembers.length} selected)
                  </label>
                  {selectedGroupMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedGroupMembers([])}
                      className="text-[10px] text-[#7033F5] dark:text-[#A78BFA] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#EBE3F6] dark:border-[#2D3A4F] rounded-2xl p-2 bg-[#FAF8FE] dark:bg-[#162032]">
                  {contacts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#7A728C] dark:text-[#94A3B8]">
                      No contacts added yet. Add a contact in the "Add New Contact" tab.
                    </div>
                  ) : (
                    contacts.map((contact) => {
                      const isSelected = selectedGroupMembers.includes(contact.name);
                      return (
                        <div
                          key={contact.id}
                          onClick={() => toggleMemberSelection(contact.name)}
                          className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#EDE5F8] dark:bg-[#2D1B4E] border border-[#D5C2F3] dark:border-[#6B21A8]'
                              : 'hover:bg-white dark:hover:bg-[#1E293B] bg-white/70 dark:bg-[#111827]/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {contact.avatar && contact.avatar.trim() ? (
                              <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#EDE4FA] dark:bg-[#2D1B4E] flex items-center justify-center text-[#7033F5] dark:text-[#C4B5FD] text-[10px] font-bold">
                                {contact.name ? contact.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">{contact.name}</p>
                              <p className="text-[10px] text-[#7A728C] dark:text-[#94A3B8]">{contact.role}</p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isSelected
                                ? 'bg-[#7033F5] border-[#7033F5] text-white'
                                : 'border-[#CEC2E2] dark:border-[#4B3B6E] bg-white dark:bg-[#1E293B]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#6A627B] dark:text-[#94A3B8] hover:bg-[#F2EDFA] dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!groupName.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          )}

          {activeTab === 'community' && (
            <form onSubmit={handleCreateCommunitySubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                    Emblem
                  </label>
                  <select
                    value={commEmoji}
                    onChange={(e) => setCommEmoji(e.target.value)}
                    className="w-14 h-12 text-xl bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC] rounded-2xl flex items-center justify-center text-center cursor-pointer focus:outline-none focus:border-[#7033F5]"
                  >
                    <option value="🏛️">🏛️</option>
                    <option value="⚡">⚡</option>
                    <option value="🔴">🔴</option>
                    <option value="💡">💡</option>
                    <option value="🧬">🧬</option>
                    <option value="🎭">🎭</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    placeholder="e.g., Computer Society of India (CSI)"
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Category
                </label>
                <select
                  value={commCategory}
                  onChange={(e) => setCommCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC] rounded-xl focus:outline-none focus:border-[#7033F5]"
                >
                  <option value="Tech & Innovation">Tech & Innovation</option>
                  <option value="Arts & Cultural">Arts & Cultural</option>
                  <option value="Social & Leadership">Social & Leadership</option>
                  <option value="Academic & Research">Academic & Research</option>
                  <option value="Sports & Fitness">Sports & Fitness</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Community Description & Mission
                </label>
                <textarea
                  rows={3}
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  placeholder="Describe your society mission, weekly syncs, and how freshers can contribute..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8FE] dark:bg-[#162032] border border-[#E6DBF6] dark:border-[#2D3A4F] text-xs text-[#5D5570] dark:text-[#CBD5E1] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#7033F5] dark:text-[#A78BFA] shrink-0 mt-0.5" />
                <p>
                  Creating a community provisions an official Announcements broadcast channel plus active discussion sub-groups for verified campus students.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#6A627B] dark:text-[#94A3B8] hover:bg-[#F2EDFA] dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!commName.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Create Community
                </button>
              </div>
            </form>
          )}

          {activeTab === 'manual' && (
            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g., Ishaan Sharma"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Mobile / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="e.g., +91 98123 45678"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#6D657F] dark:text-[#CBD5E1] block mb-1">
                  Branch & Year / Department
                </label>
                <input
                  type="text"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  placeholder="e.g., 2nd Year • B.Tech AI & Data Science"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF8FE] dark:bg-[#1E293B] border border-[#E3D6F5] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#988EA8] dark:placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#6A627B] dark:text-[#94A3B8] hover:bg-[#F2EDFA] dark:hover:bg-[#1E293B] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!manualName.trim()}
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Start Chat
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
