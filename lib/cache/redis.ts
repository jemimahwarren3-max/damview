import Redis from "ioredis";

export type CacheDomain =
  | "dashboard"
  | "managers"
  | "rooms"
  | "tables"
  | "guests"
  | "menu"
  | "orders"
  | "billing"
  | "reports"
  | "history"
  | "settings";

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) return null;

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
  });
  return redisClient;
}

export function isRedisEnabled() {
  return !!getRedisClient();
}

function versionKey(domain: CacheDomain) {
  return `cache:version:${domain}`;
}

export async function getCacheVersion(domain: CacheDomain): Promise<number> {
  const redis = getRedisClient();
  if (!redis) return 0;

  try {
    const version = await redis.get(versionKey(domain));
    if (!version) return 0;

    const parsedVersion = Number.parseInt(version, 10);
    return Number.isFinite(parsedVersion) ? parsedVersion : 0;
  } catch {
    return 0;
  }
}

export async function bumpCacheVersions(domains: CacheDomain[]) {
  const redis = getRedisClient();
  if (!redis || domains.length === 0) return;

  const uniqueDomains = [...new Set(domains)];

  try {
    await Promise.all(uniqueDomains.map((domain) => redis.incr(versionKey(domain))));
  } catch {
    // Ignore cache invalidation errors so writes are never blocked.
  }
}

export async function getOrSetVersionedCache<T>({
  domain,
  key,
  ttlSeconds,
  loader,
}: {
  domain: CacheDomain;
  key: string;
  ttlSeconds: number;
  loader: () => Promise<T>;
}): Promise<T> {
  const redis = getRedisClient();
  if (!redis) return loader();

  const version = await getCacheVersion(domain);
  const fullKey = `cache:${domain}:v${version}:${key}`;

  try {
    const cached = await redis.get(fullKey);
    if (cached !== null && cached !== undefined) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Fall through to source loader.
  }

  const data = await loader();

  try {
    await redis.set(fullKey, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Ignore write errors.
  }

  return data;
}

export function stableCacheKey(prefix: string, params?: Record<string, string | number | boolean | null | undefined>) {
  if (!params) return prefix;
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return prefix;

  const encoded = entries
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

  return `${prefix}?${encoded}`;
}
