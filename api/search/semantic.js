const { z } = require("zod");
const { applyCors, handleOptions, methodNotAllowed, readJson, sendJson } = require("../_lib/http");
const { requireClerkAuth } = require("../_lib/auth");
const { captureException } = require("../_lib/observability");
const { getPineconeIndex } = require("../_lib/pinecone");

const SemanticSearchSchema = z.object({
  vector: z.array(z.number()).min(8).max(4096),
  topK: z.number().int().min(1).max(20).optional().default(5),
  filter: z.record(z.any()).optional(),
});

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const auth = await requireClerkAuth(req);
    if (!auth.ok) return sendJson(res, auth.statusCode, { ok: false, error: auth.error });

    const index = getPineconeIndex();
    if (!index) return sendJson(res, 500, { ok: false, error: "pinecone_not_configured" });

    const input = SemanticSearchSchema.parse(await readJson(req));
    const result = await index.query({
      vector: input.vector,
      topK: input.topK,
      filter: input.filter,
      includeMetadata: true,
    });

    return sendJson(res, 200, {
      ok: true,
      matches: result.matches || [],
    });
  } catch (error) {
    captureException(error, { route: "/api/search/semantic" });
    return sendJson(res, error.statusCode || 400, { ok: false, error: error.message || "semantic_search_failed" });
  }
};
