export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
};

export interface RateLimiter {
  consume(key: string): Promise<RateLimitResult>;
}

type Bucket = {
  count: number;
  resetAt: number;
};

export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async consume(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.limit - 1 };
    }
    if (current.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: current.resetAt - now,
      };
    }
    current.count += 1;
    return { allowed: true, remaining: this.limit - current.count };
  }
}

export class NoopRateLimiter implements RateLimiter {
  async consume(_key: string): Promise<RateLimitResult> {
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER };
  }
}
