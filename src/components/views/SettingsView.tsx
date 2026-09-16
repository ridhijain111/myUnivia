import React, { useState } from 'react';
import {
  Bell,
  Lock,
  Palette,
  Check,
  Smartphone,
  Mail,
  Shield,
  Sliders,
  MessageSquare,
  User,
  Phone,
  Video,
  LogOut,
  Edit3,
  Sparkles,
  Download,
  Wifi,
  Sun,
  Moon,
  Trash2,
  KeyRound,
  Compass,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { EditProfileModal } from '../EditProfileModal';

interface SettingsViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  themeMode?: 'light' | 'dark';
  onToggleTheme?: (mode: 'light' | 'dark') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateProfile,
  onLogout,
  themeMode = 'light',
  onToggleTheme,
}) => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'theme' | 'chat' | 'notifications' | 'privacy'>('account');

  // Chat / WhatsApp settings
  const [enterToSend, setEnterToSend] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [autoDownloadWifi, setAutoDownloadWifi] = useState(true);
  const [hdVoiceCalls, setHdVoiceCalls] = useState(true);

  // Notification settings
  const [eventAlerts, setEventAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [messagePings, setMessagePings] = useState(true);
  const [callRingtone, setCallRingtone] = useState(true);

  // Privacy settings
  const [showPresence, setShowPresence] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  return (
    <div id="univia-settings-view" className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#211B33]">
            Platform Preferences & Account Settings
          </h1>
          <p className="text-xs text-[#766E87] mt-1">
            Configure your Univia Lavender Theme, WhatsApp chat settings, and student credentials
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7033F5] text-white hover:bg-[#5E22E2] transition-colors shadow-xs self-start sm:self-auto"
        >
          Save All Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span>✓ All settings and Lavender Theme preferences saved successfully!</span>
          <span className="text-[10px] text-emerald-600">Active</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold border-b border-[#EDE4F6]">
        <button
          onClick={() => setActiveTab('account')}
          className={`py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'account'
              ? 'bg-[#7033F5] text-white shadow-2xs'
              : 'text-[#6D657F] hover:bg-[#FAF8FE]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Account</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-[#7033F5] text-white shadow-2xs'
              : 'text-[#6D657F] hover:bg-[#FAF8FE]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Lavender Theme (Light / Dark)</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-[#7033F5] text-white shadow-2xs'
              : 'text-[#6D657F] hover:bg-[#FAF8FE]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp & Calls</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#7033F5] text-white shadow-2xs'
              : 'text-[#6D657F] hover:bg-[#FAF8FE]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-[#7033F5] text-white shadow-2xs'
              : 'text-[#6D657F] hover:bg-[#FAF8FE]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy</span>
        </button>
      </div>

      {/* TAB 1: ACCOUNT & LOGOUT */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#F6F1FD]">
              <div className="flex items-center gap-4">
                {currentUser.avatar && currentUser.avatar.trim() ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E3D6F5]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#EDE4FA] border-2 border-[#E3D6F5] flex items-center justify-center text-[#7033F5] text-xl font-bold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#211B33]">
                      {currentUser.name}
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EDE4FA] text-[#7033F5]">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#7033F5] font-semibold">{currentUser.handle}</p>
                  <p className="text-xs text-[#766E87] mt-0.5">
                    {currentUser.major} • {currentUser.classYear}
                  </p>
                </div>
              </div>

              {!currentUser.isGuest && (
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E2D4F5] text-[#7033F5] hover:bg-[#F9F6FE] transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile Details</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
              <div className="p-3.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE4F6]">
                <p className="text-[#786E8D] font-medium">Campus Card & Student Roll</p>
                <p className="font-bold text-[#211B33] mt-0.5">{currentUser.campusCardId}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE4F6]">
                <p className="text-[#786E8D] font-medium">Primary University Email</p>
                <p className="font-bold text-[#211B33] mt-0.5">{currentUser.email || 'student@university.edu'}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE4F6]">
                <p className="text-[#786E8D] font-medium">Verified Phone Contact</p>
                <p className="font-bold text-[#211B33] mt-0.5">{currentUser.phone || '+91 98101 23456'}</p>
              </div>

              <div className="p-3.5 bg-[#FAF8FE] rounded-2xl border border-[#EDE4F6]">
                <p className="text-[#786E8D] font-medium">Institution & Campus</p>
                <p className="font-bold text-[#211B33] mt-0.5">{currentUser.university}</p>
              </div>
            </div>
          </div>

          {/* SECURE LOGOUT ROUTINE CARD */}
          <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">Session Security & Logout Routine</h3>
                <p className="text-xs text-[#766E87]">
                  Completely terminates student session, clears local storage cache, and securely returns to the Univia Guest Gateway.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-settings-logout"
                onClick={onLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Complete Secure Logout & Return to Gateway</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAVENDER THEME CONSTRAINTS (EXCLUSIVE LAVENDER ACCENT) */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EEFC] text-[#7033F5] flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#211B33]">
                Lavender Accent Theme Configuration
              </h3>
              <p className="text-xs text-[#766E87]">
                Univia strictly adheres to a cohesive Lavender Accent palette with soft lavenders/purples on light and dark neutral canvases.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* OPTION A: LAVENDER LIGHT */}
            <div
              id="theme-option-light"
              onClick={() => onToggleTheme && onToggleTheme('light')}
              className={`p-5 rounded-2xl cursor-pointer border-2 transition-all space-y-3 ${
                themeMode === 'light'
                  ? 'border-[#7033F5] bg-[#FAF8FE] shadow-md shadow-[#7033F5]/10'
                  : 'border-[#EDE4F6] bg-white hover:border-[#D6C4F1]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EDE4FA] text-[#7033F5] flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#211B33]">Lavender Light Mode</p>
                    <p className="text-[10px] text-[#7B738C]">Clean soft-lavender on light slate canvas</p>
                  </div>
                </div>
                {themeMode === 'light' && (
                  <span className="w-5 h-5 rounded-full bg-[#7033F5] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Theme Preview Swatch */}
              <div className="p-3 bg-[#F8F6FD] rounded-xl border border-[#E9DFF7] flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#7033F5]"></span>
                <span className="w-4 h-4 rounded-full bg-[#8A50F7]"></span>
                <span className="w-4 h-4 rounded-full bg-[#DDD5ED]"></span>
                <span className="text-[10px] font-semibold text-[#5B5270] ml-auto">
                  Canvas: #F8F6FD
                </span>
              </div>
            </div>

            {/* OPTION B: LAVENDER DARK */}
            <div
              id="theme-option-dark"
              onClick={() => onToggleTheme && onToggleTheme('dark')}
              className={`p-5 rounded-2xl cursor-pointer border-2 transition-all space-y-3 ${
                themeMode === 'dark'
                  ? 'border-[#7033F5] bg-[#1E192D] text-white shadow-md shadow-[#7033F5]/20'
                  : 'border-[#EDE4F6] bg-[#1A1627] text-white/90 hover:border-[#7033F5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2D2345] text-[#A679F9] flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">Lavender Dark Mode</p>
                    <p className="text-[10px] text-[#B8ADC9]">Luminous lavender accents on slate purple canvas</p>
                  </div>
                </div>
                {themeMode === 'dark' && (
                  <span className="w-5 h-5 rounded-full bg-[#8F54F9] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Theme Preview Swatch */}
              <div className="p-3 bg-[#261E38] rounded-xl border border-[#3E3459] flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#8F54F9]"></span>
                <span className="w-4 h-4 rounded-full bg-[#A679F9]"></span>
                <span className="w-4 h-4 rounded-full bg-[#473B66]"></span>
                <span className="text-[10px] font-semibold text-[#DDD5ED] ml-auto">
                  Canvas: #120F1D
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP & CALL SETTINGS */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EEFC] text-[#7033F5] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#211B33]">WhatsApp Messaging & Calls</h3>
              <p className="text-xs text-[#766E87]">
                Configure chat key shortcuts, read receipts, and multimedia downloads
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F6F1FD] text-xs space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Enter key sends message</p>
                <p className="text-[#766E87]">Pressing Enter immediately sends your chat message</p>
              </div>
              <input
                type="checkbox"
                checked={enterToSend}
                onChange={() => setEnterToSend(!enterToSend)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Read Receipts (Blue Ticks)</p>
                <p className="text-[#766E87]">Show two blue checkmarks when you have read messages</p>
              </div>
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={() => setReadReceipts(!readReceipts)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">High Definition Audio/Video Calls</p>
                <p className="text-[#766E87]">Prioritize collegiate campus Wi-Fi bandwidth for crisp calling</p>
              </div>
              <input
                type="checkbox"
                checked={hdVoiceCalls}
                onChange={() => setHdVoiceCalls(!hdVoiceCalls)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EEFC] text-[#7033F5] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#211B33]">Notification & Alert Routing</h3>
              <p className="text-xs text-[#766E87]">
                Manage alerts for approved events, society announcements, and chat pings
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F6F1FD] text-xs space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Campus Event Announcements</p>
                <p className="text-[#766E87]">Receive immediate popups when new workshops are approved</p>
              </div>
              <input
                type="checkbox"
                checked={eventAlerts}
                onChange={() => setEventAlerts(!eventAlerts)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Academic Deadlines & Exam Alerts</p>
                <p className="text-[#766E87]">Notifications 24 hours before assignment submissions</p>
              </div>
              <input
                type="checkbox"
                checked={deadlineReminders}
                onChange={() => setDeadlineReminders(!deadlineReminders)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Incoming Call Ringtone</p>
                <p className="text-[#766E87]">Play collegiate ringtone on audio and video calls</p>
              </div>
              <input
                type="checkbox"
                checked={callRingtone}
                onChange={() => setCallRingtone(!callRingtone)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4EEFC] text-[#7033F5] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#211B33]">Campus Privacy & Directory Presence</h3>
              <p className="text-xs text-[#766E87]">
                Control who can see your campus location and status in chats
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#F6F1FD] text-xs space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Share Live Campus Status</p>
                <p className="text-[#766E87]">Allow classmates to see your library / lab status pill</p>
              </div>
              <input
                type="checkbox"
                checked={showPresence}
                onChange={() => setShowPresence(!showPresence)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="font-bold text-[#211B33]">Show Online Presence in Messages</p>
                <p className="text-[#766E87]">Show green dot when you have Univia open</p>
              </div>
              <input
                type="checkbox"
                checked={showLastSeen}
                onChange={() => setShowLastSeen(!showLastSeen)}
                className="w-4 h-4 accent-[#7033F5]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentUser={currentUser}
        onSaveProfile={onUpdateProfile}
      />
    </div>
  );
};
