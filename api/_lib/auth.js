function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

async function requireClerkAuth(req) {
  const token = getBearerToken(req);
  if (!token) {
    return { ok: false, statusCode: 401, error: "missing_bearer_token" };
  }

  if (!process.env.CLERK_SECRET_KEY) {
    return { ok: false, statusCode: 500, error: "missing_clerk_secret_key" };
  }

  const { verifyToken } = require("@clerk/backend");
  const claims = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  return {
    ok: true,
    userId: claims.sub,
    sessionId: claims.sid,
    claims,
  };
}

module.exports = { getBearerToken, requireClerkAuth };
