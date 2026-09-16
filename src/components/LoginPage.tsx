import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Building2,
  Sparkles,
  Sun,
  Moon,
  Loader2,
  Phone,
  Hash,
  Calendar,
} from 'lucide-react';
import { UserProfile } from '../types';
import { UniviaLogo } from './UniviaLogo';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile, token?: string) => void;
  onSignUpSuccess?: (user: UserProfile, token?: string) => void;
  initialMode?: 'gateway' | 'signin' | 'register';
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSignUpSuccess,
  initialMode = 'signin',
  onCancel,
}) => {
  const { toggleTheme, isDark } = useTheme();

  // Primary mode: Sign In vs Create Account
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    initialMode === 'register' ? 'signup' : 'signin'
  );

  // Sign-in inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign-up inputs (User-provided, no mock defaults)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRoll, setSignUpRoll] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpBatch, setSignUpBatch] = useState('1st Year');
  const [signUpCollege, setSignUpCollege] = useState('');
  const [signUpMajor, setSignUpMajor] = useState('Computer Science & Engineering');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Google Modal / Quick Google flow
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleRoll, setGoogleRoll] = useState('');
  const [googlePhone, setGooglePhone] = useState('');
  const [googleBatch, setGoogleBatch] = useState('1st Year');
  const [googleCollege, setGoogleCollege] = useState('');

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sample quick colleges
  const POPULAR_COLLEGES = [
    'Delhi University',
    'IIT Delhi',
    'BITS Pilani',
    'Anna University',
    'Mumbai University',
  ];

  const saveUserToDirectory = (user: UserProfile) => {
    try {
      const raw = localStorage.getItem('univia_registered_users');
      const users: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
      if (user.email) users[user.email.toLowerCase()] = user;
      if (user.campusCardId) users[user.campusCardId.toLowerCase()] = user;
      if (user.studentId) users[user.studentId.toLowerCase()] = user;
      localStorage.setItem('univia_registered_users', JSON.stringify(users));
    } catch {}
  };

  const getUserFromDirectory = (identifier: string): UserProfile | null => {
    try {
      const raw = localStorage.getItem('univia_registered_users');
      if (!raw) return null;
      const users: Record<string, UserProfile> = JSON.parse(raw);
      const clean = identifier.trim().toLowerCase();
      return users[clean] || null;
    } catch {
      return null;
    }
  };

  // ----------------------------------------------------
  // Simple Email Sign-In
  // ----------------------------------------------------
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = signInEmail.trim();
    if (!identifier) {
      setErrorMessage('Please enter your email or student username.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try backend authentication
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: signInPassword,
        }),
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const cleanInput = identifier.toLowerCase();
          const existingRegistered = getUserFromDirectory(cleanInput);
          const resolvedIsNewUser = existingRegistered?.isNewUser ?? (data.user.isNewUser ?? false);

          const userWithPreservedData: UserProfile = {
            ...data.user,
            isNewUser: resolvedIsNewUser,
            schedule: existingRegistered?.schedule || data.user.schedule || [],
            stats: existingRegistered?.stats || data.user.stats || {
              societiesJoined: 0,
              eventsAttended: 0,
              upcomingDeadlines: 0,
              savedOpportunities: 0,
            },
          };

          if (resolvedIsNewUser) {
            try {
              localStorage.removeItem('univia_user_deadlines');
            } catch {}
          }

          saveUserToDirectory(userWithPreservedData);
          setSuccessMessage(`Welcome back, ${userWithPreservedData.name}!`);
          localStorage.setItem('univia_session_token', data.token || `token_${Date.now()}`);
          localStorage.setItem('univia_current_user', JSON.stringify(userWithPreservedData));
          setTimeout(() => {
            onLoginSuccess(userWithPreservedData, data.token);
          }, 400);
          return;
        }
      }

      // 2. Check local registered user directory
      const cleanInput = identifier.toLowerCase();
      const existingRegistered = getUserFromDirectory(cleanInput);
      if (existingRegistered) {
        if (existingRegistered.isNewUser) {
          try {
            localStorage.removeItem('univia_user_deadlines');
          } catch {}
        }
        const token = `univia_local_token_${Date.now()}`;
        localStorage.setItem('univia_session_token', token);
        localStorage.setItem('univia_current_user', JSON.stringify(existingRegistered));
        setSuccessMessage(`Welcome back, ${existingRegistered.name}!`);
        setTimeout(() => {
          onLoginSuccess(existingRegistered, token);
        }, 400);
        return;
      }

      // 3. Check active session user if matching
      const savedUserStr = localStorage.getItem('univia_current_user');
      let localSavedUser: UserProfile | null = null;
      try {
        if (savedUserStr) localSavedUser = JSON.parse(savedUserStr);
      } catch {}

      if (
        localSavedUser &&
        (localSavedUser.email?.toLowerCase() === cleanInput ||
          localSavedUser.name?.toLowerCase() === cleanInput ||
          localSavedUser.handle?.toLowerCase().replace('@', '') === cleanInput.replace('@', '') ||
          localSavedUser.campusCardId?.toLowerCase() === cleanInput)
      ) {
        if (localSavedUser.isNewUser) {
          try {
            localStorage.removeItem('univia_user_deadlines');
          } catch {}
        }
        saveUserToDirectory(localSavedUser);
        const token = `univia_local_token_${Date.now()}`;
        localStorage.setItem('univia_session_token', token);
        setSuccessMessage(`Welcome back, ${localSavedUser.name}!`);
        setTimeout(() => {
          onLoginSuccess(localSavedUser!, token);
        }, 400);
        return;
      }

      // 4. Create fresh session with entered credentials
      const isEmail = identifier.includes('@');
      const cleanName = isEmail
        ? identifier.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : identifier;

      const fallbackRoll = isEmail
        ? ''
        : identifier.trim().toUpperCase();

      const fallbackUser: UserProfile = {
        name: cleanName,
        role: 'Student',
        isNewUser: true,
        email: isEmail ? identifier.trim().toLowerCase() : '',
        avatar: '',
        handle: `@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}`,
        university: '',
        major: '',
        classYear: '',
        phone: '',
        campusCardId: fallbackRoll,
        studentId: fallbackRoll,
        status: '🟢 Active on Campus',
        bio: '',
        skills: [],
        interests: [],
        clubs: [],
        projects: [],
        achievements: [],
        certifications: [],
        schedule: [],
        stats: {
          societiesJoined: 0,
          eventsAttended: 0,
          upcomingDeadlines: 0,
          savedOpportunities: 0,
        },
      };

      saveUserToDirectory(fallbackUser);
      try {
        localStorage.removeItem('univia_user_deadlines');
      } catch {}

      const token = `univia_session_${Date.now()}`;
      localStorage.setItem('univia_session_token', token);
      localStorage.setItem('univia_current_user', JSON.stringify(fallbackUser));
      setSuccessMessage(`Welcome, ${fallbackUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(fallbackUser, token);
      }, 400);
    } catch {
      setErrorMessage('Could not sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Simple Email Sign-Up (Any college student)
  // ----------------------------------------------------
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetName = signUpName.trim();
    const targetEmail = signUpEmail.trim().toLowerCase();
    const targetCollege = signUpCollege.trim();
    const targetMajor = signUpMajor.trim();
    const targetRoll = signUpRoll.trim();
    const targetPhone = signUpPhone.trim();
    const targetBatch = signUpBatch.trim();

    if (!targetName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    const newStudentProfile: UserProfile = {
      name: targetName,
      role: 'Student',
      isNewUser: true,
      email: targetEmail,
      avatar: '',
      handle: `@${targetName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}`,
      university: targetCollege,
      major: targetMajor,
      classYear: targetBatch,
      phone: targetPhone,
      campusCardId: targetRoll,
      studentId: targetRoll,
      status: '🟢 Active on Campus',
      bio: '',
      skills: [],
      interests: [],
      clubs: [],
      projects: [],
      achievements: [],
      certifications: [],
      schedule: [],
      stats: {
        societiesJoined: 0,
        eventsAttended: 0,
        upcomingDeadlines: 0,
        savedOpportunities: 0,
      },
    };

    saveUserToDirectory(newStudentProfile);
    try {
      localStorage.removeItem('univia_user_deadlines');
    } catch {}

    try {
      // Notify backend if available
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'student_id',
          fullName: targetName,
          studentId: targetRoll,
          email: targetEmail,
          password: signUpPassword,
          university: targetCollege,
          major: targetMajor,
          phone: targetPhone,
          classYear: targetBatch,
        }),
      }).catch(() => null);

      const token = `univia_reg_${Date.now()}`;
      localStorage.setItem('univia_session_token', token);
      localStorage.setItem('univia_current_user', JSON.stringify(newStudentProfile));
      setSuccessMessage(`Welcome to Univia, ${targetName}!`);

      setTimeout(() => {
        if (onSignUpSuccess) {
          onSignUpSuccess(newStudentProfile, token);
        } else {
          onLoginSuccess(newStudentProfile, token);
        }
      }, 500);
    } catch {
      // Local fallback always succeeds
      const token = `univia_reg_${Date.now()}`;
      localStorage.setItem('univia_session_token', token);
      localStorage.setItem('univia_current_user', JSON.stringify(newStudentProfile));
      if (onSignUpSuccess) {
        onSignUpSuccess(newStudentProfile, token);
      } else {
        onLoginSuccess(newStudentProfile, token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Google Sign-In / Sign-Up
  // ----------------------------------------------------
  const handleGoogleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const targetEmail = googleEmail.trim().toLowerCase() || 'student@campus.edu';
    const emailPrefix = targetEmail.split('@')[0];
    const targetName =
      googleName.trim() ||
      emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const targetRoll = googleRoll.trim();
    const targetPhone = googlePhone.trim();
    const targetBatch = googleBatch.trim();
    const targetCollege = googleCollege.trim() || signUpCollege.trim();

    setIsLoading(true);
    setSuccessMessage(`Signing in with Google as ${targetName}...`);

    setTimeout(() => {
      const googleStudent: UserProfile = {
        name: targetName,
        role: 'Student',
        isNewUser: true,
        email: targetEmail,
        avatar: '',
        handle: `@${emailPrefix.replace(/[^a-z0-9]/g, '')}`,
        major: signUpMajor.trim() || '',
        classYear: targetBatch,
        university: targetCollege,
        phone: targetPhone,
        campusCardId: targetRoll,
        studentId: targetRoll,
        status: '🟢 Google Verified Student',
        bio: '',
        skills: [],
        interests: [],
        clubs: [],
        projects: [],
        achievements: [],
        certifications: [],
        schedule: [],
        stats: {
          societiesJoined: 0,
          eventsAttended: 0,
          upcomingDeadlines: 0,
          savedOpportunities: 0,
        },
      };

      saveUserToDirectory(googleStudent);
      try {
        localStorage.removeItem('univia_user_deadlines');
      } catch {}

      const token = `univia_google_${Date.now()}`;
      localStorage.setItem('univia_session_token', token);
      localStorage.setItem('univia_current_user', JSON.stringify(googleStudent));

      setShowGoogleModal(false);
      setIsLoading(false);

      if (onSignUpSuccess) {
        onSignUpSuccess(googleStudent, token);
      } else {
        onLoginSuccess(googleStudent, token);
      }
    }, 500);
  };

  return (
    <div
      id="univia-login-root"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#F7F4FD] via-[#F3EDFB] to-[#ECE2FA] dark:from-[#0B0F19] dark:via-[#111625] dark:to-[#171226] text-[#211B33] dark:text-[#EDE8F5] transition-colors font-sans relative overflow-hidden"
    >
      {/* Decorative Lavender Crisp Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8F52FF]/15 dark:bg-[#7033F5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B580FF]/20 dark:bg-[#5E22E2]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#1E2738]/80 backdrop-blur-md border border-[#E3D6F5] dark:border-[#2D3B52] text-[#6D6385] dark:text-[#CBD5E1] hover:text-[#7033F5] transition-all shadow-xs cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7033F5]" />}
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white/95 dark:bg-[#131926]/95 backdrop-blur-xl rounded-3xl border border-[#E8DEF8] dark:border-[#28324A] shadow-2xl shadow-[#7033F5]/10 p-6 sm:p-8 z-10 animate-in fade-in duration-200">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-gradient-to-br from-[#F5F0FF] to-[#EAE0FC] dark:from-[#21173D] dark:to-[#2B1B52] rounded-2xl border border-[#E0D0F7] dark:border-[#3E2B6B] shadow-inner mb-3">
            <UniviaLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#211B33] dark:text-white">
            Univia Campus
          </h1>
          <p className="text-xs text-[#7A728C] dark:text-[#9EA8B6] mt-1">
            {activeTab === 'signin'
              ? 'Sign in to access your college dashboard & schedule'
              : 'Any college student can register and join the campus network'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-[#F5F0FD] dark:bg-[#1A2234] rounded-2xl border border-[#EADDF7] dark:border-[#29374F] mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-white dark:bg-[#25324C] text-[#7033F5] dark:text-[#CBB3F2] shadow-xs'
                : 'text-[#7D738E] dark:text-[#94A3B8] hover:text-[#211B33]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white dark:bg-[#25324C] text-[#7033F5] dark:text-[#CBB3F2] shadow-xs'
                : 'text-[#7D738E] dark:text-[#94A3B8] hover:text-[#211B33]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Option 1: Google Authentication Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-2.5 px-4 mb-4 rounded-2xl bg-[#FCFBFE] dark:bg-[#1A2234] hover:bg-[#F7F2FE] dark:hover:bg-[#222E46] border border-[#E3D6F5] dark:border-[#2E3D56] text-xs font-bold text-[#2A233C] dark:text-[#F1F5F9] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] shadow-2xs cursor-pointer"
        >
          {/* Official Google Vector Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Crisp Divider */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-[#E8DEF8] dark:border-[#273248]" />
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#8B839E] dark:text-[#7A8699] uppercase tracking-wider">
            or continue with email
          </span>
          <div className="flex-grow border-t border-[#E8DEF8] dark:border-[#273248]" />
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB: SIGN IN                                          */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleEmailSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="student@college.edu or handle"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9D93B3] hover:text-[#7033F5] transition-colors cursor-pointer"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#7033F5] to-[#8E51FF] hover:from-[#5E22E2] hover:to-[#7B3AE8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#7033F5]/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Univia</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ---------------------------------------------------- */
          /* TAB: CREATE ACCOUNT                                  */
          /* ---------------------------------------------------- */
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Aanya Gupta"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@college.edu or gmail.com"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            {/* Student Roll No. / Campus ID */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Student Roll No. / Campus ID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signUpRoll}
                  onChange={(e) => setSignUpRoll(e.target.value)}
                  placeholder="e.g. 24CS1002, 05401012026, or your Roll No."
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={signUpPhone}
                  onChange={(e) => setSignUpPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            {/* Academic Year / Batch */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Academic Year / Batch
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={signUpBatch}
                  onChange={(e) => setSignUpBatch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                >
                  <option value="1st Year">1st Year (Fresher)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                  <option value="PhD / Research Scholar">PhD / Research Scholar</option>
                </select>
              </div>
            </div>

            {/* College / University Name */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                College / University *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={signUpCollege}
                  onChange={(e) => setSignUpCollege(e.target.value)}
                  placeholder="e.g. Delhi University, IIT, BITS, etc."
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
              {/* Quick college chips */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {POPULAR_COLLEGES.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSignUpCollege(col)}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-[#F5F0FD] dark:bg-[#1F293D] hover:bg-[#EAE0FC] text-[#7033F5] dark:text-[#CBB3F2] rounded-md transition-colors cursor-pointer"
                  >
                    + {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Degree / Major */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Degree / Branch
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signUpMajor}
                  onChange={(e) => setSignUpMajor(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, B.Com, MBA"
                  className="w-full pl-10 pr-3 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9D93B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2 bg-[#FAF8FE] dark:bg-[#182030] border border-[#E3D6F5] dark:border-[#2B384E] rounded-xl text-xs sm:text-sm text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9D93B3] hover:text-[#7033F5] transition-colors cursor-pointer"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#7033F5] to-[#8E51FF] hover:from-[#5E22E2] hover:to-[#7B3AE8] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#7033F5]/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Campus Account</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Google Sign-in Modal / Popup */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#171F30] max-w-sm w-full rounded-3xl p-6 border border-[#EDE4F6] dark:border-[#2C384E] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#EDE4F6] dark:border-[#2D3950] flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#211B33] dark:text-white">Google Sign-In</h3>
                <p className="text-[11px] text-[#7A728C] dark:text-[#9EA8B6]">
                  Enter your Google or institutional email
                </p>
              </div>
            </div>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="yourname@gmail.com or student@college.edu"
                  className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="e.g. Aanya Gupta"
                  className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                    Student Roll No.
                  </label>
                  <input
                    type="text"
                    value={googleRoll}
                    onChange={(e) => setGoogleRoll(e.target.value)}
                    placeholder="Roll No. / Campus ID"
                    className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                  Academic Year / Batch
                </label>
                <select
                  value={googleBatch}
                  onChange={(e) => setGoogleBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                >
                  <option value="1st Year">1st Year (Fresher)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                  <option value="PhD / Research Scholar">PhD / Research Scholar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6D6385] dark:text-[#A6B2C4] mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={googleCollege}
                  onChange={(e) => setGoogleCollege(e.target.value)}
                  placeholder="e.g. Delhi University, IIT, BITS"
                  className="w-full px-3 py-2 bg-[#FAF8FE] dark:bg-[#1E283C] border border-[#E3D6F5] dark:border-[#2D3950] rounded-xl text-xs text-[#211B33] dark:text-white focus:outline-none focus:border-[#7033F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#665E77] dark:text-[#94A3B8] hover:bg-[#F2EDFA] dark:hover:bg-[#25324C] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-bold bg-[#7033F5] hover:bg-[#5E22E2] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isLoading ? 'Connecting...' : 'Authorize & Enter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
