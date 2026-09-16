export type NavTab = 
  | 'home' 
  | 'events' 
  | 'societies' 
  | 'messages' 
  | 'calendar' 
  | 'opportunities' 
  | 'profile' 
  | 'settings';

export interface EventRegistrationData {
  ticketId: string;
  registeredAt: string;
  studentName: string;
  rollNo: string;
  branchYear: string;
  dietaryPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Jain' | 'No Preference';
  needsLaptopLoan?: boolean;
  additionalNotes?: string;
}

export interface CampusEvent {
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
  maxAttendees?: number;
  isRsvpd: boolean;
  imageColor: string;
  tags: string[];
  description: string;
  isToday?: boolean;
  isOnline?: boolean;
  isHost?: boolean;
  registrationType?: 'open_rsvp' | 'form' | 'external' | 'members_only';
  registrationUrl?: string;
  registrationDeadline?: string;
  requireLaptop?: boolean;
  dietaryProvided?: boolean;
  userRegistration?: EventRegistrationData;
  // Event Routing & Admin Approval Workflow Fields
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  proposedBy?: {
    id?: string;
    studentId?: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
  adminReview?: {
    reviewedBy: string;
    reviewedAt: string;
    decision: 'APPROVED' | 'REJECTED';
    feedback?: string;
  };
  taggedSocieties?: string[];
}

export interface Society {
  id: string;
  name: string;
  category: 'Tech' | 'Design & Arts' | 'Academic' | 'Social & Cultural' | 'Outdoor & Sports' | string;
  memberCount: number;
  avatar: string;
  bannerColor: string;
  description: string;
  isJoined: boolean;
  recentPost?: {
    author: string;
    text: string;
    timeAgo: string;
  };
  meetingSchedule: string;
  location: string;
  communityId?: string;
  tags?: string[];
  contactInformation?: {
    email?: string;
    phone?: string;
  };
  imageUrl?: string;
  coverImage?: string;
}

export interface Deadline {
  id: string;
  title: string;
  courseOrOrg: string;
  dueDate: string;
  daysLeft: number;
  urgency: 'high' | 'medium' | 'normal';
  type: 'Assignment' | 'Admin & Housing' | 'Application' | 'Exam';
  isCompleted: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  type: 'Internship' | 'Research' | 'Campus Job' | 'Hackathon' | 'Grant';
  location: string;
  compensation: string;
  deadline: string;
  tags: string[];
  isSaved: boolean;
  hasApplied: boolean;
  description: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  type: 'class' | 'study' | 'society' | 'personal' | 'meeting' | 'event' | 'lab';
  instructorOrHost: string;
  status: 'upcoming' | 'current' | 'completed';
  date?: string; // 'Today', 'Tomorrow', or 'Oct 21'
  dayOfWeek?: 'Mon' | 'Tue' | 'Wed' | 'Thurs' | 'Fri' | 'Sat' | 'Sun';
  courseCode?: string;
  isLab?: boolean;
  group?: string;
  hasConflict?: boolean;
  conflictWithId?: string;
  conflictNote?: string;
}

export interface OfficialTimetableCourse {
  code: string;
  name: string;
  abbreviation: string;
  faculty: string;
  venue: string;
  isLab: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  timestamp: string;
  role?: string;
  status?: 'sent' | 'delivered' | 'read';
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reactions?: MessageReaction[];
  attachment?: {
    type: 'image' | 'file' | 'audio' | 'voice' | 'contact' | 'poll' | 'location';
    name: string;
    url: string;
    size?: string;
    duration?: string;
    contactInfo?: {
      name: string;
      phone: string;
      role: string;
    };
    pollInfo?: {
      question: string;
      options: { id: string; text: string; votes: number; voters: string[] }[];
      totalVotes: number;
    };
    locationInfo?: {
      venue: string;
      room: string;
      notes?: string;
    };
  };
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'Lead / Admin' | 'Moderator' | 'Core Member' | 'Student Member';
  isOnline: boolean;
  yearAndBranch?: string;
}

export interface SharedMediaItem {
  id: string;
  name: string;
  type: 'image' | 'doc' | 'link';
  url: string;
  date: string;
  senderName: string;
  size?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  isDirect: boolean;
  avatar?: string;
  societyId?: string;
  roleOrCategory?: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isOnline?: boolean;
  memberCount?: number;
  description?: string;
  isJoined?: boolean;
  isOfficial?: boolean;
  messages: MessageItem[];
  members?: CommunityMember[];
  sharedMedia?: SharedMediaItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  isRead: boolean;
  type: 'event' | 'society' | 'deadline' | 'message';
  actionTarget?: string;
}

export type AppTheme = 'lavender-light' | 'lavender-dark';

export interface UserProfile {
  _id?: string;
  id?: string;
  studentId?: string;
  name: string;
  role: 'Guest' | 'Student' | 'Student Lead' | 'Society Admin' | 'Super Admin' | string;
  handle: string;
  major: string;
  course?: string;
  department?: string;
  semester?: string;
  classYear: string;
  university: string;
  avatar: string;
  campusCardId: string;
  status: string;
  isGuest?: boolean;
  isNewUser?: boolean;
  schedule?: ScheduleItem[];
  email?: string;
  phone?: string;
  bio?: string;
  hostelBlock?: string;
  skills?: string[];
  interests?: string[];
  clubs?: string[];
  projects?: Array<{
    title: string;
    description: string;
    link?: string;
    techStack?: string[];
  }>;
  achievements?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
    url?: string;
  }>;
  github?: string;
  linkedin?: string;
  stats: {
    societiesJoined: number;
    eventsAttended: number;
    upcomingDeadlines: number;
    savedOpportunities: number;
  };
}

export interface AuthSessionData {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

export interface ActiveCallState {
  channelId: string;
  channelName: string;
  avatar?: string;
  isVideo: boolean;
  isDirect: boolean;
}
