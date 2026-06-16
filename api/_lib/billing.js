let stripeClient = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (stripeClient) return stripeClient;
  const Stripe = require("stripe");
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

function getPriceId(plan) {
  const map = {
    essential: process.env.STRIPE_PRICE_ESSENTIAL,
    plus: process.env.STRIPE_PRICE_PLUS,
    pro: process.env.STRIPE_PRICE_PRO,
    exposure: process.env.STRIPE_PRICE_EXPOSURE,
    vciso: process.env.STRIPE_PRICE_VCISO,
  };

  return map[String(plan || "").toLowerCase()] || null;
}

module.exports = { getPriceId, getStripe };
