import redis from "@/lib/redis/client";

const DEFAULT_TTL = 300; // 5 minutes

export class CacheService {
  private prefix: string;

  constructor(namespace = "nexus") {
    this.prefix = namespace;
  }

  private key(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.key(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(this.key(key), ttl, JSON.stringify(value));
    } catch {
      // Cache failures should not break the app
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(this.key(key));
    } catch {
      // ignore
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(this.key(pattern));
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch {
      // ignore
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = DEFAULT_TTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}

export const cache = new CacheService("nexus");

export const CacheKeys = {
  dashboard: (orgId: string) => `dashboard:${orgId}`,
  products: (orgId: string, page: number) => `products:${orgId}:${page}`,
  inventory: (orgId: string) => `inventory:${orgId}`,
  pipeline: (orgId: string) => `pipeline:${orgId}`,
  user: (userId: string) => `user:${userId}`,
  search: (orgId: string, query: string) => `search:${orgId}:${query}`,
} as const;
