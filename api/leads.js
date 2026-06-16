const { z } = require("zod");
const { applyCors, getClientIp, handleOptions, methodNotAllowed, readJson, sendJson } = require("./_lib/http");
const { rateLimit } = require("./_lib/rate-limit");
const { captureEvent, captureException } = require("./_lib/observability");
const { sendLeadEmail } = require("./_lib/resend");
const { getSupabaseAdmin } = require("./_lib/supabase");

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  service: z.string().trim().min(2).max(120),
  message: z.string().trim().max(2000).optional().default(""),
  website: z.string().trim().max(160).optional().default(""),
  source: z.string().trim().max(80).optional().default("website"),
});

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const limit = rateLimit(req, { key: "leads", max: 15, windowMs: 60_000 });
  if (!limit.ok) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return sendJson(res, 429, { ok: false, error: "rate_limited" });
  }

  try {
    const lead = LeadSchema.parse(await readJson(req));

    if (lead.website) {
      return sendJson(res, 202, { ok: true, accepted: true });
    }

    const enrichedLead = {
      name: lead.name,
      company: lead.company,
      email: lead.email.toLowerCase(),
      service: lead.service,
      message: lead.message,
      source: lead.source,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || "",
      created_at: new Date().toISOString(),
    };

    let stored = false;
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("leads").insert(enrichedLead);
      if (error) throw error;
      stored = true;
    }

    const emailResult = await sendLeadEmail(enrichedLead);
    await captureEvent("lead_submitted", enrichedLead.email, {
      company: enrichedLead.company,
      service: enrichedLead.service,
      stored,
      emailed: emailResult.sent,
    });

    return sendJson(res, 202, {
      ok: true,
      accepted: true,
      stored,
      emailed: emailResult.sent,
    });
  } catch (error) {
    captureException(error, { route: "/api/leads" });
    return sendJson(res, error.statusCode || 400, { ok: false, error: error.message || "lead_failed" });
  }
};
