import type { Request, Response, NextFunction } from 'express';

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 100;

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? 'unknown';
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    next();
    return;
  }

  if (entry.count >= maxRequests) {
    res.status(429).json({ error: 'Too many requests' });
    return;
  }

  entry.count++;
  next();
}
