import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ChevronLeft,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Users,
  Info,
  Check,
  CheckCheck,
  Clock,
  Pin,
  Star,
  Trash2,
  Reply,
  Share2,
  Mic,
  MicOff,
  Music,
  Camera,
  UserPlus,
  MapPin,
  BarChart2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Building,
  Radio,
  FileUp,
  FolderOpen,
  MessageSquare,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  ChatChannel,
  MessageItem,
  UserProfile,
  ActiveCallState,
} from '../../types';
import { GUEST_USER } from '../../data/mockData';
import { CallOverlayModal } from '../CallOverlayModal';
import { NewChatModal } from '../NewChatModal';

interface MessagesViewProps {
  channels: ChatChannel[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  onSendMessage: (
    channelId: string,
    text: string,
    replyTo?: { id: string; senderName: string; text: string },
    attachment?: any
  ) => void;
  onClearUnread: (channelId: string) => void;
  onToggleReaction?: (channelId: string, messageId: string, emoji: string) => void;
  onDeleteMessage?: (channelId: string, messageId: string) => void;
  onToggleJoinCommunity?: (channelId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  currentUser?: UserProfile;
  onAddChannel?: (newChannel: ChatChannel) => void;
  onDeleteChannel?: (channelId: string) => void;
  onClearAllChannels?: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '🥺', '😢', '😭', '😤', '😠', '🤯', '😱', '🤫', '🫡', '🫠', '😴', '💤'],
  },
  {
    name: 'Campus & Tech',
    emojis: ['💻', '📱', '🖥️', '⌨️', '🖱️', '💾', '🕹️', '📚', '📖', '📝', '✏️', '🖊️', '🎓', '🔬', '🔭', '📡', '💡', '🔍', '🔎', '⚡', '⚙️', '🛠️', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🍕', '☕', '🥪', '🍔', '🥤'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🖐️', '🖖', '👋', '✍️', '🤳', '💪'],
  },
  {
    name: 'Hearts & Vibes',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '🎉', '🎊', '🚀', '💯', '✨', '🌟', '⭐', '💥', '🚨', '📌', '📍', '🏆', '🥇'],
  },
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  onSendMessage,
  onClearUnread,
  onToggleReaction,
  onDeleteMessage,
  onToggleJoinCommunity,
  searchQuery = '',
  onSearchQueryChange,
  currentUser = GUEST_USER,
  onAddChannel,
  onDeleteChannel,
  onClearAllChannels,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  // Navigation & Channels
  const [localSearch, setLocalSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'societies' | 'direct' | 'groups'>('all');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [infoTab, setInfoTab] = useState<'members' | 'media' | 'files'>('members');
  const [showDirectoryMenu, setShowDirectoryMenu] = useState(false);

  // New Chat & Modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // In-Chat Search
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');

  // Input & Attachments
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<MessageItem | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<any | null>(null);

  // Poll creation modal
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');
  const [pollOption3, setPollOption3] = useState('');

  // Location share modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationVenue, setLocationVenue] = useState('Central Library Quiet Study 2nd Floor');
  const [locationRoom, setLocationRoom] = useState('Room L-204');

  // Voice recording simulation
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);

  // Audio Playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Toast / Status notification
  const [toast, setToast] = useState<string | null>(null);

  // File Input Refs for Gallery, Document, Music
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSearch = searchQuery || localSearch;
  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  useEffect(() => {
    if (activeChannel && activeChannel.unreadCount > 0) {
      onClearUnread(activeChannel.id);
    }
  }, [selectedChannelId, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel?.messages?.length, pendingAttachment]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setVoiceDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Filter channels
  const filteredChannels = channels.filter((c) => {
    const query = activeSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(query)) ||
      (c.roleOrCategory && c.roleOrCategory.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (filterTab === 'unread') return c.unreadCount > 0;
    if (filterTab === 'societies') return !c.isDirect;
    if (filterTab === 'direct') return !!c.isDirect;
    if (filterTab === 'groups') return !c.isDirect && (c.name.includes('Group') || c.name.includes('Sprint') || (c.memberCount && c.memberCount < 40));
    return true;
  });

  // Filter messages in chat
  const displayedMessages = (activeChannel?.messages || []).filter((m) => {
    if (!inChatSearchQuery.trim()) return true;
    return (
      m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(inChatSearchQuery.toLowerCase())
    );
  });

  // Sending text / attachment
  const handleSend = () => {
    if ((!inputText.trim() && !pendingAttachment) || !activeChannel) return;

    onSendMessage(
      activeChannel.id,
      inputText.trim(),
      replyTarget
        ? {
            id: replyTarget.id,
            senderName: replyTarget.senderName,
            text: replyTarget.content,
          }
        : undefined,
      pendingAttachment || undefined
    );

    setInputText('');
    setReplyTarget(null);
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  // File Handlers
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (typeof loadEvt.target?.result === 'string') {
        setPendingAttachment({
          type: 'image',
          name: file.name,
          url: loadEvt.target.result,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
        showToast(`Image "${file.name}" ready to send`);
      }
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingAttachment({
      type: 'file',
      name: file.name,
      url: '#',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });
    showToast(`Document "${file.name}" attached`);
    setShowAttachMenu(false);
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingAttachment({
      type: 'audio',
      name: file.name,
      url: '#',
      size: `${(file.size / 1024).toFixed(0)} KB`,
      duration: '03:45',
    });
    showToast(`Music file "${file.name}" attached`);
    setShowAttachMenu(false);
  };

  // Quick Camera Snapshot Simulation
  const handleCameraSnap = () => {
    setPendingAttachment({
      type: 'image',
      name: `Campus_Snapshot_${new Date().toLocaleTimeString().replace(/:/g, '')}.jpg`,
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%237033F5"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="white" font-weight="bold" text-anchor="middle" dominant-baseline="middle">📸 Campus Snapshot</text></svg>',
      size: '1.2 MB',
    });
    showToast('Campus photo captured');
    setShowAttachMenu(false);
  };

  // Share Contact Card
  const handleShareContact = () => {
    setPendingAttachment({
      type: 'contact',
      name: 'Tanvi Gupta',
      url: '#',
      contactInfo: {
        name: 'Tanvi Gupta',
        phone: '+91 98712 34567',
        role: 'Lead, AssetMerkle Team • 4th Year CSE',
      },
    });
    showToast('Contact card prepared');
    setShowAttachMenu(false);
  };

  // Share Campus Poll
  const handleCreatePoll = () => {
    if (!pollQuestion.trim() || !pollOption1.trim() || !pollOption2.trim()) {
      showToast('Please provide a question and at least 2 options');
      return;
    }

    const options = [
      { id: 'opt-1', text: pollOption1.trim(), votes: 1, voters: ['You'] },
      { id: 'opt-2', text: pollOption2.trim(), votes: 0, voters: [] },
    ];
    if (pollOption3.trim()) {
      options.push({ id: 'opt-3', text: pollOption3.trim(), votes: 0, voters: [] });
    }

    setPendingAttachment({
      type: 'poll',
      name: pollQuestion.trim(),
      url: '#',
      pollInfo: {
        question: pollQuestion.trim(),
        options,
        totalVotes: 1,
      },
    });

    setShowPollCreator(false);
    setPollQuestion('');
    setPollOption1('');
    setPollOption2('');
    setPollOption3('');
    setShowAttachMenu(false);
    showToast('Campus poll attached! Hit Send.');
  };

  // Share Campus Location Pin
  const handleShareLocation = () => {
    setPendingAttachment({
      type: 'location',
      name: locationVenue,
      url: '#',
      locationInfo: {
        venue: locationVenue,
        room: locationRoom,
        notes: 'Meet right here for project sync.',
      },
    });
    setShowLocationModal(false);
    setShowAttachMenu(false);
    showToast('Campus venue location attached!');
  };

  // Voice Note Send
  const handleSendVoiceNote = () => {
    if (!activeChannel) return;
    const durationStr = `${Math.floor(voiceDuration / 60)}:${(voiceDuration % 60)
      .toString()
      .padStart(2, '0')}`;

    onSendMessage(
      activeChannel.id,
      '🎤 Voice Note',
      undefined,
      {
        type: 'voice',
        name: `Voice_Note_${Date.now()}.m4a`,
        url: '#',
        duration: durationStr || '0:05',
        size: '120 KB',
      }
    );

    setIsRecordingVoice(false);
    setVoiceDuration(0);
    showToast('Voice note sent to channel');
  };

  // Call Initiators
  const handleStartCall = (isVideo: boolean) => {
    if (!activeChannel) return;
    setActiveCall({
      channelId: activeChannel.id,
      channelName: activeChannel.name,
      avatar: activeChannel.avatar,
      isVideo,
      isDirect: !!activeChannel.isDirect,
    });
  };

  const handleEndCall = (durationSeconds: number) => {
    if (activeCall && activeChannel) {
      const mins = Math.floor(durationSeconds / 60);
      const secs = (durationSeconds % 60).toString().padStart(2, '0');
      const callTypeLabel = activeCall.isVideo ? '📹 Video call' : '📞 Audio call';
      onSendMessage(
        activeChannel.id,
        `${callTypeLabel} ended • ${mins}:${secs}`
      );
    }
    setActiveCall(null);
    showToast('Call ended');
  };

  // Create Direct Chat
  const handleCreateDirectChat = (contact: {
    name: string;
    avatar: string;
    role: string;
    phone?: string;
  }) => {
    const existing = channels.find((c) => c.isDirect && c.name === contact.name);
    if (existing) {
      onSelectChannel(existing.id);
      setShowMobileChat(true);
      showToast(`Switched to conversation with ${contact.name}`);
      return;
    }

    const newChan: ChatChannel = {
      id: `chat-direct-${Date.now()}`,
      name: contact.name,
      isDirect: true,
      avatar: contact.avatar,
      roleOrCategory: contact.role,
      unreadCount: 0,
      lastMessage: 'Tap to send a message',
      lastMessageTime: 'Just now',
      isOnline: true,
      messages: [],
    };

    if (onAddChannel) {
      onAddChannel(newChan);
    }
    onSelectChannel(newChan.id);
    setShowMobileChat(true);
    showToast(`Started chat with ${contact.name}`);
  };

  // Create Group
  const handleCreateGroup = (group: {
    name: string;
    avatarEmoji: string;
    description: string;
    selectedMembers: string[];
  }) => {
    const newChan: ChatChannel = {
      id: `group-${Date.now()}`,
      name: group.name,
      isDirect: false,
      roleOrCategory: 'Student Project Group',
      unreadCount: 0,
      lastMessage: `Group created with ${group.selectedMembers.length + 1} members`,
      lastMessageTime: 'Just now',
      memberCount: group.selectedMembers.length + 1,
      description: group.description,
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          senderId: currentUser.campusCardId,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          isSelf: true,
          content: `Created group "${group.name}". Welcome everyone! 🚀`,
          timestamp: 'Just now',
          status: 'delivered',
        },
      ],
    };

    if (onAddChannel) {
      onAddChannel(newChan);
    }
    onSelectChannel(newChan.id);
    setShowMobileChat(true);
    showToast(`Created group "${group.name}"`);
  };

  // Create Community
  const handleCreateCommunity = (comm: {
    name: string;
    category: string;
    description: string;
    avatarEmoji: string;
  }) => {
    const newChan: ChatChannel = {
      id: `community-${Date.now()}`,
      name: `${comm.name} Official`,
      isDirect: false,
      roleOrCategory: comm.category,
      unreadCount: 0,
      lastMessage: 'Official announcements channel initiated',
      lastMessageTime: 'Just now',
      memberCount: 50,
      description: comm.description,
      isOfficial: true,
      messages: [
        {
          id: `msg-comm-${Date.now()}`,
          senderId: currentUser.campusCardId,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          isSelf: true,
          content: `📢 Official announcements channel for ${comm.name} created on Univia.`,
          timestamp: 'Just now',
          status: 'delivered',
        },
      ],
    };

    if (onAddChannel) {
      onAddChannel(newChan);
    }
    onSelectChannel(newChan.id);
    setShowMobileChat(true);
    showToast(`Created community "${comm.name}"`);
  };

  // Vote on campus poll
  const handleVotePoll = (messageId: string, optionId: string) => {
    showToast('Vote recorded on campus poll!');
  };

  return (
    <div
      id="univia-whatsapp-messages-root"
      className="w-full h-full flex flex-col md:flex-row bg-white dark:bg-[#0B0F19] overflow-hidden select-text relative"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1F2937]/90 text-white text-xs font-semibold px-4 py-2 rounded-2xl shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 flex items-center gap-2 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hidden File Inputs for real folder/gallery/music uploads */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleGalleryUpload}
        className="hidden"
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.json,.py,.csv"
        onChange={handleDocUpload}
        className="hidden"
      />
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="hidden"
      />

      {/* =========================================================================
          LEFT PANE: Chat Directory & Channels List (Crisp White & Lavender)
          ========================================================================= */}
      <div
        className={`w-full md:w-88 lg:w-96 bg-white dark:bg-[#0F172A] border-r border-[#EDE7F6] dark:border-[#1E293B] flex flex-col shrink-0 h-full ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Left Header */}
        <div className="h-15 px-4 bg-white dark:bg-[#162032] border-b border-[#EDE7F6] dark:border-[#1E293B] flex items-center justify-between shrink-0">
          {/* User Profile Pill */}
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer group">
              {currentUser.avatar && currentUser.avatar.trim() ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-white dark:border-[#2D3A4F] shadow-2xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#EDE5FB] dark:bg-[#2D1B4E] text-[#7033F5] dark:text-[#C4B5FD] font-bold text-xs flex items-center justify-center border border-white dark:border-[#2D3A4F] shadow-2xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#162032]"></span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC] flex items-center gap-1">
                <span>{currentUser.name}</span>
              </p>
              <p className="text-[10px] text-[#7A728E] dark:text-[#94A3B8] truncate max-w-[120px]">
                {currentUser.handle}
              </p>
            </div>
          </div>

          {/* Action Icons & Dark Mode Toggle */}
          <div className="flex items-center gap-1 text-[#6D6382] dark:text-[#94A3B8]">
            {/* Theme Mode Toggle (White & Lavender Light <-> Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[#F3ECFC] dark:hover:bg-white/10 text-[#7033F5] dark:text-[#C4B5FD] transition-colors cursor-pointer"
              title={isDark ? "Switch to Crisp White & Lavender Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-[#7033F5]" />}
            </button>

            {/* Status / Updates */}
            <button
              onClick={() => showToast('All campus status updates are synced.')}
              className="p-2 rounded-full hover:bg-[#F3ECFC] dark:hover:bg-white/10 hover:text-[#7033F5] dark:hover:text-[#F8FAFC] transition-colors"
              title="Status"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>

            {/* Communities */}
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-full hover:bg-[#F3ECFC] dark:hover:bg-white/10 hover:text-[#7033F5] dark:hover:text-[#F8FAFC] transition-colors"
              title="Communities & Societies"
            >
              <Building className="w-4.5 h-4.5" />
            </button>

            {/* New Chat / Add Contact */}
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-full hover:bg-[#F3ECFC] dark:hover:bg-white/10 hover:text-[#7033F5] dark:hover:text-[#A78BFA] transition-colors"
              title="New Chat / Add Contact"
            >
              <UserPlus className="w-4.5 h-4.5 text-[#7033F5] dark:text-[#A78BFA]" />
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDirectoryMenu(!showDirectoryMenu)}
                className="p-2 rounded-full hover:bg-[#F3ECFC] dark:hover:bg-white/10 hover:text-[#211B33] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
                title="Options Menu"
              >
                <MoreVertical className="w-4.5 h-4.5" />
              </button>

              {showDirectoryMenu && (
                <div className="absolute right-0 top-10 z-40 bg-white dark:bg-[#1A2333] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-2xl shadow-xl p-1.5 w-56 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  {/* Quick Dark / Light Toggle in dropdown */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setShowDirectoryMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#211B33] dark:text-[#F8FAFC] hover:bg-[#F4EEFC] dark:hover:bg-[#253247] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7033F5]" />}
                      <span>{isDark ? 'Light Lavender Mode' : 'Dark Mode'}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#EDE5F8] dark:bg-[#2E1D4E] text-[#7033F5] dark:text-[#C4B5FD] font-bold">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDirectoryMenu(false);
                      setShowNewChatModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#211B33] dark:text-[#F8FAFC] hover:bg-[#F4EEFC] dark:hover:bg-[#253247] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-[#7033F5] dark:text-[#A78BFA]" />
                    <span>Start New Chat</span>
                  </button>

                  {channels.length > 0 && (
                    <button
                      onClick={() => {
                        setShowDirectoryMenu(false);
                        if (window.confirm('Are you sure you want to remove all saved chats?')) {
                          if (onClearAllChannels) onClearAllChannels();
                          showToast('All saved chats removed.');
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <span>Clear All Saved Chats</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar & Filter Pills (Crisp White & Lavender) */}
        <div className="p-2.5 bg-white dark:bg-[#111827] border-b border-[#EDE7F6] dark:border-[#1E293B] space-y-2 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#7A728E] dark:text-[#94A3B8] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => {
                if (onSearchQueryChange) onSearchQueryChange(e.target.value);
                setLocalSearch(e.target.value);
              }}
              placeholder="Search conversations or contacts..."
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-white dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:outline-none focus:border-[#7033F5] focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
            />
            {activeSearch && (
              <button
                onClick={() => {
                  if (onSearchQueryChange) onSearchQueryChange('');
                  setLocalSearch('');
                }}
                className="absolute right-2.5 p-0.5 rounded-full text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px] font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterTab === 'all'
                  ? 'bg-[#7033F5] text-white font-bold border border-[#7033F5] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#635A77] dark:text-[#CBD5E1] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] border border-[#EDE7F6] dark:border-transparent'
              }`}
            >
              All ({channels.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterTab === 'unread'
                  ? 'bg-[#7033F5] text-white font-bold border border-[#7033F5] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#635A77] dark:text-[#CBD5E1] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] border border-[#EDE7F6] dark:border-transparent'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilterTab('societies')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterTab === 'societies'
                  ? 'bg-[#7033F5] text-white font-bold border border-[#7033F5] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#635A77] dark:text-[#CBD5E1] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] border border-[#EDE7F6] dark:border-transparent'
              }`}
            >
              Societies
            </button>
            <button
              onClick={() => setFilterTab('direct')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterTab === 'direct'
                  ? 'bg-[#7033F5] text-white font-bold border border-[#7033F5] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#635A77] dark:text-[#CBD5E1] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] border border-[#EDE7F6] dark:border-transparent'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setFilterTab('groups')}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filterTab === 'groups'
                  ? 'bg-[#7033F5] text-white font-bold border border-[#7033F5] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#635A77] dark:text-[#CBD5E1] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] border border-[#EDE7F6] dark:border-transparent'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Chat List (Crisp White & Lavender) */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F2ECFA] dark:divide-[#1E293B] bg-white dark:bg-[#0F172A]">
          {channels.length === 0 ? (
            <div className="p-8 text-center text-[#7A728E] dark:text-[#94A3B8] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4EEFC] dark:bg-[#1E293B] text-[#7033F5] dark:text-[#C4B5FD] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#211B33] dark:text-[#F8FAFC]">No conversations yet</p>
              <p className="text-[11px] text-[#7A728E] dark:text-[#94A3B8]">Start a direct message or create your first campus community group.</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs cursor-pointer transition-colors"
              >
                + Start New Chat
              </button>
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-[#7A728E] dark:text-[#94A3B8] space-y-2">
              <p className="text-xs">No conversations match &quot;{activeSearch}&quot;</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="text-xs font-bold text-[#7033F5] dark:text-[#A78BFA] hover:underline cursor-pointer"
              >
                + Start a new campus chat
              </button>
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const isSelected = channel.id === activeChannel?.id;
              return (
                <div
                  key={channel.id}
                  onClick={() => {
                    onSelectChannel(channel.id);
                    setShowMobileChat(true);
                  }}
                  className={`px-3.5 py-3 flex items-center gap-3 cursor-pointer transition-colors relative group ${
                    isSelected
                      ? 'bg-[#F4EEFC] dark:bg-[#1E293B] border-l-3 border-l-[#7033F5] dark:border-l-[#A78BFA]'
                      : 'hover:bg-[#FAF7FE] dark:hover:bg-[#162032] bg-white dark:bg-[#0F172A]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EDE5FB] dark:bg-[#2D1B4E] flex items-center justify-center border border-[#E3D4F8] dark:border-[#3D2564]">
                      {channel.avatar && channel.avatar.trim() ? (
                        <img
                          src={channel.avatar}
                          alt={channel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-[#7033F5] dark:text-[#A78BFA]">
                          {channel.isDirect ? '👤' : '⚡'}
                        </span>
                      )}
                    </div>
                    {channel.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0F172A]"></span>
                    )}
                  </div>

                  {/* Channel Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC] truncate">
                          {channel.name}
                        </h3>
                        {channel.isOfficial && (
                          <span className="text-[10px] text-[#7033F5] dark:text-[#A78BFA] shrink-0 font-extrabold" title="Verified Campus Society">
                            ✓
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] shrink-0 font-medium ${
                          channel.unreadCount > 0
                            ? 'text-[#7033F5] dark:text-[#C4B5FD] font-bold'
                            : 'text-[#8C849E] dark:text-[#94A3B8]'
                        }`}
                      >
                        {channel.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-[#6A617E] dark:text-[#CBD5E1] truncate flex items-center gap-1">
                        {channel.messages[channel.messages.length - 1]?.isSelf && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#7033F5] dark:text-[#A78BFA] shrink-0 inline" />
                        )}
                        <span>{channel.lastMessage || 'Tap to chat...'}</span>
                      </p>

                      <div className="flex items-center gap-1 shrink-0">
                        {channel.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#7033F5] text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                            {channel.unreadCount}
                          </span>
                        )}
                        {onDeleteChannel && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete conversation "${channel.name}"?`)) {
                                onDeleteChannel(channel.id);
                                showToast(`Removed conversation with ${channel.name}`);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-500/10 text-[#7A728E] dark:text-[#94A3B8] hover:text-rose-500 dark:hover:text-rose-400 transition-all cursor-pointer"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Quick-Add Bar */}
        <div className="p-3 bg-white dark:bg-[#162032] border-t border-[#EDE7F6] dark:border-[#1E293B] flex items-center justify-between text-xs text-[#6D6382] dark:text-[#94A3B8] shrink-0">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-1.5 font-bold text-[#7033F5] dark:text-[#A78BFA] hover:underline cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Contact / Group</span>
          </button>
          <span className="text-[10px] text-[#8C849E] dark:text-[#64748B]">Univia Campus Messages</span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANE: Active Conversation Window (Crisp White & Lavender)
          ========================================================================= */}
      {activeChannel ? (
        <div
          className={`flex-1 flex flex-col h-full bg-white dark:bg-[#0B0F19] relative overflow-hidden ${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Subtle lavender dot pattern background */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#7033F5 0.75px, transparent 0.75px)`,
              backgroundSize: '20px 20px',
            }}
          ></div>

          {/* Chat Header Bar */}
          <div className="h-15 px-4 bg-white dark:bg-[#131C2E] border-b border-[#EDE7F6] dark:border-[#1E293B] shadow-2xs flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 -ml-2 rounded-full text-[#7033F5] dark:text-[#94A3B8] hover:bg-[#F4EEFC] dark:hover:bg-white/10"
                title="Back to Chats"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EDE5FB] dark:bg-[#2D1B4E] flex items-center justify-center border border-[#E3D4F8] dark:border-[#3D2564]">
                    {activeChannel.avatar && activeChannel.avatar.trim() ? (
                      <img
                        src={activeChannel.avatar}
                        alt={activeChannel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-[#7033F5] dark:text-[#A78BFA]">⚡</span>
                    )}
                  </div>
                  {activeChannel.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131C2E]"></span>
                  )}
                </div>

                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#211B33] dark:text-[#F8FAFC] flex items-center gap-1.5 group-hover:text-[#7033F5] dark:group-hover:text-[#A78BFA] transition-colors">
                    <span>{activeChannel.name}</span>
                    {activeChannel.isOfficial && (
                      <span className="text-[10px] text-[#7033F5] dark:text-[#A78BFA] font-extrabold">✓</span>
                    )}
                  </h2>
                  <p className="text-[10px] text-[#7A728E] dark:text-[#94A3B8]">
                    {activeChannel.isDirect
                      ? activeChannel.isOnline
                        ? 'online'
                        : 'last seen recently'
                      : `${activeChannel.memberCount || 120} members • Official Community`}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action Icons: Theme Toggle, Video, Call, Search, Delete, Info */}
            <div className="flex items-center gap-1 text-[#6D6382] dark:text-[#94A3B8]">
              {/* Theme Toggle Button (Light Lavender <-> Dark Mode) */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-[#7033F5] dark:text-[#C4B5FD] transition-colors cursor-pointer"
                title={isDark ? "Switch to Crisp White & Lavender Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-[#7033F5]" />}
              </button>

              {/* Video Call */}
              <button
                onClick={() => handleStartCall(true)}
                className="p-2.5 rounded-full hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-[#7033F5] dark:text-[#A78BFA] transition-colors"
                title="Video Call"
              >
                <Video className="w-4.5 h-4.5" />
              </button>

              {/* Audio Call */}
              <button
                onClick={() => handleStartCall(false)}
                className="p-2.5 rounded-full hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-[#7033F5] dark:text-[#A78BFA] transition-colors"
                title="Audio Call"
              >
                <Phone className="w-4.5 h-4.5" />
              </button>

              {/* Search in Chat */}
              <button
                onClick={() => setShowInChatSearch(!showInChatSearch)}
                className={`p-2.5 rounded-full transition-colors ${
                  showInChatSearch
                    ? 'bg-[#F4EEFC] dark:bg-[#1E293B] text-[#7033F5] dark:text-[#F8FAFC]'
                    : 'hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-[#6A617E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
                }`}
                title="Search in conversation"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Delete Conversation */}
              {onDeleteChannel && (
                <button
                  onClick={() => {
                    if (window.confirm(`Delete conversation "${activeChannel.name}"?`)) {
                      onDeleteChannel(activeChannel.id);
                      setShowMobileChat(false);
                      showToast(`Removed conversation with ${activeChannel.name}`);
                    }
                  }}
                  className="p-2.5 rounded-full hover:bg-rose-500/10 text-[#7A728E] dark:text-[#94A3B8] hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}

              {/* Info Drawer Toggle */}
              <button
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className={`p-2.5 rounded-full transition-colors ${
                  showInfoDrawer
                    ? 'bg-[#F4EEFC] dark:bg-[#1E293B] text-[#7033F5] dark:text-[#F8FAFC]'
                    : 'hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-[#6A617E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
                }`}
                title="Community / Contact Info"
              >
                <Info className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* In-Chat Message Search Bar (Expandable) */}
          {showInChatSearch && (
            <div className="px-4 py-2 bg-white dark:bg-[#162032] border-b border-[#EDE7F6] dark:border-[#1E293B] flex items-center gap-3 relative z-10 animate-in slide-in-from-top-1 duration-150">
              <Search className="w-4 h-4 text-[#7033F5] dark:text-[#A78BFA]" />
              <input
                type="text"
                value={inChatSearchQuery}
                onChange={(e) => setInChatSearchQuery(e.target.value)}
                placeholder="Search messages in this chat..."
                className="flex-1 bg-white dark:bg-[#1E293B] px-3 py-1.5 text-xs rounded-xl border border-[#EDE7F6] dark:border-[#2D3A4F] focus:outline-none focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
                autoFocus
              />
              <span className="text-[11px] text-[#7A728E] dark:text-[#94A3B8]">
                {displayedMessages.length} match(es)
              </span>
              <button
                onClick={() => {
                  setShowInChatSearch(false);
                  setInChatSearchQuery('');
                }}
                className="p-1 rounded-full text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages Container Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 relative z-0">
            {/* Campus Encryption Notice Banner */}
            <div className="flex justify-center">
              <div className="bg-[#F4EEFC] dark:bg-[#1C1530] text-[#55496F] dark:text-[#D4C3F3] text-[10px] px-3.5 py-1.5 rounded-xl max-w-md text-center shadow-2xs border border-[#E5D7F8] dark:border-[#3D2562] flex items-center justify-center gap-1.5">
                <span>🔒</span>
                <span>Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.</span>
              </div>
            </div>

            {displayedMessages.map((msg) => {
              const isSelf = msg.isSelf;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isSelf ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 sm:p-3 shadow-2xs relative text-xs ${
                      isSelf
                        ? 'bg-[#7033F5] text-white rounded-tr-xs border border-[#6025DB] dark:border-[#5E22E2]'
                        : 'bg-white dark:bg-[#162032] text-[#211B33] dark:text-[#F8FAFC] rounded-tl-xs border border-[#EDE7F6] dark:border-[#283850]'
                    }`}
                  >
                    {/* Sender Name in Group Chats */}
                    {!isSelf && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-extrabold text-[11px] text-[#7033F5] dark:text-[#C4B5FD]">
                          {msg.senderName}
                        </span>
                        {msg.role && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#F3ECFC] dark:bg-[#2D1B4E] text-[#7033F5] dark:text-[#DDD1FA]">
                            {msg.role}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reply Quote Preview */}
                    {msg.replyTo && (
                      <div className={`mb-1.5 p-2 rounded-xl text-[11px] ${
                        isSelf
                          ? 'bg-black/15 text-white/90 border-l-3 border-l-[#C4B5FD]'
                          : 'bg-[#F5EFFE] dark:bg-[#101726] border-l-3 border-l-[#7033F5] dark:border-l-[#A78BFA] text-[#211B33] dark:text-[#F8FAFC]'
                      }`}>
                        <p className={`font-bold ${isSelf ? 'text-white' : 'text-[#7033F5] dark:text-[#A78BFA]'}`}>
                          {msg.replyTo.senderName}
                        </p>
                        <p className={`line-clamp-1 ${isSelf ? 'text-white/80' : 'text-[#6A617E] dark:text-[#94A3B8]'}`}>
                          {msg.replyTo.text}
                        </p>
                      </div>
                    )}

                    {/* Attachment Renderers */}
                    {msg.attachment && (
                      <div className="mb-2">
                        {/* Image Attachment */}
                        {msg.attachment.type === 'image' && Boolean(msg.attachment.url?.trim()) && (
                          <div className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10 shadow-2xs">
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.name}
                              className="w-full max-h-72 object-cover"
                            />
                            {msg.attachment.name && (
                              <div className={`p-1.5 text-[10px] flex items-center justify-between ${
                                isSelf
                                  ? 'bg-black/20 text-white/90'
                                  : 'bg-[#FAF7FD] dark:bg-black/40 text-[#6A617E] dark:text-[#CBD5E1]'
                              }`}>
                                <span className="truncate">{msg.attachment.name}</span>
                                {msg.attachment.size && <span>{msg.attachment.size}</span>}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Document Attachment */}
                        {msg.attachment.type === 'file' && (
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isSelf
                              ? 'bg-black/15 border-white/20 text-white'
                              : 'bg-[#FAF7FD] dark:bg-[#1E293B] border-[#EDE7F6] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC]'
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                                isSelf ? 'bg-white text-[#7033F5]' : 'bg-[#7033F5] text-white'
                              }`}>
                                <FileText className="w-4 h-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-[11px] truncate">
                                  {msg.attachment.name}
                                </p>
                                <p className={`text-[9px] ${isSelf ? 'text-white/80' : 'text-[#7A728E] dark:text-[#94A3B8]'}`}>
                                  {msg.attachment.size || 'Document'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => showToast(`Downloading ${msg.attachment?.name || 'file'}`)}
                              className={`p-1.5 rounded-lg transition-colors shrink-0 shadow-2xs ${
                                isSelf
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-white dark:bg-[#111827] hover:bg-[#F4EEFC] dark:hover:bg-[#28354A] text-[#7033F5] dark:text-[#A78BFA]'
                              }`}
                              title="Download document"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Audio / Music Attachment */}
                        {msg.attachment.type === 'audio' && (
                          <div className={`p-2.5 rounded-xl border space-y-2 ${
                            isSelf
                              ? 'bg-black/15 border-white/20 text-white'
                              : 'bg-[#FAF7FD] dark:bg-[#1E293B] border-[#EDE7F6] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC]'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelf ? 'bg-white text-[#7033F5]' : 'bg-[#7033F5] text-white'
                                }`}>
                                  <Music className="w-4 h-4" />
                                </span>
                                <div>
                                  <p className="font-bold text-[11px] truncate">
                                    {msg.attachment.name}
                                  </p>
                                  <p className={`text-[9px] ${isSelf ? 'text-white/80' : 'text-[#7A728E] dark:text-[#94A3B8]'}`}>
                                    {msg.attachment.duration || '03:45'} • Audio Track
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  setPlayingAudioId(
                                    playingAudioId === msg.id ? null : msg.id
                                  )
                                }
                                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs hover:scale-105 transition-transform ${
                                  isSelf ? 'bg-white text-[#7033F5]' : 'bg-[#7033F5] text-white'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-3.5 h-3.5" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 ml-0.5" />
                                )}
                              </button>
                            </div>
                            {/* Waveform track */}
                            <div className={`h-1.5 rounded-full overflow-hidden ${
                              isSelf ? 'bg-white/20' : 'bg-[#EDE7F6] dark:bg-white/10'
                            }`}>
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isSelf ? 'bg-white' : 'bg-[#7033F5]'
                                } ${playingAudioId === msg.id ? 'w-2/3 animate-pulse' : 'w-1/4'}`}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Voice Note Attachment */}
                        {msg.attachment.type === 'voice' && (
                          <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${
                            isSelf
                              ? 'bg-black/15 border-white/20 text-white'
                              : 'bg-[#FAF7FD] dark:bg-[#1E293B] border-[#EDE7F6] dark:border-[#2D3A4F] text-[#211B33] dark:text-[#F8FAFC]'
                          }`}>
                            <button
                              onClick={() =>
                                setPlayingAudioId(
                                  playingAudioId === msg.id ? null : msg.id
                                )
                              }
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs shrink-0 ${
                                isSelf ? 'bg-white text-[#7033F5]' : 'bg-[#7033F5] text-white'
                              }`}
                            >
                              {playingAudioId === msg.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>
                            <div className="flex-1 space-y-1">
                              {/* Audio bars */}
                              <div className="flex items-center gap-0.5 h-4">
                                {[30, 60, 45, 90, 70, 40, 80, 50, 65, 35, 75, 40].map(
                                  (h, idx) => (
                                    <span
                                      key={idx}
                                      style={{ height: `${h}%` }}
                                      className={`w-1 rounded-full ${
                                        isSelf
                                          ? 'bg-white'
                                          : playingAudioId === msg.id
                                          ? 'bg-[#7033F5] dark:bg-[#A78BFA]'
                                          : 'bg-[#C9BEE0] dark:bg-white/30'
                                      }`}
                                    ></span>
                                  )
                                )}
                              </div>
                              <span className={`text-[9px] block ${isSelf ? 'text-white/80' : 'text-[#7A728E] dark:text-[#94A3B8]'}`}>
                                {msg.attachment.duration || '0:06'}
                              </span>
                            </div>
                            <span className="text-sm">🎙️</span>
                          </div>
                        )}

                        {/* Campus Poll Attachment */}
                        {msg.attachment.type === 'poll' && msg.attachment.pollInfo && (
                          <div className={`p-3 rounded-xl border space-y-2 ${
                            isSelf
                              ? 'bg-black/15 border-white/20 text-white'
                              : 'bg-white dark:bg-[#111827] border-[#EDE7F6] dark:border-[#372E5A] text-[#211B33] dark:text-[#F8FAFC]'
                          }`}>
                            <div className={`flex items-center gap-1.5 text-[11px] font-extrabold ${
                              isSelf ? 'text-white' : 'text-[#7033F5] dark:text-[#A78BFA]'
                            }`}>
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span>Campus Poll</span>
                            </div>
                            <p className="font-bold text-xs">
                              {msg.attachment.pollInfo.question}
                            </p>
                            <div className="space-y-1.5 pt-1">
                              {msg.attachment.pollInfo.options.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleVotePoll(msg.id, opt.id)}
                                  className={`w-full p-2 rounded-lg border text-left text-[11px] flex items-center justify-between transition-colors ${
                                    isSelf
                                      ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                                      : 'bg-[#FAF7FD] dark:bg-[#1E293B] hover:bg-[#F4EEFC] dark:hover:bg-[#2A374A] border-[#EDE7F6] dark:border-[#334155] text-[#211B33] dark:text-[#F8FAFC]'
                                  }`}
                                >
                                  <span>{opt.text}</span>
                                  <span className={`text-[10px] font-bold ${
                                    isSelf ? 'text-white' : 'text-[#7033F5] dark:text-[#A78BFA]'
                                  }`}>
                                    {opt.votes} vote(s)
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Location Attachment */}
                        {msg.attachment.type === 'location' && msg.attachment.locationInfo && (
                          <div className="rounded-xl overflow-hidden border border-[#EDE7F6] dark:border-[#372E5A] bg-white dark:bg-[#111827] shadow-2xs">
                            <div className="p-3 bg-gradient-to-r from-[#7033F5] to-[#8C52FF] text-white">
                              <div className="flex items-center gap-1.5 text-xs font-bold">
                                <MapPin className="w-4 h-4" />
                                <span>{msg.attachment.locationInfo.venue}</span>
                              </div>
                              <p className="text-[10px] text-white/90 mt-0.5">
                                {msg.attachment.locationInfo.room}
                              </p>
                            </div>
                            <div className="p-2 text-[10px] text-[#6A617E] dark:text-[#94A3B8] flex items-center justify-between">
                              <span>{msg.attachment.locationInfo.notes}</span>
                              <span className="text-[#7033F5] dark:text-[#A78BFA] font-bold hover:underline cursor-pointer">Open Campus Map</span>
                            </div>
                          </div>
                        )}

                        {/* Contact Card Attachment */}
                        {msg.attachment.type === 'contact' && msg.attachment.contactInfo && (
                          <div className={`p-3 rounded-xl border shadow-2xs space-y-2 ${
                            isSelf
                              ? 'bg-black/15 border-white/20 text-white'
                              : 'bg-white dark:bg-[#111827] border-[#EDE7F6] dark:border-[#372E5A] text-[#211B33] dark:text-[#F8FAFC]'
                          }`}>
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${
                                isSelf ? 'bg-white text-[#7033F5]' : 'bg-[#7033F5] text-white'
                              }`}>
                                {msg.attachment.contactInfo?.name?.[0] || 'C'}
                              </div>
                              <div>
                                <p className="font-bold text-xs">{msg.attachment.contactInfo?.name || 'Contact'}</p>
                                <p className={`text-[10px] ${isSelf ? 'text-white/80' : 'text-[#7A728E] dark:text-[#94A3B8]'}`}>{msg.attachment.contactInfo?.phone || ''}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (msg.attachment?.contactInfo) {
                                  handleCreateDirectChat({
                                    name: msg.attachment.contactInfo.name,
                                    phone: msg.attachment.contactInfo.phone,
                                    role: msg.attachment.contactInfo.role,
                                    avatar: '',
                                  });
                                }
                              }}
                              className={`w-full py-1.5 rounded-lg text-center font-bold text-[10px] transition-colors ${
                                isSelf
                                  ? 'bg-white text-[#7033F5] hover:bg-white/90'
                                  : 'bg-[#F4EEFC] dark:bg-[#2E1D4E] hover:bg-[#EDE5FB] dark:hover:bg-[#3B2564] text-[#7033F5] dark:text-[#C4B5FD]'
                              }`}
                            >
                              Message Contact
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content Text */}
                    {msg.content && (
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    )}

                    {/* Footer: Timestamp & Delivery Ticks */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isSelf ? 'text-white/80' : 'text-[#7A728E] dark:text-[#94A3B8]'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {isSelf && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#E9D5FF]" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-white/70" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Quick Hover Action Bar */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 dark:bg-[#1E293B]/95 rounded-lg shadow-sm border border-[#EDE7F6] dark:border-white/10 px-1 py-0.5">
                      <button
                        onClick={() => setReplyTarget(msg)}
                        className="p-1 hover:text-[#7033F5] dark:hover:text-[#A78BFA] text-[#7A728E] dark:text-[#94A3B8]"
                        title="Reply"
                      >
                        <Reply className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => showToast('Message starred')}
                        className="p-1 hover:text-amber-500 text-[#7A728E] dark:text-[#94A3B8]"
                        title="Star"
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Quote Banner */}
          {replyTarget && (
            <div className="px-4 py-2 bg-white dark:bg-[#162032] border-t border-[#EDE7F6] dark:border-[#1E293B] flex items-center justify-between relative z-10 animate-in slide-in-from-bottom-1">
              <div className="border-l-3 border-[#7033F5] pl-3 py-0.5 text-xs">
                <p className="font-bold text-[#7033F5] dark:text-[#C4B5FD]">
                  Replying to {replyTarget.senderName}
                </p>
                <p className="text-[#6A617E] dark:text-[#CBD5E1] text-[11px] truncate max-w-lg">
                  {replyTarget.content}
                </p>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className="p-1 text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pending Attachment Preview Bar */}
          {pendingAttachment && (
            <div className="px-4 py-2.5 bg-white dark:bg-[#162032] border-t border-[#EDE7F6] dark:border-[#1E293B] flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                {pendingAttachment.type === 'image' && pendingAttachment.url && pendingAttachment.url.trim() ? (
                  <img
                    src={pendingAttachment.url}
                    alt="Pending"
                    className="w-12 h-12 rounded-xl object-cover border border-[#EDE7F6] dark:border-[#2D3A4F]"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-xl bg-[#7033F5] text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </span>
                )}
                <div>
                  <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">
                    {pendingAttachment.name}
                  </p>
                  <p className="text-[10px] text-[#7A728E] dark:text-[#94A3B8]">
                    {pendingAttachment.size || pendingAttachment.type} ready to send
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingAttachment(null)}
                className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Emoji Picker Palette */}
          {showEmojiPicker && (
            <div className="bg-white dark:bg-[#162032] border-t border-[#EDE7F6] dark:border-[#1E293B] p-3 max-h-64 overflow-y-auto relative z-20 shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDE7F6] dark:border-[#1E293B]">
                <span className="text-xs font-extrabold text-[#211B33] dark:text-[#F8FAFC]">
                  Campus Emoji Palette
                </span>
                <input
                  type="text"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  placeholder="Filter emojis..."
                  className="px-2.5 py-1 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] text-[#211B33] dark:text-[#F8FAFC] rounded-lg border border-[#EDE7F6] dark:border-[#2D3A4F] focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                />
              </div>
              <div className="space-y-3">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-[10px] font-bold text-[#7A728E] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5">
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cat.emojis
                        .filter((em) => !emojiSearch || em.includes(emojiSearch))
                        .map((em, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInputText((prev) => prev + em);
                            }}
                            className="w-8 h-8 text-lg rounded-lg hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] flex items-center justify-center transition-transform hover:scale-125"
                          >
                            {em}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attach Menu Popup */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-12 z-30 bg-white dark:bg-[#162032] rounded-2xl shadow-2xl border border-[#EDE7F6] dark:border-[#1E293B] p-3 grid grid-cols-3 gap-3 w-72 animate-in slide-in-from-bottom-2 duration-150">
              {/* Document */}
              <button
                onClick={() => docInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#5F66CD] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Document</span>
              </button>

              {/* Photos & Videos / Gallery */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#007BFC] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Gallery</span>
              </button>

              {/* Audio / Music */}
              <button
                onClick={() => musicInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#E542A3] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Music className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Audio</span>
              </button>

              {/* Camera Snap */}
              <button
                onClick={handleCameraSnap}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#D3396D] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Camera</span>
              </button>

              {/* Campus Poll */}
              <button
                onClick={() => setShowPollCreator(true)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#7033F5] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Poll</span>
              </button>

              {/* Location Pin */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group transition-colors"
              >
                <span className="w-11 h-11 rounded-full bg-[#9333EA] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-[#211B33] dark:text-[#F8FAFC]">Location</span>
              </button>

              {/* Contact Card */}
              <button
                onClick={handleShareContact}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F4EEFC] dark:hover:bg-[#1E293B] text-center group col-span-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#7033F5] text-white flex items-center justify-center shadow-sm">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-medium text-[#211B33] dark:text-[#F8FAFC]">Share Contact Card</span>
                </div>
              </button>
            </div>
          )}

          {/* Chat Input Bar (Crisp White & Lavender) */}
          <div className="h-16 px-4 bg-white dark:bg-[#131C2E] border-t border-[#EDE7F6] dark:border-[#1E293B] shadow-2xs flex items-center gap-2 relative z-10 shrink-0">
            {!isRecordingVoice ? (
              <>
                {/* Emoji Picker Button */}
                <button
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowAttachMenu(false);
                  }}
                  className={`p-2.5 rounded-full transition-colors ${
                    showEmojiPicker
                      ? 'text-[#7033F5] bg-[#F4EEFC] dark:bg-white/10'
                      : 'text-[#7033F5] dark:text-[#C4B5FD] hover:bg-[#F4EEFC] dark:hover:bg-white/10'
                  }`}
                  title="Emojis"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Attach File Button */}
                <button
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu);
                    setShowEmojiPicker(false);
                  }}
                  className={`p-2.5 rounded-full transition-colors ${
                    showAttachMenu
                      ? 'text-[#7033F5] bg-[#F4EEFC] dark:bg-white/10'
                      : 'text-[#7033F5] dark:text-[#C4B5FD] hover:bg-[#F4EEFC] dark:hover:bg-white/10'
                  }`}
                  title="Attach"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Text Message Input */}
                <div className="flex-1 bg-[#F8F8FA] dark:bg-[#1E293B] rounded-xl px-4 py-2 border border-[#EDE7F6] dark:border-[#2D3A4F] flex items-center focus-within:border-[#7033F5] focus-within:ring-1 focus-within:ring-[#7033F5] shadow-2xs">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full text-xs text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8] focus:outline-none resize-none max-h-24 bg-transparent"
                  />
                </div>

                {/* Microphone / Send Button */}
                {inputText.trim() || pendingAttachment ? (
                  <button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-full bg-[#7033F5] text-white flex items-center justify-center hover:bg-[#5E22E2] transition-colors shadow-xs hover:scale-105 cursor-pointer"
                    title="Send"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsRecordingVoice(true);
                      setVoiceDuration(0);
                    }}
                    className="w-10 h-10 rounded-full hover:bg-[#F4EEFC] dark:hover:bg-white/10 text-[#7033F5] dark:text-[#C4B5FD] flex items-center justify-center transition-colors cursor-pointer"
                    title="Record Voice Note"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </>
            ) : (
              /* Live Voice Recording UI Bar */
              <div className="flex-1 flex items-center justify-between bg-[#FAF7FD] dark:bg-[#1E293B] px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Recording • 0:{(voiceDuration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRecordingVoice(false)}
                    className="px-3 py-1 text-xs text-[#7A728E] dark:text-[#94A3B8] hover:text-rose-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendVoiceNote}
                    className="px-4 py-1.5 bg-[#7033F5] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#5E22E2] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Voice</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#FAF7FD] dark:bg-[#0B0F19] p-8 text-center text-[#7A728E] dark:text-[#94A3B8] space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#162032] text-[#7033F5] dark:text-[#A78BFA] flex items-center justify-center text-3xl shadow-sm border border-[#EDE7F6] dark:border-[#1E293B]">
            ⚡
          </div>
          <h2 className="text-lg font-bold text-[#211B33] dark:text-[#F8FAFC]">
            Univia Campus Messages
          </h2>
          <p className="text-xs max-w-sm">
            Select a conversation from the left to start messaging, or click the Add Contact icon to start a new peer discussion.
          </p>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-4 py-2 bg-[#7033F5] text-white rounded-xl text-xs font-bold hover:bg-[#5E22E2] shadow-xs cursor-pointer transition-colors"
          >
            + Start New Conversation
          </button>
        </div>
      )}

      {/* =========================================================================
          RIGHTMOST DRAWER: Society & Community Information
          ========================================================================= */}
      {showInfoDrawer && activeChannel && (
        <div className="w-80 bg-white dark:bg-[#111827] border-l border-[#EDE7F6] dark:border-[#1E293B] flex flex-col h-full shrink-0 animate-in slide-in-from-right-2 duration-150 z-20">
          <div className="h-15 px-4 bg-[#FAF7FD] dark:bg-[#162032] border-b border-[#EDE7F6] dark:border-[#1E293B] flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">
              {activeChannel.isDirect ? 'Contact Info' : 'Community Info'}
            </h3>
            <button
              onClick={() => setShowInfoDrawer(false)}
              className="p-1 rounded-full text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 flex flex-col items-center text-center border-b border-[#EDE7F6] dark:border-[#1E293B]">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#1E293B] shadow-md mb-2 bg-[#7033F5] flex items-center justify-center text-white text-2xl font-bold">
              {activeChannel.avatar && !activeChannel.avatar.includes('unsplash') ? (
                <img
                  src={activeChannel.avatar}
                  alt={activeChannel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{activeChannel.name ? activeChannel.name.charAt(0).toUpperCase() : 'C'}</span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#211B33] dark:text-[#F8FAFC]">
              {activeChannel.name}
            </h4>
            <p className="text-[11px] text-[#7033F5] dark:text-[#C4B5FD] font-semibold mt-0.5">
              {activeChannel.roleOrCategory || 'Verified Society'}
            </p>
            <p className="text-[11px] text-[#6A617E] dark:text-[#94A3B8] mt-2 leading-relaxed">
              {activeChannel.description ||
                'Official campus society channel for discussions, deadlines, and project collaboration.'}
            </p>
          </div>

          {/* Quick Info Navigation */}
          <div className="flex border-b border-[#EDE7F6] dark:border-[#1E293B] text-xs font-bold text-[#7A728E] dark:text-[#94A3B8]">
            <button
              onClick={() => setInfoTab('members')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                infoTab === 'members'
                  ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C4B5FD]'
                  : 'border-transparent'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setInfoTab('media')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                infoTab === 'media'
                  ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C4B5FD]'
                  : 'border-transparent'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setInfoTab('files')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
                infoTab === 'files'
                  ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C4B5FD]'
                  : 'border-transparent'
              }`}
            >
              Docs
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {infoTab === 'members' && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[#7A728E] dark:text-[#94A3B8] uppercase">
                  {activeChannel.members?.length || 5} Participants
                </p>
                <div className="space-y-2">
                  {(
                    activeChannel.members || [
                      {
                        id: 'm1',
                        name: 'Tanvi Gupta',
                        role: 'Lead / Admin',
                        isOnline: true,
                        avatar: '',
                      },
                      {
                        id: 'm2',
                        name: 'Ananya Rao',
                        role: 'Core Member',
                        isOnline: true,
                        avatar: '',
                      },
                      {
                        id: 'm3',
                        name: 'Aarav Patel',
                        role: 'Student Member',
                        isOnline: false,
                        avatar: '',
                      },
                    ]
                  ).map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF7FD] dark:hover:bg-[#1E293B] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {m.avatar && m.avatar.trim() ? (
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#EDE7F6] dark:bg-[#3B1F6A] text-[#7033F5] dark:text-[#C4B5FD] font-bold text-xs flex items-center justify-center">
                            {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-[#211B33] dark:text-[#F8FAFC]">{m.name}</p>
                          <p className="text-[9px] text-[#7A728E] dark:text-[#94A3B8]">{m.role}</p>
                        </div>
                      </div>
                      {m.role?.includes('Admin') && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F4EEFC] dark:bg-[#2A1B4E] text-[#7033F5] dark:text-[#C4B5FD] border border-[#EDE7F6] dark:border-[#4B3B6E]">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {infoTab === 'media' && (
              <div className="py-8 text-center text-[#7A728E] dark:text-[#94A3B8]">
                <p className="text-xs font-semibold">No shared photos or media</p>
                <p className="text-[11px] mt-1 text-[#9F96B2] dark:text-[#64748B]">Photos shared in this conversation will appear here</p>
              </div>
            )}

            {infoTab === 'files' && (
              <div className="space-y-2">
                {[
                  { name: 'DecentrAI_SmartContract_v2.pdf', size: '2.4 MB' },
                  { name: 'Society_Constitution_2026.pdf', size: '890 KB' },
                  { name: 'Meeting_Minutes_March.docx', size: '340 KB' },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-[#7033F5] dark:text-[#C4B5FD] shrink-0" />
                      <span className="truncate text-[#211B33] dark:text-[#F8FAFC] font-medium">{f.name}</span>
                    </div>
                    <span className="text-[9px] text-[#7A728E] dark:text-[#94A3B8] shrink-0">{f.size}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: Call Overlay, New Chat / Add Contact, Poll Creator, Location
          ========================================================================= */}
      {/* Audio / Video Call Overlay */}
      <CallOverlayModal call={activeCall} onEndCall={handleEndCall} />

      {/* New Chat / Add Contact / Community Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        existingChannels={channels}
        onCreateDirectChat={handleCreateDirectChat}
        onCreateGroup={handleCreateGroup}
        onCreateCommunity={handleCreateCommunity}
      />

      {/* Campus Poll Creator Modal */}
      {showPollCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#162032] w-full max-w-md rounded-3xl p-6 border border-[#EDE7F6] dark:border-[#2D3A4F] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#211B33] dark:text-[#F8FAFC] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#7033F5] dark:text-[#C4B5FD]" />
                <span>Create Campus Poll</span>
              </h3>
              <button
                onClick={() => setShowPollCreator(false)}
                className="p-1 rounded-full text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6A617E] dark:text-[#CBD5E1] block mb-1">
                Question *
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="e.g., When should we hold the DecentrAI code sprint?"
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#6A617E] dark:text-[#CBD5E1] block">
                Options *
              </label>
              <input
                type="text"
                value={pollOption1}
                onChange={(e) => setPollOption1(e.target.value)}
                placeholder="Option 1 (e.g. Friday 4:00 PM)"
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
              <input
                type="text"
                value={pollOption2}
                onChange={(e) => setPollOption2(e.target.value)}
                placeholder="Option 2 (e.g. Saturday 11:00 AM)"
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
              <input
                type="text"
                value={pollOption3}
                onChange={(e) => setPollOption3(e.target.value)}
                placeholder="Option 3 (Optional)"
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPollCreator(false)}
                className="px-4 py-2 text-xs font-semibold text-[#7A728E] dark:text-[#94A3B8] hover:bg-[#FAF7FD] dark:hover:bg-[#1E293B] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePoll}
                disabled={!pollQuestion.trim() || !pollOption1.trim()}
                className="px-5 py-2 text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
              >
                Attach Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campus Location Picker Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#162032] w-full max-w-md rounded-3xl p-6 border border-[#EDE7F6] dark:border-[#2D3A4F] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#211B33] dark:text-[#F8FAFC] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7033F5] dark:text-[#C4B5FD]" />
                <span>Share Campus Location</span>
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 rounded-full text-[#7A728E] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6A617E] dark:text-[#CBD5E1] block mb-1">
                Campus Building / Venue *
              </label>
              <input
                type="text"
                value={locationVenue}
                onChange={(e) => setLocationVenue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6A617E] dark:text-[#CBD5E1] block mb-1">
                Room / Hall Number
              </label>
              <input
                type="text"
                value={locationRoom}
                onChange={(e) => setLocationRoom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7FD] dark:bg-[#1E293B] border border-[#EDE7F6] dark:border-[#2D3A4F] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33] dark:text-[#F8FAFC] placeholder:text-[#8C839F] dark:placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#7A728E] dark:text-[#94A3B8] hover:bg-[#FAF7FD] dark:hover:bg-[#1E293B] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleShareLocation}
                className="px-5 py-2 text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Share Location Pin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
