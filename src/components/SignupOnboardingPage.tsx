import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  Society,
  CampusEvent,
} from '../types';
import { UniviaLogo } from './UniviaLogo';
import {
  GraduationCap,
  Users,
  Calendar,
  Search,
  Check,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Tag,
  Building2,
  Clock,
  MapPin,
  Bookmark,
  ShieldCheck,
  Compass,
  X,
  ChevronRight,
} from 'lucide-react';

interface SignupOnboardingPageProps {
  currentUser: UserProfile;
  societies: Society[];
  events: CampusEvent[];
  onComplete: (data: {
    updatedProfile: UserProfile;
    joinedSocietyIds: string[];
    rsvpEventIds: string[];
  }) => void;
}

const POPULAR_INTEREST_TAGS = [
  'Web3 & Blockchain',
  'AI & Machine Learning',
  'Robotics & Automation',
  'Competitive Coding',
  'UI/UX & Product Design',
  'Open Source Software',
  'Public Speaking & TEDx',
  'Debating & Literature',
  'Entrepreneurship & Startups',
  'Women in Tech (WiCS)',
  'Performing Arts & Music',
  'Hackathons & Sprints',
];

const SKILL_SUGGESTIONS = [
  'Python',
  'C++',
  'TypeScript',
  'React',
  'DSA',
  'Machine Learning',
  'Figma',
  'Solidity',
  'Git & GitHub',
  'Public Speaking',
];

const BRANCH_OPTIONS = [
  'B.Tech Computer Science & AI (CSE-AI)',
  'B.Tech Computer Science & Engineering (CSE)',
  'B.Tech Artificial Intelligence & Data Science (AI-DS)',
  'B.Tech Information Technology (IT)',
  'B.Tech Electronics & Communication (ECE)',
  'B.Tech Electronics & Communication - AI',
  'B.Tech Mechanical & Automation (MAE)',
  'B.Tech Electrical & Electronics (EEE)',
  'B.Arch Architecture & Planning',
  'BBA / MBA Management Studies',
  'BCA / MCA Computer Applications',
  'M.Tech / Dual Degree',
  'PhD / Research Scholar',
  'Others',
];

export const SignupOnboardingPage: React.FC<SignupOnboardingPageProps> = ({
  currentUser,
  societies,
  events,
  onComplete,
}) => {
  // Navigation steps: 1 = Profile Info, 2 = Societies, 3 = Events, 4 = Campus Explorer
  const [activeStep, setActiveStep] = useState<number>(1);

  // Step 1: Profile Information State
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [studentRollId, setStudentRollId] = useState(
    currentUser.campusCardId || currentUser.studentId || ''
  );
  const [branch, setBranch] = useState(currentUser.major || '');
  const [customBranch, setCustomBranch] = useState('');
  const [classYear, setClassYear] = useState(currentUser.classYear || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser.interests && currentUser.interests.length > 0
      ? currentUser.interests
      : []
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser.skills && currentUser.skills.length > 0
      ? currentUser.skills
      : []
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Step 2: Societies Selection (Joined or Want to Join)
  const [joinedSocietyIds, setJoinedSocietyIds] = useState<string[]>(
    societies.filter((s) => s.isJoined).map((s) => s.id)
  );
  const [wantToJoinIds, setWantToJoinIds] = useState<string[]>([]);
  const [societySearch, setSocietySearch] = useState('');
  const [societyFilterCategory, setSocietyFilterCategory] = useState('All');

  // Step 3: Events Selection (Events to Attend / Going)
  const [rsvpEventIds, setRsvpEventIds] = useState<string[]>(
    events.filter((e) => e.isRsvpd).map((e) => e.id)
  );
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('All');

  // Step 4: Universal Campus Search
  const [universalQuery, setUniversalQuery] = useState('');

  // Toggle Interest Tag
  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add custom skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  // Toggle Society Joined
  const toggleSocietyJoined = (socId: string) => {
    if (joinedSocietyIds.includes(socId)) {
      setJoinedSocietyIds(joinedSocietyIds.filter((id) => id !== socId));
    } else {
      setJoinedSocietyIds([...joinedSocietyIds, socId]);
      setWantToJoinIds(wantToJoinIds.filter((id) => id !== socId));
    }
  };

  // Toggle Society Want to Join
  const toggleWantToJoin = (socId: string) => {
    if (wantToJoinIds.includes(socId)) {
      setWantToJoinIds(wantToJoinIds.filter((id) => id !== socId));
    } else {
      setWantToJoinIds([...wantToJoinIds, socId]);
      setJoinedSocietyIds(joinedSocietyIds.filter((id) => id !== socId));
    }
  };

  // Toggle Event RSVP
  const toggleEventRsvp = (eventId: string) => {
    if (rsvpEventIds.includes(eventId)) {
      setRsvpEventIds(rsvpEventIds.filter((id) => id !== eventId));
    } else {
      setRsvpEventIds([...rsvpEventIds, eventId]);
    }
  };

  // Filtered Societies
  const filteredSocieties = useMemo(() => {
    return societies.filter((soc) => {
      const matchesSearch =
        soc.name.toLowerCase().includes(societySearch.toLowerCase()) ||
        soc.description.toLowerCase().includes(societySearch.toLowerCase()) ||
        soc.category.toLowerCase().includes(societySearch.toLowerCase());
      const matchesCategory =
        societyFilterCategory === 'All' ||
        soc.category.toLowerCase().includes(societyFilterCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [societies, societySearch, societyFilterCategory]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.society.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.location.toLowerCase().includes(eventSearch.toLowerCase()) ||
        evt.description.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesCategory =
        eventCategoryFilter === 'All' ||
        evt.category.toLowerCase().includes(eventCategoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [events, eventSearch, eventCategoryFilter]);

  // Universal Campus Search Results
  const universalResults = useMemo(() => {
    if (!universalQuery.trim()) return null;
    const q = universalQuery.toLowerCase();
    const matchedSocieties = societies.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
    const matchedEvents = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.society.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
    return { societies: matchedSocieties, events: matchedEvents };
  }, [universalQuery, societies, events]);

  // Submit and Finish Onboarding
  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      ...currentUser,
      name: fullName.trim() || currentUser.name,
      campusCardId: studentRollId.trim().toUpperCase(),
      studentId: studentRollId.trim().toUpperCase(),
      major: branch === 'Others' ? (customBranch.trim() || 'Other Branch') : branch,
      classYear,
      bio: bio.trim(),
      interests: selectedInterests,
      skills: selectedSkills,
      stats: {
        ...currentUser.stats,
        societiesJoined: joinedSocietyIds.length,
        eventsAttended: rsvpEventIds.length,
      },
    };

    onComplete({
      updatedProfile,
      joinedSocietyIds,
      rsvpEventIds,
    });
  };

  const steps = [
    { num: 1, label: 'Academic & Profile', icon: GraduationCap },
    { num: 2, label: 'Campus Societies', icon: Users },
    { num: 3, label: 'Events to Attend', icon: Calendar },
    { num: 4, label: 'Campus Explorer', icon: Compass },
  ];

  return (
    <div
      id="univia-signup-onboarding-root"
      className="min-h-screen bg-[#F8F6FD] dark:bg-[#0A0E17] text-[#241E34] dark:text-[#F1F5F9] flex flex-col transition-colors duration-200"
    >
      {/* Top Brand & Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0F1420]/90 backdrop-blur-md border-b border-[#EDE7F5] dark:border-[#1A2234] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <UniviaLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#211B33] dark:text-[#F1F5F9]">
                Univia
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE4FA] dark:bg-indigo-950/50 text-[#7033F5] dark:text-[#A5B4FC] border border-[#DDD3F5] dark:border-indigo-900/40">
                New Student Setup
              </span>
            </div>
            <p className="text-[11px] text-[#69607B] dark:text-[#94A3B8]">
              Personalize your collegiate hub
            </p>
          </div>
        </div>

        {/* Quick Skip or Finish Button */}
        <button
          onClick={handleFinish}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#7033F5] dark:bg-[#6366F1] text-white hover:bg-[#5E22E2] dark:hover:bg-[#4F46E5] shadow-xs transition-all"
        >
          <span>Complete Setup</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Welcome Banner */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="bg-gradient-to-r from-[#EDE4FA] to-[#F5EFFB] dark:from-[#131926] dark:to-[#182030] rounded-3xl p-6 sm:p-8 border border-[#DDD3F5] dark:border-[#1E283C] shadow-2xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#1E283C] text-[#7033F5] dark:text-[#A5B4FC] text-xs font-bold border border-[#DDD3F5] dark:border-[#2A3750]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Campus Fresher Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#211B33] dark:text-[#F1F5F9] tracking-tight">
              Welcome to Univia, {fullName.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#5B5270] dark:text-[#94A3B8] leading-relaxed">
              Let's tailor your campus experience. Join the societies you care about, select upcoming events you'll attend, and explore verified resources without noisy feeds or bots.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6 mt-4 border-t border-black/5 dark:border-white/5">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.num;
              const isPast = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`p-3 rounded-2xl text-left flex items-center gap-3 transition-all border ${
                    isActive
                      ? 'bg-white dark:bg-[#1C2538] border-[#7033F5] dark:border-[#6366F1] shadow-xs'
                      : isPast
                      ? 'bg-white/60 dark:bg-[#121826]/60 border-emerald-300 dark:border-emerald-800/40 text-[#211B33] dark:text-[#F1F5F9]'
                      : 'bg-white/40 dark:bg-[#121826]/40 border-transparent text-[#69607B] dark:text-[#64748B] hover:bg-white/70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isActive
                        ? 'bg-[#7033F5] dark:bg-[#6366F1] text-white'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-slate-400'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#69607B] dark:text-[#64748B] font-semibold uppercase">
                      Step {step.num}
                    </p>
                    <p className="text-xs font-bold truncate text-[#211B33] dark:text-[#F1F5F9]">
                      {step.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 space-y-6">
        {/* =========================================================================
            STEP 1: Student Information & Academic Profile
            ========================================================================= */}
        {activeStep === 1 && (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-[#EDE7F5] dark:border-[#1E283C] shadow-2xs space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#7033F5] dark:text-[#A5B4FC]" />
                  <span>Confirm Student Profile & Academic Focus</span>
                </h2>
                <p className="text-xs text-[#69607B] dark:text-[#94A3B8] mt-0.5">
                  Verify your university roll number, academic department, and tech interests.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                />
              </div>

              {/* Student Roll ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                  University Roll Number / ID
                </label>
                <input
                  type="text"
                  value={studentRollId}
                  onChange={(e) => setStudentRollId(e.target.value)}
                  placeholder="e.g. 05401012026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs font-medium uppercase focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                />
              </div>

              {/* Branch / Degree */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                  Academic Department / Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                >
                  {BRANCH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {branch === 'Others' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label className="text-[11px] font-bold text-[#7033F5] dark:text-[#A5B4FC] block mb-1">
                      Please specify your branch / department:
                    </label>
                    <input
                      type="text"
                      value={customBranch}
                      onChange={(e) => setCustomBranch(e.target.value)}
                      placeholder="e.g. B.Sc Data Science, B.Des Fashion, Diploma in EE"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBB3F7] dark:border-[#4B3280] bg-white dark:bg-[#0E1422] text-xs text-[#211B33] dark:text-[#F1F5F9] focus:outline-none focus:ring-2 focus:ring-[#7033F5]"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                  Academic Year
                </label>
                <select
                  value={classYear}
                  onChange={(e) => setClassYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                >
                  <option value="">-- Select Year / Batch --</option>
                  <option value="1st Year (Fresher)">1st Year (Fresher)</option>
                  <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                  <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                  <option value="4th Year (Senior)">4th Year (Senior)</option>
                  <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                  <option value="PhD / Research Scholar">PhD / Research Scholar</option>
                </select>
              </div>
            </div>

            {/* Student Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                Student Bio & Goals
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your academic goals, society interests, or what you're learning..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#7033F5] resize-none"
              />
            </div>

            {/* Campus Interests Tag Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center justify-between">
                <span>Select Campus Interests & Passions</span>
                <span className="text-[11px] text-[#69607B] dark:text-[#94A3B8]">
                  {selectedInterests.length} selected
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-[#7033F5] dark:bg-[#6366F1] text-white border-transparent shadow-2xs'
                          : 'bg-[#F8F6FD] dark:bg-[#0E1422] text-[#5B5270] dark:text-[#94A3B8] border-[#EDE7F5] dark:border-[#1E283C] hover:border-[#7033F5]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills & Tech Stack */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                Skills & Technologies (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-[#A5B4FC] text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Add skill (e.g. Python, Figma, DSA)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-[#A5B4FC] hover:bg-[#DDD3F5]"
                >
                  + Add
                </button>
              </form>
            </div>

            {/* Step Navigation Bar */}
            <div className="pt-4 border-t border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between">
              <span className="text-xs text-[#69607B] dark:text-[#94A3B8]">
                Step 1 of 4 completed
              </span>
              <button
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7033F5] dark:bg-[#6366F1] text-white hover:bg-[#5E22E2] shadow-xs"
              >
                <span>Continue to Societies</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: Campus Societies Selection (Joined or Want to Join)
            ========================================================================= */}
        {activeStep === 2 && (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-[#EDE7F5] dark:border-[#1E283C] shadow-2xs space-y-6 animate-in fade-in">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#7033F5] dark:text-[#A5B4FC]" />
                    <span>Choose Societies You Have Joined or Want to Join</span>
                  </h2>
                  <p className="text-xs text-[#69607B] dark:text-[#94A3B8] mt-0.5">
                    Select the student societies you are already a member of, or mark ones you'd love to join.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                    {joinedSocietyIds.length} Joined
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                    {wantToJoinIds.length} Want to Join
                  </span>
                </div>
              </div>
            </div>

            {/* Society Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#69607B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={societySearch}
                  onChange={(e) => setSocietySearch(e.target.value)}
                  placeholder="Search societies (e.g. AssetMerkle, TEDx, TechNeeds, WiCS)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Technical', 'Cultural', 'Social', 'Design'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSocietyFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                      societyFilterCategory === cat
                        ? 'bg-[#7033F5] dark:bg-[#6366F1] text-white border-transparent'
                        : 'bg-[#F8F6FD] dark:bg-[#0E1422] text-[#69607B] dark:text-[#94A3B8] border-[#EDE7F5] dark:border-[#1E283C]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Societies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSocieties.map((soc) => {
                const isJoined = joinedSocietyIds.includes(soc.id);
                const isWantToJoin = wantToJoinIds.includes(soc.id);

                return (
                  <div
                    key={soc.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isJoined
                        ? 'bg-[#F8F5FE] dark:bg-[#182030] border-[#7033F5] dark:border-[#6366F1] shadow-2xs'
                        : isWantToJoin
                        ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-400 dark:border-purple-800'
                        : 'bg-[#F8F6FD] dark:bg-[#0E1422] border-[#EDE7F5] dark:border-[#1E283C]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1C2538] border border-[#EDE7F5] dark:border-[#222D42] overflow-hidden flex items-center justify-center text-xl shrink-0 shadow-2xs relative">
                          {soc.imageUrl && soc.imageUrl.trim() ? (
                            <img
                              src={soc.imageUrl}
                              alt={soc.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <span className="text-lg absolute inset-0 flex items-center justify-center -z-1">
                            {soc.avatar && soc.avatar.length <= 4 ? soc.avatar : '⚡'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-1.5">
                            <span>{soc.name}</span>
                            <span className="text-[10px] text-[#7033F5] dark:text-[#A5B4FC]">✓</span>
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#69607B] dark:text-[#94A3B8]">
                            <span className="font-semibold text-[#7033F5] dark:text-[#A5B4FC]">
                              {soc.category}
                            </span>
                            <span>•</span>
                            <span>{soc.memberCount || 100}+ members</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#5B5270] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {soc.description}
                    </p>

                    <div className="text-[11px] text-[#69607B] dark:text-[#64748B] flex items-center gap-3">
                      <span className="flex items-center gap-1 truncate">
                        <Clock className="w-3 h-3" />
                        <span>{soc.meetingSchedule}</span>
                      </span>
                    </div>

                    {/* Action Toggles: "Joined" vs "Want to Join" */}
                    <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                      <button
                        onClick={() => toggleSocietyJoined(soc.id)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                          isJoined
                            ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#161F30] text-[#211B33] dark:text-[#F1F5F9] border-[#EDE7F5] dark:border-[#1E283C] hover:border-emerald-500'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isJoined ? 'Joined Member' : 'Mark as Joined'}</span>
                      </button>

                      <button
                        onClick={() => toggleWantToJoin(soc.id)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isWantToJoin
                            ? 'bg-[#7033F5] dark:bg-[#6366F1] text-white border-transparent'
                            : 'bg-white dark:bg-[#161F30] text-[#69607B] dark:text-[#94A3B8] border-[#EDE7F5] dark:border-[#1E283C] hover:border-[#7033F5]'
                        }`}
                      >
                        {isWantToJoin ? '★ Interested' : 'Want to Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Navigation Bar */}
            <div className="pt-4 border-t border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#69607B] dark:text-[#94A3B8] hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7033F5] dark:bg-[#6366F1] text-white hover:bg-[#5E22E2] shadow-xs"
              >
                <span>Continue to Events ({rsvpEventIds.length} RSVP'd)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: Campus Events Selection (Events You Are Going To Attend)
            ========================================================================= */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-[#EDE7F5] dark:border-[#1E283C] shadow-2xs space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#7033F5] dark:text-[#A5B4FC]" />
                  <span>Select Campus Events You Are Going To Attend</span>
                </h2>
                <p className="text-xs text-[#69607B] dark:text-[#94A3B8] mt-0.5">
                  RSVP to campus workshops, hackathons, and auditions to populate your collegiate calendar.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EDE4FA] dark:bg-indigo-950/50 text-[#7033F5] dark:text-[#A5B4FC] border border-[#DDD3F5] dark:border-indigo-900/40">
                {rsvpEventIds.length} Events Going
              </span>
            </div>

            {/* Events Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#69607B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="Search upcoming events (e.g. DecentrAI, TEDx Salon, HackAccessible)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE7F5] dark:border-[#1E283C] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs focus:outline-none focus:ring-1 focus:ring-[#7033F5]"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Tech', 'Career', 'Arts'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEventCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                      eventCategoryFilter === cat
                        ? 'bg-[#7033F5] dark:bg-[#6366F1] text-white border-transparent'
                        : 'bg-[#F8F6FD] dark:bg-[#0E1422] text-[#69607B] dark:text-[#94A3B8] border-[#EDE7F5] dark:border-[#1E283C]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((evt) => {
                const isGoing = rsvpEventIds.includes(evt.id);

                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isGoing
                        ? 'bg-[#F8F5FE] dark:bg-[#182030] border-emerald-500 dark:border-emerald-600 shadow-2xs'
                        : 'bg-[#F8F6FD] dark:bg-[#0E1422] border-[#EDE7F5] dark:border-[#1E283C]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-[#A5B4FC]">
                            {evt.society}
                          </span>
                          {evt.isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Today
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-[#211B33] dark:text-[#F1F5F9]">
                          {evt.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-[#5B5270] dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-[#69607B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#7033F5] dark:text-[#A5B4FC]" />
                        <span>
                          {evt.date} • {evt.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>

                    {/* 1-Click Attend / Going Toggle */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5">
                      <button
                        onClick={() => toggleEventRsvp(evt.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border ${
                          isGoing
                            ? 'bg-emerald-600 text-white border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#161F30] text-[#211B33] dark:text-[#F1F5F9] border-[#EDE7F5] dark:border-[#1E283C] hover:border-emerald-500'
                        }`}
                      >
                        {isGoing ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>I am Going (RSVP'd)</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 text-[#7033F5] dark:text-[#A5B4FC]" />
                            <span>RSVP / Going to this event</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step Navigation Bar */}
            <div className="pt-4 border-t border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#69607B] dark:text-[#94A3B8] hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7033F5] dark:bg-[#6366F1] text-white hover:bg-[#5E22E2] shadow-xs"
              >
                <span>Continue to Campus Explorer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: Search Anything Across Univia & Final Review
            ========================================================================= */}
        {activeStep === 4 && (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-[#EDE7F5] dark:border-[#1E283C] shadow-2xs space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#7033F5] dark:text-[#A5B4FC]" />
                <span>Search Anything Across Univia Campus</span>
              </h2>
              <p className="text-xs text-[#69607B] dark:text-[#94A3B8] mt-0.5">
                Look up student societies, lab facilities, hackathons, or academic notices before entering your workspace.
              </p>
            </div>

            {/* Global Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-[#7033F5] dark:text-[#A5B4FC] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={universalQuery}
                onChange={(e) => setUniversalQuery(e.target.value)}
                placeholder="Search anything (e.g. 'AssetMerkle', 'Solidity', 'TEDx', 'Robotics', 'Auditorium')..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-[#DDD3F5] dark:border-[#2A3750] bg-[#F8F6FD] dark:bg-[#0E1422] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#7033F5]"
                autoFocus
              />
            </div>

            {/* Search Results Display */}
            {universalResults && (
              <div className="space-y-4 p-4 rounded-2xl bg-[#F8F6FD] dark:bg-[#0E1422] border border-[#EDE7F5] dark:border-[#1E283C]">
                <h3 className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9] uppercase tracking-wider">
                  Campus Search Results ({universalResults.societies.length + universalResults.events.length})
                </h3>

                {universalResults.societies.length === 0 && universalResults.events.length === 0 ? (
                  <p className="text-xs text-[#69607B] dark:text-[#94A3B8]">
                    No campus records found for "{universalQuery}".
                  </p>
                ) : (
                  <div className="space-y-2">
                    {universalResults.societies.map((soc) => (
                      <div
                        key={soc.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{soc.avatar || '⚡'}</span>
                          <div>
                            <p className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                              {soc.name}
                            </p>
                            <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8]">
                              {soc.category} • {soc.memberCount || 100} members
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSocietyJoined(soc.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-[#A5B4FC]"
                        >
                          {joinedSocietyIds.includes(soc.id) ? 'Joined ✓' : '+ Join'}
                        </button>
                      </div>
                    ))}

                    {universalResults.events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9]">
                            {evt.title}
                          </p>
                          <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8]">
                            {evt.society} • {evt.date} • {evt.location}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleEventRsvp(evt.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EDE4FA] dark:bg-slate-800 text-[#7033F5] dark:text-[#A5B4FC]"
                        >
                          {rsvpEventIds.includes(evt.id) ? 'RSVP ✓' : '+ Attend'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Final Setup Summary Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#EDE4FA]/60 to-[#F5EFFB]/60 dark:from-[#131926] dark:to-[#1A233A] border border-[#DDD3F5] dark:border-[#1E283C] space-y-3">
              <h3 className="text-xs font-bold text-[#211B33] dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#7033F5] dark:text-[#A5B4FC]" />
                <span>Your Personalized Setup Summary</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C]">
                  <p className="text-lg font-bold text-[#7033F5] dark:text-[#A5B4FC]">
                    {joinedSocietyIds.length}
                  </p>
                  <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8] font-medium">
                    Societies Joined
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C]">
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {wantToJoinIds.length}
                  </p>
                  <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8] font-medium">
                    Societies Wishlist
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C]">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {rsvpEventIds.length}
                  </p>
                  <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8] font-medium">
                    Events RSVP'd
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#161F30] border border-[#EDE7F5] dark:border-[#1E283C]">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">0</p>
                  <p className="text-[10px] text-[#69607B] dark:text-[#94A3B8] font-medium">
                    Clean Chat Inbox
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#5B5270] dark:text-[#94A3B8] leading-relaxed">
                ✨ Notice: For your new signup account, all previous chats and bots have been removed. Your messages inbox starts clean and private.
              </p>
            </div>

            {/* Step Navigation Bar & Finish */}
            <div className="pt-4 border-t border-[#EDE7F5] dark:border-[#1E283C] flex items-center justify-between">
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#69607B] dark:text-[#94A3B8] hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#7033F5] dark:bg-[#6366F1] text-white hover:bg-[#5E22E2] shadow-md hover:scale-[1.01] transition-all"
              >
                <span>Save Info & Launch Univia Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
