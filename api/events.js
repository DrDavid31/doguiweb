const { z } = require("zod");
const { enforceCors, handleOptions, methodNotAllowed, readJson, sendJson } = require("./_lib/http");
const { rateLimit } = require("./_lib/rate-limit");
const { captureEvent, captureException } = require("./_lib/observability");

const EventSchema = z.object({
  event: z.string().trim().min(2).max(120),
  distinctId: z.string().trim().min(1).max(160).optional(),
  properties: z.record(z.any()).optional().default({}),
});

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (!enforceCors(req, res)) return;
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const limit = rateLimit(req, { key: "events", max: 120, windowMs: 60_000 });
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return sendJson(res, 429, { ok: false, error: "rate_limited" });
  }

  try {
    const input = EventSchema.parse(await readJson(req, 100_000));
    const result = await captureEvent(input.event, input.distinctId, input.properties);
    return sendJson(res, 202, { ok: true, ...result });
  } catch (error) {
    captureException(error, { route: "/api/events" });
    return sendJson(res, error.statusCode || 400, { ok: false, error: error.message || "invalid_event" });
  }
};
