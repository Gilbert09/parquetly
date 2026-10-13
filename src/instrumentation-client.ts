import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Events that can hold page text, element text or raw error messages, and so
// could carry file contents. before_send drops them as a backstop, so a
// setting in the PostHog dashboard cannot turn them back on.
const BLOCKED_EVENTS = new Set([
  "$snapshot",
  "$autocapture",
  "$rageclick",
  "$dead_click",
  "$$heatmap",
  "$exception",
]);

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // History-API pageviews also cover App Router client navigations, so no
    // separate pageview component is needed.
    defaults: "2025-05-24",
    // Only the explicit capture() calls are sent. Each one holds counts,
    // sizes and timings, never file contents.
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    disable_session_recording: true,
    enable_recording_console_log: false,
    mask_all_text: true,
    mask_all_element_attributes: true,
    before_send: (event) =>
      event && BLOCKED_EVENTS.has(event.event) ? null : event,
    debug: process.env.NODE_ENV === "development",
  });
}
