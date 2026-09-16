import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Check,
  Calendar,
  Users,
  Briefcase,
  ChevronDown,
  Sparkles,
  Menu,
  Zap,
  X,
  CheckCircle2,
  Trash2,
  Sun,
  Moon,
  Shield,
  LogIn,
  User,
} from 'lucide-react';
import { NavTab, NotificationItem, UserProfile } from '../types';
import { DEFAULT_USER } from '../data/mockData';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onDismissNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenStreamParser?: () => void;
  onOpenAiNova?: () => void;
  currentUser?: UserProfile;
  onLogout?: () => void;
  themeMode?: 'light' | 'dark';
  onToggleTheme?: (mode: 'light' | 'dark') => void;
  onPromptLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onDismissNotification,
  onClearAllNotifications,
  onOpenMobileMenu,
  onOpenStreamParser,
  onOpenAiNova,
  currentUser = DEFAULT_USER,
  onLogout,
  themeMode = 'light',
  onToggleTheme,
  onPromptLogin,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((n) =>
    notifFilter === 'unread' ? !n.isRead : true
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'home':
        return {
          title: 'Campus Feed',
          subtitle: `Welcome, ${currentUser.name || 'Student'} • ${currentUser.university || 'Campus'}`,
        };
      case 'events':
        return {
          title: 'Campus Events',
          subtitle: 'Workshops, hackathons & speaker sessions',
        };
      case 'societies':
        return {
          title: 'Student Societies',
          subtitle: 'AssetMerkle, TEDx, TechNeeds & guilds',
        };
      case 'messages':
        return {
          title: 'Community Groups',
          subtitle: 'Live team channels & campus discussions',
        };
      case 'calendar':
        return {
          title: 'Campus Schedule',
          subtitle: 'Classes, deadlines & conflict alerts',
        };
      case 'opportunities':
        return {
          title: 'Opportunities Hub',
          subtitle: 'Grants, internships & collegiate perks',
        };
      case 'profile':
        return {
          title: 'Student Profile',
          subtitle: 'Verified pass & registered activities',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'Preferences & notifications',
        };
    }
  };

  const getSearchPlaceholder = (tab: NavTab) => {
    switch (tab) {
      case 'events':
        return 'Search events by title, society, venue, or date...';
      case 'societies':
        return 'Search societies by name, category, or lead...';
      case 'messages':
        return 'Search chats, groups, channels, or peers...';
      case 'calendar':
        return 'Search timetable, classes, instructors, or rooms...';
      case 'opportunities':
        return 'Search scholarships, grants, perks, or internships...';
      default:
        return 'Search campus events, societies, schedule...';
    }
  };

  const getSearchTabBadge = (tab: NavTab) => {
    switch (tab) {
      case 'events':
        return 'Events';
      case 'societies':
        return 'Societies';
      case 'messages':
        return 'Chats';
      case 'calendar':
        return 'Calendar';
      case 'opportunities':
        return 'Opportunities';
      default:
        return 'All';
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header
      id="univia-top-header"
      className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-[#ECE5F5] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0"
    >
      {/* Mobile Search Overlay when expanded */}
      {showMobileSearch ? (
        <div className="flex-1 flex items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#897E9C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={getSearchPlaceholder(activeTab)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F8F6FD] border border-[#E5DCF3] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F86A0] hover:text-[#211B33]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowMobileSearch(false);
              onSearchChange('');
            }}
            className="p-1.5 rounded-xl hover:bg-[#F3EEFC] text-[#766E87]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Left: Mobile Menu Toggle + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {onOpenMobileMenu && (
              <button
                onClick={onOpenMobileMenu}
                className="p-2 -ml-1 rounded-xl text-[#554C68] hover:bg-[#F5F0FB] md:hidden shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-[#211B33] truncate">
                {title}
              </h1>
              <p className="text-[11px] text-[#766E87] hidden sm:block truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Center Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#897E9C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="campus-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={getSearchPlaceholder(activeTab)}
                className="w-full pl-10 pr-20 py-2 text-xs bg-[#F8F6FD] border border-[#E5DCF3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7033F5]/25 focus:border-[#7033F5] text-[#211B33] placeholder-[#9B93A9] transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-xs text-[#766E87] hover:text-[#211B33] bg-[#ECE5F5] hover:bg-[#DDD2ED] rounded-full p-1 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EDE4F8] text-[#7033F5]">
                    {getSearchTabBadge(activeTab)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: AI Nova, Theme toggle, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Mobile search trigger */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="p-2 rounded-xl text-[#6D657F] hover:bg-[#F5F0FB] md:hidden"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* AI Nova Assistant Trigger */}
            {onOpenAiNova && (
              <button
                id="header-ai-nova-btn"
                onClick={onOpenAiNova}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7033F5] to-[#8B5CF6] hover:from-[#5E22E2] hover:to-[#7C3AED] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Ask AI Nova with Gemini Intelligence"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Nova</span>
              </button>
            )}

            {/* Lavender Theme Mode Toggle (Light / Dark) */}
            {onToggleTheme && (
              <button
                id="header-theme-toggle"
                onClick={() => onToggleTheme(themeMode === 'light' ? 'dark' : 'light')}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8F6FD] hover:bg-[#F0EAF9] text-[#554C68] hover:text-[#7033F5] border border-[#EAE3F4] flex items-center justify-center transition-colors"
                title={`Switch to Lavender ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label="Toggle Theme"
              >
                {themeMode === 'light' ? (
                  <Moon className="w-4 h-4 text-[#7033F5]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300" />
                )}
              </button>
            )}

            {/* Super Admin Shield Badge */}
            {currentUser.role === 'Super Admin' && (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-extrabold shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin</span>
              </span>
            )}

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F8F6FD] hover:bg-[#F0EAF9] text-[#554C68] hover:text-[#7033F5] border border-[#EAE3F4] flex items-center justify-center relative transition-colors duration-150"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#7033F5] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notifications-popover"
                  className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white border border-[#E9E1F5] rounded-2xl shadow-xl shadow-purple-950/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* Notification Bar Header */}
                  <div className="p-3.5 bg-[#FAF8FE] border-b border-[#EFE8F7]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs text-[#211B33]">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#EFEBFA] text-[#7033F5]">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={onMarkAllNotificationsAsRead}
                            className="text-[11px] font-semibold text-[#7033F5] hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        {onClearAllNotifications && notifications.length > 0 && (
                          <button
                            onClick={onClearAllNotifications}
                            className="text-[11px] font-semibold text-[#8B8399] hover:text-rose-600"
                            title="Clear all notifications"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg transition-colors ${
                          notifFilter === 'all'
                            ? 'bg-[#7033F5] text-white shadow-2xs'
                            : 'bg-[#F2EDFB] text-[#615773] hover:bg-[#E9DFFA]'
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg transition-colors ${
                          notifFilter === 'unread'
                            ? 'bg-[#7033F5] text-white shadow-2xs'
                            : 'bg-[#F2EDFB] text-[#615773] hover:bg-[#E9DFFA]'
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F5EFFB]">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#8A819C] space-y-1">
                        <p className="font-semibold text-[#3D354E]">All caught up!</p>
                        <p className="text-[11px]">No {notifFilter === 'unread' ? 'unread ' : ''}notifications right now.</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs transition-colors flex items-start gap-2.5 group ${
                            notif.isRead
                              ? 'bg-white hover:bg-[#FAF8FE]'
                              : 'bg-[#FAF6FE] hover:bg-[#F3EDFC]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              notif.isRead ? 'bg-transparent border border-[#BFB7CD]' : 'bg-[#7033F5]'
                            }`}
                          ></span>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#211B33] leading-snug">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-[#69617A] mt-0.5 leading-relaxed">
                              {notif.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-[#938A9E]">
                                {notif.timeAgo}
                              </span>
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkNotificationAsRead(notif.id);
                                  }}
                                  className="text-[10px] font-bold text-[#7033F5] hover:underline flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Mark as read</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Quick dismiss button */}
                          {onDismissNotification && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismissNotification(notif.id);
                              }}
                              className="p-1 rounded-lg text-[#A097AF] hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Quick Menu */}
            <div className="relative" ref={profileRef}>
              <button
                id="header-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[#F5F0FB] transition-colors"
                aria-label="Profile menu"
              >
                {currentUser.avatar && currentUser.avatar.trim() ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E0D5F3]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#EDE4FA] border border-[#DDD0F5] flex items-center justify-center text-[#7033F5] text-xs font-bold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#7B738C] hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div
                  id="header-profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-white border border-[#E9E1F5] rounded-2xl shadow-xl shadow-purple-950/10 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="p-3 bg-[#F8F6FD] rounded-xl mb-2">
                    <p className="text-xs font-bold text-[#211B33]">
                      {currentUser?.name || 'Student'}
                    </p>
                    <p className="text-[11px] text-[#7033F5] font-medium">
                      {currentUser?.handle || '@student'}
                    </p>
                    <p className="text-[11px] text-[#716A80] mt-1">
                      {currentUser?.university || ''}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#EDE4F5] flex items-center justify-between text-[10px] text-[#554C68]">
                      <span>ID: {currentUser?.campusCardId || currentUser?.studentId || 'N/A'}</span>
                      <span className="text-emerald-600 font-semibold">
                        Verified Pass
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTab('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#3E384D] hover:bg-[#F6F2FC] rounded-lg transition-colors font-medium"
                  >
                    View & Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#3E384D] hover:bg-[#F6F2FC] rounded-lg transition-colors font-medium"
                  >
                    Account & Theme Settings
                  </button>
                  <div className="h-px bg-[#F2EDF9] my-1"></div>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium flex items-center justify-between"
                    >
                      <span>Log Out & Clear Session</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      triggerToast(`Active student session verified for ${currentUser?.name || 'Student'}`);
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#524964] hover:bg-[#FAF8FE] rounded-lg transition-colors font-medium flex items-center justify-between"
                  >
                    <span>Verify Pass Status</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#211B33] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
