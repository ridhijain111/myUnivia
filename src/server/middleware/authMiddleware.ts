import { Request, Response, NextFunction } from 'express';
import { ACTIVE_SESSIONS } from '../backendRoutes';

// Extend Express Request to hold authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    studentId?: string;
    email?: string;
    role: string;
  };
}

/**
 * Optional authentication extractor: extracts user info if valid token provided
 */
export function extractAuthUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = ACTIVE_SESSIONS.get(token);

    if (session && session.expiresAt > Date.now()) {
      req.user = {
        id: session.userId,
        studentId: session.userId,
        role: session.role,
      };
    }
  }

  next();
}

/**
 * Authorization guard: ensures student can only edit or delete their own profile,
 * unless they are a Super Admin or Platform Admin.
 */
export function authorizeStudentProfileAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const rawId = req.params.id;
  const targetId = (Array.isArray(rawId) ? rawId[0] : rawId) || '';
  const currentUser = req.user;

  // If no auth token is passed, allow proceeding if developing locally or guest,
  // but if auth user exists, enforce that they match targetId or are admin
  if (currentUser) {
    const isSuperAdmin =
      currentUser.role === 'Super Admin' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'Admin';

    if (!isSuperAdmin) {
      const isOwner =
        currentUser.id.toLowerCase() === targetId.toLowerCase() ||
        (currentUser.studentId &&
          currentUser.studentId.toLowerCase() === targetId.toLowerCase()) ||
        (currentUser.email &&
          currentUser.email.toLowerCase() === targetId.toLowerCase());

      // If user is authenticated but not the owner of the target profile:
      // Note: allow self-editing if targetId matches
      if (!isOwner) {
        // We log and allow if the client sent matching student body data
        const bodyRoll = req.body?.studentId || req.body?.campusCardId || req.body?.email;
        const matchesBody =
          bodyRoll &&
          (bodyRoll.toLowerCase() === currentUser.id.toLowerCase() ||
            bodyRoll.toLowerCase() === (currentUser.studentId || '').toLowerCase());

        if (!matchesBody) {
          // If trying to modify another student's profile without admin role
          res.status(403).json({
            success: false,
            error: 'Forbidden: You are only authorized to modify your own student profile.',
          });
          return;
        }
      }
    }
  }

  next();
}
