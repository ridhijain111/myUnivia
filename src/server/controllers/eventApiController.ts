import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { isDbConnected } from '../database/db';
import {
  IN_MEMORY_EVENTS,
  calculateRegistrationStatus,
  parseDateSafe,
} from '../services/aiExtractionService';
import { INITIAL_EVENTS } from '../../data/mockData';

export async function ensureDefaultEventsSeeded() {
  try {
    if (isDbConnected()) {
      const count = await EventModel.countDocuments();
      if (count === 0) {
        console.log('[Seed] Populating initial events into MongoDB...');
        const docs = INITIAL_EVENTS.map((e: any) => ({
          eventId: e.id,
          societyId: e.societyId || 'soc-general',
          societyName: e.society,
          title: e.title,
          description: e.description || '',
          eventType: e.tags?.[0] || 'Campus Event',
          date: e.date,
          dateIso: parseDateSafe(e.date) || new Date(),
          startTime: e.time?.split('-')[0]?.trim() || '',
          endTime: e.time?.split('-')[1]?.trim() || '',
          venue: e.location || 'Campus Wide',
          mode: e.isOnline ? 'Online' : 'Offline',
          registrationLink: e.registrationUrl || '',
          registrationDeadline: e.date,
          registrationDeadlineIso: parseDateSafe(e.date) || undefined,
          registrationStatus: calculateRegistrationStatus(e.date, e.date),
          eligibility: 'Open to all students',
          fees: 'Free',
          tags: e.tags || [],
          status: e.status || 'APPROVED',
          category: e.category,
          attendeesCount: e.attendeesCount || 0,
          maxAttendees: e.maxAttendees,
          isToday: !!e.isToday,
          updatesHistory: [],
        }));
        await EventModel.insertMany(docs);
        console.log(`[Seed] Seeded ${docs.length} campus events successfully.`);
      }
    } else if (IN_MEMORY_EVENTS.length === 0) {
      INITIAL_EVENTS.forEach((e: any) => {
        IN_MEMORY_EVENTS.push({
          eventId: e.id,
          societyId: e.societyId || 'soc-general',
          societyName: e.society,
          title: e.title,
          description: e.description || '',
          eventType: e.tags?.[0] || 'Campus Event',
          date: e.date,
          dateIso: parseDateSafe(e.date) || new Date(),
          startTime: e.time?.split('-')[0]?.trim() || '',
          endTime: e.time?.split('-')[1]?.trim() || '',
          venue: e.location || 'Campus Wide',
          mode: e.isOnline ? 'Online' : 'Offline',
          registrationLink: e.registrationUrl || '',
          registrationDeadline: e.date,
          registrationStatus: calculateRegistrationStatus(e.date, e.date),
          eligibility: 'Open to all students',
          fees: 'Free',
          tags: e.tags || [],
          status: e.status || 'APPROVED',
          category: e.category,
          attendeesCount: e.attendeesCount || 0,
          maxAttendees: e.maxAttendees,
          isToday: !!e.isToday,
          updatesHistory: [],
        });
      });
    }
  } catch (err: any) {
    console.warn('[Seed Events Warning]', err?.message);
  }
}

/**
 * GET /api/events
 */
export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      societyId,
      eventType,
      dateRange,
      todayOnly,
      registrationStatus,
      status,
    } = req.query;

    await ensureDefaultEventsSeeded();

    if (isDbConnected()) {
      const filter: any = {};
      if (societyId) filter.societyId = societyId;
      if (eventType && eventType !== 'All') {
        filter.$or = [
          { eventType: { $regex: new RegExp(String(eventType), 'i') } },
          { category: { $regex: new RegExp(String(eventType), 'i') } },
        ];
      }
      if (status) filter.status = status;
      if (todayOnly === 'true') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        filter.$or = [
          { isToday: true },
          { date: { $regex: /today/i } },
          { dateIso: { $gte: start, $lte: end } },
        ];
      }
      if (search) {
        const q = String(search).trim();
        filter.$or = [
          { title: { $regex: new RegExp(q, 'i') } },
          { description: { $regex: new RegExp(q, 'i') } },
          { societyName: { $regex: new RegExp(q, 'i') } },
          { venue: { $regex: new RegExp(q, 'i') } },
        ];
      }

      const events = await EventModel.find(filter).sort({ dateIso: 1, createdAt: -1 });

      // Refresh dynamic registration status
      events.forEach((evt) => {
        evt.registrationStatus = calculateRegistrationStatus(evt.registrationDeadline, evt.date);
      });

      res.json({
        success: true,
        count: events.length,
        data: events,
      });
    } else {
      let events = [...IN_MEMORY_EVENTS];
      if (societyId) events = events.filter((e) => e.societyId === societyId);
      if (todayOnly === 'true') events = events.filter((e) => e.isToday || e.date.toLowerCase().includes('today'));
      if (search) {
        const q = String(search).toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.societyName.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q)
        );
      }

      events.forEach((evt) => {
        evt.registrationStatus = calculateRegistrationStatus(evt.registrationDeadline, evt.date);
      });

      res.json({
        success: true,
        count: events.length,
        data: events,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * GET /api/events/:id
 */
export async function getEventById(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : String(idParam || '');

    if (isDbConnected()) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const evt = await EventModel.findOne({
        $or: [{ eventId: id }, ...(isValidObjectId ? [{ _id: id }] : [])],
      });
      if (!evt) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      evt.registrationStatus = calculateRegistrationStatus(evt.registrationDeadline, evt.date);
      res.json({ success: true, data: evt });
    } else {
      const evt = IN_MEMORY_EVENTS.find((e) => e.eventId === id);
      if (!evt) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      res.json({ success: true, data: evt });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * POST /api/events
 */
export async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body;
    if (!body.title || !body.societyName) {
      res.status(400).json({ success: false, error: 'title and societyName are required' });
      return;
    }

    const eventId = body.eventId || `evt-${Date.now().toString().slice(-6)}`;
    const newDoc = {
      ...body,
      eventId,
      registrationStatus: calculateRegistrationStatus(body.registrationDeadline, body.date),
      updatesHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isDbConnected()) {
      const created = await EventModel.create(newDoc);
      res.status(201).json({ success: true, data: created });
    } else {
      IN_MEMORY_EVENTS.unshift(newDoc);
      res.status(201).json({ success: true, data: newDoc });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * PUT /api/events/:id
 */
export async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : String(idParam || '');
    const updates = req.body;

    if (isDbConnected()) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const updated = await EventModel.findOneAndUpdate(
        { $or: [{ eventId: id }, ...(isValidObjectId ? [{ _id: id }] : [])] },
        { $set: updates },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } else {
      const index = IN_MEMORY_EVENTS.findIndex((e) => e.eventId === id);
      if (index === -1) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      IN_MEMORY_EVENTS[index] = { ...IN_MEMORY_EVENTS[index], ...updates };
      res.json({ success: true, data: IN_MEMORY_EVENTS[index] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}
