import {
  CampusEvent,
  Society,
  Deadline,
  Opportunity,
  ScheduleItem,
  ChatChannel,
  NotificationItem,
  UserProfile,
  OfficialTimetableCourse,
} from '../types';

export const DEFAULT_USER: UserProfile = {
  name: '',
  role: 'Student',
  handle: '',
  major: '',
  course: '',
  department: '',
  semester: '',
  classYear: '',
  university: '',
  avatar: '',
  campusCardId: '',
  studentId: '',
  status: '🟢 Active on Campus',
  email: '',
  phone: '',
  bio: '',
  hostelBlock: '',
  skills: [],
  interests: [],
  clubs: [],
  projects: [],
  achievements: [],
  certifications: [],
  github: '',
  linkedin: '',
  schedule: [],
  isNewUser: true,
  stats: {
    societiesJoined: 0,
    eventsAttended: 0,
    upcomingDeadlines: 0,
    savedOpportunities: 0,
  },
};

export const CURRENT_USER: UserProfile = { ...DEFAULT_USER };
export const GUEST_USER: UserProfile = { ...DEFAULT_USER };
export const DEMO_STUDENTS: (UserProfile & { password?: string })[] = [];

export const INITIAL_EVENTS: CampusEvent[] = [];
export const INITIAL_SOCIETIES: Society[] = [];
export const INITIAL_DEADLINES: Deadline[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];

export const OFFICIAL_TIMETABLE_METADATA = {
  institution: 'Campus Schedule',
  title: 'Academic Time-Table',
  cohort: 'Course Matrix',
  venue: 'Lecture Rooms & Labs',
  effectiveDate: 'Current Semester',
  version: 'Active',
};

export const OFFICIAL_COURSES: OfficialTimetableCourse[] = [];
export const INITIAL_SCHEDULE: ScheduleItem[] = [];
export const WEEKLY_OFFICIAL_SCHEDULE: Record<string, ScheduleItem[]> = {};
export const TOMORROW_SCHEDULE: ScheduleItem[] = [];
export const INITIAL_CHANNELS: ChatChannel[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
