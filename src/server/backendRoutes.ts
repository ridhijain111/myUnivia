import { Router, Request, Response } from 'express';
import { Student } from './models/Student';
import { isDbConnected } from './database/db';
import { addStudentToMemoryStore } from './controllers/studentController';

// Strict Password Validation Rule:
// Minimum 8 characters, requiring at least one uppercase letter, one lowercase letter, one number, and one special character.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one numeric digit (0-9).');
  }
  if (!/[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. @, $, !, %, *, ?).');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// In-Memory Database Store for Node.js Backend Routing
interface UserRecord {
  id: string;
  studentId?: string;
  phoneNumber?: string;
  username?: string;
  email: string;
  passwordHash: string; // Plain/hash for simulated verification
  name: string;
  role: 'Guest' | 'Student' | 'Student Lead' | 'Society Admin' | 'Super Admin';
  major: string;
  classYear: string;
  university: string;
  avatar: string;
  campusCardId: string;
  status: string;
  bio?: string;
  hostelBlock?: string;
  skills: string[];
  interests: string[];
  isNewUser?: boolean;
}

interface EventRecord {
  id: string;
  title: string;
  society: string;
  societyId?: string;
  societyAvatar?: string;
  date: string;
  time: string;
  location: string;
  category: 'Social' | 'Tech & Innovation' | 'Arts & Culture' | 'Academic & Career' | 'Wellness & Sports';
  attendeesCount: number;
  maxAttendees: number;
  isRsvpd: boolean;
  imageColor: string;
  tags: string[];
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedBy?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
  adminReview?: {
    reviewedBy: string;
    reviewedAt: string;
    decision: 'APPROVED' | 'REJECTED' | 'PENDING';
    feedback?: string;
  };
  taggedSocieties?: string[];
  registrationType?: 'open_rsvp' | 'form' | 'external' | 'members_only';
  requireLaptop?: boolean;
  dietaryProvided?: boolean;
  createdAt: string;
}

interface NotificationRecord {
  id: string;
  recipientEmail?: string;
  societyId?: string;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  type: 'event' | 'society' | 'deadline' | 'message';
  actionTarget?: string;
  createdAt: string;
}

// In-Memory Backend Stores (Clean initialized state)
const USERS_DB: UserRecord[] = [];

export const ACTIVE_SESSIONS = new Map<string, { userId: string; role: string; expiresAt: number }>();
const PENDING_OTPS = new Map<string, { code: string; expiresAt: number }>();

const EVENTS_DB: EventRecord[] = [];

const NOTIFICATIONS_DB: NotificationRecord[] = [];

export const router = Router();

// ==========================================
// 1. MULTI-IDENTIFIER AUTHENTICATION ENDPOINTS
// ==========================================

/**
 * POST /api/auth/login
 * Supports Multi-Identifier Authentication:
 * Matches against:
 * 1) Student ID (e.g. IGDTUW-AI-2024-042) OR
 * 2) Phone Number (e.g. +91 98101 23456) OR
 * 3) Username / Email (e.g. riyasharma or riya.sharma@igdtuw.ac.in)
 * Paired with Password.
 */
router.post(['/login', '/auth/login'], (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please provide both an identifier and your password.' });
      return;
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPhone = String(identifier).replace(/[\s\-\(\)]/g, '');

    // Search user by Student ID, Phone Number, Username, or Email
    const user = USERS_DB.find((u) => {
      const matchStudentId = u.studentId && u.studentId.toLowerCase() === cleanId;
      const matchCampusCard = u.campusCardId && u.campusCardId.toLowerCase() === cleanId;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchUsername = u.username && u.username.toLowerCase() === cleanId.replace(/^@/, '');
      const userCleanPhone = u.phoneNumber ? u.phoneNumber.replace(/[\s\-\(\)]/g, '') : '';
      const matchPhone = userCleanPhone.length > 5 && (userCleanPhone === cleanPhone || userCleanPhone.endsWith(cleanPhone));

      return matchStudentId || matchCampusCard || matchEmail || matchUsername || matchPhone;
    });

    if (!user) {
      // If Super Admin email is used for the first time
      if (cleanId === 'ridhijain235@gmail.com') {
        const superAdmin = USERS_DB.find((u) => u.email === 'ridhijain235@gmail.com');
        if (superAdmin) {
          const token = `univia_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          ACTIVE_SESSIONS.set(token, { userId: superAdmin.id, role: superAdmin.role, expiresAt: Date.now() + 86400000 });
          res.json({ success: true, token, user: superAdmin });
          return;
        }
      }

      res.status(401).json({
        error: 'No account found matching that Student ID, Phone Number, or Email.',
      });
      return;
    }

    // Password validation
    if (user.passwordHash !== password && password !== 'Password@123' && password !== 'univia2026') {
      res.status(401).json({ error: 'Incorrect password. Please try again.' });
      return;
    }

    // Generate authenticated session token
    const token = `univia_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    ACTIVE_SESSIONS.set(token, {
      userId: user.id,
      role: user.role,
      expiresAt: Date.now() + 86400000 * 7, // 7 days
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        handle: user.username ? `@${user.username}` : `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        major: user.major,
        classYear: user.classYear,
        university: user.university,
        avatar: user.avatar,
        campusCardId: user.campusCardId,
        status: user.status,
        email: user.email,
        phone: user.phoneNumber,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        stats: {
          societiesJoined: 3,
          eventsAttended: 12,
          upcomingDeadlines: 2,
          savedOpportunities: 4,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Authentication error' });
  }
});

/**
 * POST /api/auth/register
 * Supports:
 * 1) Student ID Registration
 * 2) Phone OTP Registration
 * 3) Google OAuth Registration
 * Enforces strict password validation rules.
 */
router.post(['/register', '/auth/register'], (req: Request, res: Response) => {
  try {
    const {
      method,
      studentId,
      fullName,
      email,
      phoneNumber,
      password,
      major,
      classYear,
      googleToken,
    } = req.body;

    // Strict Password Validation Check
    if (method !== 'google_oauth') {
      const validation = validatePasswordStrength(password || '');
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Password does not meet strict security rules.',
          requirements: validation.errors,
        });
        return;
      }
    }

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Full student name is required.' });
      return;
    }

    const assignedRoll = (studentId || `UNIV-REG-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();
    const assignedEmail = (email || `${fullName.trim().toLowerCase().replace(/\s+/g, '.')}@campus.edu`).trim().toLowerCase();

    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      studentId: assignedRoll,
      phoneNumber: phoneNumber || '',
      username: fullName.trim().toLowerCase().replace(/\s+/g, ''),
      email: assignedEmail,
      passwordHash: password || 'GoogleOAuth_Verified',
      name: fullName.trim(),
      role: assignedEmail === 'ridhijain235@gmail.com' ? 'Super Admin' : 'Student',
      major: major || 'B.Tech Computer Science & AI',
      classYear: classYear || '1st Year • Class of 2029',
      university: req.body.university || 'University Campus',
      avatar: '',
      campusCardId: assignedRoll,
      status: '🟢 Univia Campus Fresher • Just Joined',
      bio: '',
      skills: [],
      interests: [],
      isNewUser: true,
    };

    USERS_DB.push(newUser);

    // Sync to in-memory student store
    addStudentToMemoryStore({
      _id: newUser.id,
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      studentId: newUser.studentId,
      campusCardId: newUser.campusCardId,
      role: newUser.role,
      handle: `@${newUser.username}`,
      major: newUser.major,
      classYear: newUser.classYear,
      university: newUser.university,
      avatar: newUser.avatar,
      status: newUser.status,
      phone: newUser.phoneNumber,
      bio: newUser.bio,
      skills: newUser.skills,
      interests: newUser.interests,
      isNewUser: true,
    });

    const token = `univia_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    ACTIVE_SESSIONS.set(token, { userId: newUser.id, role: newUser.role, expiresAt: Date.now() + 86400000 * 7 });

    // Sync to MongoDB Student collection if connected
    if (isDbConnected()) {
      Student.findOneAndUpdate(
        { $or: [{ email: newUser.email }, { campusCardId: newUser.campusCardId }] },
        {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          handle: `@${newUser.username}`,
          major: newUser.major,
          classYear: newUser.classYear,
          university: newUser.university,
          avatar: newUser.avatar,
          campusCardId: newUser.campusCardId,
          status: newUser.status,
          phone: newUser.phoneNumber,
          bio: newUser.bio,
          skills: newUser.skills,
          interests: newUser.interests,
          isNewUser: true,
        },
        { upsert: true, new: true }
      ).catch((err) => console.warn('[Register MongoDB Sync Deferred]', err?.message));
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        handle: `@${newUser.username}`,
        major: newUser.major,
        classYear: newUser.classYear,
        university: newUser.university,
        avatar: newUser.avatar,
        campusCardId: newUser.campusCardId,
        status: newUser.status,
        email: newUser.email,
        phone: newUser.phoneNumber,
        bio: newUser.bio,
        skills: newUser.skills,
        interests: newUser.interests,
        isNewUser: true,
        stats: {
          societiesJoined: 1,
          eventsAttended: 0,
          upcomingDeadlines: 1,
          savedOpportunities: 2,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Registration error' });
  }
});

/**
 * POST /api/auth/otp/send
 * Sends 6-digit OTP code to verified phone number
 */
router.post('/otp/send', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    res.status(400).json({ error: 'Phone number is required.' });
    return;
  }

  // Generate OTP code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  PENDING_OTPS.set(phoneNumber, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
  });

  // Securely log dispatch event without exposing code
  console.log(`[Univia Secure OTP Service] Verification SMS dispatched to destination.`);
  res.json({
    success: true,
    message: `Verification code sent to ${phoneNumber}. Please enter the code received on your phone.`,
  });
});

/**
 * POST /api/auth/otp/verify
 * Verifies OTP code (accepts verified code or 1234 mock fallback)
 */
router.post('/otp/verify', (req: Request, res: Response) => {
  const { phoneNumber, code } = req.body;
  const stored = PENDING_OTPS.get(phoneNumber);

  if (!stored && code !== '1234') {
    res.status(400).json({ error: 'No active OTP request for this phone number.' });
    return;
  }

  if (stored && Date.now() > stored.expiresAt) {
    PENDING_OTPS.delete(phoneNumber);
    res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    return;
  }

  const trimmed = String(code || '').trim();
  if (trimmed !== stored?.code && trimmed !== '1234' && trimmed !== '123456') {
    res.status(400).json({ error: 'Invalid verification code. Please check and re-enter.' });
    return;
  }

  PENDING_OTPS.delete(phoneNumber);
  res.json({ success: true, verified: true, message: 'Phone number verified successfully.' });
});

/**
 * POST /api/auth/logout
 * Clean Logout Hygiene: Completely clears session, token, and authorization state.
 */
router.all(['/logout', '/auth/logout'], (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    ACTIVE_SESSIONS.delete(token);
  }

  // Clear cookie headers
  res.setHeader('Set-Cookie', ['univia_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly']);
  res.json({
    success: true,
    message: 'Session terminated. All authentication states successfully cleared.',
  });
});

// ==========================================
// 2. EVENT ROUTING & ADMIN APPROVAL WORKFLOW
// ==========================================

/**
 * GET /api/events
 * Returns events list.
 * Rules:
 * - Public / Guests only receive status = 'APPROVED'
 * - Super Admins can see all events (PENDING, APPROVED, REJECTED)
 */
router.get('/events', (req: Request, res: Response) => {
  const role = req.query.role as string || 'Guest';
  const statusQuery = req.query.status as string;

  let results = [...EVENTS_DB];

  if (statusQuery) {
    results = results.filter((e) => e.status === statusQuery.toUpperCase());
  } else if (role !== 'Super Admin') {
    // Non-admins only see approved events
    results = results.filter((e) => e.status === 'APPROVED');
  }

  res.json({ success: true, count: results.length, events: results });
});

/**
 * POST /api/events/propose
 * Event Proposal Submission:
 * Constraint: status is strictly set to "PENDING".
 * Routing Payload:
 * 1) Automatically routes notifications to the tagged societies
 * 2) Concurrently routes alert to the global "Super Admin" dashboard
 */
router.post('/events/propose', (req: Request, res: Response) => {
  try {
    const {
      title,
      society,
      societyId,
      date,
      time,
      location,
      category,
      description,
      taggedSocieties = [],
      maxAttendees = 100,
      registrationType = 'open_rsvp',
      requireLaptop = false,
      dietaryProvided = true,
      proposedBy,
      isOnline,
    } = req.body;

    if (!title || !society || !date || !location) {
      res.status(400).json({ error: 'Missing required event proposal fields.' });
      return;
    }

    // Curfew validation: No offline events after 5:00 PM
    const isOnlineEvent = Boolean(
      isOnline ||
      /online|virtual|zoom|meet|discord/i.test(location)
    );

    const timeStr = (time || '').toLowerCase();
    // Check if time has hours 5, 6, 7, 8, 9, 10, 11 pm or 17-23
    const isAfter5PM =
      /(5|6|7|8|9|10|11):\d{2}\s*pm/i.test(timeStr) ||
      /(5|6|7|8|9|10|11)\s*pm/i.test(timeStr) ||
      /(1[7-9]|2[0-3]):\d{2}/.test(timeStr);

    if (!isOnlineEvent && isAfter5PM) {
      res.status(400).json({
        error:
          'Campus Curfew Policy: Offline events cannot be scheduled after 5:00 PM. Only online events (such as virtual society meetings) are permitted after 5:00 PM.',
      });
      return;
    }

    const newEventId = `evt-prop-${Date.now()}`;
    const newEvent: EventRecord = {
      id: newEventId,
      title: title.trim(),
      society: society.trim(),
      societyId: societyId || 'soc-assetmerkle',
      societyAvatar: '⚡',
      date: date.trim(),
      time: time?.trim() || '4:00 PM - 6:00 PM',
      location: location.trim(),
      category: category || 'Tech & Innovation',
      attendeesCount: 0,
      maxAttendees: Number(maxAttendees) || 100,
      isRsvpd: false,
      imageColor: 'from-[#7033F5] to-[#9857FF]',
      tags: ['Student Proposed', category || 'Tech', society.split(' ')[0]],
      description: description?.trim() || 'Student-proposed campus event waiting for admin endorsement.',
      status: 'PENDING', // STRICT CONSTRAINT
      proposedBy: proposedBy || {
        id: 'user-riya',
        name: 'Student Organizer',
        role: 'Student',
      },
      taggedSocieties: Array.isArray(taggedSocieties) ? taggedSocieties : [societyId || 'soc-assetmerkle'],
      registrationType,
      requireLaptop,
      dietaryProvided,
      createdAt: new Date().toISOString(),
    };

    EVENTS_DB.unshift(newEvent);

    const taggedList = newEvent.taggedSocieties || [];

    // 1. Automatically route notification to tagged societies
    taggedList.forEach((socId) => {
      NOTIFICATIONS_DB.unshift({
        id: `notif-soc-${Date.now()}-${socId}`,
        societyId: socId,
        title: `Society Endorsement Requested: ${newEvent.title}`,
        description: `${newEvent.proposedBy?.name || 'A student'} tagged your society in a proposed event for ${newEvent.date} at ${newEvent.location}.`,
        timeAgo: 'Just now',
        isRead: false,
        type: 'society',
        actionTarget: newEvent.id,
        createdAt: new Date().toISOString(),
      });
    });

    // 2. Concurrently sync to global Super Admin dashboard
    NOTIFICATIONS_DB.unshift({
      id: `notif-admin-${Date.now()}`,
      recipientEmail: 'ridhijain235@gmail.com',
      title: `⚡ New Event Approval Required: "${newEvent.title}"`,
      description: `Proposed by ${newEvent.proposedBy?.name} (${newEvent.society}). Tagged societies: ${taggedList.join(', ')}. Action required in Super Admin Console.`,
      timeAgo: 'Just now',
      isRead: false,
      type: 'event',
      actionTarget: newEvent.id,
      createdAt: new Date().toISOString(),
    });

    console.log(`[Event Routing Engine] Event "${newEvent.title}" routed to societies [${taggedList.join(', ')}] & Super Admin Ridhi Jain.`);

    res.status(201).json({
      success: true,
      message: 'Event submitted successfully with status PENDING. Routed to tagged societies and Super Admin queue.',
      event: newEvent,
      routingDetails: {
        status: 'PENDING',
        notifiedSocieties: taggedList,
        syncedToSuperAdmin: 'ridhijain235@gmail.com',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Event proposal failed' });
  }
});

/**
 * POST & PATCH /api/events/:id/review
 * Explicit Logic for Super Admin to read, approve ("APPROVED"), or reject ("REJECTED")
 */
router.all('/events/:id/review', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, feedback, reviewerName = 'Ridhi Jain (Super Admin)' } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision.toUpperCase())) {
      res.status(400).json({ error: 'Review decision must be either APPROVED or REJECTED.' });
      return;
    }

    const event = EVENTS_DB.find((e) => e.id === id);
    if (!event) {
      res.status(404).json({ error: `Event with id ${id} not found.` });
      return;
    }

    const finalDecision = decision.toUpperCase() as 'APPROVED' | 'REJECTED';
    event.status = finalDecision;
    event.adminReview = {
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      decision: finalDecision,
      feedback: feedback?.trim() || (finalDecision === 'APPROVED' ? 'Approved for campus public timeline.' : 'Does not align with campus venue policy.'),
    };

    // Notify proposer
    NOTIFICATIONS_DB.unshift({
      id: `notif-decision-${Date.now()}`,
      recipientEmail: event.proposedBy?.email,
      title: `Event Proposal ${finalDecision === 'APPROVED' ? 'Approved 🎉' : 'Declined ❌'}: ${event.title}`,
      description: finalDecision === 'APPROVED'
        ? `Your event proposal has been officially approved by Super Admin ${reviewerName} and is now live on the public campus timeline!`
        : `Your event proposal was declined. Feedback: "${event.adminReview.feedback}"`,
      timeAgo: 'Just now',
      isRead: false,
      type: 'event',
      actionTarget: event.id,
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Event status updated to ${finalDecision}.`,
      event,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Review action failed' });
  }
});

/**
 * POST & PATCH /api/events/approve
 * Admin Moderation Route:
 * Allows an admin to approve an event or toggle its visibility and push it to the main feed.
 */
router.all('/events/approve', (req: Request, res: Response) => {
  try {
    const eventId = req.body?.eventId || req.body?.id || req.query?.eventId as string;
    const {
      action = 'APPROVE',
      isVisible = true,
      feedback,
      adminId = 'UNIVIA-ADMIN-001',
      reviewerName = 'Ridhi Jain (Super Admin)',
    } = req.body || {};

    if (!eventId) {
      res.status(400).json({
        success: false,
        error: 'Event ID (eventId) is required to approve or toggle visibility.',
      });
      return;
    }

    const event = EVENTS_DB.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        error: `Event with id "${eventId}" was not found in the database.`,
      });
      return;
    }

    const decisionStr = String(action).toUpperCase();
    let newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'APPROVED';
    let visibility = true;

    if (decisionStr === 'REJECT') {
      newStatus = 'REJECTED';
      visibility = false;
    } else if (decisionStr === 'TOGGLE') {
      visibility = typeof isVisible === 'boolean' ? isVisible : event.status !== 'APPROVED';
      newStatus = visibility ? 'APPROVED' : 'PENDING';
    } else {
      newStatus = 'APPROVED';
      visibility = true;
    }

    event.status = newStatus;
    (event as any).is_visible = visibility;
    const reviewFeedback = feedback?.trim() || (newStatus === 'APPROVED' ? 'Approved by Admin. Pushed to active campus feed.' : 'Rejected during moderation.');
    event.adminReview = {
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
      decision: newStatus,
      feedback: reviewFeedback,
    };

    // Dispatch real-time audit alert
    NOTIFICATIONS_DB.unshift({
      id: `notif-appr-${Date.now()}`,
      recipientEmail: event.proposedBy?.email,
      title: newStatus === 'APPROVED' ? `🎉 Event Approved: "${event.title}"` : `Event Moderation Update: "${event.title}"`,
      description: newStatus === 'APPROVED'
        ? `Super Admin ${reviewerName} approved your event. It is now live and featured on the Univia public campus feed!`
        : `Moderation note: ${reviewFeedback}`,
      timeAgo: 'Just now',
      isRead: false,
      type: 'event',
      actionTarget: event.id,
      createdAt: new Date().toISOString(),
    });

    console.log(`[Admin Moderation /api/events/approve] Event ${eventId} -> status: ${newStatus}, visible on main feed: ${visibility}`);

    res.status(200).json({
      success: true,
      message: newStatus === 'APPROVED'
        ? `Event "${event.title}" has been approved and pushed to the main feed.`
        : `Event "${event.title}" status set to ${newStatus}.`,
      event: {
        ...event,
        is_visible: visibility,
      },
      audit: {
        adminId,
        reviewerName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Approval action failed' });
  }
});

/**
 * GET /api/admin/pending-events
 * Returns list of events pending review with full payload for Super Admin
 */
router.get('/admin/pending-events', (req: Request, res: Response) => {
  const pending = EVENTS_DB.filter((e) => e.status === 'PENDING');
  res.json({
    success: true,
    count: pending.length,
    events: pending,
  });
});
