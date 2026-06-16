// Copy this file locally and load it before sales-prompt-console.html analytics code.
// Do not commit real API keys or tokens.
window.HAIBAO_ANALYTICS_CONFIG = {
  enabled: false,
  provider: "posthog",
  posthogKey: "REPLACE_WITH_YOUR_POSTHOG_PROJECT_API_KEY",
  posthogHost: "https://us.i.posthog.com",
  apiHost: "https://us.i.posthog.com",
  autocapture: false,
  capture_pageview: false,
  disable_session_recording: true
};

// EU region example:
// window.HAIBAO_ANALYTICS_CONFIG.posthogHost = "https://eu.i.posthog.com";
