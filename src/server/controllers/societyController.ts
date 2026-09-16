import { Request, Response } from 'express';
import { Society, ISociety } from '../models/Society';
import { isDbConnected } from '../database/db';
import { IN_MEMORY_SOCIETIES } from '../services/aiExtractionService';
import { INITIAL_SOCIETIES } from '../../data/mockData';

// Seed initial societies into MongoDB or in-memory if empty
export async function ensureDefaultSocietiesSeeded() {
  try {
    if (isDbConnected()) {
      const count = await Society.countDocuments();
      if (count === 0) {
        console.log('[Seed] Populating initial campus societies into MongoDB...');
        const docs = INITIAL_SOCIETIES.map((s) => ({
          societyId: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          avatar: s.avatar,
          imageUrl: s.imageUrl || '',
          coverImage: s.imageUrl || '',
          bannerColor: s.bannerColor,
          memberCount: s.memberCount,
          meetingSchedule: s.meetingSchedule || 'Weekly Meetups',
          location: s.location || 'Campus Wide',
          isOfficial: true,
          adminIds: ['UNIVIA-ADMIN-001', '01801012027', '04201012028'],
          communityId: s.communityId,
          contactInformation: {
            email: `${s.id.replace('soc-', '')}@univia.ac.in`,
            website: `https://${s.id.replace('soc-', '')}.univia.ac.in`,
          },
        }));
        await Society.insertMany(docs);
        console.log(`[Seed] Seeded ${docs.length} campus societies successfully.`);
      }
    } else if (IN_MEMORY_SOCIETIES.length === 0) {
      INITIAL_SOCIETIES.forEach((s) => {
        IN_MEMORY_SOCIETIES.push({
          societyId: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          avatar: s.avatar,
          imageUrl: s.imageUrl || '',
          coverImage: s.imageUrl || '',
          bannerColor: s.bannerColor,
          memberCount: s.memberCount,
          meetingSchedule: s.meetingSchedule || 'Weekly Meetups',
          location: s.location || 'Campus Wide',
          isOfficial: true,
          adminIds: ['UNIVIA-ADMIN-001'],
          communityId: s.communityId,
        });
      });
    }
  } catch (err: any) {
    console.warn('[Seed Societies Warning]', err?.message);
  }
}

/**
 * GET /api/societies
 * Lists all societies with flexible query search and category filtering
 */
export async function getSocieties(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, officialOnly } = req.query;

    if (isDbConnected()) {
      await ensureDefaultSocietiesSeeded();
      const filter: any = {};
      if (category && category !== 'All') {
        filter.category = { $regex: new RegExp(String(category), 'i') };
      }
      if (officialOnly === 'true') {
        filter.isOfficial = true;
      }
      if (search && String(search).trim()) {
        const q = String(search).trim();
        filter.$or = [
          { name: { $regex: new RegExp(q, 'i') } },
          { description: { $regex: new RegExp(q, 'i') } },
          { category: { $regex: new RegExp(q, 'i') } },
          { location: { $regex: new RegExp(q, 'i') } },
        ];
      }

      const societies = await Society.find(filter).sort({ memberCount: -1, name: 1 });
      res.json({
        success: true,
        count: societies.length,
        data: societies,
      });
    } else {
      await ensureDefaultSocietiesSeeded();
      let results = [...IN_MEMORY_SOCIETIES];
      if (category && category !== 'All') {
        results = results.filter((s) =>
          s.category.toLowerCase().includes(String(category).toLowerCase())
        );
      }
      if (search && String(search).trim()) {
        const q = String(search).toLowerCase().trim();
        results = results.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        );
      }
      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * GET /api/societies/:id
 */
export async function getSocietyById(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : String(idParam || '');

    if (isDbConnected()) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const society = await Society.findOne({
        $or: [{ societyId: id }, ...(isValidObjectId ? [{ _id: id }] : [])],
      });
      if (!society) {
        res.status(404).json({ success: false, error: `Society ${id} not found.` });
        return;
      }
      res.json({ success: true, data: society });
    } else {
      const society = IN_MEMORY_SOCIETIES.find((s) => s.societyId === id);
      if (!society) {
        res.status(404).json({ success: false, error: `Society ${id} not found.` });
        return;
      }
      res.json({ success: true, data: society });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * POST /api/societies
 * Creates a new generic society / club / chapter
 */
export async function createSociety(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      category,
      logo,
      avatar = '🏛️',
      contactInformation,
      socialLinks,
      meetingSchedule = 'Weekly Meetups',
      location = 'Campus Wide',
      bannerColor = 'bg-indigo-100 text-indigo-700',
      isOfficial = true,
      adminIds = [],
    } = req.body;

    if (!name || String(name).trim() === '') {
      res.status(400).json({ success: false, error: 'Society name is required.' });
      return;
    }

    // Auto-generate unique societyId
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const societyId = `soc-${slug}-${Date.now().toString().slice(-4)}`;

    const newDoc = {
      societyId,
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      category: category ? String(category).trim() : 'General Student Organization',
      logo: logo || '',
      avatar: avatar || '🏛️',
      contactInformation: contactInformation || {},
      socialLinks: socialLinks || {},
      meetingSchedule,
      location,
      bannerColor,
      memberCount: 1,
      isOfficial: isOfficial ?? true,
      adminIds: Array.isArray(adminIds) && adminIds.length > 0 ? adminIds : ['UNIVIA-ADMIN-001'],
      communityId: `comm-${slug}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isDbConnected()) {
      const created = await Society.create(newDoc);
      res.status(201).json({ success: true, data: created });
    } else {
      IN_MEMORY_SOCIETIES.unshift(newDoc);
      res.status(201).json({ success: true, data: newDoc });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}

/**
 * PUT /api/societies/:id
 */
export async function updateSociety(req: Request, res: Response): Promise<void> {
  try {
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? idParam : String(idParam || '');
    const updates = req.body;

    if (isDbConnected()) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      const updated = await Society.findOneAndUpdate(
        { $or: [{ societyId: id }, ...(isValidObjectId ? [{ _id: id }] : [])] },
        { $set: updates },
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ success: false, error: 'Society not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } else {
      const index = IN_MEMORY_SOCIETIES.findIndex((s) => s.societyId === id);
      if (index === -1) {
        res.status(404).json({ success: false, error: 'Society not found' });
        return;
      }
      IN_MEMORY_SOCIETIES[index] = { ...IN_MEMORY_SOCIETIES[index], ...updates };
      res.json({ success: true, data: IN_MEMORY_SOCIETIES[index] });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
}
