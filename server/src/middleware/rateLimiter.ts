import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store: IP -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

/**
 * Lightweight rate limiter middleware
 * Uses sliding window per IP address
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean up old entries periodically (every 100 requests)
  if (rateLimitStore.size > 100) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetTime < now) {
    // New window or expired window
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: `${retryAfter}s`
    });
  }

  // Increment count
  entry.count++;
  next();
}
