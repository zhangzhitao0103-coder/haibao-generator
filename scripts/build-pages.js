const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const filesToCopy = [
  "index.html",
  "sales-prompt-console.html",
  "posthog-config.example.js",
  "_headers",
  "_redirects"
];

function jsString(value) {
  return JSON.stringify(String(value || ""));
}

function maskKey(value) {
  const key = String(value || "");
  if (!key) return "";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

function writePostHogConfig() {
  const enabled = process.env.HAIBAO_POSTHOG_ENABLED === "true";
  const posthogKey = String(process.env.HAIBAO_POSTHOG_KEY || "").trim();
  const posthogHost = String(process.env.HAIBAO_POSTHOG_HOST || "https://app.posthog.com").trim();
  const shouldEnable = enabled && Boolean(posthogKey);
  const config = `window.HAIBAO_ANALYTICS_CONFIG = {
  enabled: ${shouldEnable ? "true" : "false"},
  provider: "posthog",
  posthogKey: ${jsString(shouldEnable ? posthogKey : "")},
  posthogHost: ${jsString(shouldEnable ? posthogHost : "")},
  apiHost: ${jsString(shouldEnable ? posthogHost : "")},
  autocapture: false,
  capture_pageview: false,
  disable_session_recording: true
};
`;
  fs.writeFileSync(path.join(dist, "posthog-config.js"), config, "utf8");
  console.log(`PostHog runtime config: enabled=${shouldEnable}, key=${shouldEnable ? maskKey(posthogKey) : ""}`);
}

function build() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });
  for (const file of filesToCopy) {
    const source = path.join(root, file);
    if (!fs.existsSync(source)) continue;
    fs.copyFileSync(source, path.join(dist, file));
  }
  writePostHogConfig();
  console.log(`Pages build output: ${dist}`);
}

build();
