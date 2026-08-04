const { enforceCors, handleOptions, methodNotAllowed, sendJson } = require("./_lib/http");
const { hasSupabaseConfig } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (!enforceCors(req, res)) return;
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  return sendJson(res, 200, {
    ok: true,
    service: "doguiweb",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    integrations: {
      supabase: hasSupabaseConfig(),
      clerk: Boolean(process.env.CLERK_SECRET_KEY),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
      posthog: Boolean(process.env.POSTHOG_PROJECT_API_KEY),
      sentry: Boolean(process.env.SENTRY_DSN),
      pinecone: Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME),
    },
  });
};
