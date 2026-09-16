import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Award,
  Calendar,
  Users,
  ShieldCheck,
  Edit3,
  Bookmark,
  QrCode,
  MapPin,
  Sparkles,
  Check,
  Mail,
  Phone,
  Building,
  Code2,
  ExternalLink,
  Plus,
  Database,
  Trash2,
  FolderGit2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  X,
} from 'lucide-react';
import { CampusEvent, Society, UserProfile, ScheduleItem } from '../../types';
import { EditProfileModal } from '../EditProfileModal';
import { getStudent, deleteStudent } from '../../services/studentService';

interface ProfileViewProps {
  events: CampusEvent[];
  societies: Society[];
  onToggleRsvp: (id: string) => void;
  onSelectEvent: (event: CampusEvent) => void;
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  schedule?: ScheduleItem[];
  onUpdateSchedule?: (schedule: ScheduleItem[]) => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  events,
  societies,
  onToggleRsvp,
  onSelectEvent,
  currentUser,
  onUpdateProfile,
  schedule = [],
  onUpdateSchedule,
  onLogout,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [status, setStatus] = useState(currentUser.status || '🟢 Active on Campus');
  const [isLoadingMongo, setIsLoadingMongo] = useState(false);
  const [mongoSynced, setMongoSynced] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'projects' | 'academics' | 'timetable'>('overview');

  // Timetable Form & State
  const userSchedule = currentUser.schedule || schedule;
  const [selectedDay, setSelectedDay] = useState<'All' | 'Mon' | 'Tue' | 'Wed' | 'Thurs' | 'Fri'>('All');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [classTitle, setClassTitle] = useState('');
  const [classCourseCode, setClassCourseCode] = useState('');
  const [classDay, setClassDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thurs' | 'Fri'>('Mon');
  const [classTime, setClassTime] = useState('09:00 AM - 10:30 AM');
  const [classRoom, setClassRoom] = useState('');
  const [classFaculty, setClassFaculty] = useState('');
  const [classType, setClassType] = useState<'class' | 'lab' | 'meeting' | 'study'>('class');

  // Load fresh student profile from database on mount
  useEffect(() => {
    let isMounted = true;
    const loadFromMongo = async () => {
      const identifier =
        currentUser._id ||
        currentUser.studentId ||
        currentUser.campusCardId ||
        currentUser.email;

      if (!identifier || currentUser.isGuest) return;

      try {
        setIsLoadingMongo(true);
        const fetched = await getStudent(identifier);
        if (isMounted && fetched) {
          onUpdateProfile(fetched);
          setMongoSynced(true);
        }
      } catch (err) {
        // Fallback to currently passed user without blocking UI
        console.info('[Profile Sync Notice] Profile active with current user cache.');
      } finally {
        if (isMounted) setIsLoadingMongo(false);
      }
    };

    loadFromMongo();

    return () => {
      isMounted = false;
    };
  }, [currentUser.campusCardId, currentUser.email]);

  const joinedSocieties = societies.filter((s) => s.isJoined);
  const rsvpdEvents = events.filter((e) => e.isRsvpd);

  const statusPresets = [
    '🟢 In AI & Data Lab 201',
    '⚡ In Auditorium Hall 2 (AssetMerkle)',
    '☕ College Nescafe Corner with TechNeeds team',
    '📚 Campus Central Library Quiet Floor',
    '🎤 Amphitheatre rehearsal for TEDx',
  ];

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setEditingStatus(false);
    onUpdateProfile({
      ...currentUser,
      status: newStatus,
    });
  };

  const handleSaveNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim()) return;

    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      title: classTitle.trim(),
      courseCode: classCourseCode.trim() || undefined,
      dayOfWeek: classDay,
      time: classTime.trim() || '09:00 AM - 10:30 AM',
      location: classRoom.trim() || 'LH-101',
      instructorOrHost: classFaculty.trim() || 'Faculty',
      type: classType,
      status: 'upcoming',
    };

    const nextSchedule = [newItem, ...(currentUser.schedule || schedule || [])];
    const updatedUser: UserProfile = {
      ...currentUser,
      schedule: nextSchedule,
    };

    onUpdateProfile(updatedUser);
    if (onUpdateSchedule) onUpdateSchedule(nextSchedule);

    // Reset form
    setClassTitle('');
    setClassCourseCode('');
    setClassRoom('');
    setClassFaculty('');
    setShowAddClassModal(false);
  };

  const handleDeleteClass = (id: string) => {
    const nextSchedule = (currentUser.schedule || schedule || []).filter((s) => s.id !== id);
    const updatedUser: UserProfile = {
      ...currentUser,
      schedule: nextSchedule,
    };
    onUpdateProfile(updatedUser);
    if (onUpdateSchedule) onUpdateSchedule(nextSchedule);
  };

  const handleDeleteProfile = async () => {
    const identifier =
      currentUser._id ||
      currentUser.studentId ||
      currentUser.campusCardId ||
      currentUser.email;

    try {
      setIsDeleting(true);
      if (identifier) {
        try {
          await deleteStudent(identifier);
        } catch (err: any) {
          console.warn('Backend deletion notice (continuing with account wipe):', err?.message);
        }
      }

      // Wipe all localStorage tokens, profiles, and sessions
      localStorage.removeItem('univia_current_user');
      localStorage.removeItem('univia_session_token');
      localStorage.removeItem('univia_session_role');
      localStorage.removeItem('univia_auth_token');
      localStorage.removeItem('univia_user_session');
      sessionStorage.clear();

      setShowDeleteConfirm(false);
      if (onLogout) {
        onLogout();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Delete profile error:', err);
      localStorage.clear();
      sessionStorage.clear();
      if (onLogout) onLogout();
      else window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  const projectList = currentUser.projects || [];
  const certificationsList = currentUser.certifications || [];
  const achievementsList = currentUser.achievements || [];
  const clubsList = currentUser.clubs || [];

  return (
    <div
      id="univia-profile-view"
      className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Bar with Profile Persistence Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3ECFB] text-[#7033F5] border border-[#E4D5F8]">
            <User className="w-3.5 h-3.5 text-[#7033F5]" />
            <span>Student Profile</span>
            {isLoadingMongo ? (
              <RefreshCw className="w-3 h-3 animate-spin ml-1 text-[#7033F5]" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-0.5" />
            )}
          </div>
          <span className="text-[11px] text-[#766E87] hidden sm:inline">
            Active Student Account
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Delete Profile & Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete Profile</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-1.5 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Student Banner Card */}
      <div className="bg-white rounded-3xl border border-[#EDE7F5] overflow-hidden shadow-sm">
        {/* Decorative Lavender Gradient Header */}
        <div className="h-32 bg-gradient-to-r from-[#EDE4FA] via-[#F4EFFD] to-[#E5DBF8] p-6 flex items-start justify-end relative">
          {currentUser.course && (
            <span className="text-xs font-semibold text-[#665D79] bg-white/80 px-3 py-1 rounded-xl border border-purple-100">
              {currentUser.course}
            </span>
          )}
        </div>

        {/* Profile Details Content */}
        <div className="p-6 pt-0 relative sm:flex items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 text-center sm:text-left">
            <div className="relative group">
              {currentUser.avatar && currentUser.avatar.trim() ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md ring-1 ring-purple-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-[#ECE5F8] border-4 border-white shadow-md ring-1 ring-purple-200 flex flex-col items-center justify-center text-[#7033F5]">
                  <User className="w-8 h-8 mb-0.5" />
                  <span className="text-[10px] font-bold">No Photo</span>
                </div>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Photo"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-extrabold text-[#211B33]">
                  {currentUser.name}
                </h1>
                <span className="text-xs text-[#7033F5] font-bold bg-[#F3EFF9] px-2.5 py-0.5 rounded-full border border-[#E5DAF6]">
                  {currentUser.handle}
                </span>
              </div>
              <p className="text-xs font-bold text-[#5527B8] mt-0.5">
                {currentUser.course ? `${currentUser.course} in ` : ''}
                {currentUser.department || currentUser.major}
              </p>
              <p className="text-xs text-[#7B738C] mt-0.5">
                {currentUser.university} • {currentUser.classYear}
                {currentUser.semester ? ` • ${currentUser.semester}` : ''}
              </p>
            </div>
          </div>

          {/* Live Campus Status */}
          <div className="mt-4 sm:mt-0 pb-2">
            <div className="bg-[#FAF8FE] border border-[#EDE4F6] p-3 rounded-2xl flex items-center gap-2 shadow-2xs">
              <span className="text-xs font-medium text-[#292236]">
                {currentUser.status || status}
              </span>
              <button
                onClick={() => setEditingStatus(!editingStatus)}
                className="p-1 hover:bg-[#EDE5F8] rounded-lg text-[#7033F5] transition-colors"
                title="Change status"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick status selector */}
        {editingStatus && (
          <div className="px-6 pb-4 pt-1 border-t border-[#F5EFFC] bg-[#FCFBFE] space-y-2">
            <p className="text-[11px] font-bold text-[#6D657F]">
              Select Current Campus Status:
            </p>
            <div className="flex flex-wrap gap-2">
              {statusPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleStatusChange(preset)}
                  className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-[#E7DCF5] hover:border-[#7033F5] text-[#362F47] font-medium transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bio & Details Bar */}
        {currentUser.bio && (
          <div className="px-6 py-3 border-t border-[#F2ECFA] bg-[#FAF8FE]/50 text-xs text-[#544C66] leading-relaxed">
            <p className="italic">"{currentUser.bio}"</p>
          </div>
        )}

        {/* Contact & Links Bar */}
        <div className="px-6 py-3 border-t border-[#F2ECFA] bg-white flex flex-wrap items-center gap-4 text-xs text-[#6B637B]">
          {currentUser.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7033F5]" />
              <span>{currentUser.email}</span>
            </span>
          )}
          {currentUser.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentUser.phone}</span>
            </span>
          )}
          {currentUser.hostelBlock && (
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#5527B8]" />
              <span>{currentUser.hostelBlock}</span>
            </span>
          )}
          {currentUser.github && (
            <a
              href={currentUser.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#211B33] hover:text-[#7033F5] font-bold"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          )}
          {currentUser.linkedin && (
            <a
              href={currentUser.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#0A66C2] hover:underline font-bold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>

        {/* Skills & Tech Chips */}
        <div className="px-6 py-3 border-t border-[#F2ECFA] bg-[#FCFBFE] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#867E96] mr-1">
              Skills:
            </span>
            {currentUser.skills && currentUser.skills.length > 0 ? (
              currentUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-lg bg-[#FAF8FE] border border-[#E2D5F5] text-[#5527B8] font-semibold text-[11px]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#8A829B] italic">No skills added yet</span>
            )}
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-[11px] font-bold text-[#7033F5] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>{currentUser.skills && currentUser.skills.length > 0 ? 'Edit Skills' : 'Add Skills'}</span>
          </button>
        </div>

        {/* Interests Bar */}
        {currentUser.interests && currentUser.interests.length > 0 && (
          <div className="px-6 py-2.5 border-t border-[#F2ECFA] bg-white flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#867E96] mr-1">
              Interests:
            </span>
            {currentUser.interests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 rounded-lg bg-[#F3ECFD] text-[#7033F5] text-[10px] font-bold"
              >
                #{interest}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-4 border-t border-[#F2ECFA] bg-[#FAF8FE] text-center divide-x divide-[#F0EAF8] py-3 text-xs">
          <div>
            <p className="font-black text-base text-[#211B33]">
              {joinedSocieties.length}
            </p>
            <p className="text-[11px] text-[#7A728C]">Societies</p>
          </div>
          <div>
            <p className="font-black text-base text-[#211B33]">
              {rsvpdEvents.length}
            </p>
            <p className="text-[11px] text-[#7A728C]">Events RSVP'd</p>
          </div>
          <div>
            <p className="font-black text-base text-[#211B33]">
              {userSchedule.length}
            </p>
            <p className="text-[11px] text-[#7A728C]">Classes</p>
          </div>
          <div>
            <p className="font-black text-base text-[#211B33]">
              {(currentUser.projects?.length || 0) + (currentUser.certifications?.length || 0)}
            </p>
            <p className="text-[11px] text-[#7A728C]">Projects &amp; Certs</p>
          </div>
        </div>
      </div>

      {/* Sub Tab Switcher: Overview vs Projects vs Academics */}
      <div className="flex border-b border-[#EDE4F6] gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-[#7033F5] text-[#7033F5]'
              : 'border-transparent text-[#766E87] hover:text-[#211B33]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Societies & RSVPs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('projects')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'projects'
              ? 'border-[#7033F5] text-[#7033F5]'
              : 'border-transparent text-[#766E87] hover:text-[#211B33]'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects & Portfolio ({projectList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('academics')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'academics'
              ? 'border-[#7033F5] text-[#7033F5]'
              : 'border-transparent text-[#766E87] hover:text-[#211B33]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Clubs, Achievements & Certifications</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'timetable'
              ? 'border-[#7033F5] text-[#7033F5]'
              : 'border-transparent text-[#766E87] hover:text-[#211B33]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Timetable &amp; Schedule ({userSchedule.length})</span>
        </button>
      </div>

      {/* SUB-VIEW 1: OVERVIEW (Societies & Events) */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Joined Societies */}
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7033F5]" />
                <span>Joined Societies ({joinedSocieties.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {joinedSocieties.length > 0 ? (
                joinedSocieties.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-[#ECE5F5] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-white border border-[#DDD0F4] flex items-center justify-center text-lg shadow-2xs">
                        {s.avatar}
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-[#211B33]">{s.name}</h4>
                        <p className="text-[10px] text-[#7B738C]">{s.memberCount} members • {s.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Member
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
                  No societies joined yet. Explore societies to connect with campus groups.
                </div>
              )}
            </div>
          </div>

          {/* Registered Events */}
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7033F5]" />
                <span>Upcoming RSVP'd Events ({rsvpdEvents.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {rsvpdEvents.length > 0 ? (
                rsvpdEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8FD] border border-[#ECE5F5] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#5527B8]">
                        {evt.date} • {evt.time}
                      </span>
                      <h4
                        onClick={() => onSelectEvent(evt)}
                        className="text-xs font-bold text-[#211B33] truncate cursor-pointer hover:text-[#7033F5] mt-0.5"
                      >
                        {evt.title}
                      </h4>
                      <p className="text-[10px] text-[#7B738C] truncate mt-0.5">
                        {evt.location} ({evt.society})
                      </p>
                    </div>
                    <button
                      onClick={() => onToggleRsvp(evt.id)}
                      className="text-[11px] text-[#7B738C] hover:text-rose-600 font-semibold shrink-0 px-2 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
                  No upcoming RSVP'd events. Check the Events feed to register for campus activities.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PROJECTS & PORTFOLIO */}
      {activeSubTab === 'projects' && (
        <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#7033F5]" />
                <span>Featured Student Projects</span>
              </h3>
              <p className="text-xs text-[#7B738C] mt-0.5">
                Technical repositories and software artifacts saved to profile
              </p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#F3ECFB] hover:bg-[#EAE0F9] text-[#7033F5] font-bold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          {projectList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectList.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#ECE5F5] hover:border-[#D8C7F3] transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-[#211B33]">{proj.title}</h4>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7033F5] hover:underline flex items-center gap-1 text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#5D5570] leading-relaxed">{proj.description}</p>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-white border border-[#E3D6F5] text-[#7033F5] text-[10px] font-bold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
              <p>No projects added yet.</p>
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-2 text-xs font-bold text-[#7033F5] hover:underline cursor-pointer"
              >
                + Add your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: CLUBS, ACHIEVEMENTS & CERTIFICATIONS */}
      {activeSubTab === 'academics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Achievements & Certifications */}
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7033F5]" />
              <span>Achievements & Honors</span>
            </h3>

            <div className="space-y-2.5">
              {achievementsList.length > 0 ? (
                achievementsList.map((ach, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF8FE] border border-[#EDE4F6] flex items-center gap-3 text-xs font-semibold text-[#211B33]"
                  >
                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                      🏆
                    </span>
                    <span>{ach}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
                  No achievements listed yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#F2ECFA]">
              <h4 className="font-bold text-xs text-[#6B637B] mb-2">Verified Certifications</h4>
              <div className="space-y-2">
                {certificationsList.length > 0 ? (
                  certificationsList.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#FCFBFE] border border-[#EDE4F6] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#211B33]">{cert.name}</p>
                        <p className="text-[10px] text-[#766E87]">
                          {cert.issuer} {cert.year ? `• ${cert.year}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#7033F5] border border-purple-200">
                        Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
                    No certifications added yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clubs & Communities */}
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#7033F5]" />
              <span>Campus Clubs & Communities</span>
            </h3>
            <p className="text-xs text-[#7B738C]">
              Active leadership and society involvement on campus
            </p>

            <div className="space-y-2.5">
              {clubsList.length > 0 ? (
                clubsList.map((club, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF8FE] border border-[#EDE4F6] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-white border border-[#DDD0F4] flex items-center justify-center text-xs">
                        ⚡
                      </span>
                      <span className="font-bold text-[#211B33]">{club}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Member
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#EDE4F6] text-xs text-[#8A829B]">
                  No clubs joined yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: TIMETABLE & SCHEDULE */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#EDE7F5] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2ECFA]">
              <div>
                <h3 className="font-bold text-base text-[#211B33] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7033F5]" />
                  <span>College Timetable &amp; Class Schedule</span>
                </h3>
                <p className="text-xs text-[#7A728C] mt-0.5">
                  Keep your lectures, practical labs, and study blocks organized. Nova checks this to prevent event overlaps!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Class / Lab</span>
                </button>
              </div>
            </div>

            {/* Day of week filter buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(['All', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri'] as const).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    selectedDay === day
                      ? 'bg-[#7033F5] text-white shadow-xs'
                      : 'bg-[#FAF8FE] text-[#696179] border border-[#E8DEF7] hover:border-[#7033F5]'
                  }`}
                >
                  {day === 'All' ? 'Whole Week' : day}
                </button>
              ))}
            </div>

            {/* Timetable Items */}
            {userSchedule.filter((item) => selectedDay === 'All' || item.dayOfWeek === selectedDay).length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#FAF8FE] border border-dashed border-[#E0D3F5] space-y-3">
                <Calendar className="w-10 h-10 text-[#A89EC0] mx-auto" />
                <h4 className="text-sm font-bold text-[#211B33]">
                  No Classes Scheduled {selectedDay !== 'All' ? `for ${selectedDay}` : 'Yet'}
                </h4>
                <p className="text-xs text-[#7A728C] max-w-sm mx-auto">
                  Add your courses, timings, and classroom numbers to have your personalized semester schedule ready.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#7033F5] text-white text-xs font-bold hover:bg-[#5E22E2] shadow-xs"
                  >
                    + Add Your First Class
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {userSchedule
                  .filter((item) => selectedDay === 'All' || item.dayOfWeek === selectedDay)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#EDE4F6] hover:border-[#D6C5F2] transition-all flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#F2ECFB] text-[#7033F5] border border-[#E3D5F5]">
                              {item.dayOfWeek || 'Mon'}
                            </span>
                            {item.courseCode && (
                              <span className="text-[10px] font-bold text-[#5527B8]">
                                {item.courseCode}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-[#827A93] uppercase">
                              {item.type || 'class'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#211B33]">{item.title}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteClass(item.id)}
                          className="p-1.5 rounded-lg text-[#948B9F] hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#F0EAF8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B627D]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#7033F5]" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#7033F5]" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        {item.instructorOrHost && (
                          <div className="w-full text-[11px] text-[#7A718B]">
                            Faculty: <span className="font-semibold text-[#292236]">{item.instructorOrHost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 border border-[#EDE7F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAF8]">
              <h3 className="text-base font-extrabold text-[#211B33] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7033F5]" />
                <span>Add Class / Lab to Timetable</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddClassModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#7A718C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewClass} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                  Subject / Course Title *
                </label>
                <input
                  type="text"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  placeholder="e.g., Data Structures & Algorithms, Physics Practical"
                  required
                  className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={classCourseCode}
                    onChange={(e) => setClassCourseCode(e.target.value)}
                    placeholder="e.g., CS-201, PH-102"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={classDay}
                    onChange={(e) => setClassDay(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thurs">Thursday</option>
                    <option value="Fri">Friday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Timing Range *
                  </label>
                  <input
                    type="text"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    placeholder="e.g., 09:00 AM - 10:30 AM"
                    required
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Session Type
                  </label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  >
                    <option value="class">Lecture (Class)</option>
                    <option value="lab">Lab / Practical</option>
                    <option value="study">Tutorial / Study Group</option>
                    <option value="meeting">Society / Seminar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Room / Venue *
                  </label>
                  <input
                    type="text"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    placeholder="e.g., LH-302, Computing Lab 2"
                    required
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4B3E65] block mb-1">
                    Instructor / Professor
                  </label>
                  <input
                    type="text"
                    value={classFaculty}
                    onChange={(e) => setClassFaculty(e.target.value)}
                    placeholder="e.g., Prof. R.K. Sharma"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8FE] border border-[#E4D8F3] rounded-xl focus:ring-1 focus:ring-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F2ECFA]">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#665E77] hover:bg-[#F2EDFA] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white rounded-xl shadow-xs transition-colors"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-rose-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#211B33]">
                Delete Student Profile &amp; Account?
              </h3>
              <p className="text-xs text-[#7A728C] mt-1.5 leading-relaxed">
                This will permanently remove your student profile <strong>{currentUser.name}</strong> (Roll:{' '}
                {currentUser.campusCardId || currentUser.studentId}). This action cannot be undone and your account data will be completely wiped.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-[#665E77] hover:bg-[#F2EDFA] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting Account...' : 'Confirm Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={currentUser}
        onSaveProfile={onUpdateProfile}
      />
    </div>
  );
};
