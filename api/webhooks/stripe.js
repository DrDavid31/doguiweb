const { methodNotAllowed, readRawBody, sendJson, setSecurityHeaders } = require("../_lib/http");
const { getStripe } = require("../_lib/billing");
const { captureEvent, captureException } = require("../_lib/observability");
const { getSupabaseAdmin } = require("../_lib/supabase");

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return sendJson(res, 500, { ok: false, error: "stripe_webhook_not_configured" });
    }

    const rawBody = await readRawBody(req, 2_000_000);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("billing_events").insert({
        stripe_event_id: event.id,
        type: event.type,
        payload: event,
        created_at: new Date().toISOString(),
      });
    }

    await captureEvent("stripe_webhook_received", event.data?.object?.client_reference_id || event.id, {
      type: event.type,
      stripeEventId: event.id,
    });

    return sendJson(res, 200, { ok: true, received: true });
  } catch (error) {
    captureException(error, { route: "/api/webhooks/stripe" });
    return sendJson(res, 400, { ok: false, error: error.message || "webhook_failed" });
  }
};
