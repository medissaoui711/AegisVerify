export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

interface ClientRecord {
  timestamps: number[];
}

export class InMemoryRateLimiter {
  private records: Map<string, ClientRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private lastCleanup: number = Date.now();

  constructor(maxRequests: number = 15, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public check(ip: string, simulateLimit: boolean = false): RateLimitStatus {
    const now = Date.now();

    // Lazy cleanup of stale records on-demand without global interval timers
    if (now - this.lastCleanup > 5 * 60 * 1000 || this.records.size > 500) {
      this.cleanup();
      this.lastCleanup = now;
    }

    if (simulateLimit) {
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetTimeMs: now + 45 * 1000,
        retryAfterSec: 45,
      };
    }

    const windowStart = now - this.windowMs;

    let record = this.records.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(ip, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const resetTimeMs = oldestInWindow + this.windowMs;
      const retryAfterSec = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetTimeMs,
        retryAfterSec,
      };
    }

    // Add current request
    record.timestamps.push(now);
    const remaining = Math.max(0, this.maxRequests - record.timestamps.length);
    const resetTimeMs = now + this.windowMs;

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining,
      resetTimeMs,
      retryAfterSec: 0,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.records.delete(ip);
      }
    }
  }

  public reset(ip?: string): void {
    if (ip) {
      this.records.delete(ip);
    } else {
      this.records.clear();
    }
  }
}

export const defaultRateLimiter = new InMemoryRateLimiter(15, 60 * 1000);
