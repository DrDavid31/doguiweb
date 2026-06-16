let sentryReady = false;
let posthogClient = null;

function initSentry() {
  if (sentryReady || !process.env.SENTRY_DSN) return null;
  const Sentry = require("@sentry/node");

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
  });

  sentryReady = true;
  return Sentry;
}

function captureException(error, context = {}) {
  try {
    const Sentry = initSentry();
    if (!Sentry) return;
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
      Sentry.captureException(error);
    });
  } catch (sentryError) {
    console.error("sentry_capture_failed", sentryError);
  }
}

function getPostHog() {
  if (posthogClient || !process.env.POSTHOG_PROJECT_API_KEY) return posthogClient;
  const { PostHog } = require("posthog-node");
  posthogClient = new PostHog(process.env.POSTHOG_PROJECT_API_KEY, {
    host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

async function captureEvent(event, distinctId, properties = {}) {
  const client = getPostHog();
  if (!client) return { captured: false };

  client.capture({
    distinctId: distinctId || "anonymous",
    event,
    properties: {
      source: "doguiweb",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      ...properties,
    },
  });

  if (typeof client.flush === "function") {
    await client.flush();
  }

  return { captured: true };
}

module.exports = { captureEvent, captureException, initSentry };
