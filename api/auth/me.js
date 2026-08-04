const { enforceCors, handleOptions, methodNotAllowed, sendJson } = require("../_lib/http");
const { captureException } = require("../_lib/observability");
const { requireClerkAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (!enforceCors(req, res)) return;
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const auth = await requireClerkAuth(req);
    if (!auth.ok) return sendJson(res, auth.statusCode, { ok: false, error: auth.error });

    return sendJson(res, 200, {
      ok: true,
      userId: auth.userId,
      sessionId: auth.sessionId,
    });
  } catch (error) {
    captureException(error, { route: "/api/auth/me" });
    return sendJson(res, 401, { ok: false, error: "invalid_auth_token" });
  }
};
