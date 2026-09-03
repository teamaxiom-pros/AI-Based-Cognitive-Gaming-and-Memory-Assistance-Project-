import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken, AuthenticatedUser, dbService, toValidUuid } from '../services/supabaseBackend';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware that strictly requires a valid Supabase Auth Bearer token.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = await verifySupabaseToken(token);

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired Supabase authentication session.',
    });
    return;
  }

  req.user = user;
  next();
}

/**
 * Optional authentication middleware: sets req.user if token is present, but doesn't block.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await verifySupabaseToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

/**
 * Role guard middleware to enforce role-based access for patients only.
 */
export function requirePatient(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'patient') {
    res.status(403).json({
      success: false,
      error: `Access forbidden: Patient role required. Caller has role "${req.user.role}".`,
    });
    return;
  }
  next();
}

/**
 * Role guard middleware to enforce role-based access for caregivers only.
 */
export function requireCaregiver(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'caregiver') {
    res.status(403).json({
      success: false,
      error: `Access forbidden: Caregiver role required. Caller has role "${req.user.role}".`,
    });
    return;
  }
  next();
}

/**
 * Authorization guard: verifies caller is either the patient themselves OR a verified linked caregiver.
 */
export function requirePatientAccess(getPatientId: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const targetPatientId = getPatientId(req);
    const callerId = req.user.userId;

    // Direct match: Caller is the patient
    if (callerId === targetPatientId || toValidUuid(callerId) === toValidUuid(targetPatientId)) {
      next();
      return;
    }

    // Caregiver access check: Caller is linked caregiver
    if (req.user.role === 'caregiver') {
      try {
        const linkedPatients = await dbService.getLinkedPatients(callerId);
        const isLinked = linkedPatients.some(
          p => p.user_id === targetPatientId || toValidUuid(p.user_id) === toValidUuid(targetPatientId)
        );
        if (isLinked) {
          next();
          return;
        }
      } catch {}
    }

    res.status(403).json({
      success: false,
      error: 'Access forbidden: You do not have permission to access this patient profile.',
    });
  };
}
