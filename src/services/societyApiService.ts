/**
 * Client-side API service for Univia's Generic College Society System & Knowledge Engine
 */

export interface SocietyApiPayload {
  name: string;
  description: string;
  category: string;
  avatar?: string;
  imageUrl?: string;
  coverImage?: string;
  bannerColor?: string;
  meetingSchedule?: string;
  location?: string;
  contactInformation?: {
    email?: string;
    phone?: string;
    website?: string;
    roomOrOffice?: string;
  };
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    discord?: string;
  };
  isOfficial?: boolean;
  adminIds?: string[];
}

export interface AnnouncementPayload {
  societyId: string;
  societyName: string;
  originalMessage: string;
  sender?: {
    id?: string;
    name?: string;
    role?: string;
    avatar?: string;
    email?: string;
    studentId?: string;
  };
  channelId?: string;
}

/**
 * Fetches all registered campus societies from MongoDB
 */
export async function fetchSocieties(category?: string, search?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`/api/societies?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch societies: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  } catch (err: any) {
    console.warn('[SocietyAPI] fetchSocieties fallback:', err?.message);
    return [];
  }
}

/**
 * Registers a new generic society in MongoDB
 */
export async function createSocietyApi(payload: SocietyApiPayload): Promise<any> {
  const res = await fetch('/api/societies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to register society');
  }
  return res.json();
}

/**
 * Posts an announcement from ANY society: runs AI extraction, saves to MongoDB, updates events
 */
export async function postAnnouncementApi(payload: AnnouncementPayload): Promise<any> {
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to post announcement');
  }
  return res.json();
}

/**
 * Fetches stored society events with date/registration filters
 */
export async function fetchEventsApi(filters?: {
  search?: string;
  societyId?: string;
  todayOnly?: boolean;
}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.societyId) params.append('societyId', filters.societyId);
    if (filters?.todayOnly) params.append('todayOnly', 'true');

    const res = await fetch(`/api/events?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.statusText}`);
    const json = await res.json();
    return json.data || [];
  } catch (err: any) {
    console.warn('[SocietyAPI] fetchEventsApi fallback:', err?.message);
    return [];
  }
}
