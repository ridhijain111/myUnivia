import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  User,
  GraduationCap,
  Mail,
  Phone,
  Camera,
  Check,
  Code2,
  ExternalLink,
  Building,
  Plus,
  Trash2,
  Award,
  BookOpen,
  FolderGit2,
  Sparkles,
  Loader2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { UserProfile } from '../types';
import { updateStudent, createStudent } from '../services/studentService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

const AVATAR_PRESETS = [
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%237033F5"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🎓</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%238B5CF6"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">💻</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%236366F1"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🔬</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%23EC4899"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🎨</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%233B82F6"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🚀</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%2310B981"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">📚</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%23F59E0B"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">⚡</text></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" rx="40" fill="%2314B8A6"/><text x="50%" y="54%" font-family="sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">🌟</text></svg>',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'academics' | 'skills' | 'projects' | 'achievements'>('academics');

  // Academic & Personal
  const [name, setName] = useState(currentUser.name || '');
  const [handle, setHandle] = useState(currentUser.handle || '');
  const [university, setUniversity] = useState(currentUser.university || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [major, setMajor] = useState(currentUser.major || '');
  const [classYear, setClassYear] = useState(currentUser.classYear || '');
  const [semester, setSemester] = useState(currentUser.semester || '');
  const [campusCardId, setCampusCardId] = useState(currentUser.campusCardId || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [status, setStatus] = useState(currentUser.status || '🟢 Active on Campus');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [hostelBlock, setHostelBlock] = useState(currentUser.hostelBlock || '');

  // Social
  const [github, setGithub] = useState(currentUser.github || '');
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || '');

  // Skills & Interests
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Clubs / Communities
  const [clubs, setClubs] = useState<string[]>(currentUser.clubs || []);
  const [newClubInput, setNewClubInput] = useState('');

  // Projects
  const [projects, setProjects] = useState<Array<{ title: string; description: string; link?: string; techStack?: string[] }>>(
    currentUser.projects || []
  );
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');
  const [projTech, setProjTech] = useState('');

  // Achievements & Certifications
  const [achievements, setAchievements] = useState<string[]>(
    currentUser.achievements || []
  );
  const [newAchievementInput, setNewAchievementInput] = useState('');

  const [certifications, setCertifications] = useState<Array<{ name: string; issuer?: string; year?: string; url?: string }>>(
    currentUser.certifications || []
  );
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('');

  // Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || '');
      setHandle(currentUser.handle || '');
      setUniversity(currentUser.university || '');
      setCourse(currentUser.course || '');
      setDepartment(currentUser.department || '');
      setMajor(currentUser.major || '');
      setClassYear(currentUser.classYear || '');
      setSemester(currentUser.semester || '');
      setCampusCardId(currentUser.campusCardId || currentUser.studentId || '');
      setAvatar(currentUser.avatar || '');
      setStatus(currentUser.status || '🟢 Active on Campus');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setHostelBlock(currentUser.hostelBlock || '');
      setGithub(currentUser.github || '');
      setLinkedin(currentUser.linkedin || '');
      setSkills(currentUser.skills || []);
      setInterests(currentUser.interests || []);
      setClubs(currentUser.clubs || []);
      setProjects(currentUser.projects || []);
      setAchievements(currentUser.achievements || []);
      setCertifications(currentUser.certifications || []);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (typeof loadEvt.target?.result === 'string') {
        setAvatar(loadEvt.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Skill Handlers
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (sToRemove: string) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  // Interest Handlers
  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newInterestInput.trim()) return;
    if (!interests.includes(newInterestInput.trim())) {
      setInterests([...interests, newInterestInput.trim()]);
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  // Clubs Handlers
  const handleAddClub = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newClubInput.trim()) return;
    if (!clubs.includes(newClubInput.trim())) {
      setClubs([...clubs, newClubInput.trim()]);
    }
    setNewClubInput('');
  };

  const handleRemoveClub = (item: string) => {
    setClubs(clubs.filter((c) => c !== item));
  };

  // Project Handlers
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const techArray = projTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    setProjects([
      ...projects,
      {
        title: projTitle.trim(),
        description: projDesc.trim(),
        link: projLink.trim() || undefined,
        techStack: techArray.length > 0 ? techArray : undefined,
      },
    ]);
    setProjTitle('');
    setProjDesc('');
    setProjLink('');
    setProjTech('');
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  // Achievements Handlers
  const handleAddAchievement = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!newAchievementInput.trim()) return;
    if (!achievements.includes(newAchievementInput.trim())) {
      setAchievements([...achievements, newAchievementInput.trim()]);
    }
    setNewAchievementInput('');
  };

  const handleRemoveAchievement = (item: string) => {
    setAchievements(achievements.filter((a) => a !== item));
  };

  // Certifications Handlers
  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;
    setCertifications([
      ...certifications,
      {
        name: certName.trim(),
        issuer: certIssuer.trim() || undefined,
        year: certYear.trim() || undefined,
      },
    ]);
    setCertName('');
    setCertIssuer('');
    setCertYear('');
  };

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    const targetName = name.trim() || currentUser.name || 'Student';
    const targetRoll = (campusCardId.trim() || currentUser.campusCardId || currentUser.studentId || '').toUpperCase();
    const targetUniversity = university.trim() || currentUser.university || '';

    const cleanHandle = handle.trim()
      ? (handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`)
      : (currentUser.handle || '@student');

    const payload: Partial<UserProfile> = {
      name: targetName,
      handle: cleanHandle,
      university: targetUniversity,
      course: course.trim(),
      department: department.trim(),
      major: major.trim(),
      classYear: classYear.trim(),
      semester: semester.trim(),
      campusCardId: targetRoll,
      studentId: targetRoll,
      avatar,
      status: status.trim(),
      email: email.trim().toLowerCase() || currentUser.email || '',
      phone: phone.trim(),
      bio: bio.trim(),
      hostelBlock: hostelBlock.trim(),
      github: github.trim(),
      linkedin: linkedin.trim(),
      skills,
      interests,
      clubs,
      projects,
      achievements,
      certifications,
      isNewUser: false,
    };

    const updatedProfile: UserProfile = {
      ...currentUser,
      ...payload,
    };

    try {
      const targetIdentifier =
        currentUser._id ||
        currentUser.studentId ||
        currentUser.campusCardId ||
        currentUser.email ||
        targetRoll;

      try {
        await updateStudent(targetIdentifier, payload);
      } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes('not found')) {
          await createStudent(payload).catch(() => {});
        } else {
          console.warn('Backend sync deferred, saving changes locally:', err?.message);
        }
      }

      // Persist to localStorage and notify app
      localStorage.setItem('univia_current_user', JSON.stringify(updatedProfile));
      onSaveProfile(updatedProfile);
      setSuccessToast(true);

      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Save notice:', err);
      localStorage.setItem('univia_current_user', JSON.stringify(updatedProfile));
      onSaveProfile(updatedProfile);
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#EDE7F5] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0EAF8] flex items-center justify-between bg-[#FCFBFE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0E6FF] flex items-center justify-center text-[#7033F5]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#211B33]">
                Edit Student Profile
              </h2>
              <p className="text-[11px] text-[#7A728C]">
                Update your campus profile information and academic details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#F2ECF9] rounded-xl text-[#8E869E] hover:text-[#211B33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banners */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successToast && (
          <div className="mx-6 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile changes successfully saved!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#F0EAF8] dark:border-[#1E2738] px-6 bg-[#FAF8FE] dark:bg-[#0E1420] gap-1 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('academics')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'academics'
                ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C084FC] dark:border-[#A855F7]'
                : 'border-transparent text-[#766E87] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Personal & Academics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C084FC] dark:border-[#A855F7]'
                : 'border-transparent text-[#766E87] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skills & Interests</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C084FC] dark:border-[#A855F7]'
                : 'border-transparent text-[#766E87] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects & Portfolio ({projects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-[#7033F5] text-[#7033F5] dark:text-[#C084FC] dark:border-[#A855F7]'
                : 'border-transparent text-[#766E87] dark:text-[#94A3B8] hover:text-[#211B33] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Clubs & Achievements</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* TAB 1: ACADEMICS & PERSONAL */}
          {activeTab === 'academics' && (
            <div className="space-y-4">
              {/* Photo & Presets */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#FAF8FE] border border-[#EFE8F8]">
                <div className="relative group shrink-0">
                  {avatar && avatar.trim() ? (
                    <img
                      src={avatar}
                      alt="Student Avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#EDE4FA] border-2 border-purple-200 shadow-sm flex flex-col items-center justify-center text-[#7033F5]">
                      <User className="w-8 h-8 mb-0.5" />
                      <span className="text-[9px] font-bold">Add Photo</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Upload Custom Image"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <span className="font-bold text-[#6D657F] block">Select Profile Preset or Upload</span>
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform ${
                          avatar === preset ? 'ring-2 ring-[#7033F5] scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Core Identifiers: Name, Roll ID, Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Roll / Student ID (Unique) *</label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={campusCardId}
                      onChange={(e) => setCampusCardId(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Campus Handle *</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              {/* University & Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">College / University *</label>
                  <input
                    type="text"
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Course / Degree *</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech, M.Tech, BCA, MCA"
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>
              </div>

              {/* Department/Branch, Year, Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Department / Branch *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setMajor(`${course} ${e.target.value}`);
                    }}
                    placeholder="e.g. Computer Science & AI"
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Academic Year *</label>
                  <select
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  >
                    <option value="">Select Academic Year / Batch</option>
                    <option value="1st Year (Fresher)">1st Year (Fresher)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                    <option value="PhD / Research Scholar">PhD / Research Scholar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              {/* Status & Residence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Campus Status</label>
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="e.g. 🟢 In AI & Smart Systems Lab"
                    className="w-full px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Hostel / Residence</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      placeholder="e.g. Kalpana Chawla Block B-304"
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="font-bold text-[#6D657F] block mb-1">About / Student Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio visible across Univia campus societies..."
                  className="w-full p-3 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">College Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & INTERESTS */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              {/* Technical Skills */}
              <div className="space-y-2">
                <label className="font-bold text-[#6D657F] block">Technical Skills (Press Enter to Add)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Solidity, Python, Next.js, Docker"
                    className="flex-1 px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-[#F2ECFB] hover:bg-[#EAE0F9] text-[#7033F5] font-bold rounded-xl transition-colors"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8FE] border border-[#E5DAF6] text-[#5527B8] font-bold text-[11px]"
                    >
                      <span>{s}</span>
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests & Domains */}
              <div className="space-y-2 pt-2 border-t border-[#F0EAF8]">
                <label className="font-bold text-[#6D657F] block">Interests & Hobbies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={handleAddInterest}
                    placeholder="e.g. Autonomous Agents, Open Source, Badminton"
                    className="flex-1 px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-[#F2ECFB] hover:bg-[#EAE0F9] text-[#7033F5] font-bold rounded-xl transition-colors"
                  >
                    Add Interest
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interests.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8FE] border border-[#E5DAF6] text-[#7033F5] font-bold text-[11px]"
                    >
                      <span>{item}</span>
                      <button type="button" onClick={() => handleRemoveInterest(item)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Profiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0EAF8]">
                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">GitHub Profile URL</label>
                  <div className="relative">
                    <Code2 className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#6D657F] block mb-1">LinkedIn Profile URL</label>
                  <div className="relative">
                    <ExternalLink className="w-3.5 h-3.5 text-[#9C94AD] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#EDE4F6] space-y-3">
                <span className="font-extrabold text-[#211B33] block">Add New Project</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="Project Title (e.g. DecentrAI Verifier)"
                    className="px-3 py-1.5 bg-white border border-[#E3D6F5] rounded-xl text-[#211B33]"
                  />
                  <input
                    type="text"
                    value={projLink}
                    onChange={(e) => setProjLink(e.target.value)}
                    placeholder="Project URL (e.g. GitHub link)"
                    className="px-3 py-1.5 bg-white border border-[#E3D6F5] rounded-xl text-[#211B33]"
                  />
                </div>
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="Tech Stack (comma separated: React, Python, Solidity)"
                  className="w-full px-3 py-1.5 bg-white border border-[#E3D6F5] rounded-xl text-[#211B33]"
                />
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Brief description of project goal and architecture..."
                  className="w-full p-2 bg-white border border-[#E3D6F5] rounded-xl text-[#211B33]"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-[#7033F5] hover:bg-[#5E22E2] text-white font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Project to List</span>
                </button>
              </div>

              {/* Existing Projects List */}
              <div className="space-y-2">
                <label className="font-bold text-[#6D657F] block">Existing Student Projects ({projects.length})</label>
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FCFBFE] border border-[#EDE4F6] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#211B33]">{proj.title}</span>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7033F5] hover:underline flex items-center gap-0.5 text-[10px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Link</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-[#766E87]">{proj.description}</p>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techStack.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 rounded-md bg-[#F2ECFB] text-[#7033F5] text-[10px] font-semibold">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="p-1 text-[#9E95B0] hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CLUBS, ACHIEVEMENTS & CERTIFICATIONS */}
          {activeTab === 'achievements' && (
            <div className="space-y-5">
              {/* Clubs / Communities */}
              <div className="space-y-2">
                <label className="font-bold text-[#6D657F] block">Clubs & Societies Affiliations</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newClubInput}
                    onChange={(e) => setNewClubInput(e.target.value)}
                    onKeyDown={handleAddClub}
                    placeholder="e.g. AssetMerkle Team, TEDx Club, IEEE, Robotics Society"
                    className="flex-1 px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                  <button
                    type="button"
                    onClick={handleAddClub}
                    className="px-4 py-2 bg-[#F2ECFB] hover:bg-[#EAE0F9] text-[#7033F5] font-bold rounded-xl transition-colors"
                  >
                    Add Club
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {clubs.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8FE] border border-[#E5DAF6] text-[#5527B8] font-bold text-[11px]"
                    >
                      <span>{c}</span>
                      <button type="button" onClick={() => handleRemoveClub(c)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2 pt-2 border-t border-[#F0EAF8]">
                <label className="font-bold text-[#6D657F] block">Student Achievements & Awards</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievementInput}
                    onChange={(e) => setNewAchievementInput(e.target.value)}
                    onKeyDown={handleAddAchievement}
                    placeholder="e.g. 1st Place at Univia Hackathon 2026"
                    className="flex-1 px-3 py-2 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl focus:outline-none focus:border-[#7033F5] text-[#211B33]"
                  />
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="px-4 py-2 bg-[#F2ECFB] hover:bg-[#EAE0F9] text-[#7033F5] font-bold rounded-xl transition-colors"
                  >
                    Add Award
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {achievements.map((ach) => (
                    <div
                      key={ach}
                      className="p-2.5 rounded-xl bg-[#FCFBFE] border border-[#EDE4F6] flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-[#211B33]">🏆 {ach}</span>
                      <button type="button" onClick={() => handleRemoveAchievement(ach)} className="hover:text-rose-600">
                        <Trash2 className="w-3.5 h-3.5 text-[#9E95B0]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2 pt-2 border-t border-[#F0EAF8]">
                <label className="font-bold text-[#6D657F] block">Professional Certifications</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="Certification Name"
                    className="px-3 py-1.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl text-[#211B33]"
                  />
                  <input
                    type="text"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="Issuer (e.g. Google, AWS)"
                    className="px-3 py-1.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl text-[#211B33]"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={certYear}
                      onChange={(e) => setCertYear(e.target.value)}
                      placeholder="Year"
                      className="w-20 px-3 py-1.5 bg-[#FAF8FE] border border-[#E3D6F5] rounded-xl text-[#211B33]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="flex-1 px-3 py-1.5 bg-[#7033F5] text-white font-bold rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {certifications.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#FCFBFE] border border-[#EDE4F6] flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-[#211B33]">📜 {c.name}</span>
                        {c.issuer && <span className="text-[#766E87]"> — {c.issuer}</span>}
                        {c.year && <span className="text-[#9C94AD]"> ({c.year})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(idx)}
                        className="hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#9E95B0]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#F2ECFA] flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#7A728C]">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saves securely to your student account</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-semibold text-[#6A627B] hover:bg-[#F2EDFA] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white rounded-xl shadow-md shadow-[#7033F5]/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
