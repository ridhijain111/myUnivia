import { GoogleGenAI, Type } from '@google/genai';
import { Announcement, IExtractedInformation, IAnnouncement } from '../models/Announcement';
import { EventModel, IEvent } from '../models/Event';
import { OpportunityModel } from '../models/Opportunity';
import { Society } from '../models/Society';
import { isDbConnected } from '../database/db';

/**
 * In-memory resilient stores for when MongoDB is operating in local/offline fallback mode
 */
export const IN_MEMORY_ANNOUNCEMENTS: any[] = [];
export const IN_MEMORY_EVENTS: any[] = [];
export const IN_MEMORY_OPPORTUNITIES: any[] = [];
export const IN_MEMORY_SOCIETIES: any[] = [];

/**
 * Parses date string into a Date object if recognizable
 */
export function parseDateSafe(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  const currentYear = new Date().getFullYear();
  // Handle phrases like "Oct 21", "24 October", "20 September"
  const monthMatch = dateStr.match(
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}/i
  );
  if (monthMatch) {
    const candidate = new Date(`${monthMatch[0]}, ${currentYear}`);
    if (!isNaN(candidate.getTime())) return candidate;
  }
  return null;
}

/**
 * Calculates current registration status relative to now
 */
export function calculateRegistrationStatus(
  deadlineStr?: string | null,
  eventDateStr?: string | null
): 'not_announced' | 'open' | 'closing_soon' | 'closed' | 'completed' {
  const now = new Date();

  // If event already passed
  const eventDate = parseDateSafe(eventDateStr);
  if (eventDate && eventDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    return 'completed';
  }

  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('tba')) {
    return 'not_announced';
  }

  const deadlineDate = parseDateSafe(deadlineStr);
  if (!deadlineDate) {
    return 'open';
  }

  const diffMs = deadlineDate.getTime() - now.getTime();
  if (diffMs < 0) {
    return 'closed';
  }
  // If less than 48 hours remaining
  if (diffMs <= 48 * 60 * 60 * 1000) {
    return 'closing_soon';
  }

  return 'open';
}

/**
 * Rule-based fallback extractor when Gemini API is unavailable
 */
export function fallbackExtractInformation(
  message: string,
  societyName: string
): { messageType: string; extracted: IExtractedInformation } {
  const text = message.trim();
  const lower = text.toLowerCase();

  // Determine message type
  let messageType = 'general_update';
  if (lower.includes('workshop') || lower.includes('bootcamp') || lower.includes('hands-on')) {
    messageType = 'workshop';
  } else if (lower.includes('hackathon') || lower.includes('sprint') || lower.includes('codefest')) {
    messageType = 'hackathon';
  } else if (lower.includes('recruitment') || lower.includes('audition') || lower.includes('hiring') || lower.includes('join our team') || lower.includes('induction')) {
    messageType = 'recruitment';
  } else if (lower.includes('competition') || lower.includes('contest') || lower.includes('tournament')) {
    messageType = 'competition';
  } else if (lower.includes('internship') || lower.includes('scholarship') || lower.includes('grant') || lower.includes('perks')) {
    messageType = 'opportunity';
  } else if (lower.includes('reminder') || lower.includes('closing soon') || lower.includes('last day')) {
    messageType = 'reminder';
  } else if (lower.includes('rescheduled') || lower.includes('postponed') || lower.includes('time changed') || lower.includes('venue changed')) {
    messageType = 'schedule_change';
  } else if (lower.includes('cancelled') || lower.includes('called off')) {
    messageType = 'cancellation';
  } else if (lower.includes('event') || lower.includes('session') || lower.includes('seminar') || lower.includes('meetup') || lower.includes('talk')) {
    messageType = 'event';
  } else if (lower.includes('notice') || lower.includes('attention') || lower.includes('circular')) {
    messageType = 'notice';
  }

  // Extract Links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex) || [];
  const registrationLink = urls.find(
    (u) =>
      u.includes('forms') ||
      u.includes('register') ||
      u.includes('devfolio') ||
      u.includes('unstop') ||
      u.includes('luma') ||
      u.includes('rsvp')
  ) || (urls.length > 0 ? urls[0] : null);

  const onlineMeetingLink = urls.find(
    (u) =>
      u.includes('meet.google') ||
      u.includes('zoom.us') ||
      u.includes('teams.microsoft')
  ) || null;

  // Extract Venue
  let venue: string | null = null;
  const venueMatch = text.match(
    /(?:venue|location|room|hall|lab|auditorium|at|in)\s*[:\-]?\s*([A-Za-z0-9\s,\-–]{3,40})/i
  );
  if (venueMatch && venueMatch[1]) {
    venue = venueMatch[1].trim().replace(/[\r\n].*$/, '');
  }

  // Extract Mode
  const mode = onlineMeetingLink || lower.includes('online') || lower.includes('google meet') || lower.includes('zoom')
    ? (lower.includes('offline') || lower.includes('hall') || lower.includes('auditorium') ? 'Hybrid' : 'Online')
    : 'Offline';

  // Extract Dates & Times
  let date: string | null = null;
  const dateMatch = text.match(
    /(?:on|date|dated)\s*[:\-]?\s*([A-Za-z0-9,\s]{3,25}(?:202[5-9]|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Today|Tomorrow|Friday|Monday|Saturday|Sunday))/i
  );
  if (dateMatch && dateMatch[1]) {
    date = dateMatch[1].trim();
  } else if (lower.includes('today')) {
    date = 'Today';
  } else if (lower.includes('tomorrow')) {
    date = 'Tomorrow';
  }

  let startTime: string | null = null;
  let endTime: string | null = null;
  const timeMatch = text.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*(?:to|-|–)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/);
  if (timeMatch) {
    startTime = timeMatch[1];
    endTime = timeMatch[2];
  } else {
    const singleTime = text.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/);
    if (singleTime) startTime = singleTime[1];
  }

  // Extract Registration Deadline
  let registrationDeadline: string | null = null;
  const deadlineMatch = text.match(/(?:deadline|last date|register before|closes on)\s*[:\-]?\s*([A-Za-z0-9,\s:]{3,30})/i);
  if (deadlineMatch) {
    registrationDeadline = deadlineMatch[1].trim().replace(/[\r\n].*$/, '');
  }

  // Extract Eligibility
  let eligibility: string | null = null;
  const eligMatch = text.match(/(?:eligibility|open to|for)\s*[:\-]?\s*([A-Za-z0-9\s,\-–]{4,50})/i);
  if (eligMatch) {
    eligibility = eligMatch[1].trim().replace(/[\r\n].*$/, '');
  } else if (lower.includes('first year') || lower.includes('freshers') || lower.includes('1st year')) {
    eligibility = 'Open to 1st year / Freshers';
  } else if (lower.includes('all years') || lower.includes('open to all')) {
    eligibility = 'Open to all students';
  }

  // Fees
  const fees = lower.includes('free') ? 'Free' : (text.match(/₹\s*\d+|Rs\.?\s*\d+/)?.[0] || null);

  // Missing fields checking
  const missingFields: string[] = [];
  const isEventLike = ['event', 'workshop', 'hackathon', 'competition', 'seminar'].includes(messageType);
  if (isEventLike) {
    if (!date) missingFields.push('date');
    if (!startTime) missingFields.push('time');
    if (!venue && mode !== 'Online') missingFields.push('venue');
    if (!registrationLink && !lower.includes('no registration')) missingFields.push('registrationLink');
  }

  // Derive Event Name
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const eventName = lines.length > 0 && lines[0].length < 100
    ? lines[0].replace(/^[*#_~]+|[*#_~]+$/g, '')
    : `${societyName} Campus Activity`;

  const registrationStatus = calculateRegistrationStatus(registrationDeadline, date);

  return {
    messageType,
    extracted: {
      eventName: isEventLike || messageType === 'recruitment' ? eventName : null,
      eventType: isEventLike ? messageType : null,
      description: text.substring(0, 300),
      date,
      dateIso: parseDateSafe(date),
      startTime,
      endTime,
      venue,
      mode,
      onlineMeetingLink,
      registrationLink,
      registrationDeadline,
      registrationDeadlineIso: parseDateSafe(registrationDeadline),
      registrationStatus,
      eligibility,
      targetAudience: eligibility,
      yearOrBranchRestrictions: null,
      participationRequirements: null,
      fees,
      prizes: null,
      speakers: [],
      guests: [],
      organizers: [societyName],
      contactInformation: null,
      importantInstructions: null,
      requiredDocuments: [],
      submissionDeadline: null,
      submissionDeadlineIso: null,
      eventStatus: messageType === 'cancellation' ? 'cancelled' : messageType === 'schedule_change' ? 'rescheduled' : 'scheduled',
      tags: [messageType, societyName],
      incompleteInfo: missingFields.length > 0,
      missingFields,
      notes: missingFields.length > 0 ? `Notice: Missing ${missingFields.join(', ')} in original post.` : null,
    },
  };
}

/**
 * AI Information Extraction Service using Google Gen AI (Gemini)
 * Enforces honesty protocol, detects updates & duplicates, and updates structured documents.
 */
export async function analyzeAndStoreSocietyMessage(params: {
  societyId: string;
  societyName: string;
  originalMessage: string;
  sender?: {
    id?: string;
    name?: string;
    role?: string;
    avatar?: string;
    studentId?: string;
    email?: string;
  };
  channelId?: string;
}): Promise<{
  announcement: any;
  createdEvent?: any;
  createdOpportunity?: any;
  isUpdate: boolean;
  isDuplicate: boolean;
}> {
  const { societyId, societyName, originalMessage, sender, channelId } = params;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  let messageType = 'general_update';
  let extracted: IExtractedInformation;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const systemInstruction = `You are Univia's core AI Intelligence Engine.
You parse student announcements posted by ANY college society, club, committee, chapter, or department.

CRITICAL DIRECTIVES:
1. CLASSIFY MESSAGE TYPE: Determine whether the message is:
   - 'event'
   - 'workshop'
   - 'hackathon'
   - 'seminar'
   - 'competition'
   - 'recruitment' (auditions, society core induction, member onboarding)
   - 'opportunity' (scholarships, internships, campus ambassador, grants)
   - 'reminder'
   - 'schedule_change' (postponement, date change, time change)
   - 'venue_change'
   - 'cancellation'
   - 'notice' (general updates, election, circular)
   - 'other'
   Do NOT assume every message is an event!

2. EXTRACT PRECISE DATA:
   - eventName (null if no event/activity)
   - eventType (e.g. Workshop, Hackathon, Audition, Orientation, Social, etc.)
   - description (clear, concise 1-3 sentence summary)
   - date (e.g., "2026-09-20" or "Friday, Oct 24")
   - startTime and endTime (e.g., "4:00 PM", "6:30 PM")
   - venue (e.g. "Auditorium Hall 2", "Seminar Hall 3", "LH-05", "Online")
   - mode ('Online', 'Offline', 'Hybrid')
   - onlineMeetingLink (Google Meet, Zoom, MS Teams URL)
   - registrationLink (Google Form, Devfolio, Unstop, Luma URL)
   - registrationDeadline (string)
   - eligibility (e.g. "Open to 1st year students", "All CSE undergrads", "Open to all branches")
   - targetAudience
   - yearOrBranchRestrictions
   - participationRequirements (e.g. "Bring charged laptop", "Teams of 2-4")
   - fees (e.g. "Free", "₹100")
   - prizes (e.g. "Cash prizes worth ₹25,000", "Certificates")
   - speakers (array of names)
   - guests (array of names)
   - organizers (array of societies or coordinators)
   - contactInformation
   - importantInstructions
   - requiredDocuments
   - submissionDeadline
   - eventStatus ('scheduled', 'rescheduled', 'cancelled', 'registration_open', 'registration_closed', 'completed')
   - tags (array of keywords e.g. ["Web3", "AI", "First-Year", "Auditions"])

3. HONESTY PROTOCOL:
   - If any vital field is missing or not provided in the original announcement, set it to NULL.
   - Set incompleteInfo: true, and list the missing fields in missingFields array.
   - NEVER INVENT OR FABRICATE PLACEHOLDERS (e.g., do not make up room numbers, fake deadlines, or fake dates).

4. DETECT UPDATES OR DUPLICATES:
   - Note in 'notes' if this message looks like a schedule update, venue shift, or cancellation of a previously announced event.`;

      let response: any = null;
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
      for (const m of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: m,
            contents: `Society: "${societyName}" (ID: ${societyId})\nOriginal Announcement Message:\n"""\n${originalMessage}\n"""`,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  messageType: { type: Type.STRING },
                  eventName: { type: Type.STRING },
                  eventType: { type: Type.STRING },
                  description: { type: Type.STRING },
                  date: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  venue: { type: Type.STRING },
                  mode: { type: Type.STRING },
                  onlineMeetingLink: { type: Type.STRING },
                  registrationLink: { type: Type.STRING },
                  registrationDeadline: { type: Type.STRING },
                  eligibility: { type: Type.STRING },
                  targetAudience: { type: Type.STRING },
                  yearOrBranchRestrictions: { type: Type.STRING },
                  participationRequirements: { type: Type.STRING },
                  fees: { type: Type.STRING },
                  prizes: { type: Type.STRING },
                  speakers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  guests: { type: Type.ARRAY, items: { type: Type.STRING } },
                  organizers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contactInformation: { type: Type.STRING },
                  importantInstructions: { type: Type.STRING },
                  requiredDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  submissionDeadline: { type: Type.STRING },
                  eventStatus: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  incompleteInfo: { type: Type.BOOLEAN },
                  missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notes: { type: Type.STRING },
                },
                required: ['messageType', 'description', 'incompleteInfo', 'missingFields'],
              },
            },
          });
          break;
        } catch (err: any) {
          console.warn(`[AI Extraction] Model ${m} unavailable (${err?.message || err}). Trying next model...`);
        }
      }
      if (!response) {
        throw new Error('All Gemini models unavailable for extraction');
      }

      let raw = (response.text || '').trim();
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }
      const parsed = JSON.parse(raw || '{}');
      messageType = parsed.messageType || 'general_update';
      const regStatus = calculateRegistrationStatus(parsed.registrationDeadline, parsed.date);

      extracted = {
        eventName: parsed.eventName || null,
        eventType: parsed.eventType || null,
        description: parsed.description || null,
        date: parsed.date || null,
        dateIso: parseDateSafe(parsed.date),
        startTime: parsed.startTime || null,
        endTime: parsed.endTime || null,
        venue: parsed.venue || null,
        mode: parsed.mode || 'Offline',
        onlineMeetingLink: parsed.onlineMeetingLink || null,
        registrationLink: parsed.registrationLink || null,
        registrationDeadline: parsed.registrationDeadline || null,
        registrationDeadlineIso: parseDateSafe(parsed.registrationDeadline),
        registrationStatus: regStatus,
        eligibility: parsed.eligibility || null,
        targetAudience: parsed.targetAudience || null,
        yearOrBranchRestrictions: parsed.yearOrBranchRestrictions || null,
        participationRequirements: parsed.participationRequirements || null,
        fees: parsed.fees || null,
        prizes: parsed.prizes || null,
        speakers: parsed.speakers || [],
        guests: parsed.guests || [],
        organizers: parsed.organizers && parsed.organizers.length > 0 ? parsed.organizers : [societyName],
        contactInformation: parsed.contactInformation || null,
        importantInstructions: parsed.importantInstructions || null,
        requiredDocuments: parsed.requiredDocuments || [],
        submissionDeadline: parsed.submissionDeadline || null,
        submissionDeadlineIso: parseDateSafe(parsed.submissionDeadline),
        eventStatus: parsed.eventStatus || 'scheduled',
        tags: parsed.tags || [societyName],
        incompleteInfo: !!parsed.incompleteInfo,
        missingFields: parsed.missingFields || [],
        notes: parsed.notes || null,
      };
    } catch (err: any) {
      console.warn('[Gemini AI Extraction Fallback]', err?.message);
      const fb = fallbackExtractInformation(originalMessage, societyName);
      messageType = fb.messageType;
      extracted = fb.extracted;
    }
  } else {
    const fb = fallbackExtractInformation(originalMessage, societyName);
    messageType = fb.messageType;
    extracted = fb.extracted;
  }

  // --- DUPLICATE & UPDATE DETECTION ---
  let isDuplicate = false;
  let isUpdate = false;
  let relatedEventId: string | undefined = undefined;
  let supersedesAnnouncementId: string | undefined = undefined;

  const titleToCheck = extracted.eventName || '';
  const now = new Date();

  // Search existing events to see if this matches or updates an existing event
  let existingEvent: any = null;

  if (isDbConnected()) {
    if (titleToCheck) {
      existingEvent = await EventModel.findOne({
        societyId,
        $or: [
          { title: { $regex: new RegExp(titleToCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
          ...(extracted.registrationLink ? [{ registrationLink: extracted.registrationLink }] : []),
        ],
      });
    }
  } else {
    existingEvent = IN_MEMORY_EVENTS.find(
      (e) =>
        e.societyId === societyId &&
        ((titleToCheck && e.title.toLowerCase().includes(titleToCheck.toLowerCase())) ||
          (extracted.registrationLink && e.registrationLink === extracted.registrationLink))
    );
  }

  // Check if it is an update or duplicate
  if (existingEvent) {
    relatedEventId = existingEvent.eventId;

    const isExplicitChange =
      messageType === 'schedule_change' ||
      messageType === 'venue_change' ||
      messageType === 'cancellation' ||
      (extracted.date && extracted.date !== existingEvent.date) ||
      (extracted.venue && extracted.venue !== existingEvent.venue) ||
      (extracted.startTime && extracted.startTime !== existingEvent.startTime) ||
      (extracted.registrationDeadline && extracted.registrationDeadline !== existingEvent.registrationDeadline);

    if (isExplicitChange) {
      isUpdate = true;
      // Record in event update history
      const updateRecord = {
        announcementId: `ann-${Date.now()}`,
        timestamp: now,
        updateType: messageType,
        summary: `Announcement update: ${extracted.description || 'Details modified'}`,
        previousValues: {
          date: existingEvent.date,
          startTime: existingEvent.startTime,
          venue: existingEvent.venue,
          registrationDeadline: existingEvent.registrationDeadline,
          status: existingEvent.status,
        },
      };

      const updatedFields: any = {
        updatesHistory: [...(existingEvent.updatesHistory || []), updateRecord],
        updatedAt: now,
      };
      if (extracted.date) {
        updatedFields.date = extracted.date;
        updatedFields.dateIso = extracted.dateIso;
      }
      if (extracted.venue) updatedFields.venue = extracted.venue;
      if (extracted.startTime) updatedFields.startTime = extracted.startTime;
      if (extracted.endTime) updatedFields.endTime = extracted.endTime;
      if (extracted.registrationLink) updatedFields.registrationLink = extracted.registrationLink;
      if (extracted.registrationDeadline) {
        updatedFields.registrationDeadline = extracted.registrationDeadline;
        updatedFields.registrationDeadlineIso = extracted.registrationDeadlineIso;
        updatedFields.registrationStatus = calculateRegistrationStatus(extracted.registrationDeadline, updatedFields.date || existingEvent.date);
      }
      if (messageType === 'cancellation') {
        updatedFields.status = 'cancelled';
      } else if (messageType === 'schedule_change' || messageType === 'venue_change') {
        updatedFields.status = 'rescheduled';
      }

      if (isDbConnected()) {
        await EventModel.updateOne({ eventId: existingEvent.eventId }, { $set: updatedFields });
      } else {
        Object.assign(existingEvent, updatedFields);
      }
    } else {
      // Check if original messages are nearly identical
      isDuplicate = true;
    }
  }

  // Generate Announcement ID
  const announcementId = `ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Store Announcement in MongoDB
  const announcementData = {
    announcementId,
    societyId,
    societyName,
    originalMessage,
    sender,
    messageTimestamp: now,
    messageType,
    extractedInformation: extracted,
    relatedEventId,
    isDuplicate,
    isUpdate,
    supersedesAnnouncementId,
    channelId,
    createdAt: now,
    updatedAt: now,
  };

  let savedAnnouncement: any;
  if (isDbConnected()) {
    savedAnnouncement = await Announcement.create(announcementData);
  } else {
    savedAnnouncement = announcementData;
    IN_MEMORY_ANNOUNCEMENTS.unshift(announcementData);
  }

  // --- STRUCTURED EVENT CREATION ---
  // If message contains an event and is NOT an update or duplicate of an existing event
  let createdEvent: any = null;
  const isEventClass = ['event', 'workshop', 'hackathon', 'seminar', 'competition'].includes(messageType);

  if (isEventClass && extracted.eventName && !existingEvent) {
    const eventId = `evt-${societyId}-${Date.now().toString().slice(-6)}`;
    const eventDocument = {
      eventId,
      societyId,
      societyName,
      title: extracted.eventName,
      description: extracted.description || originalMessage.substring(0, 200),
      eventType: extracted.eventType || 'Campus Event',
      date: extracted.date || 'TBA (Check Society Announcement)',
      dateIso: extracted.dateIso || undefined,
      startTime: extracted.startTime || '',
      endTime: extracted.endTime || '',
      venue: extracted.venue || (extracted.mode === 'Online' ? 'Online' : 'Campus Venue TBA'),
      mode: extracted.mode || 'Offline',
      onlineMeetingLink: extracted.onlineMeetingLink || '',
      registrationLink: extracted.registrationLink || '',
      registrationDeadline: extracted.registrationDeadline || '',
      registrationDeadlineIso: extracted.registrationDeadlineIso || undefined,
      registrationStatus: extracted.registrationStatus || 'not_announced',
      eligibility: extracted.eligibility || 'Open to all students',
      fees: extracted.fees || 'Free',
      prizes: extracted.prizes || '',
      speakers: extracted.speakers || [],
      contactInformation: extracted.contactInformation || '',
      tags: extracted.tags || [societyName],
      sourceAnnouncementId: announcementId,
      status: 'scheduled',
      category: extracted.eventType || 'Tech & Innovation',
      attendeesCount: 0,
      isToday: extracted.date?.toLowerCase().includes('today') || false,
      updatesHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    if (isDbConnected()) {
      createdEvent = await EventModel.create(eventDocument);
    } else {
      createdEvent = eventDocument;
      IN_MEMORY_EVENTS.unshift(eventDocument);
    }

    // Link eventId back to announcement
    if (isDbConnected()) {
      await Announcement.updateOne({ announcementId }, { $set: { relatedEventId: eventId } });
    } else {
      savedAnnouncement.relatedEventId = eventId;
    }
  }

  // --- STRUCTURED OPPORTUNITY CREATION ---
  let createdOpportunity: any = null;
  if (messageType === 'opportunity' || messageType === 'recruitment') {
    const opportunityId = `opp-${societyId}-${Date.now().toString().slice(-6)}`;
    const oppDoc: any = {
      opportunityId,
      societyId,
      organization: societyName,
      title: extracted.eventName || `${societyName} Opportunities & Recruitment`,
      type: messageType === 'recruitment' ? 'Recruitment' : 'Internship',
      location: extracted.venue || 'Campus Wide',
      compensation: extracted.fees || 'Univia Verified Student Member',
      deadline: extracted.registrationDeadline || extracted.date || 'Rolling',
      deadlineIso: (extracted.registrationDeadlineIso || extracted.dateIso) || undefined,
      tags: extracted.tags || [societyName, messageType],
      description: extracted.description || originalMessage.substring(0, 300),
      sourceAnnouncementId: announcementId,
      applicationLink: extracted.registrationLink || '',
      eligibility: extracted.eligibility || 'Open to all students',
      createdAt: now,
      updatedAt: now,
    };

    if (isDbConnected()) {
      createdOpportunity = await OpportunityModel.create(oppDoc);
    } else {
      createdOpportunity = oppDoc;
      IN_MEMORY_OPPORTUNITIES.unshift(oppDoc);
    }
  }

  return {
    announcement: savedAnnouncement,
    createdEvent: createdEvent || existingEvent,
    createdOpportunity,
    isUpdate,
    isDuplicate,
  };
}
