const buckets = new Map();

function rateLimit(req, options = {}) {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || options.windowMs || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || options.max || 60);
  const key = options.key || "global";
  const ip =
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return {
      ok: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { ok: true, remaining: Math.max(0, max - bucket.count) };
}

module.exports = { rateLimit };
