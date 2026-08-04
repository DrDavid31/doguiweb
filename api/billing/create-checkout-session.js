const { z } = require("zod");
const { enforceCors, handleOptions, methodNotAllowed, readJson, sendJson } = require("../_lib/http");
const { requireClerkAuth } = require("../_lib/auth");
const { getPriceId, getStripe } = require("../_lib/billing");
const { captureEvent, captureException } = require("../_lib/observability");

const CheckoutSchema = z.object({
  plan: z.enum(["essential", "plus", "pro", "exposure", "vciso"]),
});

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return handleOptions(req, res);
  if (!enforceCors(req, res)) return;
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const auth = await requireClerkAuth(req);
    if (!auth.ok) return sendJson(res, auth.statusCode, { ok: false, error: auth.error });

    const stripe = getStripe();
    if (!stripe) return sendJson(res, 500, { ok: false, error: "stripe_not_configured" });

    const input = CheckoutSchema.parse(await readJson(req));
    const price = getPriceId(input.plan);
    if (!price) return sendJson(res, 400, { ok: false, error: "missing_stripe_price" });

    const appUrl = process.env.APP_URL || `https://${process.env.VERCEL_URL}`;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      client_reference_id: auth.userId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
      metadata: {
        clerkUserId: auth.userId,
        plan: input.plan,
      },
    });

    await captureEvent("checkout_created", auth.userId, { plan: input.plan });
    return sendJson(res, 200, { ok: true, url: session.url, id: session.id });
  } catch (error) {
    captureException(error, { route: "/api/billing/create-checkout-session" });
    return sendJson(res, error.statusCode || 400, { ok: false, error: error.message || "checkout_failed" });
  }
};
