import { Router } from 'express';
import {
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getAllStudents,
} from '../controllers/studentController';
import {
  validateCreateStudent,
  validateUpdateStudent,
  checkStudentIdentifier,
} from '../middleware/validationMiddleware';
import {
  extractAuthUser,
  authorizeStudentProfileAccess,
} from '../middleware/authMiddleware';

const router = Router();

// Retrieve all students
router.get('/', getAllStudents);

// Create student profile
router.post('/', validateCreateStudent, createStudent);

// Get single student profile by ID / Roll / Email
router.get('/:id', checkStudentIdentifier, getStudentById);

// Update existing student profile
router.put(
  '/:id',
  checkStudentIdentifier,
  extractAuthUser,
  authorizeStudentProfileAccess,
  validateUpdateStudent,
  updateStudent
);

// Delete student profile
router.delete(
  '/:id',
  checkStudentIdentifier,
  extractAuthUser,
  authorizeStudentProfileAccess,
  deleteStudent
);

export default router;
