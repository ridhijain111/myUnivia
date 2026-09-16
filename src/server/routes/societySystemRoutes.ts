import { Router } from 'express';
import {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
} from '../controllers/societyController';
import {
  createAnnouncement,
  analyzeAnnouncementPreview,
  getAnnouncements,
  getAnnouncementById,
} from '../controllers/announcementController';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
} from '../controllers/eventApiController';

const router = Router();

// Society Routes
router.get('/societies', getSocieties);
router.post('/societies', createSociety);
router.get('/societies/:id', getSocietyById);
router.put('/societies/:id', updateSociety);

// Announcement Routes
router.post('/announcements', createAnnouncement);
router.post('/announcements/analyze', analyzeAnnouncementPreview);
router.get('/announcements', getAnnouncements);
router.get('/announcements/:id', getAnnouncementById);

// Event Routes (MongoDB generic event registry)
router.get('/events', getEvents);
router.post('/events', createEvent);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);

export default router;
