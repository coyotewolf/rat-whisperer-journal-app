// Simple localStorage-based cache with optional TTL
export interface CacheEntry<T> {
  data: T;
  ts: number; // timestamp ms
  ttl?: number; // ms
}

export function setCache<T>(key: string, data: T, ttlMs?: number) {
  const entry: CacheEntry<T> = { data, ts: Date.now(), ttl: ttlMs };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('setCache failed', e);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.ttl && Date.now() - entry.ts > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data as T;
  } catch (e) {
    console.warn('getCache failed', e);
    return null;
  }
}

export function delCache(key: string) {
  try { localStorage.removeItem(key); } catch {}
}
