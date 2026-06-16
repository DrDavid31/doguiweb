const DEFAULT_LIMIT_BYTES = 1_000_000;

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
}

function getAllowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (origin && isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  return isAllowed;
}

function sendJson(res, statusCode, payload) {
  setSecurityHeaders(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
}

function handleOptions(req, res) {
  setSecurityHeaders(res);
  applyCors(req, res);
  res.statusCode = 204;
  res.end();
}

function getClientIp(req) {
  return (
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function readRawBody(req, limitBytes = DEFAULT_LIMIT_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error("request_body_too_large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function readJson(req, limitBytes = DEFAULT_LIMIT_BYTES) {
  const raw = await readRawBody(req, limitBytes);
  if (!raw.length) return {};

  try {
    return JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw Object.assign(new Error("invalid_json"), { statusCode: 400 });
  }
}

module.exports = {
  applyCors,
  getClientIp,
  handleOptions,
  methodNotAllowed,
  readJson,
  readRawBody,
  sendJson,
  setSecurityHeaders,
};
