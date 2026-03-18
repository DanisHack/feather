import type { Request, Response, NextFunction } from 'express';

// Extend Express Request to carry verified user ID
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      clerkUserId?: string;
    }
  }
}

const hasClerk = Boolean(process.env.CLERK_SECRET_KEY);

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!hasClerk) {
    // Dev mode — accept any token
    req.clerkUserId = 'dev-user';
    next();
    return;
  }

  try {
    const { verifyToken } = await import('@clerk/express');
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    req.clerkUserId = payload.sub;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
