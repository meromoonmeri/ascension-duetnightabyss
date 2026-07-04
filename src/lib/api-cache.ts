const cache = new Map<string, { data: any; expiry: number }>();
const TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + TTL });
}