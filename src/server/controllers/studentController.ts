import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Student, IStudent } from '../models/Student';
import { isDbConnected } from '../database/db';
// Fallback in-memory store in case MongoDB URI is not configured yet
let memoryStudentsStore: any[] = [];

/**
 * Helper to check and seed demo students into MongoDB once connected
 * Note: Per user safety constraints, we do NOT seed demo students into the
 * production user database merely because the database is empty.
 */
let hasSeededMongo = false;
export async function seedMongoIfEmpty(): Promise<void> {
  hasSeededMongo = true;
}

/**
 * Synchronize newly registered/logged-in students with in-memory store for offline continuity
 */
export function addStudentToMemoryStore(student: any): void {
  const cleanId = (student.studentId || student.campusCardId || '').toLowerCase();
  const cleanEmail = (student.email || '').toLowerCase();
  const existingIdx = memoryStudentsStore.findIndex(
    (s) =>
      (s.studentId && s.studentId.toLowerCase() === cleanId) ||
      (s.campusCardId && s.campusCardId.toLowerCase() === cleanId) ||
      (s.email && s.email.toLowerCase() === cleanEmail)
  );
  if (existingIdx !== -1) {
    memoryStudentsStore[existingIdx] = { ...memoryStudentsStore[existingIdx], ...student };
  } else {
    memoryStudentsStore.push(student);
  }
}

/**
 * Helper to locate a student by MongoDB _id, studentId, campusCardId, or email
 */
async function findStudentByIdentifier(identifier: string): Promise<IStudent | null> {
  const clean = identifier.trim();
  const lower = clean.toLowerCase();

  const queries: any[] = [
    { studentId: clean },
    { campusCardId: clean },
    { email: lower },
  ];

  if (mongoose.Types.ObjectId.isValid(clean)) {
    queries.unshift({ _id: new mongoose.Types.ObjectId(clean) });
  }

  return Student.findOne({ $or: queries });
}

/**
 * POST /api/students
 * Create a new student profile in MongoDB
 */
export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      studentId,
      campusCardId,
      course,
      department,
      major,
      classYear,
      semester,
      bio,
      skills,
      interests,
      clubs,
      projects,
      achievements,
      certifications,
      linkedin,
      github,
      phone,
      avatar,
      status,
      hostelBlock,
      role,
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const effectiveRoll = (studentId || campusCardId || `UNIV-${Date.now()}`).trim().toUpperCase();

    if (isDbConnected()) {
      await seedMongoIfEmpty();

      // Check for existing profile by email or roll
      const existing = await Student.findOne({
        $or: [
          { email: normalizedEmail },
          { studentId: effectiveRoll },
          { campusCardId: effectiveRoll },
        ],
      });

      if (existing) {
        res.status(409).json({
          success: false,
          error: `A student profile with this email (${normalizedEmail}) or Student ID (${effectiveRoll}) already exists.`,
          existingStudentId: existing.studentId,
        });
        return;
      }

      const newStudent = new Student({
        name: name.trim(),
        email: normalizedEmail,
        studentId: effectiveRoll,
        campusCardId: effectiveRoll,
        course: course || '',
        department: department || '',
        major: major || course || '',
        classYear: classYear || '',
        semester: semester || '',
        bio: bio?.trim() || '',
        skills: Array.isArray(skills) ? skills : [],
        interests: Array.isArray(interests) ? interests : [],
        clubs: Array.isArray(clubs) ? clubs : [],
        projects: Array.isArray(projects) ? projects : [],
        achievements: Array.isArray(achievements) ? achievements : [],
        certifications: Array.isArray(certifications) ? certifications : [],
        linkedin: linkedin?.trim() || '',
        github: github?.trim() || '',
        phone: phone?.trim() || '',
        avatar: avatar || '',
        status: status?.trim() || '🟢 Active on Campus',
        hostelBlock: hostelBlock?.trim() || 'Day Scholar',
        role: role || 'Student',
        isNewUser: req.body.isNewUser !== undefined ? Boolean(req.body.isNewUser) : false,
      });

      const savedStudent = await newStudent.save();

      res.status(201).json({
        success: true,
        message: 'Student profile created and saved in MongoDB.',
        source: 'MongoDB',
        student: savedStudent.toJSON(),
      });
      return;
    }

    // In-memory fallback if MongoDB is not connected
    const existingMemory = memoryStudentsStore.find(
      (s) =>
        s.email?.toLowerCase() === normalizedEmail ||
        s.studentId?.toUpperCase() === effectiveRoll
    );

    if (existingMemory) {
      res.status(409).json({
        success: false,
        error: 'A student profile with this email or Student ID already exists.',
      });
      return;
    }

    const fallbackId = `mem_${Date.now()}`;
    const fallbackStudent = {
      _id: fallbackId,
      id: fallbackId,
      name: name.trim(),
      email: normalizedEmail,
      studentId: effectiveRoll,
      campusCardId: effectiveRoll,
      course: course || '',
      department: department || '',
      major: major || course || '',
      classYear: classYear || '',
      semester: semester || '',
      bio: bio?.trim() || '',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      clubs: Array.isArray(clubs) ? clubs : [],
      projects: Array.isArray(projects) ? projects : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      linkedin: linkedin?.trim() || '',
      github: github?.trim() || '',
      phone: phone?.trim() || '',
      avatar: avatar || '',
      status: status?.trim() || '🟢 Active on Campus',
      hostelBlock: hostelBlock?.trim() || 'Day Scholar',
      role: role || 'Student',
      isNewUser: req.body.isNewUser !== undefined ? Boolean(req.body.isNewUser) : false,
      stats: {
        societiesJoined: 0,
        eventsAttended: 0,
        upcomingDeadlines: 0,
        savedOpportunities: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryStudentsStore.unshift(fallbackStudent);

    res.status(201).json({
      success: true,
      message: 'Student profile created (stored in memory; connect MongoDB to persist permanently).',
      source: 'Memory (MongoDB Offline)',
      student: fallbackStudent,
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to create student profile.',
    });
  }
}

/**
 * GET /api/students/:id
 * Retrieve a student's profile from MongoDB
 * Supports: MongoDB ObjectId, Student ID / Roll Number, or College Email
 */
export async function getStudentById(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (isDbConnected()) {
      await seedMongoIfEmpty();
      const student = await findStudentByIdentifier(id);

      if (!student) {
        res.status(404).json({
          success: false,
          error: `Student profile not found matching identifier "${id}".`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        source: 'MongoDB',
        student: student.toJSON(),
      });
      return;
    }

    // In-memory lookup
    const cleanLower = id.toLowerCase();
    const studentMemory = memoryStudentsStore.find(
      (s) =>
        s._id === id ||
        s.id === id ||
        s.studentId?.toLowerCase() === cleanLower ||
        s.campusCardId?.toLowerCase() === cleanLower ||
        s.email?.toLowerCase() === cleanLower ||
        s.handle?.toLowerCase().replace('@', '') === cleanLower.replace('@', '')
    );

    if (!studentMemory) {
      res.status(404).json({
        success: false,
        error: `Student profile not found matching identifier "${id}".`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      source: 'Memory (MongoDB Offline)',
      student: studentMemory,
    });
  } catch (error: any) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch student profile.',
    });
  }
}

/**
 * PUT /api/students/:id
 * Update an existing student's profile in MongoDB
 * Updates existing document instead of creating a duplicate
 */
export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const updateData = req.body;

    if (isDbConnected()) {
      await seedMongoIfEmpty();
      const student = await findStudentByIdentifier(id);

      if (!student) {
        res.status(404).json({
          success: false,
          error: `Cannot update: No student found with identifier "${id}".`,
        });
        return;
      }

      // Whitelist fields to update
      const allowedFields = [
        'name',
        'email',
        'avatar',
        'university',
        'course',
        'department',
        'major',
        'classYear',
        'semester',
        'bio',
        'status',
        'phone',
        'hostelBlock',
        'skills',
        'interests',
        'clubs',
        'projects',
        'achievements',
        'certifications',
        'linkedin',
        'github',
        'stats',
        'role',
        'isNewUser',
      ];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          (student as any)[field] = updateData[field];
        }
      }

      if (updateData.campusCardId && !student.campusCardId) {
        student.campusCardId = updateData.campusCardId;
      }
      if (updateData.studentId && !student.studentId) {
        student.studentId = updateData.studentId;
      }

      const updated = await student.save();

      res.status(200).json({
        success: true,
        message: 'Student profile updated successfully in MongoDB.',
        source: 'MongoDB',
        student: updated.toJSON(),
      });
      return;
    }

    // In-memory fallback
    const cleanLower = id.toLowerCase();
    const index = memoryStudentsStore.findIndex(
      (s) =>
        s._id === id ||
        s.id === id ||
        s.studentId?.toLowerCase() === cleanLower ||
        s.campusCardId?.toLowerCase() === cleanLower ||
        s.email?.toLowerCase() === cleanLower
    );

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: `Cannot update: No student found with identifier "${id}".`,
      });
      return;
    }

    memoryStudentsStore[index] = {
      ...memoryStudentsStore[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: 'Student profile updated in memory store (connect MongoDB for durable persistence).',
      source: 'Memory (MongoDB Offline)',
      student: memoryStudentsStore[index],
    });
  } catch (error: any) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to update student profile.',
    });
  }
}

/**
 * DELETE /api/students/:id
 * Delete a student's profile from MongoDB
 */
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (isDbConnected()) {
      await seedMongoIfEmpty();
      const student = await findStudentByIdentifier(id);

      if (!student) {
        res.status(404).json({
          success: false,
          error: `Cannot delete: Student with identifier "${id}" not found.`,
        });
        return;
      }

      await Student.deleteOne({ _id: student._id });

      res.status(200).json({
        success: true,
        message: `Student profile for "${student.name}" (${student.studentId}) successfully deleted from MongoDB.`,
        deletedId: student._id,
      });
      return;
    }

    // In-memory fallback
    const cleanLower = id.toLowerCase();
    const initialLen = memoryStudentsStore.length;
    memoryStudentsStore = memoryStudentsStore.filter(
      (s) =>
        s._id !== id &&
        s.id !== id &&
        s.studentId?.toLowerCase() !== cleanLower &&
        s.campusCardId?.toLowerCase() !== cleanLower &&
        s.email?.toLowerCase() !== cleanLower
    );

    if (memoryStudentsStore.length === initialLen) {
      res.status(404).json({
        success: false,
        error: `Cannot delete: Student with identifier "${id}" not found.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Student profile with identifier "${id}" removed.`,
    });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to delete student profile.',
    });
  }
}

/**
 * GET /api/students
 * Retrieve all students with optional search/filtering
 */
export async function getAllStudents(req: Request, res: Response): Promise<void> {
  try {
    const { q, department, classYear, skill } = req.query;

    if (isDbConnected()) {
      await seedMongoIfEmpty();

      const filter: any = {};

      if (q && typeof q === 'string' && q.trim()) {
        const regex = new RegExp(q.trim(), 'i');
        filter.$or = [
          { name: regex },
          { studentId: regex },
          { campusCardId: regex },
          { email: regex },
          { major: regex },
          { department: regex },
          { skills: regex },
        ];
      }

      if (department && typeof department === 'string') {
        filter.department = new RegExp(department.trim(), 'i');
      }

      if (classYear && typeof classYear === 'string') {
        filter.classYear = new RegExp(classYear.trim(), 'i');
      }

      if (skill && typeof skill === 'string') {
        filter.skills = new RegExp(skill.trim(), 'i');
      }

      const students = await Student.find(filter).sort({ name: 1 });

      res.status(200).json({
        success: true,
        source: 'MongoDB',
        count: students.length,
        students: students.map((s) => s.toJSON()),
      });
      return;
    }

    // In-memory fallback
    let results = [...memoryStudentsStore];

    if (q && typeof q === 'string') {
      const lower = q.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.studentId?.toLowerCase().includes(lower) ||
          s.email?.toLowerCase().includes(lower) ||
          s.major?.toLowerCase().includes(lower) ||
          s.skills?.some((sk: string) => sk.toLowerCase().includes(lower))
      );
    }

    res.status(200).json({
      success: true,
      source: 'Memory (MongoDB Offline)',
      count: results.length,
      students: results,
    });
  } catch (error: any) {
    console.error('Error fetching students list:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to retrieve students.',
    });
  }
}
