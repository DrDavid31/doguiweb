const { applyCors, handleOptions, methodNotAllowed, sendJson } = require("./_lib/http");

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  return sendJson(res, 200, {
    ok: true,
    appUrl: process.env.APP_URL || process.env.VERCEL_URL || "",
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
    posthogEnabled: Boolean(process.env.POSTHOG_PROJECT_API_KEY),
    sentryEnabled: Boolean(process.env.SENTRY_DSN),
  });
};
