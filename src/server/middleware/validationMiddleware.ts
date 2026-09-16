import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates required fields for creating a student profile
 */
export function validateCreateStudent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name, email, studentId, campusCardId } = req.body;
  const missingFields: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    missingFields.push('name');
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    missingFields.push('email');
  } else if (!isValidEmail(email)) {
    res.status(400).json({
      success: false,
      error: 'Invalid email address format.',
      field: 'email',
    });
    return;
  }

  const effectiveId = studentId || campusCardId;
  if (!effectiveId || typeof effectiveId !== 'string' || effectiveId.trim().length === 0) {
    missingFields.push('studentId or campusCardId');
  }

  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      error: `Missing required field(s): ${missingFields.join(', ')}.`,
      missingFields,
    });
    return;
  }

  next();
}

/**
 * Validates updates to an existing student profile
 */
export function validateUpdateStudent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { email, name } = req.body;

  if (email !== undefined) {
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Provided email address format is invalid.',
        field: 'email',
      });
      return;
    }
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    res.status(400).json({
      success: false,
      error: 'Name cannot be empty.',
      field: 'name',
    });
    return;
  }

  next();
}

/**
 * Checks identifier parameter (can be 24-character hex MongoDB ObjectId or studentId/email)
 */
export function checkStudentIdentifier(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Student identifier parameter is required in URL.',
    });
    return;
  }

  // Trim and store cleaned id on request object
  req.params.id = id.trim();
  next();
}
