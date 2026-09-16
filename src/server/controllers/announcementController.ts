import { Request, Response } from 'express';
import { Announcement } from '../models/Announcement';
import { isDbConnected } from '../database/db';
import {
  analyzeAndStoreSocietyMessage,
  fallbackExtractInformation,
  IN_MEMORY_ANNOUNCEMENTS,
} from '../services/aiExtractionService';
import { Society } from '../models/Society';

/**
 * POST /api/announcements
 * Accepts an announcement from ANY college society, runs AI analysis, extracts structured data,
 * stores in MongoDB, updates or creates events/opportunities, and detects duplicates or updates.
 */
export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  try {
    const {
      societyId,
      societyName,
      originalMessage,
      sender,
      channelId,
    } = req.body;

    if (!originalMessage || String(originalMessage).trim() === '') {
      res.status(400).json({ success: false, error: 'originalMessage is required.' });
      return;
    }

    let finalSocietyName = societyName;
    let finalSocietyId = societyId || 'soc-general';

    // If societyId provided without name, lookup society
    if (!finalSocietyName && societyId) {
      if (isDbConnected()) {
        const soc = await Society.findOne({ societyId });
        if (soc) finalSocietyName = soc.name;
      }
    }

    if (!finalSocietyName) {
      finalSocietyName = 'Campus Student Organization';
    }

    const result = await analyzeAndStoreSocietyMessage({
      societyId: finalSocietyId,
      societyName: finalSocietyName,
      originalMessage: String(originalMessage).trim(),
      sender,
      channelId,
    });

    res.status(201).json({
      success: true,
      message: result.isUpdate
        ? 'Announcement processed as an update to an existing event.'
        : result.isDuplicate
        ? 'Announcement identified as a reminder/duplicate of an existing notice.'
        : 'Announcement parsed and structured successfully.',
      data: result.announcement,
      createdEvent: result.createdEvent,
      createdOpportunity: result.createdOpportunity,
      isUpdate: result.isUpdate,
      isDuplicate: result.isDuplicate,
    });
  } catch (error: any) {
    console.error('[Create Announcement Error]', error);
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * POST /api/announcements/analyze
 * Dry-run test endpoint to analyze announcement text and preview AI extraction without saving
 */
export async function analyzeAnnouncementPreview(req: Request, res: Response): Promise<void> {
  try {
    const { text, societyName = 'College Society' } = req.body;

    if (!text || String(text).trim() === '') {
      res.status(400).json({ success: false, error: 'Text to analyze is required.' });
      return;
    }

    const result = fallbackExtractInformation(String(text), societyName);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * GET /api/announcements
 * Retrieve society announcements with optional filtering
 */
export async function getAnnouncements(req: Request, res: Response): Promise<void> {
  try {
    const { societyId, messageType, search, limit = 50 } = req.query;

    if (isDbConnected()) {
      const filter: any = {};
      if (societyId) filter.societyId = societyId;
      if (messageType && messageType !== 'all') filter.messageType = messageType;
      if (search) {
        const q = String(search).trim();
        filter.$or = [
          { originalMessage: { $regex: new RegExp(q, 'i') } },
          { societyName: { $regex: new RegExp(q, 'i') } },
          { 'extractedInformation.eventName': { $regex: new RegExp(q, 'i') } },
        ];
      }

      const list = await Announcement.find(filter)
        .sort({ messageTimestamp: -1 })
        .limit(Number(limit));

      res.json({
        success: true,
        count: list.length,
        data: list,
      });
    } else {
      let list = [...IN_MEMORY_ANNOUNCEMENTS];
      if (societyId) list = list.filter((a) => a.societyId === societyId);
      if (messageType && messageType !== 'all') list = list.filter((a) => a.messageType === messageType);
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter(
          (a) =>
            a.originalMessage.toLowerCase().includes(q) ||
            a.societyName.toLowerCase().includes(q) ||
            a.extractedInformation?.eventName?.toLowerCase().includes(q)
        );
      }
      res.json({
        success: true,
        count: list.length,
        data: list.slice(0, Number(limit)),
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * GET /api/announcements/:id
 */
export async function getAnnouncementById(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : String(idParam || '');

    if (isDbConnected()) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const ann = await Announcement.findOne({
        $or: [{ announcementId: id }, ...(isValidObjectId ? [{ _id: id }] : [])],
      });
      if (!ann) {
        res.status(404).json({ success: false, error: 'Announcement not found' });
        return;
      }
      res.json({ success: true, data: ann });
    } else {
      const ann = IN_MEMORY_ANNOUNCEMENTS.find((a) => a.announcementId === id);
      if (!ann) {
        res.status(404).json({ success: false, error: 'Announcement not found' });
        return;
      }
      res.json({ success: true, data: ann });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}
