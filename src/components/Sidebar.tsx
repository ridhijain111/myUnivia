import React from 'react';
import {
  Home,
  CalendarDays,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  User,
  Settings,
  X,
} from 'lucide-react';
import { NavTab, UserProfile } from '../types';
import { DEFAULT_USER } from '../data/mockData';
import { UniviaLogo } from './UniviaLogo';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadMessagesCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: UserProfile;
  isGuest?: boolean;
  onOpenAiNova?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount,
  isMobileOpen = false,
  onCloseMobile,
  currentUser = DEFAULT_USER,
  isGuest = false,
  onOpenAiNova,
}) => {
  const mainNavItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'events' as NavTab, label: 'Events', icon: CalendarDays },
    { id: 'societies' as NavTab, label: 'Societies', icon: Users },
    {
      id: 'messages' as NavTab,
      label: 'Messages',
      icon: MessageSquare,
      isProminent: true,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} new` : undefined,
    },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: Calendar },
    { id: 'opportunities' as NavTab, label: 'Opportunities', icon: Sparkles },
  ];

  const bottomNavItems = [
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = (isDrawer = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="p-5 sm:p-6 pb-5 flex items-center justify-between border-b border-[#F0EAF8]">
          <div
            id="brand-logo"
            onClick={() => handleTabClick('home')}
            className="cursor-pointer group"
          >
            <UniviaLogo size="md" />
          </div>

          {isDrawer && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-xl text-[#756D84] hover:bg-[#F2ECFA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#968EA7]">
            Menu
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isProminent) {
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7033F5] to-[#804AF6] text-white shadow-md shadow-[#7033F5]/20 font-semibold'
                      : 'bg-gradient-to-r from-[#F2EDFD] to-[#F7F3FF] text-[#5527B8] hover:from-[#EAE2FB] hover:to-[#F1EBFC] border border-[#DDD3F5] font-semibold shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1 rounded-lg ${
                        isActive ? 'text-white' : 'text-[#7033F5]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full tracking-tight transition-transform duration-200 group-hover:scale-105 ${
                        isActive
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'bg-[#7033F5] text-white shadow-xs animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#EFEBFA] text-[#7033F5] font-semibold border-l-4 border-[#7033F5]'
                    : 'text-[#4D465C] hover:bg-[#F3EFF9] hover:text-[#211B33]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-[#7033F5]' : 'text-[#766E87]'
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI Nova Campus Intelligence Pill */}
        {onOpenAiNova && (
          <div className="px-3 pt-2">
            <button
              id="sidebar-ai-nova-btn"
              onClick={onOpenAiNova}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-[#7033F5]/10 via-[#8B5CF6]/10 to-[#C084FC]/10 border border-[#7033F5]/20 hover:border-[#7033F5]/40 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#7033F5] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#211B33]">AI Nova</p>
                  <p className="text-[10px] text-[#7033F5] font-medium">Gemini Campus AI</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#7033F5] text-white">Ask</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Profile Widget */}
      <div className="p-3 border-t border-[#F0EAF8] space-y-3">
        <div className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-bottom-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#EFEBFA] text-[#7033F5] font-semibold'
                    : 'text-[#5A536B] hover:bg-[#F3EFF9] hover:text-[#211B33]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#7033F5]' : 'text-[#877F98]'
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Mini Card in Bottom Left Corner */}
        <div
          id="user-mini-card"
          onClick={() => handleTabClick('profile')}
          className="p-2.5 rounded-xl bg-white border border-[#EBE4F5] flex items-center gap-2.5 cursor-pointer hover:border-[#D1C2EE] transition-colors shadow-xs"
        >
          <div className="relative">
            {currentUser.avatar && currentUser.avatar.trim() ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-purple-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#EDE4FA] border border-purple-200 flex items-center justify-center text-[#7033F5] text-xs font-bold">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white bg-emerald-500"
            ></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#211B33] truncate">
              {currentUser?.name || 'Student'}
            </p>
            <p className="text-[11px] text-[#766E87] truncate">
              {currentUser?.classYear || currentUser?.major || 'Univia Student'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="univia-sidebar"
        className="hidden md:flex md:w-64 bg-[#FCFBFE] border-r border-[#EDE7F6] flex-col justify-between shrink-0 select-none z-20 min-h-screen sticky top-0 h-screen"
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div
          id="univia-mobile-drawer-backdrop"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        >
          <div
            id="univia-mobile-drawer"
            className="w-72 max-w-[82vw] bg-[#FCFBFE] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
