import React, { useState } from 'react';
import {
  Home,
  CalendarDays,
  MessageSquare,
  Calendar,
  Menu,
  X,
  Users,
  Sparkles,
  User,
  Settings,
  Zap,
} from 'lucide-react';
import { NavTab } from '../types';
import { UniviaLogo } from './UniviaLogo';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadMessagesCount: number;
  onOpenStreamParser: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount,
  onOpenStreamParser,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'events' as NavTab, label: 'Events', icon: CalendarDays },
    {
      id: 'messages' as NavTab,
      label: 'Chat',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    { id: 'calendar' as NavTab, label: 'Schedule', icon: Calendar },
  ];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Slide-over "More" Sheet on Mobile */}
      {showMoreMenu && (
        <div
          id="mobile-more-menu-backdrop"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            id="mobile-more-menu-sheet"
            className="bg-white rounded-t-3xl border-t border-[#EDE7F5] p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle and Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F4EEFC]">
              <UniviaLogo size="sm" />

              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full hover:bg-[#F3EEFC] text-[#69617B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Stream Parser Spotlight in Mobile Menu */}
            <div
              onClick={() => {
                setShowMoreMenu(false);
                onOpenStreamParser();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F4EDFE] via-[#F8F4FF] to-[#ECE1FB] border border-[#DCBFFB] flex items-center justify-between cursor-pointer hover:border-[#7033F5] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#7033F5] text-white flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#211B33]">
                      AI Announcement Parser
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#7033F5] text-white">
                      JSON
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6A627C]">
                    Clean messy WhatsApp/Email announcements
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#7033F5]">Open →</span>
            </div>

            {/* Secondary Navigation Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleSelect('societies')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'societies'
                    ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D8C7F5] font-bold'
                    : 'bg-[#FAF8FE] text-[#332C44] border-[#EFE9F7] font-semibold hover:bg-[#F4EFFB]'
                }`}
              >
                <Users className="w-4 h-4 text-[#7033F5]" />
                <span className="text-xs">Societies & Clubs</span>
              </button>

              <button
                onClick={() => handleSelect('opportunities')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'opportunities'
                    ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D8C7F5] font-bold'
                    : 'bg-[#FAF8FE] text-[#332C44] border-[#EFE9F7] font-semibold hover:bg-[#F4EFFB]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#7033F5]" />
                <span className="text-xs">Opportunities</span>
              </button>

              <button
                onClick={() => handleSelect('profile')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D8C7F5] font-bold'
                    : 'bg-[#FAF8FE] text-[#332C44] border-[#EFE9F7] font-semibold hover:bg-[#F4EFFB]'
                }`}
              >
                <User className="w-4 h-4 text-[#7033F5]" />
                <span className="text-xs">Student Profile</span>
              </button>

              <button
                onClick={() => handleSelect('settings')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#F2EDFB] text-[#7033F5] border-[#D8C7F5] font-bold'
                    : 'bg-[#FAF8FE] text-[#332C44] border-[#EFE9F7] font-semibold hover:bg-[#F4EFFB]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#7033F5]" />
                <span className="text-xs">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar on Mobile */}
      <nav
        id="univia-mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE7F5] px-2 py-1.5 flex items-center justify-around md:hidden shadow-lg"
      >
        {mainTabs.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#7033F5] font-bold'
                  : 'text-[#7A728C] hover:text-[#211B33]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
            </button>
          );
        })}

        {/* More Menu Trigger */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            showMoreMenu ||
            ['societies', 'opportunities', 'profile', 'settings'].includes(activeTab)
              ? 'text-[#7033F5] font-bold'
              : 'text-[#7A728C] hover:text-[#211B33]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">More</span>
        </button>
      </nav>
    </>
  );
};
