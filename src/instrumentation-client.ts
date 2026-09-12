import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Same defaults date as the Vite app, so event semantics (autocapture and
    // history_change pageviews) do not shift during the migration. History-API
    // pageviews also cover App Router client navigations, so no separate
    // pageview component is needed.
    defaults: "2025-05-24",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
